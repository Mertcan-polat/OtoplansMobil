// src/screens/GarageScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../lib/supabaseClient';
import { useNavigation } from '@react-navigation/native';

type Nav = any;

type UserInfo = {
  email?: string | null;
};

export default function GarageScreen() {
  const navigation = useNavigation<Nav>();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const loadUser = async () => {
    setLoadingUser(true);
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setUser(null);
    } else {
      setUser({ email: data.user.email });
    }
    setLoadingUser(false);
  };

  useEffect(() => {
    // İlk açılışta user çek
    loadUser();

    // Auth durumu değişince tekrar yükle
    const sub = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      sub.data.subscription.unsubscribe();
    };
  }, []);

  const goLogin = () => {
    navigation.navigate('Login');
  };

  const goAddVehicle = () => {
    // İleride araç ekleme ekranına gidecek.
    // Şimdilik sadece bilgi mesajı.
    console.log('Araç ekleme akışı burada olacak.');
  };

  if (loadingUser) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Kullanıcı bilgilerin yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 🔹 Kullanıcı GİRİŞ YAPMAMIŞSA
  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.heroCard}>
            <Ionicons name="car-sport" size={36} color="#2563EB" />
            <Text style={styles.heroTitle}>Garajını oluşturmak için giriş yap</Text>
            <Text style={styles.heroSubtitle}>
              Kendi araçlarını ekle, yaptığın bakımları, masrafları ve kilometreyi burada
              tutalım.{"\n"}
              Ayrıca kasko, sigorta ve muayene tarihlerini hatırlatıcı olarak kaydedebilirsin.
            </Text>

            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.8}
              onPress={goLogin}
            >
              <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
              <Text style={styles.loginText}>Giriş yap / Kayıt ol</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Garaj ile neler yapabilirsin?</Text>
            <Text style={styles.infoItem}>• Araçlarını tek ekranda takip et</Text>
            <Text style={styles.infoItem}>• Bakım geçmişini ve masrafları kaydet</Text>
            <Text style={styles.infoItem}>• Kasko, sigorta, muayene için hatırlatıcı al</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 🔹 Kullanıcı GİRİŞ YAPTIYSA
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Garajım</Text>
        <Text style={styles.subtitle}>
          {user.email} hesabıyla giriş yaptın.{"\n"}
          Burada Supabase üzerinden sana ait araçları listeleyeceğiz.
        </Text>

        {/* Şimdilik placeholder bir kutu, ileride Supabase ile bağlayacağız */}
        <View style={styles.garageCard}>
          <Text style={styles.garageEmptyTitle}>Henüz kayıtlı aracın yok</Text>
          <Text style={styles.garageEmptyText}>
            İlk aracını ekleyerek bakım ve masraf geçmişini tutmaya başlayabilirsin.
          </Text>

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={goAddVehicle}
          >
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Araç ekle</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D4ED8',
    marginTop: 8,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#1F2933',
    lineHeight: 20,
  },
  loginButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  loginText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  infoItem: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  garageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  garageEmptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  garageEmptyText: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#22C55E',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addButtonText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
