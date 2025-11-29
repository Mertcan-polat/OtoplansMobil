// src/screens/HomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Otoplans</Text>
          <Text style={styles.tagline}>
            Aracını tanı, bakımını planla, sorunları önle
          </Text>
        </View>

        {/* SEARCH - Ana Odak Noktası */}
        <TouchableOpacity
          style={styles.searchContainer}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Search')}
        >
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <View style={styles.searchTextContainer}>
              <Text style={styles.searchPlaceholder}>Araç ara...</Text>
              <Text style={styles.searchHint}>
                Marka, model veya motor tipi yazın
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* QUICK ACTIONS - Basit ve Temiz */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.actionIcon}>🔧</Text>
              <Text style={styles.actionTitle}>Bakım Kontrolü</Text>
              <Text style={styles.actionDesc}>
                KM'ne göre bakım listesi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('KronikSorun')}
            >
              <Text style={styles.actionIcon}>⚠️</Text>
              <Text style={styles.actionTitle}>Kronik Sorunlar</Text>
              <Text style={styles.actionDesc}>
                Bilinen problemleri gör
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('CompareDecision')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Araç Karşılaştır</Text>
              <Text style={styles.actionDesc}>
                İki aracı yan yana getir
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('EvGuide')}
            >
              <Text style={styles.actionIcon}>🔋</Text>
              <Text style={styles.actionTitle}>Elektrikli Rehberi</Text>
              <Text style={styles.actionDesc}>
                EV araçları hakkında bilgi
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FEATURED CONTENT - Daha Az Metin */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Otoplans ile Neler Yapabilirsin?</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🚗</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>2. El Araç Alırken</Text>
              <Text style={styles.featureDescription}>
                Aracın bakım geçmişi ve bilinen sorunlarını öğren
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🛠️</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Mevcut Aracını Yönet</Text>
              <Text style={styles.featureDescription}>
                Bakım periyotlarını takip et, sonraki servisi planla
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>💡</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Bilgi Sahibi Ol</Text>
              <Text style={styles.featureDescription}>
                Teknik bilgiler ve kullanıcı deneyimleri tek yerde
              </Text>
            </View>
          </View>
        </View>

        {/* CTA - Call to Action */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaTitle}>Aracını tanımaya başla</Text>
          <Text style={styles.ctaDescription}>
            Binlerce araç modeli için bakım bilgileri ve kullanıcı deneyimleri
          </Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.ctaButtonText}>Hemen Ara</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 40,
  },

  /* HEADER */
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },

  /* SEARCH */
  searchContainer: {
    marginBottom: 30,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
    color: '#666',
  },
  searchTextContainer: {
    flex: 1,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
    marginBottom: 2,
  },
  searchHint: {
    fontSize: 14,
    color: '#888',
  },

  /* QUICK ACTIONS */
  actionsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  /* FEATURES */
  featuresContainer: {
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureIcon: {
    fontSize: 18,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  /* CTA */
  ctaContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});