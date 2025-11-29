// src/screens/CompareDecisionScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = 'https://otoplans.net';

// ====== Tipler ======
type OptionsResponse = {
  markalar?: string[];
  modeller?: string[];
  motorlar?: string[];
  error?: string;
};

type Bakim = { km: number; motor_tip: string; bakim: string; notlar: string };

type BakimResponse = {
  tum: Bakim[];
  yapilan: Bakim[];
  yapilmayan: Bakim[];
  source?: string;
  error?: string;
};

type TopSorun = {
  baslik: string;
  kategori: string | null;
  siklik_1_5: number | null;
  siddet_1_5: number | null;
  tahmini_maliyet_tl?: number | null;
};

type KronikOzetResp = {
  ok: boolean;
  toplamSorun: number;
  topSorunlarBirlesik?: TopSorun[];
  motorSpesifik?: any[];
  birlesik?: any[];
  error?: string;
};

type Item = {
  marka: string;
  model: string;
  motor: string;
  km: string;
};

type ChronicMetrics = {
  count: number;
  riskTotal: number;
  avgSeverity: number | null;
  avgFrequency: number | null;
  estCostAvg: number | null;
  topIssues: TopSorun[];
};

// ====== Helper Functions ======
async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // noop
  }
  if (!res.ok) {
    const msg = (json && (json.error || json.message)) || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return json as T;
}

const formatNumber = (n: number | null | undefined) =>
  typeof n === 'number' ? n.toLocaleString('tr-TR') : '—';

const formatTL = (n: number | null | undefined) =>
  typeof n === 'number'
    ? n.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' TL'
    : '—';

const formatKm = (n: number | null | undefined) =>
  typeof n === 'number' ? n.toLocaleString('tr-TR') + ' km' : '—';

const getSeverityColor = (severity: number | null) => {
  if (!severity) return '#6b7280';
  if (severity >= 4) return '#dc2626';
  if (severity >= 3) return '#ea580c';
  if (severity >= 2) return '#ca8a04';
  return '#059669';
};

const getFrequencyColor = (frequency: number | null) => {
  if (!frequency) return '#6b7280';
  if (frequency >= 4) return '#dc2626';
  if (frequency >= 3) return '#ea580c';
  if (frequency >= 2) return '#ca8a04';
  return '#059669';
};

function computeChronicMetrics(ozet: KronikOzetResp | null): ChronicMetrics {
  if (!ozet || !ozet.ok) {
    return {
      count: 0,
      riskTotal: 0,
      avgSeverity: null,
      avgFrequency: null,
      estCostAvg: null,
      topIssues: [],
    };
  }

  const rows =
    Array.isArray(ozet.birlesik) && ozet.birlesik.length
      ? ozet.birlesik
      : Array.isArray(ozet.motorSpesifik) && ozet.motorSpesifik.length
      ? ozet.motorSpesifik
      : [];

  const top =
    Array.isArray(ozet.topSorunlarBirlesik) && ozet.topSorunlarBirlesik.length
      ? ozet.topSorunlarBirlesik
      : [];

  const valid = rows.filter(
    (k: any) =>
      (k?.siddet_1_5 ?? null) !== null || (k?.siklik_1_5 ?? null) !== null,
  );

  const risks = valid.map(
    (k: any) =>
      (Number(k.siklik_1_5) || 0) * (Number(k.siddet_1_5) || 0),
  );
  const riskTotal = risks.reduce((s: number, v: number) => s + v, 0);

  const avgSeverity = valid.length
    ? Number(
        (
          valid.reduce(
            (s: number, k: any) => s + (Number(k.siddet_1_5) || 0),
            0,
          ) / valid.length
        ).toFixed(2),
      )
    : null;

  const avgFrequency = valid.length
    ? Number(
        (
          valid.reduce(
            (s: number, k: any) => s + (Number(k.siklik_1_5) || 0),
            0,
          ) / valid.length
        ).toFixed(2),
      )
    : null;

  const costs = rows
    .map((k: any) =>
      k?.tahmini_maliyet_tl == null ? null : Number(k.tahmini_maliyet_tl),
    )
    .filter((x: any): x is number => Number.isFinite(x));

  const estCostAvg = costs.length
    ? Math.round(costs.reduce((s: number, v: number) => s + v, 0) / costs.length)
    : null;

  const topIssues = (Array.isArray(top) ? top : []).slice(0, 6) as TopSorun[];

  return {
    count: rows.length,
    riskTotal,
    avgSeverity,
    avgFrequency,
    estCostAvg,
    topIssues,
  };
}

