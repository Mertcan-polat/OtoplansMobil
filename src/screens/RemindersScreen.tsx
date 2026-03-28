// src/screens/RemindersScreen.tsx
import React from 'react';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function RemindersScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Hatırlatıcılar</Text>
        <Text style={styles.subtitle}>
          Kasko, trafik sigortası, muayene ve bakım tarihlerini burada
          toplamak istiyoruz. Şimdilik tasarım aşamasında; ileride bu ekrandan
          Supabase’e kaydedip bildirim planlayacağız.
        </Text>

        {/* Örnek hızlı şablonlar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı Şablonlar</Text>

          <View style={styles.grid}>
            <View style={styles.templateCard}>
              <View style={styles.templateIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#2563EB" />
              </View>
              <Text style={styles.templateTitle}>Trafik Sigortası</Text>
              <Text style={styles.templateText}>
                Yıllık yenileme tarihini ekleyerek poliçe bitişinde uyarı al.
              </Text>
            </View>

            <View style={styles.templateCard}>
              <View style={styles.templateIcon}>
                <Ionicons name="car-sport" size={20} color="#10B981" />
              </View>
              <Text style={styles.templateTitle}>Kasko Yenileme</Text>
              <Text style={styles.templateText}>
                Araç kasko bitiş tarihi yaklaştığında sana haber verelim.
              </Text>
            </View>

            <View style={styles.templateCard}>
              <View style={styles.templateIcon}>
                <Ionicons name="construct" size={20} color="#F97316" />
              </View>
              <Text style={styles.templateTitle}>Periyodik Bakım</Text>
              <Text style={styles.templateText}>
                KM veya tarih bazlı bakım hatırlatıcılarını burada tutacağız.
              </Text>
            </View>

            <View style={styles.templateCard}>
              <View style={styles.templateIcon}>
                <Ionicons name="calendar" size={20} color="#EC4899" />
              </View>
              <Text style={styles.templateTitle}>Muayene Tarihi</Text>
              <Text style={styles.templateText}>
                Araç muayenesini unutma; tarih yaklaşınca bildirim al.
              </Text>
            </View>
          </View>
        </View>

        {/* Örnek bir “yakında” kutusu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yakında</Text>
          <View style={styles.soonCard}>
            <Ionicons name="notifications-outline" size={22} color="#2563EB" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.soonTitle}>Kişisel hatırlatıcı listesi</Text>
              <Text style={styles.soonText}>
                Giriş yaptıktan sonra, kendi araçların için hatırlatıcı
                ekleyebileceksin. Tarih & kilometre bazlı planlama, push
                notification gibi özellikleri buradan yöneteceğiz.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
          <Text style={styles.infoText}>
            Şu an sadece taslak görünümü hazırlıyoruz. Backend tarafında araç
            ve kullanıcı bilgilerini otoplans.net Supabase şemasına bağlayınca,
            bu ekrandan gerçek kaydetme & hatırlatma akışını birlikte kurarız.
          </Text>
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
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  templateCard: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  templateIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  templateTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  templateText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  soonCard: {
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    padding: 12,
    alignItems: 'flex-start',
  },
  soonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  soonText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  infoBox: {
    marginTop: 20,
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    padding: 10,
    alignItems: 'flex-start',
    gap: 8,
  } as any,
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
});
