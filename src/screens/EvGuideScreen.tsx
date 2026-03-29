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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

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
  torque_nm?: number | null;
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
  tow_braked_kg?: number | null;
  tow_unbraked_kg?: number | null;
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
  const url = `${API_BASE}${path}`;
  const res = await fetch(url);

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg = (json && (json.error || json.message)) || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return json as T;
}

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

      {open && !loading && (
        <View style={styles.optionsPanel}>
          {options.length > 0 ? (
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
          ) : (
            <View style={styles.emptyOption}>
              <Text style={styles.emptyOptionText}>Seçenek bulunamadı</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
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

  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoadingBrands(true);
        setErrorMsg(null);
        const res = await fetchJson<EvOptionsResponse>('/api/ev/options');
        const raw = res.markalar ?? [];
        const unique = Array.from(new Set(raw)).sort((a, b) => a.localeCompare(b, 'tr'));
        setBrands(unique);
      } catch (e) {
        console.error('[EV] Marka yükleme hatası', e);
        setErrorMsg('EV marka listesi alınamadı.');
      } finally {
        setLoadingBrands(false);
      }
    };

    loadBrands();
  }, []);

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
      const unique = Array.from(new Set(raw)).sort((a, b) => a.localeCompare(b, 'tr'));
      setModels(unique);
    } catch (e) {
      console.error('[EV] Model yükleme hatası', e);
      setErrorMsg('EV model listesi alınamadı.');
    } finally {
      setLoadingModels(false);
    }
  };

  const onSearchList = async () => {
    if (!brand && !search && !model) {
      setErrorMsg('En az bir marka, model veya arama kelimesi gir.');
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

      const res = await fetchJson<EvListResponse>(`/api/ev/models?${params.toString()}`);

      if (res.error) {
        setErrorMsg(res.error);
      }

      setItems(res.items ?? []);
      setTotal(res.total ?? (res.items?.length || 0));
    } catch (e) {
      console.error('[EV] Liste çekme hatası', e);
      setErrorMsg('EV listesi alınırken bir hata oluştu.');
    } finally {
      setLoadingList(false);
    }
  };

  const openDetail = async (item: EvListItem) => {
    const baseRange = buildDefaultRange(item);
    const baseBattery = buildDefaultBattery(item);

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

    if (!Number.isFinite(id)) {
      setDetailLoading(false);
      return;
    }

    try {
      const res = await fetchJson<EvDetailResponse>(
        `/api/ev/model?id=${id}&includeSources=true`,
      );
      setDetailData(res);
    } catch (e) {
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

  const filterReady = useMemo(
    () => !!brand || !!model || !!search.trim(),
    [brand, model, search],
  );

  const renderDetailContent = () => {
    if (!detailVisible) return null;

    const merged = detailData?.merged;
    const r = detailData?.range;
    const b = detailData?.battery;

    if (!merged) {
      return (
        <View style={styles.detailSheet}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>Detay bulunamadı</Text>
            <TouchableOpacity
              onPress={() => setDetailVisible(false)}
              style={styles.detailCloseBtn}
            >
              <Ionicons name="close" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
          <Text style={styles.emptyText}>
            Bir hata nedeniyle detay verisi alınamadı.
          </Text>
        </View>
      );
    }

    const realRangeAvailable = hasRealRange(r ?? null);
    const estRange = !realRangeAvailable ? estimateRangeKm(merged) : null;

    return (
      <View style={styles.detailSheet}>
        <View style={styles.detailHandle} />

        <View style={styles.detailHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailBrand}>{merged.marka ?? '–'}</Text>
            <Text style={styles.detailTitle}>
              {merged.model ?? '–'}
              {merged.varyant_norm ? ` • ${merged.varyant_norm}` : ''}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setDetailVisible(false)}
            style={styles.detailCloseBtn}
          >
            <Ionicons name="close" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {detailLoading ? (
          <View style={styles.detailLoadingWrap}>
            <ActivityIndicator color="#2563EB" />
            <Text style={styles.detailLoadingText}>Detaylar yükleniyor...</Text>
          </View>
        ) : null}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Genel</Text>
            <InfoRow label="WLTP" value={fmtWithUnit(merged.wltp_km, 'km')} />
            <InfoRow label="0–100 km/s" value={fmtWithUnit(merged.accel_0_100_s, 'sn')} />
            <InfoRow label="Azami hız" value={fmtWithUnit(merged.top_speed_kmh, 'km/s')} />
            <InfoRow label="Güç" value={fmtWithUnit(merged.power_kw, 'kW')} />
            <InfoRow label="Tork" value={fmtWithUnit(merged.torque_nm, 'Nm')} />
            <InfoRow label="Aktarma" value={merged.drivetrain ?? '–'} />
            <InfoRow label="Gövde" value={merged.body ?? '–'} />
            <InfoRow label="Koltuk" value={formatNumber(merged.seats)} />
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Batarya & Şarj</Text>
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
            <InfoRow label="Batarya tipi" value={b?.type ?? merged.kimya ?? '–'} />
            <InfoRow
              label="Mimari"
              value={
                b?.architecture_v || merged.volt_mimari_v
                  ? fmtWithUnit(b?.architecture_v ?? merged.volt_mimari_v, 'V')
                  : '–'
              }
            />
            <InfoRow
              label="AC şarj"
              value={
                merged.ac_max_kw
                  ? `${formatNumber(merged.ac_max_kw)} kW${
                      merged.ac_phases ? ` / ${merged.ac_phases} faz` : ''
                    }`
                  : '–'
              }
            />
            <InfoRow label="DC tepe güç" value={fmtWithUnit(merged.dc_max_kw, 'kW')} />
            <InfoRow
              label="10–80% DC süre"
              value={merged.dc_10_80_min != null ? fmtWithUnit(merged.dc_10_80_min, 'dk') : '–'}
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
                  : 'Yok'
              }
            />
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Menzil</Text>
            {realRangeAvailable ? (
              <>
                <InfoRow
                  label="Gerçek min–maks"
                  value={
                    r?.real
                      ? `${formatNumber(r.real.min_km)} – ${fmtWithUnit(r.real.max_km, 'km')}`
                      : '–'
                  }
                />
                <InfoRow
                  label="Ilıman karma"
                  value={r?.mild?.combined_km ? fmtWithUnit(r.mild.combined_km, 'km') : '–'}
                />
                <InfoRow
                  label="Soğuk şehir"
                  value={r?.cold?.city_km ? fmtWithUnit(r.cold.city_km, 'km') : '–'}
                />
                <InfoRow
                  label="Soğuk otoyol"
                  value={r?.cold?.highway_km ? fmtWithUnit(r.cold.highway_km, 'km') : '–'}
                />
              </>
            ) : (
              <>
                <InfoRow
                  label="Tahmini menzil"
                  value={estRange ? `~${estRange.toLocaleString('tr-TR')} km` : 'Veri yetersiz'}
                />
                <InfoRow
                  label="Formül"
                  value="kullanılabilir kWh × 1000 / (Wh/km)"
                />
              </>
            )}
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Boyut & Ağırlık</Text>
            <InfoRow label="Uzunluk" value={fmtWithUnit(merged.length_mm, 'mm')} />
            <InfoRow label="Genişlik" value={fmtWithUnit(merged.width_mm, 'mm')} />
            <InfoRow label="Yükseklik" value={fmtWithUnit(merged.height_mm, 'mm')} />
            <InfoRow
              label="Dingil mesafesi"
              value={fmtWithUnit(merged.wheelbase_mm, 'mm')}
            />
            <InfoRow
              label="Bagaj (min/maks)"
              value={
                merged.boot_l_min || merged.boot_l_max
                  ? `${formatNumber(merged.boot_l_min)} / ${formatNumber(merged.boot_l_max)} L`
                  : '–'
              }
            />
            <InfoRow label="Ağırlık" value={fmtWithUnit(merged.weight_kg, 'kg')} />
            <InfoRow
              label="Çeki (frenli / frensiz)"
              value={
                merged.tow_braked_kg || merged.tow_unbraked_kg
                  ? `${fmtWithUnit(merged.tow_braked_kg, 'kg')} / ${fmtWithUnit(
                      merged.tow_unbraked_kg,
                      'kg',
                    )}`
                  : '–'
              }
            />
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Kaynak</Text>
            {merged.source_url ? (
              <TouchableOpacity
                style={styles.sourceButton}
                onPress={() => Linking.openURL(merged.source_url!)}
              >
                <Ionicons name="open-outline" size={16} color="#2563EB" />
                <Text style={styles.sourceButtonText}>Kaynağı aç</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.emptyText}>Bu kayıt için kaynak bağlantısı yok.</Text>
            )}
          </View>

          {detailData?.error ? (
            <Text style={styles.errorText}>Not: {detailData.error}</Text>
          ) : null}
        </ScrollView>
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
        <LinearGradient
          colors={['#F8FBFF', '#EEF5FF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroBadge}>
            <Ionicons name="flash-outline" size={14} color="#2563EB" />
            <Text style={styles.heroBadgeText}>Elektrikli araç rehberi</Text>
          </View>

          <Text style={styles.heroTitle}>Elektrikli araçları daha kolay karşılaştır</Text>
          <Text style={styles.heroSubtitle}>
            Türkiye’de satılan elektrikli araçların batarya, menzil ve şarj özelliklerini
            sade bir ekranda incele.
          </Text>

          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatCard}>
              <Ionicons name="battery-charging-outline" size={18} color="#2563EB" />
              <Text style={styles.quickStatTitle}>Batarya</Text>
              <Text style={styles.quickStatText}>Net / brüt kapasiteyi gör</Text>
            </View>

            <View style={styles.quickStatCard}>
              <Ionicons name="flash-outline" size={18} color="#2563EB" />
              <Text style={styles.quickStatTitle}>Şarj</Text>
              <Text style={styles.quickStatText}>AC ve DC değerlerini kıyasla</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Filtrele ve ara</Text>
            <Text style={styles.sectionSubtitle}>
              Marka, model veya teknik anahtar kelime ile EV modellerini listele.
            </Text>
          </View>

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
                  ? 'Model seçin'
                  : 'Bu markada model bulunamadı'
                : 'Önce marka seçin'
            }
            options={brand ? models : []}
            disabled={!brand || models.length === 0}
            loading={loadingModels}
            onChange={setModel}
          />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Arama (opsiyonel)</Text>
            <View style={styles.searchInputBox}>
              <View style={styles.searchIconWrap}>
                <Ionicons name="search-outline" size={18} color="#2563EB" />
              </View>
              <TextInput
                placeholder='Örn: LFP, 800V, 54 kWh'
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.searchButton, (!filterReady || loadingList) && styles.searchButtonDisabled]}
            activeOpacity={0.92}
            onPress={onSearchList}
            disabled={!filterReady || loadingList}
          >
            {loadingList ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="flash-outline" size={18} color="#FFFFFF" />
                <Text style={styles.searchButtonText}>EV modellerini listele</Text>
              </>
            )}
          </TouchableOpacity>

          {badgeText ? <Text style={styles.helperText}>{badgeText}</Text> : null}
        </View>

        {errorMsg ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
            <Text style={styles.errorCardText}>{errorMsg}</Text>
          </View>
        ) : null}

        {!loadingList && items.length === 0 && !errorMsg ? (
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="car-sport-outline" size={22} color="#2563EB" />
            </View>
            <Text style={styles.emptyStateTitle}>Aramaya hazır</Text>
            <Text style={styles.emptyStateText}>
              Marka veya model seçerek ya da “LFP”, “800V”, “54 kWh” gibi aramalar yaparak
              elektrikli araç listelerini görüntüleyebilirsin.
            </Text>
          </View>
        ) : null}

        {loadingList ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator color="#2563EB" />
            <Text style={styles.loadingSectionText}>EV listesi yükleniyor...</Text>
          </View>
        ) : null}

        {!loadingList && items.length > 0 ? (
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Modeller</Text>
              <Text style={styles.sectionSubtitle}>
                Bir karta dokunarak detayları açabilirsin.
              </Text>
            </View>

            {items.map((it, idx) => {
              const badge = getRangeBadge(it);

              return (
                <TouchableOpacity
                  key={`${it.marka}-${it.model}-${it.varyant_norm}-${idx}`}
                  style={styles.resultCard}
                  activeOpacity={0.92}
                  onPress={() => openDetail(it)}
                >
                  <View style={styles.resultHeader}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.resultBrand}>{it.marka ?? '–'}</Text>
                      <Text style={styles.resultTitle}>{it.model ?? '–'}</Text>
                      {it.varyant_norm ? (
                        <Text style={styles.resultVariant}>{it.varyant_norm}</Text>
                      ) : null}
                    </View>

                    {badge ? (
                      <View
                        style={[
                          styles.rangeBadge,
                          badge.label === 'Gerçek'
                            ? styles.rangeBadgeReal
                            : styles.rangeBadgeEstimated,
                        ]}
                      >
                        <Text style={styles.rangeBadgeText}>
                          {badge.label}: {badge.text}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.statsRow}>
                    <StatBox
                      label="WLTP"
                      value={it.wltp_km ? `${it.wltp_km} km` : '–'}
                    />
                    <StatBox
                      label="Net batarya"
                      value={it.battery_usable_kwh != null ? `${it.battery_usable_kwh} kWh` : '–'}
                    />
                  </View>

                  <View style={styles.statsRow}>
                    <StatBox
                      label="AC şarj"
                      value={it.ac_max_kw != null ? `${it.ac_max_kw} kW` : '–'}
                    />
                    <StatBox
                      label="DC şarj"
                      value={it.dc_max_kw != null ? `${it.dc_max_kw} kW` : '–'}
                    />
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaChipText}>{it.drivetrain ?? 'Aktarma: –'}</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaChipText}>{it.body ?? 'Gövde: –'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>{renderDetailContent()}</View>
      </Modal>
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
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    overflow: 'hidden',
  },

  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFFD9',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
  },

  heroBadgeText: {
    marginLeft: 6,
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },

  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },

  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 18,
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

  searchInputBox: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    marginLeft: 10,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },

  searchButton: {
    marginTop: 18,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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

  helperText: {
    marginTop: 10,
    fontSize: 12,
    color: '#64748B',
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

  errorCardText: {
    flex: 1,
    marginLeft: 8,
    color: '#DC2626',
    fontSize: 14,
    lineHeight: 19,
  },

  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
  },

  emptyStateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },

  emptyStateText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    textAlign: 'center',
  },

  loadingSection: {
    paddingVertical: 18,
    alignItems: 'center',
  },

  loadingSectionText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },

  resultsSection: {
    marginTop: 2,
  },

  resultCard: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
  },

  resultHeader: {
    marginBottom: 12,
  },

  resultBrand: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 4,
  },

  resultTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  resultVariant: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },

  rangeBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  rangeBadgeReal: {
    backgroundColor: '#DCFCE7',
  },

  rangeBadgeEstimated: {
    backgroundColor: '#FEF3C7',
  },

  rangeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  } as any,

  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },

  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  } as any,

  metaChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  metaChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.34)',
    justifyContent: 'flex-end',
  },

  detailSheet: {
    maxHeight: '88%',
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  detailHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },

  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  } as any,

  detailBrand: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 4,
  },

  detailTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#0F172A',
  },

  detailCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailLoadingWrap: {
    paddingVertical: 10,
    alignItems: 'center',
  },

  detailLoadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
  },

  detailSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },

  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  } as any,

  infoRowLabel: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
  },

  infoRowValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
  },

  sourceButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sourceButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },

  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 19,
  },
});