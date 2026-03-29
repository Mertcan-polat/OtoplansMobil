import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabaseClient';

type Nav = any;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Eksik bilgi', 'Lütfen tüm alanları doldur.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Geçersiz şifre', 'Şifre en az 6 karakter olmalı.');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: 'https://otoplans.net/auth/callback',
        },
      });

      if (error) {
        Alert.alert('Kayıt başarısız', error.message);
        return;
      }

      Alert.alert(
        'Kayıt başarılı',
        'Doğrulama maili gönderildi. Mail kutundan hesabını doğruladıktan sonra giriş yapabilirsin.'
      );

      navigation.navigate('Login');
    } catch (err) {
      console.log('[RegisterScreen] catch error:', err);
      Alert.alert('Hata', 'Kayıt sırasında beklenmeyen bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="person-add-outline" size={28} color="#2563EB" />
            </View>
            <Text style={styles.title}>Kayıt Ol</Text>
            <Text style={styles.subtitle}>
              Hesap oluştur ve araçların için kişisel kayıt altyapısını aç.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              placeholder="Ad Soyad"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@mail.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Şifre</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="En az 6 karakter"
                placeholderTextColor="#94A3B8"
                secureTextEntry={secure}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeButton}>
                <Ionicons
                  name={secure ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              activeOpacity={0.88}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Kayıt ol</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryLink} onPress={goToLogin}>
              <Text style={styles.secondaryLinkText}>Zaten hesabın var mı? Giriş yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F8FC' },
  flex: { flex: 1 },
  content: { padding: 20 },
  header: { marginBottom: 20 },
  iconWrap: {
    width: 58, height: 58, borderRadius: 18, backgroundColor: '#EAF3FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 21, color: '#64748B' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1,
    borderColor: '#E2E8F0', padding: 18,
  },
  label: {
    fontSize: 14, fontWeight: '700', color: '#334155',
    marginBottom: 8, marginTop: 10,
  },
  input: {
    height: 52, borderRadius: 16, borderWidth: 1, borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC', paddingHorizontal: 14, fontSize: 15, color: '#0F172A',
  },
  passwordWrap: {
    flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: 16,
    borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', paddingHorizontal: 14,
  },
  passwordInput: { flex: 1, fontSize: 15, color: '#0F172A' },
  eyeButton: { paddingLeft: 10 },
  primaryButton: {
    marginTop: 20, minHeight: 52, borderRadius: 16, backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  },
  disabledButton: { opacity: 0.7 },
  primaryButtonText: {
    marginLeft: 8, color: '#FFFFFF', fontSize: 15, fontWeight: '800',
  },
  secondaryLink: { marginTop: 16, alignItems: 'center' },
  secondaryLinkText: { color: '#2563EB', fontSize: 14, fontWeight: '700' },
});