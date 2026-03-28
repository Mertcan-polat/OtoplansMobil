// src/screens/RiskAnalysisScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../lib/supabaseClient';

type Params = {
  brand?: string;
  model?: string;
  year?: string;
  motorTip?: string | null;
};

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

type VehicleInfo = {
  marka: string | null;
  model: string | null;
};

type AggRow = {
  key: string;
  marka: string;
  model: string;
  count: number;
  avgSev: number | null;
  avgFreq: number | null;
  categoryCounts: Record<string, number>;
  score: number;
};

export default function RiskAnalysisScreen() {
  const route = useRoute<any>();
  const params = (route.params || {}) as Params;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<KronikSorun[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const [vehicleMap, setVehicleMap] = useState<Record<number, VehicleInfo>>({});

  const hasVehicle =
    !!params.brand || !!params.model || !!params.year || !!params.motorTip;

  const isGlobal = !hasVehicle;

  const title = isGlobal
    ? 'Genel Kronik Risk Görünümü'
    : [params.brand, params.model].filter(Boolean).join(' ');

  const subtitleParts: string[] = [];
  if (params.year) subtitleParts.push(`${params.year} model`);
  if (params.motorTip) subtitleParts.push(params.motorTip as string);
  const subtitle = subtitleParts.join(' • ');

  // ---------- arac_id çöz ----------
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
      console.warn('[RiskAnalysis] arac_id çözülemedi', error);
      return null;
    }
    return data?.id ?? null;
  };

  // ---------- veri çek ----------
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      let aracId: number | null = null;

      if (params.brand && params.model) {
        aracId = await resolveAracId(params.brand, params.model);
      }

      let query = supabase
        .from('kronik_sorunlar')
        .select(
          'id, arac_id, baslik, kategori, yil_araligi, motor_tip, siklik_1_5, siddet_1_5, aciklama_md'
        )
        .order('siddet_1_5', { ascending: false, nullsFirst: false })
        .order('siklik_1_5', { ascending: false, nullsFirst: false })
        .limit(200);

      // 🔹 Araç özel görünüm: önce arac_id ile daralt
      if (hasVehicle && aracId) {
        query = query.eq('arac_id', aracId);
      } else if (hasVehicle && params.motorTip) {
        // 🔹 arac_id bulunamadıysa motor_tip ile daralt
        query = query.ilike('motor_tip', `%${params.motorTip}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[RiskAnalysis] kronik_sorunlar hata', error);
        setErrorMsg('Veri alınırken bir hata oluştu.');
        setItems([]);
        return;
      }

      const rows = (data ?? []) as KronikSorun[];

      if (!rows.length) {
        setErrorMsg(
          hasVehicle
            ? 'Bu araç/motor için henüz kronik sorun kaydı yok. Benzer araçlara genel görünümden bakabilirsin.'
            : 'Henüz kronik sorun verisi bulunamadı.'
        );
        setItems([]);
        setVehicleMap({});
        return;
      }

      setItems(rows);

      // 🔹 Marka / model eşlemesi için araclar tablosunu çek
      const uniqueIds = Array.from(
        new Set(
          rows
            .map((r) => r.arac_id)
            .filter((x): x is number => x !== null && x !== undefined)
        )
      );

      if (uniqueIds.length > 0) {
        const { data: aracRows, error: aracError } = await supabase
          .from('araclar')
          .select('id, marka, model')
          .in('id', uniqueIds);

        if (aracError) {
          console.warn('[RiskAnalysis] araclar map hata', aracError);
          setVehicleMap({});
        } else {
          const map: Record<number, VehicleInfo> = {};
          (aracRows ?? []).forEach((a: any) => {
            map[a.id] = {
              marka: a.marka ?? null,
              model: a.model ?? null,
            };
          });
          setVehicleMap(map);
        }
      } else {
        setVehicleMap({});
      }
    } catch (e) {
      console.error('[RiskAnalysis] beklenmeyen hata', e);
      setErrorMsg('Beklenmeyen bir hata oluştu.');
      setItems([]);
      setVehicleMap({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- özet hesapları ----------
  const { avgFreq, avgSev, maxFreq, maxSev } = useMemo(() => {
    if (!items.length) {
      return { avgFreq: null, avgSev: null, maxFreq: null, maxSev: null };
    }
    let sumFreq = 0;
    let sumSev = 0;
    let countFreq = 0;
    let countSev = 0;
    let maxF = 0;
    let maxS = 0;

    items.forEach((it) => {
      if (it.siklik_1_5 != null) {
        sumFreq += it.siklik_1_5;
        countFreq++;
        if (it.siklik_1_5 > maxF) maxF = it.siklik_1_5;
      }
      if (it.siddet_1_5 != null) {
        sumSev += it.siddet_1_5;
        countSev++;
        if (it.siddet_1_5 > maxS) maxS = it.siddet_1_5;
      }
    });

    return {
      avgFreq: countFreq ? sumFreq / countFreq : null,
      avgSev: countSev ? sumSev / countSev : null,
      maxFreq: countFreq ? maxF : null,
      maxSev: countSev ? maxS : null,
    };
  }, [items]);

  const visibleItems = useMemo(() => {
    if (showAll) return items;
    return items.slice(0, 10); // 🔹 Sadece en kritik 10 kayıt
  }, [items, showAll]);

  const remainingCount = items.length > 10 ? items.length - 10 : 0;

  // ---------- Marka / Model bazlı sınıflandırma (global görünümde) ----------
  const brandModelAgg: AggRow[] = useMemo(() => {
    if (!isGlobal || !items.length) return [];

    const map = new Map<string, AggRow>();

    items.forEach((it) => {
      const info = it.arac_id ? vehicleMap[it.arac_id] : undefined;
      const markaRaw = (info?.marka || 'Belirsiz').trim();
      const modelRaw = (info?.model || 'Genel').trim();

      const marka = markaRaw || 'Belirsiz';
      const model = modelRaw || 'Genel';

      const key = `${marka}|||${model}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          marka,
          model,
          count: 0,
          avgSev: null,
          avgFreq: null,
          categoryCounts: {},
          score: 0,
        });
      }

      const row = map.get(key)!;

      row.count += 1;

      const cat = it.kategori || 'Diğer';
      row.categoryCounts[cat] = (row.categoryCounts[cat] || 0) + 1;

      // Geçici toplama için: avg tekrar hesaplanacak, şimdilik yok
    });

    // Şimdi tek tek tekrar gezip ortalamaları hesaplayalım
    // (Daha temiz olsun diye ikinci pass)
    const sums: Record<string, { sevSum: number; freqSum: number; sevCount: number; freqCount: number }> =
      {};

    items.forEach((it) => {
      const info = it.arac_id ? vehicleMap[it.arac_id] : undefined;
      const markaRaw = (info?.marka || 'Belirsiz').trim();
      const modelRaw = (info?.model || 'Genel').trim();

      const marka = markaRaw || 'Belirsiz';
      const model = modelRaw || 'Genel';
      const key = `${marka}|||${model}`;

      if (!sums[key]) {
        sums[key] = { sevSum: 0, freqSum: 0, sevCount: 0, freqCount: 0 };
      }
      if (it.siddet_1_5 != null) {
        sums[key].sevSum += it.siddet_1_5;
        sums[key].sevCount += 1;
      }
      if (it.siklik_1_5 != null) {
        sums[key].freqSum += it.siklik_1_5;
        sums[key].freqCount += 1;
      }
    });

    const result: AggRow[] = [];
    map.forEach((row) => {
      const sum = sums[row.key];
      const avgSev =
        sum && sum.sevCount ? sum.sevSum / sum.sevCount : null;
      const avgFreq =
        sum && sum.freqCount ? sum.freqSum / sum.freqCount : null;

      // Basit skor: şiddet ağırlıklı, sıklık ve kayıt sayısı ile ölçekli
      const sevPart = avgSev != null ? avgSev : 0;
      const freqPart = avgFreq != null ? avgFreq : 0;
      const countFactor = 1 + Math.log(1 + row.count) / 2;

      const score = (sevPart * 1.4 + freqPart) * countFactor;

      result.push({
        ...row,
        avgSev,
        avgFreq,
        score,
      });
    });

    // Skora göre azalan sırala
    result.sort((a, b) => b.score - a.score);

    return result;
  }, [isGlobal, items, vehicleMap]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* ARAÇ / GENEL ÖZET KARTI */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIcon}>
              <Ionicons
                name={isGlobal ? 'earth' : 'car-sport'}
                size={22}
                color="#2563EB"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleTitle}>{title}</Text>
              {isGlobal ? (
                <Text style={styles.vehicleSubtitle}>
                  Marka/model seçilmedi. Aşağıdaki özetler, veri tabanındaki{' '}
                  <Text style={styles.bold}>tüm araçlar için</Text> toplu kronik
                  risk görünümünü gösterir.
                </Text>
              ) : subtitle ? (
                <Text style={styles.vehicleSubtitle}>{subtitle}</Text>
              ) : (
                <Text style={styles.vehicleSubtitleMuted}>
                  Bu ekran şu anda seçili marka / model kombinasyonuna göre
                  kronik sorun riskini gösteriyor.
                </Text>
              )}
            </View>
          </View>

          <View style={styles.vehicleInfoBox}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#0F172A"
            />
            <Text style={styles.vehicleInfoText}>
              Buradaki <Text style={styles.bold}>“risk”</Text>, kronik{' '}
              <Text style={styles.bold}>mekanik ve elektrik arızası</Text>{' '}
              ihtimalini anlatır. Yani bu; kaza riski, sürüş tarzı, yakıt
              tüketimi veya ikinci el fiyat riski değildir.
            </Text>
          </View>
        </View>

        {/* RİSK KAPSAMI AÇIKLAMA KARTI */}
        <View style={styles.scopeCard}>
          <Text style={styles.scopeTitle}>Bu ekran neyi ölçüyor?</Text>
          <View style={styles.scopeRow}>
            <View style={styles.scopeCol}>
              <Text style={styles.scopeBadge}>Ölçtüklerimiz</Text>
              <Text style={styles.scopeItem}>• Kronik arıza kayıt sayısı</Text>
              <Text style={styles.scopeItem}>
                • Arızanın ne kadar sık görüldüğü
              </Text>
              <Text style={styles.scopeItem}>
                • Arızanın şiddeti / kullanım üzerindeki etkisi
              </Text>
              <Text style={styles.scopeItem}>
                • Motor tipi ve model yılı aralıkları
              </Text>
            </View>
            <View style={styles.scopeCol}>
              <Text style={[styles.scopeBadge, styles.scopeBadgeMuted]}>
                Ölçmediklerimiz
              </Text>
              <Text style={styles.scopeItem}>• Kaza geçmişi</Text>
              <Text style={styles.scopeItem}>• Kullanım tarzı</Text>
              <Text style={styles.scopeItem}>• Yakıt tüketimi</Text>
              <Text style={styles.scopeItem}>• Fiyat / değer kaybı</Text>
            </View>
          </View>
        </View>

        {/* ÖZET KART */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>
                {isGlobal
                  ? 'Toplam kronik kayıt (veri tabanı)'
                  : 'Bu araç için kronik kayıt'}
              </Text>
              <Text style={styles.summaryNumber}>{items.length}</Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>
                Ort. şiddet {isGlobal ? '(genel)' : '(araç/motor)'}
              </Text>
              <Text style={styles.summaryNumber}>
                {avgSev ? avgSev.toFixed(1) : '-'}
                <Text style={styles.summarySuffix}> / 5</Text>
              </Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Ort. sıklık</Text>
              <Text style={styles.summaryNumber}>
                {avgFreq ? avgFreq.toFixed(1) : '-'}
                <Text style={styles.summarySuffix}> / 5</Text>
              </Text>
            </View>
          </View>

          <View style={styles.summaryBadges}>
            <View style={[styles.summaryBadge, styles.badgeSevere]}>
              <Text style={styles.badgeLabel}>
                🔥 En yüksek şiddet:{' '}
                <Text style={styles.badgeValue}>
                  {maxSev != null ? `${maxSev}/5` : '-'}
                </Text>
              </Text>
            </View>
            <View style={[styles.summaryBadge, styles.badgeFreq]}>
              <Text style={styles.badgeLabel}>
                📈 En sık görülen seviye:{' '}
                <Text style={styles.badgeValue}>
                  {maxFreq != null ? `${maxFreq}/5` : '-'}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* DURUM MESAJLARI */}
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Risk verileri yükleniyor...</Text>
          </View>
        )}

        {!loading && errorMsg && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>⚠️ {errorMsg}</Text>
          </View>
        )}

        {/* 🔹 MARKA / MODEL BAZLI RİSK TABLOSU (sadece global modda) */}
        {!loading && !errorMsg && isGlobal && brandModelAgg.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Marka / model bazlı risk özeti
            </Text>
            <Text style={styles.sectionHelp}>
              Aşağıdaki tablo, hangi marka–model ailesinde kronik sorun yoğunluğunun
              daha yüksek olduğunu gösterir. Kategori etiketleri; motor, şanzıman,
              elektrik gibi hangi tarafta sorun biriktiğini özetler.
            </Text>

            {brandModelAgg.slice(0, 15).map((row) => {
              const sev = row.avgSev ?? 0;
              const freq = row.avgFreq ?? 0;

              let riskLabel = 'Orta';
              let riskColor = '#F59E0B';
              if (sev >= 3.5 || freq >= 3.5) {
                riskLabel = 'Yüksek';
                riskColor = '#DC2626';
              } else if (sev <= 2 && freq <= 2) {
                riskLabel = 'Düşük';
                riskColor = '#16A34A';
              }

              // En çok görülen ilk 3 kategori
              const topCats = Object.entries(row.categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

              return (
                <View key={row.key} style={styles.aggCard}>
                  <View style={styles.aggHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.aggTitle}>
                        {row.marka} {row.model}
                      </Text>
                      <Text style={styles.aggSubtitle}>
                        Toplam {row.count} kronik kayıt
                      </Text>
                    </View>
                    <View style={styles.aggRiskPill}>
                      <View
                        style={[
                          styles.aggRiskDot,
                          { backgroundColor: riskColor },
                        ]}
                      />
                      <Text style={[styles.aggRiskText, { color: riskColor }]}>
                        {riskLabel}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.aggRow}>
                    <View style={styles.aggStatCol}>
                      <Text style={styles.aggStatLabel}>Ort. şiddet</Text>
                      <Text style={styles.aggStatValue}>
                        {row.avgSev ? row.avgSev.toFixed(1) : '-'}
                        <Text style={styles.aggStatSuffix}> / 5</Text>
                      </Text>
                    </View>
                    <View style={styles.aggStatCol}>
                      <Text style={styles.aggStatLabel}>Ort. sıklık</Text>
                      <Text style={styles.aggStatValue}>
                        {row.avgFreq ? row.avgFreq.toFixed(1) : '-'}
                        <Text style={styles.aggStatSuffix}> / 5</Text>
                      </Text>
                    </View>
                  </View>

                  {topCats.length > 0 && (
                    <View style={styles.catRow}>
                      {topCats.map(([cat, count]) => (
                        <View key={cat} style={styles.catChip}>
                          <Text style={styles.catChipText}>
                            {cat} ({count})
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* 🔹 DETAYLI KRONİK KAYIT LİSTESİ (araç özel görünümde veya opsiyonel global) */}
        {!loading && !errorMsg && items.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: isGlobal ? 12 : 0 }]}>
              Detaylı kronik kayıt listesi
            </Text>
            <Text style={styles.sectionHelp}>
              Her satır; kronik bir sorunu, hangi yıl aralığında ve hangi motor
              tipinde öne çıktığını, ne kadar sık ve ne kadar ciddi olduğunu
              gösterir.
            </Text>

            {visibleItems.map((item) => {
              const freq = item.siklik_1_5 ?? 0;
              const sev = item.siddet_1_5 ?? 0;

              let riskLabel = 'Orta';
              let riskColor = '#F59E0B';
              if (sev >= 4 || freq >= 4) {
                riskLabel = 'Yüksek';
                riskColor = '#DC2626';
              } else if (sev <= 2 && freq <= 2) {
                riskLabel = 'Düşük';
                riskColor = '#16A34A';
              }

              const info =
                item.arac_id && vehicleMap[item.arac_id]
                  ? vehicleMap[item.arac_id]
                  : null;

              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1 }}>
                      {item.baslik && (
                        <Text style={styles.cardTitle} numberOfLines={2}>
                          {item.baslik}
                        </Text>
                      )}

                      <Text style={styles.cardSubtitle}>
                        {info ? (
                          <>
                            {info.marka} {info.model}{' '}
                            {item.yil_araligi ? `(${item.yil_araligi})` : ''}
                          </>
                        ) : isGlobal ? (
                          item.yil_araligi || item.motor_tip ? (
                            <>
                              {item.yil_araligi
                                ? `Belirli yıl aralığı: ${item.yil_araligi} `
                                : null}
                              {item.motor_tip
                                ? `• Motor: ${item.motor_tip}`
                                : null}
                            </>
                          ) : (
                            'Model ailesine ait kronik kayıt'
                          )
                        ) : (
                          <>
                            {params.brand} {params.model}{' '}
                            {item.yil_araligi ? `(${item.yil_araligi})` : ''}
                          </>
                        )}
                      </Text>

                      <View style={styles.metaRow}>
                        {item.kategori && (
                          <View style={styles.metaChip}>
                            <Text style={styles.metaChipText}>
                              {item.kategori}
                            </Text>
                          </View>
                        )}
                        {item.motor_tip && (
                          <View style={styles.metaChip}>
                            <Text style={styles.metaChipText}>
                              {item.motor_tip}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.riskPill}>
                      <View
                        style={[
                          styles.riskDot,
                          { backgroundColor: riskColor },
                        ]}
                      />
                      <Text style={[styles.riskText, { color: riskColor }]}>
                        {riskLabel}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scoreRow}>
                    <View style={styles.scoreCol}>
                      <Text style={styles.scoreLabel}>Sıklık</Text>
                      <Text style={styles.scoreValue}>
                        {freq || '-'}
                        <Text style={styles.scoreSuffix}> / 5</Text>
                      </Text>
                    </View>
                    <View style={styles.scoreCol}>
                      <Text style={styles.scoreLabel}>Şiddet</Text>
                      <Text style={styles.scoreValue}>
                        {sev || '-'}
                        <Text style={styles.scoreSuffix}> / 5</Text>
                      </Text>
                    </View>
                  </View>

                  {item.aciklama_md && (
                    <Text style={styles.cardBody} numberOfLines={5}>
                      {item.aciklama_md}
                    </Text>
                  )}
                </View>
              );
            })}

            {remainingCount > 0 && !showAll && (
              <TouchableOpacity
                style={styles.moreButton}
                activeOpacity={0.8}
                onPress={() => setShowAll(true)}
              >
                <Text style={styles.moreButtonText}>
                  + {remainingCount} kronik kaydı daha göster
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },

  // Araç / genel kart
  vehicleCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 10,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  vehicleSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#4B5563',
  },
  vehicleSubtitleMuted: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
  },
  vehicleInfoBox: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  } as any,
  vehicleInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
  },
  bold: {
    fontWeight: '700',
  },

  // Risk kapsam kartı
  scopeCard: {
    borderRadius: 16,
    backgroundColor: '#0F172A',
    padding: 14,
    marginBottom: 12,
  },
  scopeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 12,
  } as any,
  scopeCol: {
    flex: 1,
  },
  scopeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ECFEFF',
    marginBottom: 4,
  },
  scopeBadgeMuted: {
    color: '#E5E7EB',
  },
  scopeItem: {
    fontSize: 11,
    color: '#E5E7EB',
    marginBottom: 2,
  },

  // Özet kart
  summaryCard: {
    borderRadius: 16,
    backgroundColor: '#0F172A',
    padding: 14,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  summarySuffix: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  summaryBadges: {
    marginTop: 10,
    gap: 6,
  } as any,
  summaryBadge: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badgeSevere: {
    backgroundColor: 'rgba(248,113,113,0.18)',
  },
  badgeFreq: {
    backgroundColor: 'rgba(52,211,153,0.16)',
  },
  badgeLabel: {
    fontSize: 12,
    color: '#F9FAFB',
  },
  badgeValue: {
    fontWeight: '700',
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  messageBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  messageText: {
    fontSize: 13,
    color: '#92400E',
  },

  sectionTitle: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionHelp: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },

  // 🔹 Marka / model özet kartı
  aggCard: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  aggHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  aggTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  aggSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  aggRiskPill: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  aggRiskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  aggRiskText: {
    fontSize: 11,
    fontWeight: '700',
  },
  aggRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  aggStatCol: {
    marginRight: 16,
  },
  aggStatLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  aggStatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  aggStatSuffix: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  catRow: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  } as any,
  catChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#EEF2FF',
  },
  catChipText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },

  // Detay kartlar
  card: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  } as any,
  metaChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#EEF2FF',
  },
  metaChipText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  riskPill: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 6,
  },
  scoreCol: {
    marginRight: 16,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  scoreSuffix: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  cardBody: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },

  moreButton: {
    marginTop: 6,
    borderRadius: 999,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#E0F2FE',
  },
  moreButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
  },
});
