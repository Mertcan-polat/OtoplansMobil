// src/screens/EvGuideScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// TODO: Gerekirse burayı kendi ortamına göre değiştir
const API_BASE = 'https://otoplans.net';

type RangeBlock = {
  real: { min_km: number | null; max_km: number | null } | null;
  cold: { city_km: number | null; highway_km: number | null; combined_km: number | null } | null;
  mild: { city_km: number | null; highway_km: number | null; combined_km: number | null } | null;
};

type BatteryBlock = {
  usable_kwh: number | null;
  nominal_kwh: number | null;
  type: string | null;
  cells: number | null;
  cathode_material: string | null;
  pack_config: string | null;
  architecture_v: number | null;
  nominal_voltage_v: number | null;
  warranty_years: number | null;
  warranty_km: number | null;
};

type EvListItem = {
  marka?: string;
  model?: string;
  varyant_norm?: string | null;
  wltp_km?: number | null;
  battery_usable_kwh?: number | null;
  battery_nominal_kwh?: number | null;
  ac_max_kw?: number | null;
  ac_phases?: number | null;
  dc_max_kw?: number | null;
  dc_10_80_min?: number | null;
  accel_0_100_s?: number | null;
  top_speed_kmh?: number | null;
  power_kw?: number | null;
  drivetrain?: string | null;
  body?: string | null;
  seats?: number | null;
  length_mm?: number | null;
  width_mm?: number | null;
  height_mm?: number | null;
  wheelbase_mm?: number | null;
  boot_l_min?: number | null;
  boot_l_max?: number | null;
  weight_kg?: number | null;
  soket_ac?: string | null;
  soket_dc?: string | null;
  source_url?: string | null;
  src_ids?: number[] | null;
  efficiency_wh_km?: number | null;
  kimya?: string | null;
  volt_mimari_v?: number | null;
  v2l?: boolean | null;
  v2l_kw?: number | null;
  range?: RangeBlock | null;
  battery?: BatteryBlock | null;
};

