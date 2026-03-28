// src/screens/SearchScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
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
    setOpen((prev) => !prev);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={[
          styles.selectTrigger,
          open && styles.selectTriggerOpen,
          disabled && styles.selectTriggerDisabled,
        ]}
      >
        {loading ? (
          <View style={styles.selectLoadingRow}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.selectLoadingText}>Yükleniyor...</Text>
          </View>
        ) : (
          <>
            <Text
              numberOfLines={1}
              style={[styles.selectValue, !value && styles.selectPlaceholder]}
            >
              {value || placeholder}
            </Text>
            <Ionicons
              name={open ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#64748B"
            />
          </>
        )}
      </TouchableOpacity>

      {open && !loading && options.length > 0 && (
        <View style={styles.optionsPanel}>
          <ScrollView nestedScrollEnabled style={styles.optionsScroll}>
            {options.map((opt) => {
              const active = opt === value;

              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.85}
                  onPress={() => handleSelect(opt)}
                  style={[styles.optionItem, active && styles.optionItemActive]}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {opt}
                  </Text>
                  {active ? (
                    <Ionicons name="checkmark-circle" size={18} color="#2563EB" />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {open && !loading && options.length === 0 && (
        <View style={styles.optionsPanel}>
          <View style={styles.emptyOption}>
            <Text style={styles.emptyOptionText}>Seçenek bulunamadı</Text>
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
          a.localeCompare(b, 'tr')
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

  const handleBrandChange = async (value: string) => {
    setMarka(value);
    setModel('');
    setMotor('');
    setModelList([]);
    setMotorList([]);
    setResults([]);
    setErrorMsg(null);

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
        a.localeCompare(b, 'tr')
      );

      setModelList(unique);
    } catch (e) {
      console.error('Model listesi hatası:', e);
      setErrorMsg('Model listesi alınamadı.');
    } finally {
      setLoadingModels(false);
    }
  };

  const handleModelChange = async (value: string) => {
    setModel(value);
    setMotor('');
    setMotorList([]);
    setResults([]);
    setErrorMsg(null);

    if (!marka || !value) return;

    try {
      setLoadingMotors(true);
      let collectedMotors: string[] = [];

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
        a.localeCompare(b, 'tr')
      );

      setMotorList(unique);
    } catch (e) {
      console.error('Motor listesi hatası:', e);
      setErrorMsg('Motor listesi alınamadı.');
    } finally {
      setLoadingMotors(false);
    }
  };

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
      let allRows: BakimItem[] = [];
      const motorKey = trimmedMotor ? trimmedMotor.split('(')[0].trim() : '';

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
            .in('arac_id', ids);

          if (motorKey) {
            q1 = q1.ilike('motor_tip', `%${motorKey}%`);
          }

          const { data: data1, error: err1 } = await q1
            .order('km', { ascending: true })
            .limit(200);

          if (!err1 && data1 && data1.length > 0) {
            allRows = data1 as BakimItem[];
          }
        }
      }

      if (allRows.length === 0) {
        let q2 = supabase
          .from('bakimlar')
          .select('id, km, bakim, notlar, marka, model, motor_tip, yil')
          .eq('marka', trimmedMarka)
          .ilike('model', `%${trimmedModel}%`);

        if (motorKey) {
          q2 = q2.ilike('motor_tip', `%${motorKey}%`);
        }

        const { data: data2, error: err2 } = await q2
          .order('km', { ascending: true })
          .limit(200);

        if (err2) throw err2;

        if (data2 && data2.length > 0) {
          allRows = data2 as BakimItem[];
        }
      }

      const validRows = allRows.filter((item) => item.km != null);

      const upcoming = validRows
        .filter((item) => (item.km ?? 0) >= parsedKm)
        .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));

      const previous = validRows
        .filter((item) => (item.km ?? 0) < parsedKm)
        .sort((a, b) => (b.km ?? 0) - (a.km ?? 0));

      const finalRows = [...upcoming, ...previous];
      setResults(finalRows);
    } catch (e) {
      console.error('Arama hatası:', e);
      setErrorMsg('Arama sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const parsedKmForDisplay = Number(km.replace(/\D/g, '') || 0);

  const formatKm = (value: number | null | undefined) =>
    value != null ? `${value.toLocaleString('tr-TR')} km` : '';

  const formatDeltaKm = (value: number | null | undefined) => {
    if (value == null) return '';
    if (value < 0) return `${Math.abs(value).toLocaleString('tr-TR')} km sonra`;
    return `${value.toLocaleString('tr-TR')} km önce`;
  };

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

  const upcomingMaintenance = results.find(
    (item) => item.km != null && item.km >= parsedKmForDisplay
  );

  const previousMaintenances = results.filter(
    (item) => item.km != null && item.km < parsedKmForDisplay
  );

  const searchReady = useMemo(() => !!marka && !!model && !!km.trim(), [marka, model, km]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={['#F8FBFF', '#EEF5FF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroBadge}>
            <Ionicons name="construct-outline" size={14} color="#2563EB" />
            <Text style={styles.heroBadgeText}>Akıllı bakım arama</Text>
          </View>

          <Text style={styles.title}>Aracına uygun bakımı bul</Text>
          <Text style={styles.subtitle}>
            Marka, model ve kilometreye göre yaklaşan bakım kaydını net şekilde gör.
          </Text>

          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatCard}>
              <Ionicons name="car-outline" size={18} color="#2563EB" />
              <Text style={styles.quickStatTitle}>Araç seç</Text>
              <Text style={styles.quickStatText}>Marka ve model belirle</Text>
            </View>

            <View style={styles.quickStatCard}>
              <Ionicons name="speedometer-outline" size={18} color="#2563EB" />
              <Text style={styles.quickStatTitle}>Km gir</Text>
              <Text style={styles.quickStatText}>Mevcut kilometreyi yaz</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Araç bilgileri</Text>
            <Text style={styles.sectionSubtitle}>
              Seçimlerini yap, ardından uygun bakım planını listele.
            </Text>
          </View>

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
            label="Motor tipi (opsiyonel)"
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
            <Text style={styles.fieldLabel}>Mevcut kilometre</Text>
            <View style={styles.kmInputBox}>
              <View style={styles.kmIconWrap}>
                <Ionicons name="speedometer-outline" size={18} color="#2563EB" />
              </View>
              <TextInput
                placeholder="Örn: 58744"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                style={styles.kmInput}
                value={km}
                onChangeText={setKm}
              />
              <Text style={styles.kmSuffix}>km</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.searchButton, (!searchReady || loading) && styles.searchButtonDisabled]}
            onPress={onSearch}
            disabled={!searchReady || loading}
            activeOpacity={0.92}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="search-outline" size={18} color="#FFFFFF" />
                <Text style={styles.searchButtonText}>Bakımı listele</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {errorMsg ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {results.length > 0 ? (
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {parsedKmForDisplay.toLocaleString('tr-TR')} km bakım görünümü
              </Text>
              <Text style={styles.sectionSubtitle}>
                Sana en yakın yaklaşan bakım üstte gösterilir.
              </Text>
            </View>

            {upcomingMaintenance ? (
              <LinearGradient
                colors={['#EEF6FF', '#F8FBFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.highlightCard}
              >
                <View style={styles.highlightTopRow}>
                  <View style={styles.highlightBadge}>
                    <Text style={styles.highlightBadgeText}>Yaklaşan bakım</Text>
                  </View>

                  {upcomingMaintenance.km != null ? (
                    <Text style={styles.highlightKm}>{formatKm(upcomingMaintenance.km)}</Text>
                  ) : null}
                </View>

                <Text style={styles.vehicleInfo}>
                  {upcomingMaintenance.marka} {upcomingMaintenance.model}
                  {upcomingMaintenance.yil ? ` • ${upcomingMaintenance.yil}` : ''}
                  {upcomingMaintenance.motor_tip ? ` • ${upcomingMaintenance.motor_tip}` : ''}
                </Text>

                {upcomingMaintenance.bakim ? (
                  <Text style={styles.maintenanceText}>{upcomingMaintenance.bakim}</Text>
                ) : null}

                {upcomingMaintenance.km != null ? (
                  <Text style={styles.deltaText}>
                    {upcomingMaintenance.km === parsedKmForDisplay
                      ? 'Bakım kilometresi geldi'
                      : `${(upcomingMaintenance.km - parsedKmForDisplay).toLocaleString('tr-TR')} km sonra`}
                  </Text>
                ) : null}

                <View style={styles.tagsRow}>
                  {tagify(upcomingMaintenance.bakim).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {upcomingMaintenance.notlar ? (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteTitle}>Not</Text>
                    <Text style={styles.noteText}>{upcomingMaintenance.notlar}</Text>
                  </View>
                ) : null}
              </LinearGradient>
            ) : null}

            {previousMaintenances.length > 0 ? (
              <View style={styles.listSection}>
                <Text style={styles.listTitle}>Önceki bakım kayıtları</Text>

                {previousMaintenances.map((item) => {
                  const delta = item.km != null ? parsedKmForDisplay - item.km : null;

                  return (
                    <View key={item.id} style={styles.resultCard}>
                      <View style={styles.resultCardTop}>
                        <Text style={styles.resultVehicle}>
                          {item.marka} {item.model}
                          {item.motor_tip ? ` • ${item.motor_tip}` : ''}
                        </Text>

                        {item.km != null ? (
                          <Text style={styles.resultKm}>{formatKm(item.km)}</Text>
                        ) : null}
                      </View>

                      {item.bakim ? (
                        <Text style={styles.resultMaintenance}>{item.bakim}</Text>
                      ) : null}

                      {delta != null ? (
                        <Text style={styles.resultDelta}>{formatDeltaKm(delta)}</Text>
                      ) : null}

                      <View style={styles.tagsRow}>
                        {tagify(item.bakim).map((tag) => (
                          <View key={tag} style={[styles.tag, styles.smallTag]}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        ) : null}

        {results.length === 0 && !loading && !errorMsg ? (
          <View style={styles.emptyHelpCard}>
            <View style={styles.emptyHelpIcon}>
              <Ionicons name="car-sport-outline" size={22} color="#2563EB" />
            </View>

            <Text style={styles.emptyHelpTitle}>Bakım aramaya hazır</Text>
            <Text style={styles.emptyHelpText}>
              Aracının bilgilerini girerek sana en yakın bakım aralığını ve önceki bakım kayıtlarını
              görebilirsin.
            </Text>

            <View style={styles.helpSteps}>
              <View style={styles.helpStep}>
                <Text style={styles.helpStepNumber}>1</Text>
                <Text style={styles.helpStepText}>Marka seç</Text>
              </View>
              <View style={styles.helpStep}>
                <Text style={styles.helpStepNumber}>2</Text>
                <Text style={styles.helpStepText}>Model seç</Text>
              </View>
              <View style={styles.helpStep}>
                <Text style={styles.helpStepNumber}>3</Text>
                <Text style={styles.helpStepText}>Km gir</Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F8FC',
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 140,
  },

  heroCard: {
    position: 'relative',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 18,
  },

  heroGlowOne: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: 'rgba(59,130,246,0.10)',
  },

  heroGlowTwo: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: 'rgba(14,165,233,0.08)',
  },

  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFFCC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 14,
  },

  heroBadgeText: {
    marginLeft: 6,
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 18,
    maxWidth: '92%',
  },

  quickStatsRow: {
    flexDirection: 'row',
    gap: 10,
  } as any,

  quickStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFFD9',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  quickStatTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  quickStatText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },

  field: {
    marginTop: 14,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },

  selectTrigger: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectTriggerOpen: {
    borderColor: '#93C5FD',
    backgroundColor: '#FFFFFF',
  },

  selectTriggerDisabled: {
    opacity: 0.55,
  },

  selectValue: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    marginRight: 10,
  },

  selectPlaceholder: {
    color: '#94A3B8',
    fontWeight: '400',
  },

  selectLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectLoadingText: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 14,
  },

  optionsPanel: {
    marginTop: 6,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  optionsScroll: {
    maxHeight: 220,
  },

  optionItem: {
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  optionItemActive: {
    backgroundColor: '#EFF6FF',
  },

  optionText: {
    fontSize: 15,
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },

  optionTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },

  emptyOption: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  emptyOptionText: {
    fontSize: 14,
    color: '#94A3B8',
  },

  kmInputBox: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  kmIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  kmInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    marginLeft: 10,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },

  kmSuffix: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginLeft: 8,
  },

  searchButton: {
    marginTop: 18,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },

  searchButtonDisabled: {
    opacity: 0.58,
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },

  errorCard: {
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    color: '#DC2626',
    fontSize: 14,
    lineHeight: 19,
  },

  resultsSection: {
    marginTop: 2,
  },

  highlightCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 18,
    marginBottom: 16,
  },

  highlightTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  highlightBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  highlightBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  highlightKm: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2563EB',
  },

  vehicleInfo: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },

  maintenanceText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#334155',
    marginBottom: 8,
  },

  deltaText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  } as any,

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
  },

  smallTag: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  noteBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },

  noteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },

  noteText: {
    fontSize: 14,
    lineHeight: 19,
    color: '#334155',
  },

  listSection: {
    marginTop: 6,
  },

  listTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },

  resultCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
  },

  resultCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  resultVehicle: {
    flex: 1,
    marginRight: 10,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#0F172A',
  },

  resultKm: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },

  resultMaintenance: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
    marginBottom: 8,
  },

  resultDelta: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },

  emptyHelpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
  },

  emptyHelpIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyHelpTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },

  emptyHelpText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
  },

  helpSteps: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  } as any,

  helpStep: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  helpStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    overflow: 'hidden',
  },

  helpStepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
});