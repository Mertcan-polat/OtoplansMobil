import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../lib/supabaseClient';

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
};

type VehicleRow = {
  id: number;
  brand: string;
  model: string;
  year: number | null;
  created_at: string;
};

export default function AdminPanelScreen() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();

      if (userErr || !userRes.user) {
        Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı.');
        return;
      }

      const { data: roleRows, error: roleErr } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userRes.user.id);

      if (roleErr) {
        Alert.alert('Hata', roleErr.message);
        return;
      }

      const adminExists = (roleRows || []).some((x) => x.role === 'admin');
      setIsAdmin(adminExists);

      if (!adminExists) {
        Alert.alert('Yetki yok', 'Bu ekran sadece admin kullanıcılar içindir.');
        return;
      }

      const { data: profilesData, error: profilesErr } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (profilesErr) {
        console.log('[AdminPanel] profilesErr:', profilesErr);
      } else {
        setProfiles((profilesData || []) as ProfileRow[]);
      }

      const { data: vehiclesData, error: vehiclesErr } = await supabase
        .from('user_vehicles')
        .select('id, brand, model, year, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (vehiclesErr) {
        console.log('[AdminPanel] vehiclesErr:', vehiclesErr);
      } else {
        setVehicles((vehiclesData || []) as VehicleRow[]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Admin verileri yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="shield-outline" size={36} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Bu alan sadece admin kullanıcılar için açık</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Admin Paneli</Text>
          <Text style={styles.heroSubtitle}>
            Kullanıcı, araç ve test verilerini hızlıca kontrol et.
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={loadAdminData} activeOpacity={0.88}>
          <Ionicons name="refresh-outline" size={18} color="#2563EB" />
          <Text style={styles.refreshButtonText}>Verileri yenile</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Son kullanıcılar</Text>
          {profiles.length === 0 ? (
            <Text style={styles.emptyText}>Kayıt bulunamadı.</Text>
          ) : (
            profiles.map((item) => (
              <View key={item.id} style={styles.row}>
                <Text style={styles.rowTitle}>{item.full_name || 'İsimsiz kullanıcı'}</Text>
                <Text style={styles.rowSubtitle}>{item.email || '-'}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Son araç kayıtları</Text>
          {vehicles.length === 0 ? (
            <Text style={styles.emptyText}>Araç kaydı bulunamadı.</Text>
          ) : (
            vehicles.map((item) => (
              <View key={item.id} style={styles.row}>
                <Text style={styles.rowTitle}>
                  {item.brand} {item.model}
                </Text>
                <Text style={styles.rowSubtitle}>
                  {item.year ? String(item.year) : 'Yıl yok'}
                </Text>
              </View>
            ))
          )}
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
  content: {
    padding: 18,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#475569',
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },
  refreshButton: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  refreshButtonText: {
    marginLeft: 8,
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#64748B',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
});