type EvListResponse = {
  items: EvListItem[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
};

type EvOptionsResponse = {
  markalar?: string[];
  modeller?: string[];
  error?: string;
};

type EvDetailResponse = {
  merged: EvListItem;
  sources: any[];
  fields: Record<string, boolean>;
  range: RangeBlock;
  battery: BatteryBlock;
  error?: string;
};

// --------- küçük helperlar ---------
const formatNumber = (v: any): string =>
  v == null || Number.isNaN(Number(v)) ? '–' : Number(v).toLocaleString('tr-TR');

const fmtWithUnit = (v: any, unit: string): string =>
  v == null || Number.isNaN(Number(v)) ? '–' : `${Number(v).toLocaleString('tr-TR')} ${unit}`;

const hasRealRange = (r?: RangeBlock | null): boolean => {
  if (!r) return false;
  return !!(
    r.real?.min_km ||
    r.real?.max_km ||
    r.cold?.city_km ||
    r.cold?.highway_km ||
    r.cold?.combined_km ||
    r.mild?.city_km ||
    r.mild?.highway_km ||
    r.mild?.combined_km
  );
};

const estimateRangeKm = (src: { battery_usable_kwh?: any; efficiency_wh_km?: any }): number | null => {
  const usable = Number(src.battery_usable_kwh);
  const eff = Number(src.efficiency_wh_km);
  if (!Number.isFinite(usable) || !Number.isFinite(eff) || eff <= 0) return null;
  return Math.round((usable * 1000) / eff);
};

const getRangeBadge = (
  it: EvListItem,
): { label: 'Gerçek' | 'Tahmini'; text: string } | null => {
  const r = it.range;
  if (r?.real?.min_km && r?.real?.max_km) {
    return {
      label: 'Gerçek',
      text: `${r.real.min_km}–${r.real.max_km} km`,
    };
  }
  const est = estimateRangeKm(it);
  if (est) {
    return {
      label: 'Tahmini',
      text: `~${est.toLocaleString('tr-TR')} km`,
    };
  }
  return null;
};

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

// Kart verisinden default range/batarya üreticiler
const buildDefaultRange = (item: EvListItem): RangeBlock => ({
  real: {
    min_km: item.range?.real?.min_km ?? null,
    max_km: item.range?.real?.max_km ?? null,
  },
  cold: {
    city_km: item.range?.cold?.city_km ?? null,
    highway_km: item.range?.cold?.highway_km ?? null,
    combined_km: item.range?.cold?.combined_km ?? null,
  },
  mild: {
    city_km: item.range?.mild?.city_km ?? null,
    highway_km: item.range?.mild?.highway_km ?? null,
    combined_km: item.range?.mild?.combined_km ?? null,
  },
});

const buildDefaultBattery = (item: EvListItem): BatteryBlock => ({
  usable_kwh: item.battery?.usable_kwh ?? item.battery_usable_kwh ?? null,
  nominal_kwh: item.battery?.nominal_kwh ?? item.battery_nominal_kwh ?? null,
  type: item.battery?.type ?? item.kimya ?? null,
  cells: item.battery?.cells ?? null,
  cathode_material: item.battery?.cathode_material ?? null,
  pack_config: item.battery?.pack_config ?? null,
  architecture_v: item.battery?.architecture_v ?? item.volt_mimari_v ?? null,
  nominal_voltage_v: item.battery?.nominal_voltage_v ?? null,
  warranty_years: item.battery?.warranty_years ?? null,
  warranty_km: item.battery?.warranty_km ?? null,
});

// --------- küçük UI bileşenleri ---------
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
        ]}
      >
        {loading ? (
          <View style={styles.selectBoxLoading}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.selectBoxLoadingText}>Yükleniyor…</Text>
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

      {open && !loading && (
        <View style={styles.optionsPanel}>
          {options.length > 0 ? (
            <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => handleSelect(opt)}
                  activeOpacity={0.85}
                  style={styles.optionItem}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.optionItem, { paddingVertical: 10 }]}>
              <Text style={styles.optionTextEmpty}>Seçenek bulunamadı.</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function KpiBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpiBox}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoRowLabel}>{label}</Text>
      <Text style={styles.infoRowValue}>{value}</Text>
    </View>
  );
}

