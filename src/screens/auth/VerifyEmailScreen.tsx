import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { supabase } from '../../lib/supabaseClient';


type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

export default function VerifyEmailScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: 'https://otoplans.net/auth/callback',
        },
      });

      if (error) {
        Alert.alert('Gönderilemedi', error.message);
        return;
      }

      Alert.alert('Tekrar gönderildi', 'Doğrulama maili tekrar gönderildi.');
    } catch (error) {
      Alert.alert('Hata', 'Mail tekrar gönderilirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail-outline" size={30} color="#2563EB" />
        </View>

        <Text style={styles.title}>Mailini Doğrula</Text>
        <Text style={styles.subtitle}>
          <Text style={{ fontWeight: '800', color: '#0F172A' }}>{email}</Text> adresine doğrulama
          bağlantısı gönderdik. Mailindeki bağlantıya tıkladıktan sonra giriş yapabilirsin.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.replace('Login')}>
          <Text style={styles.primaryButtonText}>Giriş ekranına git</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleResend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#2563EB" />
          ) : (
            <Text style={styles.secondaryButtonText}>Maili tekrar gönder</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F8FC' },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: '#2563EB', fontSize: 15, fontWeight: '800' },
});