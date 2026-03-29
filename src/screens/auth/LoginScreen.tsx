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

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const resendConfirmation = async () => {
    if (!email.trim()) {
      Alert.alert('Eksik bilgi', 'Önce e-posta adresini gir.');
      return;
    }

    try {
      setResendLoading(true);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: 'https://otoplans.net/auth/callback',
        },
      });

      if (error) {
        Alert.alert('Hata', error.message);
        return;
      }

      Alert.alert('Gönderildi', 'Doğrulama e-postası tekrar gönderildi.');
    } catch {
      Alert.alert('Hata', 'Doğrulama maili gönderilirken sorun oluştu.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eksik bilgi', 'Lütfen e-posta ve şifre alanlarını doldur.');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message?.toLowerCase().includes('email not confirmed')) {
          Alert.alert(
            'E-posta doğrulanmadı',
            'Önce e-posta adresini doğrulaman gerekiyor. Aşağıdaki butonla doğrulama mailini tekrar gönderebilirsin.'
          );
          return;
        }

        Alert.alert('Giriş başarısız', error.message);
        return;
      }

      Alert.alert('Başarılı', 'Giriş yapıldı.');
      navigation.navigate('Home');
    } catch {
      Alert.alert('Hata', 'Giriş sırasında beklenmeyen bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
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
              <Ionicons name="log-in-outline" size={28} color="#2563EB" />
            </View>
            <Text style={styles.title}>Giriş Yap</Text>
            <Text style={styles.subtitle}>
              Hesabına giriş yaparak araçlarını ve kişisel kayıtlarını yönet.
            </Text>
          </View>

          <View style={styles.card}>
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
                placeholder="Şifreni gir"
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
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Giriş yap</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ghostButton, resendLoading && styles.disabledButton]}
              activeOpacity={0.88}
              onPress={resendConfirmation}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <ActivityIndicator color="#2563EB" />
              ) : (
                <>
                  <Ionicons name="mail-outline" size={18} color="#2563EB" />
                  <Text style={styles.ghostButtonText}>Doğrulama mailini tekrar gönder</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryLink} onPress={goToRegister}>
              <Text style={styles.secondaryLinkText}>Hesabın yok mu? Kayıt ol</Text>
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
  ghostButton: {
    marginTop: 12, minHeight: 52, borderRadius: 16, backgroundColor: '#EFF6FF',
    borderWidth: 1, borderColor: '#BFDBFE', alignItems: 'center',
    justifyContent: 'center', flexDirection: 'row',
  },
  ghostButtonText: {
    marginLeft: 8, color: '#2563EB', fontSize: 14, fontWeight: '800',
  },
  disabledButton: { opacity: 0.7 },
  primaryButtonText: {
    marginLeft: 8, color: '#FFFFFF', fontSize: 15, fontWeight: '800',
  },
  secondaryLink: { marginTop: 16, alignItems: 'center' },
  secondaryLinkText: { color: '#2563EB', fontSize: 14, fontWeight: '700' },
});