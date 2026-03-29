import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabaseClient';

export default function ProfileScreen() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Çıkış yapılamadı', error.message);
      }
    } catch {
      Alert.alert('Hata', 'Çıkış sırasında beklenmeyen bir sorun oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={28} color="#2563EB" />
          </View>
          <Text style={styles.name}>
            {user?.user_metadata?.full_name || 'Kullanıcı'}
          </Text>
          <Text style={styles.email}>{user?.email || '-'}</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {user?.email_confirmed_at ? 'Mail doğrulandı' : 'Mail doğrulanmadı'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Hesap Bilgileri</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Kayıtlı Araçlarım</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Bakım Geçmişim</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F8FC' },
  container: { flex: 1, padding: 20 },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  email: { marginTop: 4, fontSize: 14, color: '#64748B' },
  badge: {
    marginTop: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  badgeText: { color: '#2563EB', fontSize: 13, fontWeight: '800' },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuItem: {
    minHeight: 58,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuText: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  logoutButton: {
    marginTop: 18,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logoutText: { marginLeft: 8, color: '#DC2626', fontSize: 15, fontWeight: '800' },
});