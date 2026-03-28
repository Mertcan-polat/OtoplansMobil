// src/screens/HomeScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

type Nav = any;

type PopularCar = {
  id: number;
  brand: string;
  model: string;
  year: string;
  risk: 'Düşük' | 'Orta' | 'Yüksek' | string;
  motorTip?: string | null;
};

type FeaturedItem = {
  marka: string;
  model: string;
  motor_tip: string;
  yil: number | null;
  bakimlar: { text: string; not?: string | null }[];
};

const API_BASE_URL = 'https://otoplans.net';

const CONTENT_HORIZONTAL = 20;
const CARD_GAP = 12;
const CARD_WIDTH = (width - CONTENT_HORIZONTAL * 2 - CARD_GAP) / 2;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [popularCars, setPopularCars] = useState<PopularCar[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const go = (screen: string) => {
    navigation.navigate(screen as never);
  };

  const goToRisk = (car: PopularCar) => {
    navigation.navigate(
      'KronikSorun' as never,
      {
        brand: car.brand,
        model: car.model,
        year: car.year,
        motorTip: car.motorTip ?? null,
      } as never
    );
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.setValue(e.nativeEvent.contentOffset.y);
  };

  const headerBorderOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const mainActions = useMemo(
    () => [
      {
        id: 1,
        title: 'Bakım Ara',
        subtitle: 'Aracına uygun bakım adımlarını bul',
        icon: 'search-outline',
        iconActiveBg: '#DBEAFE',
        iconColor: '#2563EB',
        screen: 'Search',
      },
      {
        id: 2,
        title: 'Kronik Sorunlar',
        subtitle: 'Sık görülen arızaları kontrol et',
        icon: 'warning-outline',
        iconActiveBg: '#FEE2E2',
        iconColor: '#DC2626',
        screen: 'KronikSorun',
      },
      {
        id: 3,
        title: 'Karşılaştır',
        subtitle: 'Risk ve maliyeti yan yana değerlendir',
        icon: 'git-compare-outline',
        iconActiveBg: '#DCFCE7',
        iconColor: '#16A34A',
        screen: 'CompareDecision',
      },
      {
        id: 4,
        title: 'Elektrikli Araç',
        subtitle: 'Menzil, şarj ve teknik verileri incele',
        icon: 'flash-outline',
        iconActiveBg: '#EDE9FE',
        iconColor: '#7C3AED',
        screen: 'EvGuide',
      },
    ],
    []
  );

  const smartShortcuts = useMemo(
    () => [
      {
        id: 1,
        label: 'Hatırlatıcılar',
        icon: 'calendar-outline',
        screen: 'Reminders',
      },
      {
        id: 2,
        label: 'Risk Analizi',
        icon: 'stats-chart-outline',
        screen: 'RiskAnalysis',
      },
      {
        id: 3,
        label: 'Rehberler',
        icon: 'document-text-outline',
        screen: 'Guides',
      },
      {
        id: 4,
        label: 'Garajım',
        icon: 'car-sport-outline',
        screen: 'Garage',
      },
    ],
    []
  );

  const getRiskConfig = (risk: PopularCar['risk']) => {
    if (risk === 'Yüksek') {
      return {
        bg: '#FEE2E2',
        text: '#DC2626',
        soft: '#FEF2F2',
        label: 'Yüksek risk',
      };
    }
    if (risk === 'Düşük') {
      return {
        bg: '#DCFCE7',
        text: '#15803D',
        soft: '#F0FDF4',
        label: 'Düşük risk',
      };
    }
    return {
      bg: '#FEF3C7',
      text: '#B45309',
      soft: '#FFFBEB',
      label: 'Orta risk',
    };
  };

  const fetchPopularCars = async () => {
    try {
      setLoadingPopular(true);

      const limit = 12;
      const url = `${API_BASE_URL}/api/featured?limit=${limit}`;

      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';

      if (!res.ok) {
        const text = await res.text();
        console.warn('Featured API status hata:', res.status, text.slice(0, 200));
        throw new Error('Featured API hatası');
      }

      if (!contentType.includes('application/json')) {
        const text = await res.text();
        console.warn('JSON beklenirken farklı içerik:', text.slice(0, 200));
        throw new Error('API JSON döndürmüyor');
      }

      const json = (await res.json()) as { items: FeaturedItem[] };

      const mapped: PopularCar[] = (json.items ?? []).map((item, index) => {
        const riskLevels: PopularCar['risk'][] = ['Düşük', 'Orta', 'Yüksek'];
        const risk = riskLevels[index % riskLevels.length];

        return {
          id: index + 1,
          brand: item.marka,
          model: item.model,
          year: item.yil ? String(item.yil) : 'Genel',
          risk,
          motorTip: item.motor_tip ?? null,
        };
      });

      setPopularCars(mapped.slice(0, 6));
    } catch (error) {
      console.warn('Popüler araçlar alınamadı:', error);
      setPopularCars([]);
    } finally {
      setLoadingPopular(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPopularCars();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPopularCars();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <Animated.View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>OTOPLANS</Text>
            <Text style={styles.headerSubtitle}>Araç bakım ve risk asistanı</Text>
          </View>

          <TouchableOpacity style={styles.headerButton} activeOpacity={0.85}>
            <Ionicons name="notifications-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.headerBorder,
            {
              opacity: headerBorderOpacity,
            },
          ]}
        />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
        }
      >
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={['#EAF3FF', '#F8FAFC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles-outline" size={14} color="#2563EB" />
              <Text style={styles.heroBadgeText}>Akıllı başlangıç</Text>
            </View>

            <Text style={styles.heroTitle}>
              Aracınla ilgili en önemli bilgilere saniyeler içinde ulaş.
            </Text>

            <Text style={styles.heroText}>
              Bakım planı, kronik sorunlar, maliyet ve karşılaştırma araçlarını tek yerden kullan.
            </Text>

            <TouchableOpacity
              style={styles.primarySearchButton}
              activeOpacity={0.92}
              onPress={() => go('Search')}
            >
              <Ionicons name="search-outline" size={18} color="#64748B" />
              <Text style={styles.primarySearchButtonText}>
                Marka, model veya motor kodu ara
              </Text>
            </TouchableOpacity>

            <View style={styles.heroQuickRow}>
              <TouchableOpacity style={styles.heroChip} activeOpacity={0.85}>
                <Ionicons name="flash-outline" size={13} color="#2563EB" />
                <Text style={styles.heroChipText}>1.6 TDI</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.heroChip} activeOpacity={0.85}>
                <Ionicons name="help-circle-outline" size={13} color="#0EA5E9" />
                <Text style={styles.heroChipText}>DSG mekatronik</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ana İşlemler</Text>

          <View style={styles.actionGrid}>
            {mainActions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.actionCard}
                activeOpacity={0.92}
                onPress={() => go(item.screen)}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: item.iconActiveBg }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
                </View>

                <Text style={styles.actionTitle}>{item.title}</Text>
                <Text style={styles.actionSubtitle}>{item.subtitle}</Text>

                <View style={styles.actionFooter}>
                  <Text style={styles.actionFooterText}>Aç</Text>
                  <Ionicons name="arrow-forward" size={15} color="#2563EB" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kısa Yollar</Text>

          <View style={styles.shortcutRow}>
            {smartShortcuts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.shortcutCard}
                activeOpacity={0.9}
                onPress={() => go(item.screen)}
              >
                <View style={styles.shortcutIconWrap}>
                  <Ionicons name={item.icon as any} size={20} color="#2563EB" />
                </View>
                <Text style={styles.shortcutText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popüler Modeller</Text>

            <TouchableOpacity onPress={onRefresh} activeOpacity={0.85}>
              <View style={styles.refreshRow}>
                <Ionicons name="refresh" size={14} color="#2563EB" />
                <Text style={styles.refreshText}>Yenile</Text>
              </View>
            </TouchableOpacity>
          </View>

          {loadingPopular && popularCars.length === 0 ? (
            <View style={styles.popularGrid}>
              {[...Array(4)].map((_, index) => (
                <View key={index} style={styles.popularCard}>
                  <View style={styles.skeletonPill} />
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonSubtitle} />
                  <View style={styles.skeletonBox} />
                </View>
              ))}
            </View>
          ) : null}

          {!loadingPopular && popularCars.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={28} color="#94A3B8" />
              <Text style={styles.emptyStateTitle}>Popüler model bulunamadı</Text>
              <Text style={styles.emptyStateText}>
                Şimdilik arama ekranından doğrudan araç seçerek devam edebilirsin.
              </Text>
            </View>
          ) : null}

          {popularCars.length > 0 ? (
            <View style={styles.popularGrid}>
              {popularCars.map((car) => {
                const risk = getRiskConfig(car.risk);

                return (
                  <TouchableOpacity
                    key={car.id}
                    style={styles.popularCard}
                    activeOpacity={0.92}
                    onPress={() => goToRisk(car)}
                  >
                    <View style={styles.popularTopRow}>
                      <View style={styles.brandPill}>
                        <Ionicons name="car-sport-outline" size={13} color="#2563EB" />
                        <Text style={styles.brandPillText}>{car.brand}</Text>
                      </View>

                      <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
                        <Text style={[styles.riskBadgeText, { color: risk.text }]}>
                          {risk.label}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.popularModel} numberOfLines={2}>
                      {car.model}
                    </Text>

                    <Text style={styles.popularYear}>{car.year} model</Text>

                    <View style={[styles.popularHintBox, { backgroundColor: risk.soft }]}>
                      <Text style={styles.popularHintText}>
                        Kronik sorun görünümü ve temel risk bilgisi için incele.
                      </Text>
                    </View>

                    <View style={styles.popularFooter}>
                      <Text style={styles.popularFooterText}>İncele</Text>
                      <Ionicons name="arrow-forward" size={15} color="#2563EB" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {loadingPopular && popularCars.length > 0 ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator size="small" color="#2563EB" />
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.evBannerWrap}
            activeOpacity={0.92}
            onPress={() => go('EvGuide')}
          >
            <LinearGradient
              colors={['#0EA5E9', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.evBanner}
            >
              <View style={styles.evTextWrap}>
                <Text style={styles.evTitle}>Elektrikli Araç Rehberi</Text>
                <Text style={styles.evSubtitle}>
                  Menzil, şarj, tüketim ve teknik verileri tek bakışta gör.
                </Text>
              </View>

              <View style={styles.evArrowWrap}>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoIcon}>
                <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
              </View>

              <View style={styles.infoHeaderTextWrap}>
                <Text style={styles.infoTitle}>Bakım İpuçları</Text>
                <Text style={styles.infoSubtitle}>Günlük kullanım için kısa notlar</Text>
              </View>
            </View>

            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>
                Yağ değişimi ve filtre kontrolünü kullanım şekline göre geciktirme.
              </Text>
            </View>

            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>
                Fren sistemi ve lastik durumu güvenlik için düzenli takip edilmelidir.
              </Text>
            </View>

            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>
                Özellikle ikinci el araçlarda kronik sorun geçmişi satın alma kararını etkiler.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#F8FAFC',
    paddingTop: isIOS ? 8 : StatusBar.currentHeight,
    paddingHorizontal: CONTENT_HORIZONTAL,
    paddingBottom: 10,
  },
  headerContent: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBorder: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 8,
  },

  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 124,
  },

  heroWrap: {
    paddingHorizontal: CONTENT_HORIZONTAL,
    marginBottom: 24,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 22,
    overflow: 'hidden',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
  },
  heroBadgeText: {
    marginLeft: 6,
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  heroText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#475569',
    marginBottom: 18,
  },
  primarySearchButton: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  primarySearchButtonText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#64748B',
    flex: 1,
  },
  heroQuickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as any,
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#FFFFFFC9',
  },
  heroChipText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },

  section: {
    paddingHorizontal: CONTENT_HORIZONTAL,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  refreshText: {
    marginLeft: 4,
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: CARD_WIDTH,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 18,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  actionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  actionSubtitle: {
    minHeight: 36,
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
  actionFooter: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionFooterText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },

  shortcutRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shortcutCard: {
    width: CARD_WIDTH,
    minHeight: 68,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shortcutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  shortcutText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  popularCard: {
    width: CARD_WIDTH,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  popularTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexShrink: 1,
    marginRight: 8,
  },
  brandPillText: {
    marginLeft: 5,
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  riskBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  popularModel: {
    minHeight: 44,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  popularYear: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
  },
  popularHintBox: {
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  popularHintText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
  },
  popularFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  popularFooterText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '700',
  },

  skeletonPill: {
    width: '42%',
    height: 20,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  skeletonTitle: {
    width: '82%',
    height: 16,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: '48%',
    height: 12,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  skeletonBox: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },

  emptyState: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 22,
    alignItems: 'center',
  },
  emptyStateTitle: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
  },
  inlineLoading: {
    marginTop: 6,
  },

  evBannerWrap: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 5,
  },
  evBanner: {
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  evTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  evTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  evSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#E0F2FE',
  },
  evArrowWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 18,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoHeaderTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  infoSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  tipDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#F59E0B',
    marginTop: 7,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },
});