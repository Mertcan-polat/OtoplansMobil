// src/screens/AccountScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabaseClient';
import { useNavigation } from '@react-navigation/native';

type Nav = any;

type UserInfo = {
  email?: string | null;
};

type QuickActionProps = {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
};

type InfoCardProps = {
  icon: string;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
};

function QuickActionCard({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickCard} activeOpacity={0.88} onPress={onPress}>
      <View style={[styles.quickIconWrap, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>

      <View style={styles.quickTextWrap}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}

function InfoCard({
  icon,
  title,
  description,
  color,
  onPress,
}: InfoCardProps) {
  return (
    <TouchableOpacity style={styles.infoCard} activeOpacity={0.92} onPress={onPress}>
      <View style={[styles.infoIconWrap, { backgroundColor: color }]}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>

      <View style={styles.infoTextWrap}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoDescription}>{description}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const navigation = useNavigation<Nav>();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const loadUser = async () => {
    try {
      setLoadingUser(true);
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setUser(null);
      } else {
        setUser({ email: data.user.email });
      }
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    loadUser();

    return () => {
      sub.data.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
    }
  };

  const goToLogin = () => {
    navigation.navigate('Login' as never);
  };

  const goToGarage = () => {
    navigation.navigate('Garage' as never);
  };

  const goToKronik = () => {
    navigation.navigate('KronikSorun' as never);
  };

  const goToEvGuide = () => {
    navigation.navigate('EvGuide' as never);
  };

  const goToFAQ = () => {
    navigation.navigate('FAQ' as never);
  };

  const goToAbout = () => {
    navigation.navigate('About' as never);
  };

  const goToContact = () => {
    Alert.alert(
      'İletişim',
      'İletişim ekranını bir sonraki adımda ekleyeceğiz. Şimdilik bu alan hazır değil.'
    );
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
            <Ionicons name="person-circle-outline" size={14} color="#2563EB" />
            <Text style={styles.heroBadgeText}>Hesap & destek merkezi</Text>
          </View>

          <Text style={styles.heroTitle}>Hesabın ve uygulama kısayolların burada</Text>
          <Text style={styles.heroSubtitle}>
            Giriş yaparak araçlarını kaydet, bakım geçmişini takip et ve Otoplans özelliklerine
            daha hızlı eriş.
          </Text>

          <View style={styles.heroMiniRow}>
            <View style={styles.heroMiniChip}>
              <Ionicons name="car-outline" size={13} color="#2563EB" />
              <Text style={styles.heroMiniChipText}>Araç yönetimi</Text>
            </View>

            <View style={styles.heroMiniChip}>
              <Ionicons name="construct-outline" size={13} color="#2563EB" />
              <Text style={styles.heroMiniChipText}>Bakım takibi</Text>
            </View>

            <View style={styles.heroMiniChip}>
              <Ionicons name="help-circle-outline" size={13} color="#2563EB" />
              <Text style={styles.heroMiniChipText}>Destek</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.accountCard}>
          <View style={styles.accountTopRow}>
            <View style={styles.avatarWrap}>
              <Ionicons name="person" size={26} color="#2563EB" />
            </View>

            <View style={styles.accountTextArea}>
              {loadingUser ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text style={styles.loadingText}>Kullanıcı bilgisi yükleniyor...</Text>
                </View>
              ) : user ? (
                <>
                  <Text style={styles.accountTitle}>Hoş geldin</Text>
                  <Text style={styles.accountSubtitle}>{user.email}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.accountTitle}>Henüz giriş yapmadın</Text>
                  <Text style={styles.accountSubtitle}>
                    Giriş yaparak araçlarını kaydedebilir, bakım ve favori içeriklerini daha sonra
                    tekrar görebilirsin.
                  </Text>
                </>
              )}
            </View>
          </View>

          {!loadingUser && !user ? (
            <View style={styles.authButtonsRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.88}
                onPress={goToLogin}
              >
                <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Giriş yap</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.88}
                onPress={goToLogin}
              >
                <Ionicons name="person-add-outline" size={18} color="#2563EB" />
                <Text style={styles.secondaryButtonText}>Kayıt ol</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!loadingUser && user ? (
            <View style={styles.loggedInRow}>
              <View style={styles.loggedInBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                <Text style={styles.loggedInBadgeText}>Oturum açık</Text>
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                activeOpacity={0.88}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={16} color="#B91C1C" />
                <Text style={styles.logoutText}>Çıkış yap</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hızlı erişim</Text>
            <Text style={styles.sectionSubtitle}>
              En çok kullanacağın alanlara tek dokunuşla git.
            </Text>
          </View>

          <QuickActionCard
            icon="car-sport-outline"
            title="Garajım"
            subtitle="Araçlarını görüntüle ve yönet"
            color="#2563EB"
            onPress={goToGarage}
          />

          <QuickActionCard
            icon="warning-outline"
            title="Kronik Sorunlar"
            subtitle="Model bazlı bilinen sorunları incele"
            color="#F97316"
            onPress={goToKronik}
          />

          <QuickActionCard
            icon="flash-outline"
            title="Elektrikli Araç Rehberi"
            subtitle="EV menzil, batarya ve şarj bilgilerini karşılaştır"
            color="#22C55E"
            onPress={goToEvGuide}
          />
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bilgi ve destek</Text>
            <Text style={styles.sectionSubtitle}>
              Yardım ve kurumsal sayfalara buradan ulaş.
            </Text>
          </View>

          <InfoCard
            icon="help-circle-outline"
            title="Sıkça Sorulan Sorular"
            description="Yazdığımız FAQ ekranına geç."
            color="#0EA5E9"
            onPress={goToFAQ}
          />

          <InfoCard
            icon="information-circle-outline"
            title="Otoplans Hakkında"
            description="Yazdığımız About ekranına geç."
            color="#6366F1"
            onPress={goToAbout}
          />

          <InfoCard
            icon="mail-outline"
            title="İletişim"
            description="İletişim ekranını sonraki adımda ekleyeceğiz."
            color="#EC4899"
            onPress={goToContact}
          />
        </View>

        <View style={styles.footerNote}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#2563EB" />
          <Text style={styles.footerNoteText}>
            FAQ ve About artık gerçek ekrana gitmeli. Contact ekranını sonra bağlarız.
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
    overflow: 'hidden',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFFCC',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DBEAFE',
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
  heroMiniRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as any,
  heroMiniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFFD9',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  heroMiniChipText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  accountTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountTextArea: {
    flex: 1,
  },
  accountTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  accountSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  } as any,
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    marginLeft: 8,
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '800',
  },
  loggedInRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  } as any,
  loggedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loggedInBadgeText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
  },
  sectionBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  sectionHeader: {
    marginBottom: 10,
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
  },
  quickCard: {
    minHeight: 74,
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
  quickIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  quickSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
  infoCard: {
    minHeight: 86,
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
  infoIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  infoDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 18,
    padding: 14,
  },
  footerNoteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#1E40AF',
  },
});