// --------- Ana ekran ---------
export default function EvGuideScreen() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [search, setSearch] = useState('');

  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  const [loadingList, setLoadingList] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [items, setItems] = useState<EvListItem[]>([]);
  const [total, setTotal] = useState(0);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<EvDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ----- MARKALAR -----
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoadingBrands(true);
        setErrorMsg(null);
        const res = await fetchJson<EvOptionsResponse>('/api/ev/options');
        const raw = res.markalar ?? [];
        const unique = Array.from(new Set(raw)).sort((a, b) =>
          a.localeCompare(b, 'tr'),
        );
        setBrands(unique);
      } catch (e: any) {
        console.error('[EV] Marka yükleme hatası', e);
        setErrorMsg('EV marka listesi alınamadı.');
      } finally {
        setLoadingBrands(false);
      }
    };
    loadBrands();
  }, []);

  // ----- MARKA DEĞİŞİNCE MODELLER -----
  const handleBrandChange = async (val: string) => {
    setBrand(val);
    setModel('');
    setModels([]);
    if (!val) return;
    try {
      setLoadingModels(true);
      setErrorMsg(null);
      const res = await fetchJson<EvOptionsResponse>(
        `/api/ev/options?marka=${encodeURIComponent(val)}`,
      );
      const raw = res.modeller ?? [];
      const unique = Array.from(new Set(raw)).sort((a, b) =>
        a.localeCompare(b, 'tr'),
      );
      setModels(unique);
    } catch (e: any) {
      console.error('[EV] Model yükleme hatası', e);
      setErrorMsg('EV model listesi alınamadı.');
    } finally {
      setLoadingModels(false);
    }
  };

  // ----- LİSTE ARAMA -----
  const onSearchList = async () => {
    if (!brand && !search && !model) {
      setErrorMsg('En azından marka, model veya arama kelimesi gir.');
      return;
    }
    setErrorMsg(null);
    setLoadingList(true);
    setItems([]);
    setTotal(0);

    try {
      const params = new URLSearchParams();
      if (brand) params.set('marka', brand);
      if (model) params.set('model', model);
      if (search.trim()) params.set('q', search.trim());
      params.set('omitGeneric', 'true');
      params.set('page', '1');
      params.set('pageSize', '50');

      const res = await fetchJson<EvListResponse>(
        `/api/ev/models?${params.toString()}`,
      );

      if (res.error) {
        setErrorMsg(res.error);
      }

      setItems(res.items ?? []);
      setTotal(res.total ?? (res.items?.length || 0));
    } catch (e: any) {
      console.error('[EV] Liste çekme hatası', e);
      setErrorMsg('EV listesi alınırken bir hata oluştu.');
    } finally {
      setLoadingList(false);
    }
  };

  // ----- DETAY -----
  const openDetail = async (item: EvListItem) => {
    console.log('[EV] Detay açılıyor:', item.marka, item.model, item.varyant_norm);

    const baseRange = buildDefaultRange(item);
    const baseBattery = buildDefaultBattery(item);

    // Önce karttaki veriyi hemen göster
    setDetailVisible(true);
    setDetailLoading(true);
    setDetailData({
      merged: item,
      sources: [],
      fields: {},
      range: baseRange,
      battery: baseBattery,
    });

    const id =
      Array.isArray(item.src_ids) && item.src_ids.length
        ? Number(item.src_ids[0])
        : NaN;

    // Kaynak ID yoksa API'ye gitme, sadece mevcut veriyi göster
    if (!Number.isFinite(id)) {
      setDetailLoading(false);
      return;
    }

    // Kaynak ID varsa detay isteği at
    try {
      const res = await fetchJson<EvDetailResponse>(
        `/api/ev/model?id=${id}&includeSources=true`,
      );
      setDetailData(res);
    } catch (e: any) {
      console.error('[EV] Detay çekme hatası', e);
      setDetailData((prev) =>
        prev
          ? { ...prev, error: 'Detaylar tam alınamadı.' }
          : {
              merged: item,
              sources: [],
              fields: {},
              range: baseRange,
              battery: baseBattery,
              error: 'Detaylar tam alınamadı.',
            },
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const badgeText = useMemo(() => {
    if (!items.length) return '';
    if (!total) return `${items.length} sonuç listelendi`;
    return `${total} sonuçtan ilk ${items.length} tanesi listelendi`;
  }, [items, total]);

  // --------- RENDER DETAY ---------
  const renderDetailContent = () => {
    if (!detailVisible) return null;

    if (!detailData && !detailLoading) {
      return (
        <View style={styles.detailContainer}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>Detay bulunamadı</Text>
            <TouchableOpacity
              onPress={() => setDetailVisible(false)}
              style={styles.detailCloseBtn}
            >
              <Text style={styles.detailCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helper}>
            Bir hata nedeniyle detay verisi alınamadı.
          </Text>
        </View>
      );
    }

    const merged = detailData?.merged;
    const r = detailData?.range;
    const b = detailData?.battery;

    const realRangeAvailable = hasRealRange(r);
    const estRange = !realRangeAvailable && merged
      ? estimateRangeKm(merged)
      : null;

    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailBrand}>{merged?.marka ?? '–'}</Text>
            <Text style={styles.detailTitle}>
              {merged?.model ?? '–'}
              {merged?.varyant_norm ? ` • ${merged.varyant_norm}` : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setDetailVisible(false)}
            style={styles.detailCloseBtn}
          >
            <Text style={styles.detailCloseText}>✕</Text>
          </TouchableOpacity>
        </View>

        {detailLoading && (
          <View style={{ paddingVertical: 16 }}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.detailLoadingText}>Detaylar yükleniyor…</Text>
          </View>
        )}

        {!detailLoading && merged && (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Genel */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Genel</Text>
              <InfoRow label="WLTP" value={fmtWithUnit(merged.wltp_km, 'km')} />
              <InfoRow
                label="Gövde"
                value={merged.body ?? '–'}
              />
              <InfoRow
                label="Aktarma"
                value={merged.drivetrain ?? '–'}
              />
              <InfoRow
                label="0-100 km/s"
                value={fmtWithUnit(merged.accel_0_100_s, 'sn')}
              />
              <InfoRow
                label="Azami hız"
                value={fmtWithUnit(merged.top_speed_kmh, 'km/s')}
              />
              <InfoRow
                label="Güç"
                value={fmtWithUnit(merged.power_kw, 'kW')}
              />
              <InfoRow
                label="Koltuk sayısı"
                value={formatNumber(merged.seats)}
              />
            </View>

            {/* Batarya & Şarj */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Batarya & Şarj</Text>
              <InfoRow
                label="Batarya (net / brüt)"
                value={
                  merged.battery_usable_kwh || merged.battery_nominal_kwh
                    ? `${fmtWithUnit(merged.battery_usable_kwh, 'kWh')} / ${fmtWithUnit(
                        merged.battery_nominal_kwh,
                        'kWh',
                      )}`
                    : '–'
                }
              />
              <InfoRow
                label="Batarya tipi"
                value={b?.type ?? merged.kimya ?? '–'}
              />
              <InfoRow
                label="Katot"
                value={b?.cathode_material ?? '–'}
              />
              <InfoRow
                label="Mimari"
                value={
                  b?.architecture_v || merged.volt_mimari_v
                    ? fmtWithUnit(b?.architecture_v ?? merged.volt_mimari_v, 'V')
                    : '–'
                }
              />
              <InfoRow
                label="AC şarj (OBC)"
                value={
                  merged.ac_max_kw
                    ? `${formatNumber(merged.ac_max_kw)} kW${
                        merged.ac_phases ? ` / ${merged.ac_phases} faz` : ''
                      }`
                    : '–'
                }
              />
              <InfoRow
                label="DC tepe güç"
                value={fmtWithUnit(merged.dc_max_kw, 'kW')}
              />
              <InfoRow
                label="10–80% DC süre"
                value={
                  merged.dc_10_80_min != null
                    ? fmtWithUnit(merged.dc_10_80_min, 'dk')
                    : '–'
                }
              />
              <InfoRow
                label="Soket (AC / DC)"
                value={`${merged.soket_ac ?? '–'} / ${merged.soket_dc ?? '–'}`}
              />
              <InfoRow
                label="V2L"
                value={
                  merged.v2l
                    ? merged.v2l_kw
                      ? `Var (${formatNumber(merged.v2l_kw)} kW)`
                      : 'Var'
                    : '–'
                }
              />
              <InfoRow
                label="Garanti"
                value={
                  b?.warranty_years || b?.warranty_km
                    ? `${b?.warranty_years ?? '–'} yıl / ${
                        b?.warranty_km
                          ? fmtWithUnit(b.warranty_km, 'km')
                          : '–'
                      }`
                    : '–'
                }
              />
            </View>

            {/* Menzil */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Menzil</Text>
              {realRangeAvailable ? (
                <>
                  <InfoRow
                    label="Gerçek (min–maks)"
                    value={
                      r?.real
                        ? `${formatNumber(r.real.min_km)}–${fmtWithUnit(
                            r.real.max_km,
                            'km',
                          )}`
                        : '–'
                    }
                  />
                  <InfoRow
                    label="Ilıman / karma"
                    value={
                      r?.mild?.combined_km
                        ? fmtWithUnit(r.mild.combined_km, 'km')
                        : '–'
                    }
                  />
                  <InfoRow
                    label="Soğuk / şehir"
                    value={
                      r?.cold?.city_km
                        ? fmtWithUnit(r.cold.city_km, 'km')
                        : '–'
                    }
                  />
                  <InfoRow
                    label="Soğuk / otoyol"
                    value={
                      r?.cold?.highway_km
                        ? fmtWithUnit(r.cold.highway_km, 'km')
                        : '–'
                    }
                  />
                </>
              ) : (
                <>
                  <InfoRow
                    label="Tahmini menzil"
                    value={
                      estRange
                        ? `~${estRange.toLocaleString('tr-TR')} km`
                        : '–'
                    }
                  />
                  <InfoRow
                    label="Formül"
                    value="Kullanılabilir kWh × 1000 / (Wh/km)"
                  />
                  <InfoRow
                    label="Girdi (kullanılabilir)"
                    value={fmtWithUnit(merged.battery_usable_kwh, 'kWh')}
                  />
                  <InfoRow
                    label="Girdi (tüketim)"
                    value={fmtWithUnit(merged.efficiency_wh_km, 'Wh/km')}
                  />
                  <InfoRow
                    label="Not"
                    value="Tahmini hesap; resmi veri değildir."
                  />
                </>
              )}
            </View>

            {/* Boyut & Ağırlık */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Boyut & Ağırlık</Text>
              <InfoRow
                label="Uzunluk"
                value={fmtWithUnit(merged.length_mm, 'mm')}
              />
              <InfoRow
                label="Genişlik"
                value={fmtWithUnit(merged.width_mm, 'mm')}
              />
              <InfoRow
                label="Yükseklik"
                value={fmtWithUnit(merged.height_mm, 'mm')}
              />
              <InfoRow
                label="Dingil mesafesi"
                value={fmtWithUnit(merged.wheelbase_mm, 'mm')}
              />
              <InfoRow
                label="Bagaj (min/maks)"
                value={
                  merged.boot_l_min || merged.boot_l_max
                    ? `${formatNumber(merged.boot_l_min)} / ${formatNumber(
                        merged.boot_l_max,
                      )} L`
                    : '–'
                }
              />
              <InfoRow
                label="Ağırlık"
                value={fmtWithUnit(merged.weight_kg, 'kg')}
              />
            </View>

            {/* Kaynak */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Kaynak</Text>
              {merged.source_url ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(merged.source_url!)}
                >
                  <Text style={styles.linkText}>
                    Kaynağı aç (EV Database / üretici sitesi)
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.helper}>
                  Bu kayıt için kaynak bağlantısı işlenmemiş.
                </Text>
              )}
            </View>

            {detailData?.error && (
              <Text style={[styles.errorText, { marginTop: 8 }]}>
                Not: {detailData.error}
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Başlık */}
        <Text style={styles.title}>Elektrikli Araç Rehberi</Text>
        <Text style={styles.subtitle}>
          Türkiye’de satılan elektrikli araçların batarya, menzil ve şarj
          hızlarını tek ekranda kıyasla.
        </Text>

        {/* Filtre kutusu */}
        <View style={styles.filterBox}>
          <SelectBox
            label="Marka"
            value={brand}
            placeholder="Tüm markalar"
            options={brands}
            loading={loadingBrands}
            onChange={handleBrandChange}
          />

          <SelectBox
            label="Model"
            value={model}
            placeholder={
              brand
                ? models.length
                  ? 'Tüm modeller'
                  : 'Bu markada model yok'
                : 'Önce marka seç (opsiyonel)'
            }
            options={brand ? models : []}
            disabled={!brand || models.length === 0}
            loading={loadingModels}
            onChange={setModel}
          />

          <View style={styles.field}>
            <Text style={styles.label}>Arama (opsiyonel)</Text>
            <TextInput
              placeholder={'Model, özellik: "LFP", "800V"...'}
              style={styles.input}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loadingList && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={onSearchList}
            disabled={loadingList}
          >
            {loadingList ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>EV modellerini listele</Text>
            )}
          </TouchableOpacity>

          {badgeText ? (
            <Text style={styles.listInfo}>{badgeText}</Text>
          ) : null}
        </View>

        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        {/* Liste */}
        {loadingList && (
          <View style={{ marginTop: 16 }}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.helper}>EV listesi yükleniyor…</Text>
          </View>
        )}

        {!loadingList && items.length === 0 && !errorMsg && (
          <Text style={styles.helper}>
            Bir marka/model seçip ya da spesifik bir kelimeyle (örneğin
            “Elettrica 54 kWh”, “LFP batarya”, “800V mimari”) arama yaparak
            listelenen EV modelleri inceleyebilirsin.
          </Text>
        )}

        {!loadingList && items.length > 0 && (
          <View style={styles.cardsGrid}>
            {items.map((it, idx) => {
              const badge = getRangeBadge(it);
              return (
                <TouchableOpacity
                  key={`${it.marka}-${it.model}-${it.varyant_norm}-${idx}`}
                  style={styles.card}
                  activeOpacity={0.9}
                  onPress={() => openDetail(it)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardBrand}>{it.marka ?? '–'}</Text>
                    <Text style={styles.cardTitle}>{it.model ?? '–'}</Text>
                    {it.varyant_norm && (
                      <Text style={styles.cardVariant}>{it.varyant_norm}</Text>
                    )}
                  </View>

                  <View style={styles.kpiRow}>
                    <KpiBox
                      label="WLTP"
                      value={it.wltp_km ? `${it.wltp_km} km` : '–'}
                    />
                    <KpiBox
                      label="Net batarya"
                      value={
                        it.battery_usable_kwh != null
                          ? `${it.battery_usable_kwh} kWh`
                          : '–'
                      }
                    />
                  </View>
                  <View style={styles.kpiRow}>
                    <KpiBox
                      label="AC şarj"
                      value={
                        it.ac_max_kw != null
                          ? `${it.ac_max_kw} kW`
                          : '–'
                      }
                    />
                    <KpiBox
                      label="DC şarj"
                      value={
                        it.dc_max_kw != null
                          ? `${it.dc_max_kw} kW`
                          : '–'
                      }
                    />
                  </View>

                  {badge && (
                    <View
                      style={[
                        styles.badge,
                        badge.label === 'Gerçek'
                          ? styles.badgeReal
                          : styles.badgeEstimated,
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {badge.label}: {badge.text}
                      </Text>
                    </View>
                  )}

                  <View style={styles.cardFooterRow}>
                    <Text style={styles.cardFooterText}>
                      {it.drivetrain ?? 'Aktarma: –'}
                    </Text>
                    <Text style={styles.cardFooterText}>
                      {it.body ?? 'Gövde: –'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Detay Modal */}
      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {renderDetailContent()}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#4b5563',
  },

  // Filtre kutusu
  filterBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },

  field: {
    marginTop: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },

  // SelectBox
  selectBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectBoxDisabled: {
    opacity: 0.6,
  },
  selectBoxValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  selectBoxPlaceholder: {
    color: '#9ca3af',
  },
  selectBoxChevron: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6b7280',
  },
  selectBoxLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectBoxLoadingText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
  },
  optionsPanel: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  optionItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionText: {
    fontSize: 14,
    color: '#111827',
  },
  optionTextEmpty: {
    fontSize: 13,
    color: '#6b7280',
  },

  button: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  listInfo: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 10,
    fontSize: 12,
    color: '#b91c1c',
  },
  helper: {
    marginTop: 16,
    fontSize: 12,
    color: '#6b7280',
  },

  // Kartlar
  cardsGrid: {
    marginTop: 18,
    gap: 10,
  } as any,
  card: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardBrand: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#6b7280',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  cardVariant: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 2,
  },

  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  kpiBox: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  kpiValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },

  badge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeReal: {
    backgroundColor: '#d1fae5',
  },
  badgeEstimated: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
  },

  cardFooterRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardFooterText: {
    fontSize: 11,
    color: '#6b7280',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.65)',
    justifyContent: 'center',   // ortada
    alignItems: 'center',       // yatayda ortala
  },
  detailContainer: {
    maxHeight: '90%',
    width: '94%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailBrand: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#6b7280',
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  detailCloseBtn: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailCloseText: {
    fontSize: 18,
    color: '#6b7280',
  },
  detailLoadingText: {
    marginTop: 6,
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
  },

  sectionBox: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    padding: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  infoRowLabel: {
    fontSize: 12,
    color: '#4b5563',
    flex: 1.1,
    marginRight: 8,
  },
  infoRowValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },

  linkText: {
    fontSize: 12,
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
});
