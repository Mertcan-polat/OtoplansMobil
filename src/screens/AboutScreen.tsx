// src/screens/AboutScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureIconWrap, { backgroundColor: color }]}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>

      <View style={styles.featureTextWrap}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function ValueCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.valueCard}>
      <Text style={styles.valueTitle}>{title}</Text>
      <Text style={styles.valueDescription}>{description}</Text>
    </View>
  );
}

export default function AboutScreen() {
  const openWebsite = async () => {
    try {
      await Linking.openURL('https://otoplans.net');
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#F8FBFF', '#EEF5FF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroBadge}>
            <Ionicons name="information-circle-outline" size={14} color="#2563EB" />
            <Text style={styles.heroBadgeText}>Otoplans hakkında</Text>
          </View>

          <Text style={styles.heroTitle}>Araç sahipleri için daha sade ve güvenilir bilgi deneyimi</Text>
          <Text style={styles.heroSubtitle}>
            Otoplans; bakım, kronik sorunlar, motor bilgileri ve elektrikli araç içeriklerini
            daha erişilebilir hale getirmek için geliştirilen otomotiv odaklı bir platformdur.
          </Text>

          <View style={styles.heroChips}>
            <View style={styles.heroChip}>
              <Ionicons name="car-outline" size={13} color="#2563EB" />
              <Text style={styles.heroChipText}>Bakım</Text>
            </View>

            <View style={styles.heroChip}>
              <Ionicons name="warning-outline" size={13} color="#2563EB" />
              <Text style={styles.heroChipText}>Kronik sorunlar</Text>
            </View>

            <View style={styles.heroChip}>
              <Ionicons name="flash-outline" size={13} color="#2563EB" />
              <Text style={styles.heroChipText}>Elektrikli araçlar</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Otoplans ne sunar?</Text>
          <Text style={styles.sectionSubtitle}>
            Kullanıcıların araçlarıyla ilgili doğru bilgiye daha hızlı ulaşmasını hedefler.
          </Text>

          <View style={styles.featureList}>
            <FeatureCard
              icon="construct-outline"
              title="Bakım bilgileri"
              description="Marka, model ve kilometreye göre bakım içeriklerini daha anlaşılır şekilde sunar."
              color="#2563EB"
            />

            <FeatureCard
              icon="warning-outline"
              title="Kronik sorun rehberi"
              description="Belirli model ve motor kombinasyonlarında sık görülen sorunları derli toplu gösterir."
              color="#F97316"
            />

            <FeatureCard
              icon="speedometer-outline"
              title="Motor ve teknik içerikler"
              description="Motor tipi, teknik veriler ve araç özelinde gerekli bilgileri daha düzenli hale getirir."
              color="#6366F1"
            />

            <FeatureCard
              icon="flash-outline"
              title="Elektrikli araç verileri"
              description="Menzil, batarya ve şarj özelliklerini karşılaştırmalı şekilde incelemeyi kolaylaştırır."
              color="#22C55E"
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Neden geliştiriliyor?</Text>
          <Text style={styles.sectionSubtitle}>
            Çünkü otomotiv bilgisi çoğu zaman dağınık, teknik ve yorucu biçimde sunuluyor.
          </Text>

          <ValueCard
            title="Daha anlaşılır içerik"
            description="Karmaşık teknik verileri daha okunabilir, sade ve kullanıcı dostu bir deneyime dönüştürmek."
          />

          <ValueCard
            title="Daha hızlı karar"
            description="Araç sahibi, bakım yaptıracak kullanıcı veya yeni araç araştıran biri için süreci hızlandırmak."
          />

          <ValueCard
            title="Daha güçlü güven"
            description="Dağınık forum aramaları yerine, tek ekranda daha düzenli ve kontrollü bilgi sunmak."
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Yakında gelecek özellikler</Text>
          <Text style={styles.sectionSubtitle}>
            Uygulama adım adım büyütülüyor. Planlanan bazı geliştirmeler:
          </Text>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Garaj ve kullanıcıya özel araç takibi</Text>
              <Text style={styles.timelineText}>
                Kullanıcının kendi aracını kaydedip içerikleri kişiselleştirebilmesi.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Bakım geçmişi ve hatırlatmalar</Text>
              <Text style={styles.timelineText}>
                Yapılan bakım kayıtlarını saklama ve yaklaşan işlemler için uyarı alma.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Gelişmiş karşılaştırma ve yorum alanları</Text>
              <Text style={styles.timelineText}>
                Kullanıcıların araçlar arasında daha hızlı kıyas yapabilmesi ve geri bildirim paylaşabilmesi.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Vizyon</Text>
          <Text style={styles.visionText}>
            Otoplans’ın hedefi; araç kullanıcılarının sadece veri gördüğü değil, gerçekten yön bulabildiği
            bir otomotiv platformu oluşturmaktır.
          </Text>

          <TouchableOpacity
            style={styles.websiteButton}
            activeOpacity={0.88}
            onPress={openWebsite}
          >
            <Ionicons name="globe-outline" size={18} color="#FFFFFF" />
            <Text style={styles.websiteButtonText}>otoplans.net adresini aç</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#2563EB" />
          <Text style={styles.infoBannerText}>
            Bu ekran, kullanıcıya Otoplans’ın ne olduğunu net anlatmak ve güven hissi vermek için tasarlandı.
          </Text>
        </View>
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
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
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
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
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
    marginBottom: 16,
  },

  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as any,

  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFFD9',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  heroChipText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
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
    marginBottom: 12,
  },

  featureList: {
    marginTop: 2,
  },

  featureCard: {
    minHeight: 84,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  featureIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  featureTextWrap: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },

  valueCard: {
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 10,
  },

  valueTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },

  valueDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
  },

  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    marginTop: 5,
    marginRight: 12,
  },

  timelineContent: {
    flex: 1,
    paddingBottom: 8,
  },

  timelineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  timelineText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },

  visionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    marginTop: 4,
    marginBottom: 16,
  },

  websiteButton: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  websiteButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 18,
    padding: 14,
  },

  infoBannerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#1E40AF',
  },
});