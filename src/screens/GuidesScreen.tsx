// src/screens/GuidesScreen.tsx
import React from 'react';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type GuideItem = {
  title: string;
  description: string;
  tip: string;
  iconName: string;
  iconColor: string;
};

const guideItems: GuideItem[] = [
  {
    title: 'Motor Yağı & Yağ Filtresi',
    description:
      'Yağ zamanla kirlenir ve viskozitesini kaybeder. Türkiye şartlarında çoğu araç için 10–15 bin km veya 1 yıl önerilir.',
    tip: 'Kısa mesafe / dur-kalk kullanımda 10–12 bin km’yi geçmemeye çalış.',
    iconName: 'water',
    iconColor: '#F59E0B',
  },
  {
    title: 'Akü Kontrolü',
    description:
      'Aküler genelde 3–5 yıl ömür sunar. Marşta zorluk, farlarda zayıflama uyarı işaretidir.',
    tip: 'Kış öncesi akü testi yaptır, kutup başlarını oksitten temiz tut.',
    iconName: 'battery-charging',
    iconColor: '#0EA5E9',
  },
  {
    title: 'Fren Sistemi',
    description:
      'Balata/disk duruma göre kontrol edilmelidir. Fren hidroliği 2 yılda bir değiştirilmeli.',
    tip: 'Yokuşta titreme veya sağ/sola çekme varsa hemen kontrol ettir.',
    iconName: 'stop-circle',
    iconColor: '#FB7185',
  },
  {
    title: 'Klima & Polen Filtresi',
    description:
      'Yılda bir veya ~15.000 km’de polen filtresi; klima hattı dezenfeksiyonu ile koku ve buğulanma azalır.',
    tip: 'Şehir içi yoğun kullanımda aktif karbonlu polen filtresi tercih et.',
    iconName: 'snow',
    iconColor: '#06B6D4',
  },
  {
    title: 'Lastik Basıncı & Rotasyon',
    description:
      'Basınç ayda bir kontrol edilmeli; 10–15 bin km’de rotasyonla eşit aşınma sağlanır.',
    tip: 'Uzun yolda aracın etiketindeki “yük/otoban” basınç değerlerini kullan.',
    iconName: 'speedometer',
    iconColor: '#10B981',
  },
  {
    title: 'Otomatik / DSG / CVT Şanzıman',
    description:
      'Birçok üretici “ömür boyu” dese de yağ değişimi 60–80 bin km civarı şanzıman ömrünü uzatır.',
    tip: 'Vites geçişlerinde vuruntu veya gecikme varsa yağı ve adaptasyonu kontrol ettir.',
    iconName: 'construct',
    iconColor: '#6366F1',
  },
  {
    title: 'Soğutma Sıvısı',
    description:
      'Antifriz karışımı 4–5 yılda bir yenilenmeli. Eksiltme varsa kaçak ve kapak kontrolü şart.',
    tip: 'Renk tek başına ölçüt değildir; donma noktası cihazla ölçülmeli.',
    iconName: 'thermometer',
    iconColor: '#14B8A6',
  },
  {
    title: 'Yakıt Filtresi (Dizel)',
    description:
      'Dizelde su ve partikül ayırıcı kritik. Genellikle 30–40 bin km civarı değişim tavsiye edilir.',
    tip: 'Kışın depoyu en az yarıdan fazla tut, yakıt donma riskini azalt.',
    iconName: 'flame',
    iconColor: '#EC4899',
  },
  {
    title: 'Triger & Kayışlar',
    description:
      'Kayışlı motorlarda genelde 90–120 bin km / 5–6 yıl. Zincirde ses/uzama varsa ihmal etme.',
    tip: 'Su pompası ve rulmanlar trigerle birlikte değiştirildiğinde risk ciddi şekilde azalır.',
    iconName: 'build',
    iconColor: '#8B5CF6',
  },
];

export default function GuidesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Başlık */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>
              Genel bakım rehberi • marka bağımsız
            </Text>
          </View>
          <Text style={styles.title}>Bakım Rehberi</Text>
          <Text style={styles.subtitle}>
            Aşağıdaki maddeler genel prensiplerdir. Modeline özel net periyotlar
            için uygulamadaki arama ekranını ve bakımları kullan.
          </Text>
        </View>

        {/* Kartlar */}
        <View style={styles.grid}>
          {guideItems.map((item, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: '#0F172A' }]}>
                  <Ionicons
                    name={item.iconName}
                    size={22}
                    color={item.iconColor}
                  />
                </View>
                <View style={styles.cardTitleBox}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
              </View>

              <View style={styles.tipBox}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>
                  <Text style={styles.tipLabel}>İpucu: </Text>
                  {item.tip}
                </Text>
              </View>
            </View>
          ))}
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
  header: {
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FBBF24',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  grid: {
    marginTop: 8,
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardTitleBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  tipBox: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tipDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
    marginRight: 8,
    marginTop: 5,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
  },
  tipLabel: {
    fontWeight: '700',
  },
});
