// src/screens/KronikSorunScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabaseClient';

// TypeScript Tür Tanımları
type KronikSorun = {
  id: number;
  arac_id: number | null;
  baslik: string | null;
  kategori: string | null;
  yil_araligi: string | null;
  motor_tip: string | null;
  siklik_1_5: number | null;
  siddet_1_5: number | null;
  aciklama_md: string | null;
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

/**
 * Yenilenmiş Tasarıma Sahip SelectBox Bileşeni
 */
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
            <ActivityIndicator size="small" color="#0369a1" />
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
                style={[
                  styles.optionItem,
                  value === opt && styles.optionItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === opt && styles.optionTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {open && !loading && options.length === 0 && (
        <View style={styles.optionsPanel}>
          <View style={[styles.optionItem, { paddingVertical: 12 }]}>
            <Text style={styles.optionTextEmpty}>Seçenek bulunamadı.</Text>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Kronik Sorun Arama Ekranı
 */
export default function KronikSorunScreen() {
  const [keyword, setKeyword] = useState('');
  const [marka, setMarka] = useState('');
  const [model, setModel] = useState('');

  const [brandList, setBrandList] = useState<string[]>([]);
  const [modelList, setModelList] = useState<string[]>([]);

  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  const [onlyFrequent, setOnlyFrequent] = useState(false); // siklik_1_5 ≥ 3
  const [onlySevere, setOnlySevere] = useState(false); // siddet_1_5 ≥ 3

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<KronikSorun[]>([]);

  // =============== MARKA LİSTESİ (araclar) ===============
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        console.log('[Kronik] Marka listesi çekiliyor (araclar)...');

        const { data, error } = await supabase
          .from('araclar')
          .select('marka')
          .not('marka', 'is', null)
          .limit(5000);

        console.log('[Kronik] Marka sorgu sonucu:', {
          error,
          count: data?.length,
          sample: data?.[0],
        });

        if (error) {
          console.error('[Kronik] araclar marka error', error);
          setErrorMsg('Marka listesi alınamadı.');
          return;
        }

        const raw = (data ?? [])
          .map((r: any) => (r.marka || '').trim())
          .filter((x: string) => x.length > 0);

        const unique = Array.from(new Set(raw)).sort((a, b) =>
          a.localeCompare(b, 'tr')
        );

        console.log('[Kronik] unique brand count:', unique.length);
        setBrandList(unique);
      } catch (e) {
        console.error('[Kronik] Marka listesi beklenmeyen hata:', e);
        setErrorMsg('Marka listesi alınırken beklenmeyen bir hata oluştu.');
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  // =============== MARKA SEÇİLİNCE MODELLER (araclar) ===============
  const handleBrandChange = async (value: string) => {
    setMarka(value);
    setModel('');
    setModelList([]);

    if (!value) return;

    try {
      setLoadingModels(true);
      console.log('[Kronik] Model listesi çekiliyor (araclar)...', value);

      const { data, error } = await supabase
        .from('araclar')
        .select('model')
        .eq('marka', value)
        .not('model', 'is', null)
        .limit(5000);

      console.log('[Kronik] Model sorgu sonucu:', {
        error,
        count: data?.length,
        sample: data?.[0],
      });

      if (error) {
        console.error('[Kronik] araclar model error', error);
        setErrorMsg('Model listesi alınamadı.');
        return;
      }

      const raw = (data ?? [])
        .map((r: any) => (r.model || '').trim())
        .filter((x: string) => x.length > 0);

      const unique = Array.from(new Set(raw)).sort((a, b) =>
        a.localeCompare(b, 'tr')
      );

      console.log('[Kronik] unique model count:', unique.length);
      setModelList(unique);
    } catch (e) {
      console.error('[Kronik] Model listesi beklenmeyen hata:', e);
      setErrorMsg('Model listesi alınırken beklenmeyen bir hata oluştu.');
    } finally {
      setLoadingModels(false);
    }
  };

  // =============== marka+model → arac_id çöz (araclar) ===============
  const resolveAracId = async (
    marka?: string,
    model?: string
  ): Promise<number | null> => {
    if (!marka || !model) return null;

    const { data, error } = await supabase
      .from('araclar')
      .select('id')
      .eq('marka', marka)
      .eq('model', model)
      .maybeSingle();

    if (error) {
      console.error('[Kronik] arac_id çözüm error', error);
      return null;
    }
    return data?.id ?? null;
  };

  // =============== ARAMA ===============
  const onSearch = async () => {
    const trimmedKeyword = keyword.trim();
    const trimmedMarka = marka.trim();
    const trimmedModel = model.trim();

    if (!trimmedMarka && !trimmedModel && !trimmedKeyword) {
      setErrorMsg('Önce marka/model veya bir anahtar kelime gir.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResults([]);

    try {
      console.log('[Kronik] Arama hazırlanıyor...', {
        marka: trimmedMarka,
        model: trimmedModel,
        keyword: trimmedKeyword,
        onlyFrequent,
        onlySevere,
      });

      let aracId: number | null = null;

      if (trimmedMarka && trimmedModel) {
        aracId = await resolveAracId(trimmedMarka, trimmedModel);
        console.log('[Kronik] Çözülen arac_id:', aracId);
      }

      let query = supabase
        .from('kronik_sorunlar')
        .select(
          'id, arac_id, baslik, kategori, yil_araligi, motor_tip, siklik_1_5, siddet_1_5, aciklama_md'
        )
        // Yeni tasarımda şiddet > sıklık önceliği
        .order('siddet_1_5', { ascending: false, nullsFirst: false })
        .order('siklik_1_5', { ascending: false, nullsFirst: false }) 
        .limit(200);

      if (aracId) {
        query = query.eq('arac_id', aracId);
      }

      if (trimmedKeyword) {
        const like = `%${trimmedKeyword}%`;
        // Baslik, aciklama ve motor tipinde arama
        query = query.or(
          `baslik.ilike.${like},aciklama_md.ilike.${like},motor_tip.ilike.${like},yil_araligi.ilike.${like}`
        );
      }

      if (onlyFrequent) {
        query = query.gte('siklik_1_5', 3);
      }
      if (onlySevere) {
        query = query.gte('siddet_1_5', 3);
      }

      const { data, error } = await query;

      console.log('[Kronik] Arama response:', {
        error,
        count: data?.length,
        sample: data?.[0],
      });

      if (error) {
        console.error('[Kronik] kronik_sorunlar error', error);
        setErrorMsg('Veri alınırken bir hata oluştu.');
        return;
      }

      setResults((data ?? []) as KronikSorun[]);
      if (data?.length === 0) {
        setErrorMsg('Aradığınız kriterlere uygun kronik sorun bulunamadı.');
      }
    } catch (e) {
      console.error('[Kronik] Beklenmeyen hata:', e);
      setErrorMsg('Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Araba Kronik Sorunları 🚨</Text>
        <Text style={styles.subtitle}>
          Arabanızın potansiyel zayıf noktalarını görün. Marka/model seçerek daraltın veya anahtar kelimeyle arama yapın.
        </Text>

        {/* MARKA */}
        <SelectBox
          label="Marka Seçimi"
          value={marka}
          placeholder="Tüm Markalar"
          options={brandList}
          loading={loadingBrands}
          onChange={handleBrandChange}
        />

        {/* MODEL */}
        <SelectBox
          label="Model Seçimi"
          value={model}
          placeholder={
            marka
              ? modelList.length
                ? 'Model seç (opsiyonel)'
                : 'Bu markada model bulunamadı'
              : 'Önce bir marka seçin'
          }
          options={marka ? modelList : []}
          disabled={!marka || modelList.length === 0}
          loading={loadingModels}
          onChange={(val) => setModel(val)}
        />

        {/* ANAHTAR KELİME */}
        <View style={styles.field}>
          <Text style={styles.label}>Anahtar Kelime ile Ara</Text>
          <TextInput
            placeholder="Örn: triger, mekatronik, DPF, zincir..."
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>

        {/* FİLTRE BUTONLARI */}
        <View style={[styles.field, { marginTop: 12 }]}>
          <Text style={styles.label}>Önem Düzeyine Göre Filtreler</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              onPress={() => setOnlyFrequent((v) => !v)}
              activeOpacity={0.8}
              style={[
                styles.filterChip,
                onlyFrequent && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  onlyFrequent && styles.filterChipTextActive,
                ]}
              >
                {onlyFrequent ? '✅ Sık Görülen (≥3/5)' : 'Sık Görülen (≥3/5)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOnlySevere((v) => !v)}
              activeOpacity={0.8}
              style={[
                styles.filterChip,
                onlySevere && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  onlySevere && styles.filterChipTextActive,
                ]}
              >
                {onlySevere ? '🔥 Ciddi Olanlar (≥3/5)' : 'Ciddi Olanlar (≥3/5)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ARA BUTONU */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          activeOpacity={0.8}
          onPress={onSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {marka ? `${marka} Kronik Sorunlarını Listele` : 'Tüm Sorunları Ara'}
            </Text>
          )}
        </TouchableOpacity>

        {errorMsg && <Text style={styles.errorText}>⚠️ {errorMsg}</Text>}

        {/* SONUÇLAR */}
        {results.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsCountText}>
              🔎 Toplam {results.length} sonuç bulundu.
            </Text>
            {results.map((item) => (
              <View key={item.id} style={styles.card}>
                {item.baslik && (
                  <Text style={styles.cardHeadline}>{item.baslik}</Text>
                )}

                <View style={styles.chipRow}>
                  {item.kategori && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{item.kategori}</Text>
                    </View>
                  )}
                  {item.yil_araligi && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>Model Yılı: {item.yil_araligi}</Text>
                    </View>
                  )}
                  {item.motor_tip && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{item.motor_tip}</Text>
                    </View>
                  )}
                  {item.siklik_1_5 != null && (
                    <View style={[styles.chip, styles.chipFreq]}>
                      <Text style={styles.chipText}>
                        Sıklık: {item.siklik_1_5}/5
                      </Text>
                    </View>
                  )}
                  {item.siddet_1_5 != null && (
                    <View style={[styles.chip, styles.chipSeverity]}>
                      <Text style={styles.chipText}>
                        Şiddet: {item.siddet_1_5}/5
                      </Text>
                    </View>
                  )}
                </View>

                {item.aciklama_md && (
                  <Text style={styles.cardText}>{item.aciklama_md}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {results.length === 0 && !loading && !errorMsg && (
          <Text style={styles.helper}>
            Sadece marka/model seçerek aracına özel kroniklere bakabilir veya
            doğrudan “DSG mekatronik, TSI zincir, DPF tıkanma” gibi anahtar
            kelimelerle genel arama yapabilirsin.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ===================================
// YENİ STİL TANIMLARI
// ===================================
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc', // Hafif beyaz arka plan
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '800', // Extra bold
    color: '#0f172a', // Koyu lacivert
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569', // Koyu gri
    marginBottom: 10,
  },
  field: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b', // Koyu gri
    marginBottom: 6,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10, // Platforma özel ayar
    fontSize: 15,
    color: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },

  /* SelectBox */
  selectBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  selectBoxOpen: {
    borderColor: '#06b6d4', // Turkuaz vurgu
  },
  selectBoxDisabled: {
    backgroundColor: '#f1f5f9',
    opacity: 0.8,
  },
  selectBoxValue: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  selectBoxPlaceholder: {
    color: '#94a3b8',
    fontWeight: '400',
  },
  selectBoxLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectBoxLoadingText: {
    fontSize: 13,
    color: '#475569',
    marginLeft: 8,
  },

  optionsPanel: {
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  optionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  optionItemActive: {
    backgroundColor: '#f0f9ff', // Seçili öğe arka planı
  },
  optionText: {
    fontSize: 15,
    color: '#1e293b',
  },
  optionTextActive: {
    fontWeight: '600',
    color: '#06b6d4', // Seçili öğe turkuaz yazı
  },
  optionTextEmpty: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },

  /* Filtre chipleri */
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  } as any,
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: '#06b6d4', // Turkuaz
    borderColor: '#06b6d4',
  },
  filterChipText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  /* Sonuç kartları */
  button: {
    marginTop: 25,
    borderRadius: 10,
    backgroundColor: '#0ea5e9', // Parlak mavi
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    marginTop: 15,
    fontSize: 13,
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  resultsSection: {
    marginTop: 25,
  },
  resultsCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  card: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeadline: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  } as any,
  chip: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#eef2ff', // Hafif mavi
  },
  chipFreq: {
    backgroundColor: '#dcfce7', // Yeşil tonları (Sıklık için)
  },
  chipSeverity: {
    backgroundColor: '#fee2e2', // Kırmızı tonları (Şiddet için)
  },
  chipText: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: '600',
  },
  cardText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  helper: {
    marginTop: 20,
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 15,
  },
});