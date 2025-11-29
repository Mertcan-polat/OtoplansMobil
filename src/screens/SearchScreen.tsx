// src/screens/SearchScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabaseClient';

type BakimItem = {
  id: number;
  km: number | null;
  bakim: string | null;
  notlar?: string | null;
  marka?: string | null;
  model?: string | null;
  motor_tip?: string | null;
  yil?: number | null;
};

type SelectBoxProps = {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  loading?: boolean;
  onChange: (val: string) => void;
};

function SelectBox({
  label,
  value,
  placeholder,
  options,
  disabled,
  loading,
  onChange,
}: SelectBoxProps) {
  const [open, setOpen] = useState(false);

  const handlePress = () => {
    if (disabled || loading) return;
    setOpen((o) => !o);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={[
          styles.selectBox,
          (disabled || loading) && styles.selectBoxDisabled,
          open && styles.selectBoxOpen,
        ]}
      >
        {loading ? (
          <View style={styles.selectBoxLoading}>
            <ActivityIndicator size="small" color="#1a1a1a" />
            <Text style={styles.selectBoxLoadingText}>Yükleniyor...</Text>
          </View>
        ) : (
          <>
            <Text
              style={[
                styles.selectBoxValue,
                !value && styles.selectBoxPlaceholder,
              ]}
              numberOfLines={1}
            >
              {value || placeholder}
            </Text>
            <Text style={styles.selectBoxChevron}>{open ? '▲' : '▼'}</Text>
          </>
        )}
      </TouchableOpacity>

      {open && !loading && options.length > 0 && (
        <View style={styles.optionsPanel}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => handleSelect(opt)}
                activeOpacity={0.7}
                style={styles.optionItem}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {open && !loading && options.length === 0 && (
        <View style={styles.optionsPanel}>
          <View style={[styles.optionItem, { paddingVertical: 16 }]}>
            <Text style={styles.optionTextEmpty}>Seçenek bulunamadı</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function SearchScreen() {
  const [marka, setMarka] = useState('');
  const [model, setModel] = useState('');
  const [motor, setMotor] = useState('');
  const [km, setKm] = useState('');

  const [brandList, setBrandList] = useState<string[]>([]);
  const [modelList, setModelList] = useState<string[]>([]);
  const [motorList, setMotorList] = useState<string[]>([]);

  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingMotors, setLoadingMotors] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<BakimItem[]>([]);

  // Markaları çek
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const { data, error } = await supabase
          .from('araclar')
          .select('marka')
          .not('marka', 'is', null)
          .limit(5000);

        if (error) throw error;

        const raw = (data ?? [])
          .map((r: any) => (r.marka || '').trim())
          .filter((x: string) => x.length > 0);

        const unique = Array.from(new Set(raw)).sort((a, b) =>
          a.localeCompare(b, 'tr'),
        );
        setBrandList(unique);
      } catch (e) {
        console.error('Marka listesi hatası:', e);
        setErrorMsg('Marka listesi alınamadı.');
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  // Marka değişince modelleri çek
  const handleBrandChange = async (value: string) => {
    setMarka(value);
    setModel('');
    setMotor('');
    setModelList([]);
    setMotorList([]);
    setErrorMsg(null);
    setResults([]);

    if (!value) return;

    try {
      setLoadingModels(true);
      const { data, error } = await supabase
        .from('araclar')
        .select('model')
        .eq('marka', value)
        .not('model', 'is', null)
        .limit(5000);

      if (error) throw error;

      const raw = (data ?? [])
        .map((r: any) => (r.model || '').trim())
        .filter((x: string) => x.length > 0);

      const unique = Array.from(new Set(raw)).sort((a, b) =>
        a.localeCompare(b, 'tr'),
      );
      setModelList(unique);
    } catch (e) {
      console.error('Model listesi hatası:', e);
      setErrorMsg('Model listesi alınamadı.');
    } finally {
      setLoadingModels(false);
    }
  };

  // Model değişince motorları çek
  const handleModelChange = async (value: string) => {
    setModel(value);
    setMotor('');
    setMotorList([]);
    setErrorMsg(null);
    setResults([]);

    if (!marka || !value) return;

    try {
      setLoadingMotors(true);
      let collectedMotors: string[] = [];

      // 1) İlgili arac_id'leri bul
      const { data: araclarRows, error: errArac } = await supabase
        .from('araclar')
        .select('id')
        .eq('marka', marka)
        .eq('model', value)
        .limit(1000);

      if (!errArac && araclarRows && araclarRows.length > 0) {
        const ids = araclarRows.map((r: any) => r.id).filter(Boolean);

        if (ids.length > 0) {
          const { data: bakimRows, error: errBakim } = await supabase
            .from('bakimlar')
            .select('motor_tip')
            .in('arac_id', ids)
            .not('motor_tip', 'is', null)
            .limit(5000);

          if (!errBakim && bakimRows) {
            collectedMotors = bakimRows
              .map((r: any) => (r.motor_tip || '').trim())
              .filter((x: string) => x.length > 0);
          }
        }
      }

      // 2) Fallback: marka+model'e göre doğrudan bakimlar'dan
      if (collectedMotors.length === 0) {
        const { data: bakimRows2, error: errBakim2 } = await supabase
          .from('bakimlar')
          .select('motor_tip')
          .eq('marka', marka)
          .eq('model', value)
          .not('motor_tip', 'is', null)
          .limit(5000);

        if (!errBakim2 && bakimRows2) {
          collectedMotors = bakimRows2
            .map((r: any) => (r.motor_tip || '').trim())
            .filter((x: string) => x.length > 0);
        }
      }

      const unique = Array.from(new Set(collectedMotors)).sort((a, b) =>
        a.localeCompare(b, 'tr'),
      );
      setMotorList(unique);
    } catch (e) {
      console.error('Motor listesi hatası:', e);
      setErrorMsg('Motor listesi alınamadı.');
    } finally {
      setLoadingMotors(false);
    }
  };

  // Arama fonksiyonu
  const onSearch = async () => {
    const trimmedMarka = marka.trim();
    const trimmedModel = model.trim();
    const trimmedMotor = motor.trim();
    const parsedKm = Number(km.replace(/\D/g, '') || 0);

    if (!trimmedMarka || !trimmedModel || !parsedKm) {
      setErrorMsg('Marka, model ve kilometre bilgisi gereklidir.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResults([]);

    try {
      let finalRows: BakimItem[] = [];
      const motorKey = trimmedMotor ? trimmedMotor.split('(')[0].trim() : '';

      // 1) Normalized path: arac_id üzerinden
      const { data: araclarRows, error: errArac } = await supabase
        .from('araclar')
        .select('id')
        .eq('marka', trimmedMarka)
        .eq('model', trimmedModel)
        .limit(1000);

      if (!errArac && araclarRows && araclarRows.length > 0) {
        const ids = araclarRows.map((r: any) => r.id).filter(Boolean);

        if (ids.length > 0) {
          let q1 = supabase
            .from('bakimlar')
            .select('id, km, bakim, notlar, marka, model, motor_tip, yil')
            .in('arac_id', ids)
            .lte('km', parsedKm);

          if (motorKey) {
            q1 = q1.ilike('motor_tip', `%${motorKey}%`);
          }

          const { data: data1, error: err1 } = await q1
            .order('km', { ascending: false })
            .limit(50);

          if (!err1 && data1 && data1.length > 0) {
            finalRows = data1 as BakimItem[];
          }

          // Fallback: km filtresi olmadan
          if (finalRows.length === 0) {
            let q1b = supabase
              .from('bakimlar')
              .select('id, km, bakim, notlar, marka, model, motor_tip, yil')
              .in('arac_id', ids);

            if (motorKey) {
              q1b = q1b.ilike('motor_tip', `%${motorKey}%`);
            }

            const { data: data1b, error: err1b } = await q1b
              .order('km', { ascending: true })
              .limit(50);

            if (!err1b && data1b && data1b.length > 0) {
              finalRows = data1b as BakimItem[];
            }
          }
        }
      }

      // 2) Fallback: marka+model direkt
      if (finalRows.length === 0) {
        let q2 = supabase
          .from('bakimlar')
          .select('id, km, bakim, notlar, marka, model, motor_tip, yil')
          .eq('marka', trimmedMarka)
          .ilike('model', `%${trimmedModel}%`)
          .lte('km', parsedKm);

        if (motorKey) {
          q2 = q2.ilike('motor_tip', `%${motorKey}%`);
        }

        const { data: data2, error: err2 } = await q2
          .order('km', { ascending: false })
          .limit(50);

        if (!err2 && data2 && data2.length > 0) {
          finalRows = data2 as BakimItem[];
        } else {
          let q2b = supabase
            .from('bakimlar')
            .select('id, km, bakim, notlar, marka, model, motor_tip, yil')
            .eq('marka', trimmedMarka)
            .ilike('model', `%${trimmedModel}%`);

          if (motorKey) {
            q2b = q2b.ilike('motor_tip', `%${motorKey}%`);
          }

          const { data: data2b, error: err2b } = await q2b
            .order('km', { ascending: true })
            .limit(50);

          if (err2b) {
            throw err2b;
          }

          if (data2b && data2b.length > 0) {
            finalRows = data2b as BakimItem[];
          }
        }
      }

      setResults(finalRows ?? []);
    } catch (e: any) {
      console.error('Arama hatası:', e);
      setErrorMsg('Arama sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const parsedKmForDisplay = Number(km.replace(/\D/g, '') || 0);
  
  const formatKm = (value: number | null | undefined) =>
    value != null ? `${value.toLocaleString('tr-TR')} km` : '';

  const tagify = (txt: string | null | undefined): string[] => {
    if (!txt) return [];
    const t = txt.toLowerCase();
    const tags: string[] = [];
    if (/(yağ|oil)/.test(t)) tags.push('Yağ');
    if (/filtre/.test(t)) tags.push('Filtre');
    if (/(triger|zincir|kayış)/.test(t)) tags.push('Triger/Kayış');
    if (/(buj|ateşleme|bobin)/.test(t)) tags.push('Ateşleme');
    if (/(fren|balata|disk|hidrolik)/.test(t)) tags.push('Fren');
    if (/(şanzıman|dsg|cvt|atf)/.test(t)) tags.push('Şanzıman');
    return Array.from(new Set(tags)).slice(0, 3);
  };

  const latest = results[0];
  const older = results.slice(1);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bakım Arama</Text>
          <Text style={styles.subtitle}>
            Aracınızın marka, model ve kilometre bilgisi ile bakım geçmişini görüntüleyin
          </Text>
        </View>

        {/* Input Sections */}
        <View style={styles.inputContainer}>
          <SelectBox
            label="Marka"
            value={marka}
            placeholder="Marka seçin"
            options={brandList}
            loading={loadingBrands}
            onChange={handleBrandChange}
          />

          <SelectBox
            label="Model"
            value={model}
            placeholder={
              marka
                ? modelList.length
                  ? 'Model seçin'
                  : 'Model bulunamadı'
                : 'Önce marka seçin'
            }
            options={marka ? modelList : []}
            disabled={!marka}
            loading={loadingModels}
            onChange={handleModelChange}
          />

          <SelectBox
            label="Motor Tipi (opsiyonel)"
            value={motor}
            placeholder={
              model
                ? motorList.length
                  ? 'Motor seçin'
                  : 'Motor bulunamadı'
                : 'Önce model seçin'
            }
            options={model ? motorList : []}
            disabled={!model}
            loading={loadingMotors}
            onChange={(val) => setMotor(val)}
          />

          <View style={styles.field}>
            <Text style={styles.label}>Mevcut Kilometre</Text>
            <View style={styles.kmInputWrapper}>
              <TextInput
                placeholder="Örn: 120000"
                keyboardType="numeric"
                style={styles.input}
                value={km}
                onChangeText={setKm}
              />
              <Text style={styles.kmSuffix}>km</Text>
            </View>
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.buttonDisabled]}
          onPress={onSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.searchButtonText}>Bakımları Ara</Text>
          )}
        </TouchableOpacity>

        {errorMsg && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Results */}
        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {parsedKmForDisplay.toLocaleString('tr-TR')} km'ye kadar kayıtlı bakımlar
            </Text>

            {/* Latest Maintenance */}
            {latest && (
              <View style={styles.highlightCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>En Yakın Bakım</Text>
                  </View>
                  {latest.km != null && (
                    <Text style={styles.highlightKm}>{formatKm(latest.km)}</Text>
                  )}
                </View>
                
                <Text style={styles.vehicleInfo}>
                  {latest.marka} {latest.model}
                  {latest.yil && ` • ${latest.yil}`}
                  {latest.motor_tip && ` • ${latest.motor_tip}`}
                </Text>

                {latest.bakim && (
                  <Text style={styles.maintenanceText}>{latest.bakim}</Text>
                )}

                {latest.km != null && (
                  <Text style={styles.deltaText}>
                    {formatKm(parsedKmForDisplay - latest.km)} önce yapılmış
                  </Text>
                )}

                <View style={styles.tagsContainer}>
                  {tagify(latest.bakim).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {latest.notlar && (
                  <View style={styles.noteContainer}>
                    <Text style={styles.noteTitle}>Not</Text>
                    <Text style={styles.noteText}>{latest.notlar}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Previous Maintenance Records */}
            {older.length > 0 && (
              <View style={styles.previousContainer}>
                <Text style={styles.previousTitle}>Önceki Bakımlar</Text>
                {older.map((item) => {
                  const delta = item.km != null ? parsedKmForDisplay - item.km : null;
                  return (
                    <View key={item.id} style={styles.maintenanceCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.vehicleInfoSmall}>
                          {item.marka} {item.model}
                          {item.motor_tip && ` • ${item.motor_tip}`}
                        </Text>
                        {item.km != null && (
                          <Text style={styles.kmText}>{formatKm(item.km)}</Text>
                        )}
                      </View>

                      {item.bakim && (
                        <Text style={styles.maintenanceTextSmall}>{item.bakim}</Text>
                      )}

                      {delta != null && (
                        <Text style={styles.deltaTextSmall}>
                          {formatKm(delta)} önce
                        </Text>
                      )}

                      <View style={styles.tagsContainer}>
                        {tagify(item.bakim).map((tag) => (
                          <View key={tag} style={[styles.tag, styles.tagSmall]}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Help Text */}
        {results.length === 0 && !loading && (
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Nasıl Kullanılır?</Text>
            <Text style={styles.helpText}>
              • Marka, model ve mevcut kilometreyi seçin{"\n"}
              • Opsiyonel olarak motor tipini belirleyin{"\n"}
              • Bakımları Ara butonuna tıklayın{"\n"}
              • KM'nize en yakın bakım kayıtlarını görüntüleyin
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  selectBox: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectBoxOpen: {
    borderColor: '#1a1a1a',
  },
  selectBoxDisabled: {
    opacity: 0.5,
  },
  selectBoxValue: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  selectBoxPlaceholder: {
    color: '#999',
  },
  selectBoxChevron: {
    fontSize: 12,
    color: '#666',
  },
  selectBoxLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectBoxLoadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  optionsPanel: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    marginTop: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  optionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  optionTextEmpty: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  kmInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  kmSuffix: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  searchButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  highlightCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  highlightKm: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  vehicleInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  maintenanceText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  deltaText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '500',
  },
  noteContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
  },
  previousContainer: {
    marginTop: 8,
  },
  previousTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  maintenanceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 12,
  },
  vehicleInfoSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  kmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  maintenanceTextSmall: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
    marginVertical: 8,
  },
  deltaTextSmall: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  helpContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});