// ====== SelectBox Component ======
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
            <Text style={styles.selectBoxLoadingText}>Yükleniyor…</Text>
          </View>
        ) : (
          <>
            <Text
              numberOfLines={1}
              style={[
                styles.selectBoxValue,
                !value && styles.selectBoxPlaceholder,
              ]}
            >
              {value || placeholder}
            </Text>
            <Text style={styles.selectBoxChevron}>
              {open ? '▲' : '▼'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {open && !loading && (
        <View style={styles.optionsPanel}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {options.length > 0 ? (
              options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.7}
                  style={styles.optionItem}
                  onPress={() => handleSelect(opt)}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={[styles.optionItem, { paddingVertical: 16 }]}>
                <Text style={styles.optionTextEmpty}>Seçenek bulunamadı</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ====== Risk Indicator Component ======
function RiskIndicator({ riskPuani }: { riskPuani: number | null }) {
  if (riskPuani === null) {
    return (
      <View style={styles.riskContainer}>
        <Text style={styles.riskYok}>Veri yok</Text>
      </View>
    );
  }

  const getRiskColor = (risk: number) => {
    if (risk <= 3) return '#10b981';
    if (risk <= 6) return '#f59e0b';
    return '#ef4444';
  };

  const getRiskSeviye = (risk: number) => {
    if (risk <= 3) return 'Düşük Risk';
    if (risk <= 6) return 'Orta Risk';
    return 'Yüksek Risk';
  };

  return (
    <View style={styles.riskContainer}>
      <View style={styles.riskHeader}>
        <Text style={styles.riskPuan}>{riskPuani.toFixed(1)}/10</Text>
        <Text style={[styles.riskSeviye, { color: getRiskColor(riskPuani) }]}>
          {getRiskSeviye(riskPuani)}
        </Text>
      </View>
      <View style={styles.riskBar}>
        <View 
          style={[
            styles.riskFill,
            { 
              width: `${(riskPuani / 10) * 100}%`,
              backgroundColor: getRiskColor(riskPuani)
            }
          ]} 
        />
      </View>
    </View>
  );
}

// ====== Main Screen ======
export default function CompareDecisionScreen() {
  const [brands, setBrands] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  const [models1, setModels1] = useState<string[]>([]);
  const [models2, setModels2] = useState<string[]>([]);
  const [motors1, setMotors1] = useState<string[]>([]);
  const [motors2, setMotors2] = useState<string[]>([]);
  const [loadingModels1, setLoadingModels1] = useState(false);
  const [loadingModels2, setLoadingModels2] = useState(false);
  const [loadingMotors1, setLoadingMotors1] = useState(false);
  const [loadingMotors2, setLoadingMotors2] = useState(false);

  const [items, setItems] = useState<Item[]>([
    { marka: '', model: '', motor: '', km: '' },
    { marka: '', model: '', motor: '', km: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [queried, setQueried] = useState(false);

  const [kronikResults, setKronikResults] = useState<(KronikOzetResp | null)[]>([null, null]);
  const [bakimResults, setBakimResults] = useState<(BakimResponse | null)[]>([null, null]);

  // Marka listesi
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoadingBrands(true);
        const res = await fetchJson<OptionsResponse>('/api/filter-options');
        const raw = res.markalar ?? [];
        const unique = Array.from(new Set(raw)).sort((a, b) => a.localeCompare(b, 'tr'));
        setBrands(unique);
      } catch (e: any) {
        console.error('Marka yükleme hatası', e);
        setErrorMsg('Marka listesi alınamadı.');
      } finally {
        setLoadingBrands(false);
      }
    };
    loadBrands();
  }, []);

  const updateItem = (index: number, patch: Partial<Item>) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    );
  };

  const loadModels = async (index: 0 | 1, marka: string) => {
    if (!marka) {
      if (index === 0) setModels1([]);
      else setModels2([]);
      return;
    }
    try {
      index === 0 ? setLoadingModels1(true) : setLoadingModels2(true);
      const res = await fetchJson<OptionsResponse>(
        `/api/filter-options?marka=${encodeURIComponent(marka)}`,
      );
      const raw = res.modeller ?? [];
      const unique = Array.from(new Set(raw)).sort((a, b) => a.localeCompare(b, 'tr'));
      if (index === 0) setModels1(unique);
      else setModels2(unique);
    } catch (e) {
      console.error('Model yükleme hatası', e);
      setErrorMsg('Model listesi alınamadı.');
    } finally {
      index === 0 ? setLoadingModels1(false) : setLoadingModels2(false);
    }
  };

  const loadMotors = async (index: 0 | 1, marka: string, model: string) => {
    if (!marka || !model) {
      if (index === 0) setMotors1([]);
      else setMotors2([]);
      return;
    }
    try {
      index === 0 ? setLoadingMotors1(true) : setLoadingMotors2(true);
      const res = await fetchJson<OptionsResponse>(
        `/api/filter-options?marka=${encodeURIComponent(marka)}&model=${encodeURIComponent(model)}`,
      );
      const raw = res.motorlar ?? [];
      const unique = Array.from(new Set(raw)).sort((a, b) => a.localeCompare(b, 'tr'));
      if (index === 0) setMotors1(unique);
      else setMotors2(unique);
    } catch (e) {
      console.error('Motor yükleme hatası', e);
      setErrorMsg('Motor listesi alınamadı.');
    } finally {
      index === 0 ? setLoadingMotors1(false) : setLoadingMotors2(false);
    }
  };

  const readyFlags = items.map(
    (it) =>
      !!(it.marka && it.model && it.motor && it.km) &&
      !Number.isNaN(parseInt(it.km, 10)),
  );
  const canCompare = readyFlags.every(Boolean);

  const handleCompare = async () => {
    if (!canCompare) {
      setErrorMsg('Her iki araç için de marka, model, motor ve km değerini doldur.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setQueried(true);
    setKronikResults([null, null]);
    setBakimResults([null, null]);

    try {
      const promises = items.map(async (it) => {
        const kronikQs = new URLSearchParams({
          marka: it.marka,
          model: it.model,
        }).toString();
        const bakimQs = new URLSearchParams({
          marka: it.marka,
          model: it.model,
          motor: it.motor,
          km: String(parseInt(it.km, 10)),
        }).toString();

        const [kronik, bakim] = await Promise.all([
          fetchJson<KronikOzetResp>(`/api/kronik-ozet?${kronikQs}`),
          fetchJson<BakimResponse>(`/api/bakim?${bakimQs}`),
        ]);

        return { kronik, bakim };
      });

      const res = await Promise.all(promises);
      setKronikResults(res.map(r => r.kronik));
      setBakimResults(res.map(r => r.bakim));
    } catch (e: any) {
      console.error('Karşılaştırma hatası', e);
      setErrorMsg(e?.message || 'Karşılaştırma sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const chronicMetrics = useMemo(
    () => kronikResults.map((k) => computeChronicMetrics(k)),
    [kronikResults],
  );

  const nextMaintenance = useMemo(() => {
    return bakimResults.map((res, idx) => {
      if (!res) return null;
      const km = Number.parseInt(items[idx]?.km || '0', 10) || 0;
      const yapilmayanKm = (res.yapilmayan ?? []).map((x) => x.km);
      const nextDueKm = yapilmayanKm.length ? Math.min(...yapilmayanKm) : null;
      const nextInKm = nextDueKm == null ? null : Math.max(nextDueKm - km, 0);
      return nextInKm;
    });
  }, [bakimResults, items]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Araç Karşılaştır</Text>
          <Text style={styles.subtitle}>
            İki aracı kronik sorunlar ve bakım durumu açısından karşılaştırın
          </Text>
        </View>

        {/* Input Sections */}
        <View style={styles.inputContainer}>
          {[0, 1].map((index) => (
            <View key={index} style={styles.vehicleSection}>
              <Text style={styles.vehicleLabel}>{index + 1}. Araç</Text>
              
              <SelectBox
                label="Marka"
                value={items[index].marka}
                placeholder="Marka seçin"
                options={brands}
                loading={loadingBrands}
                onChange={(val) => {
                  updateItem(index, { marka: val, model: '', motor: '' });
                  if (index === 0) setModels1([]);
                  else setModels2([]);
                  loadModels(index as 0 | 1, val);
                }}
              />

              <SelectBox
                label="Model"
                value={items[index].model}
                placeholder={
                  items[index].marka
                    ? (index === 0 ? models1 : models2).length
                      ? 'Model seçin'
                      : 'Model bulunamadı'
                    : 'Önce marka seçin'
                }
                options={items[index].marka ? (index === 0 ? models1 : models2) : []}
                disabled={!items[index].marka}
                loading={index === 0 ? loadingModels1 : loadingModels2}
                onChange={(val) => {
                  updateItem(index, { model: val, motor: '' });
                  if (index === 0) setMotors1([]);
                  else setMotors2([]);
                  loadMotors(index as 0 | 1, items[index].marka, val);
                }}
              />

              <SelectBox
                label="Motor"
                value={items[index].motor}
                placeholder={
                  items[index].model
                    ? (index === 0 ? motors1 : motors2).length
                      ? 'Motor seçin'
                      : 'Motor bulunamadı'
                    : 'Önce model seçin'
                }
                options={items[index].model ? (index === 0 ? motors1 : motors2) : []}
                disabled={!items[index].model}
                loading={index === 0 ? loadingMotors1 : loadingMotors2}
                onChange={(val) => updateItem(index, { motor: val })}
              />

              <View style={styles.field}>
                <Text style={styles.label}>Mevcut kilometre</Text>
                <View style={styles.kmInputWrapper}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="85000"
                    value={items[index].km}
                    onChangeText={(val) => updateItem(index, { km: val })}
                  />
                  <Text style={styles.kmSuffix}>km</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Compare Button */}
        <TouchableOpacity
          style={[styles.compareButton, (!canCompare || loading) && styles.buttonDisabled]}
          onPress={handleCompare}
          disabled={!canCompare || loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.compareButtonText}>Karşılaştır</Text>
          )}
        </TouchableOpacity>

        {errorMsg && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Results */}
        {queried && (
          <>
            {/* Quick Metrics */}
            <View style={styles.metricsContainer}>
              <Text style={styles.resultsTitle}>Karşılaştırma Sonuçları</Text>
              
              <View style={styles.metricsGrid}>
                {[0, 1].map((index) => (
                  <View key={index} style={styles.metricCard}>
                    <Text style={styles.vehicleName}>
                      {items[index].marka} {items[index].model}
                    </Text>
                    
                    <View style={styles.metricRow}>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricValue}>{chronicMetrics[index].count}</Text>
                        <Text style={styles.metricLabel}>Kayıtlı Sorun</Text>
                      </View>
                      
                      <View style={styles.metricItem}>
                        <Text style={styles.metricValue}>
                          {chronicMetrics[index].riskTotal > 0 ? chronicMetrics[index].riskTotal : '—'}
                        </Text>
                        <Text style={styles.metricLabel}>Risk Skoru</Text>
                      </View>
                    </View>

                    <View style={styles.metricRow}>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricValue}>
                          {formatTL(chronicMetrics[index].estCostAvg)}
                        </Text>
                        <Text style={styles.metricLabel}>Ort. Maliyet</Text>
                      </View>
                      
                      <View style={styles.metricItem}>
                        <Text style={styles.metricValue}>
                          {formatKm(nextMaintenance[index])}
                        </Text>
                        <Text style={styles.metricLabel}>Sonraki Bakım</Text>
                      </View>
                    </View>

                    <RiskIndicator riskPuani={
                      chronicMetrics[index].riskTotal > 0 ? 
                      Math.min(chronicMetrics[index].riskTotal / 10, 10) : null
                    } />
                  </View>
                ))}
              </View>
            </View>

            {/* Chronic Issues */}
            <View style={styles.issuesContainer}>
              <Text style={styles.sectionTitle}>Kronik Sorunlar</Text>
              <View style={styles.issuesGrid}>
                {[0, 1].map((index) => (
                  <View key={index} style={styles.issuesCard}>
                    <Text style={styles.issuesCardTitle}>
                      {items[index].marka} {items[index].model}
                    </Text>
                    
                    {chronicMetrics[index].topIssues.length > 0 ? (
                      chronicMetrics[index].topIssues.map((issue, i) => (
                        <View key={i} style={styles.issueItem}>
                          <Text style={styles.issueTitle}>{issue.baslik}</Text>
                          <View style={styles.issueMeta}>
                            {issue.siddet_1_5 && (
                              <Text style={[styles.issueStat, { color: getSeverityColor(issue.siddet_1_5) }]}>
                                Şiddet: {issue.siddet_1_5}
                              </Text>
                            )}
                            {issue.siklik_1_5 && (
                              <Text style={[styles.issueStat, { color: getFrequencyColor(issue.siklik_1_5) }]}>
                                Sıklık: {issue.siklik_1_5}
                              </Text>
                            )}
                            {issue.tahmini_maliyet_tl && (
                              <Text style={styles.issueCost}>
                                {formatTL(issue.tahmini_maliyet_tl)}
                              </Text>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>Kayıtlı sorun bulunamadı</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Önemli Not</Text>
              <Text style={styles.infoText}>
                Gösterilen değerler istatistiksel verilere dayanır. Gerçek durum aracın 
                bakım geçmişi ve kullanım koşullarına göre değişiklik gösterebilir.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ====== STYLES ======
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
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  vehicleSection: {
    flex: 1,
  },
  vehicleLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
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
  compareButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  compareButtonText: {
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
  metricsContainer: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  riskContainer: {
    marginTop: 8,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskPuan: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  riskSeviye: {
    fontSize: 14,
    fontWeight: '600',
  },
  riskBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  riskFill: {
    height: '100%',
    borderRadius: 4,
  },
  riskYok: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  issuesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  issuesGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  issuesCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  issuesCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  issueItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  issueMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  issueStat: {
    fontSize: 12,
    fontWeight: '500',
  },
  issueCost: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});