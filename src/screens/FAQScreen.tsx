// src/screens/FAQScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FAQItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    category: 'Genel',
    question: 'Otoplans nedir?',
    answer:
      'Otoplans, araç sahiplerinin bakım, kronik sorunlar, motor bilgileri ve elektrikli araç verileri gibi konulara daha hızlı ulaşabilmesi için geliştirilen bir otomotiv bilgi platformudur.',
  },
  {
    id: '2',
    category: 'Genel',
    question: 'Otoplans üzerinden neleri görüntüleyebilirim?',
    answer:
      'Araç bakım bilgileri, model bazlı kronik sorun içerikleri, elektrikli araç menzil ve batarya detayları, ileride ise kullanıcıya özel araç takibi ve bakım geçmişi gibi özellikleri görüntüleyebilirsin.',
  },
  {
    id: '3',
    category: 'Hesap',
    question: 'Giriş yapmadan uygulamayı kullanabilir miyim?',
    answer:
      'Evet. Birçok içeriği giriş yapmadan inceleyebilirsin. Ancak araç kaydetme, kişiselleştirilmiş takip ve bazı kullanıcıya özel özellikler için giriş yapılması gerekecek.',
  },
  {
    id: '4',
    category: 'Hesap',
    question: 'Neden hesap oluşturmam gerekiyor?',
    answer:
      'Hesap oluşturduğunda araçlarını kaydetmek, favori içeriklerini daha sonra tekrar görmek, bakım geçmişi tutmak ve ileride hatırlatma özelliklerinden yararlanmak mümkün olacak.',
  },
  {
    id: '5',
    category: 'Bakım',
    question: 'Bakım önerileri neye göre gösteriliyor?',
    answer:
      'Bakım ekranındaki öneriler; araç markası, model, motor tipi ve kilometre bilgisine göre eşleşen bakım kayıtları üzerinden sunulur. Amaç, sana en yakın yaklaşan bakım aralığını göstermektir.',
  },
  {
    id: '6',
    category: 'Elektrikli Araçlar',
    question: 'Elektrikli araç menzil verileri nasıl yorumlanmalı?',
    answer:
      'Listelenen menzil verileri gerçek kullanım, tahmini hesap veya WLTP verisi olabilir. Hava sıcaklığı, sürüş tarzı, hız ve yol koşulları gerçek menzili doğrudan etkiler.',
  },
  {
    id: '7',
    category: 'Destek',
    question: 'Hatalı veri görürsem ne yapmalıyım?',
    answer:
      'İletişim bölümünden bize bildirebilirsin. Kullanıcı geri bildirimleri veri kalitesini artırmak için önemlidir.',
  },
];

const CATEGORIES = ['Tümü', 'Genel', 'Hesap', 'Bakım', 'Elektrikli Araçlar', 'Destek'];

function FAQCard({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity style={styles.faqCard} activeOpacity={0.9} onPress={onToggle}>
      <View style={styles.faqTop}>
        <View style={styles.faqTextArea}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>

          <Text style={styles.faqQuestion}>{item.question}</Text>
        </View>

        <View style={[styles.chevronWrap, isOpen && styles.chevronWrapOpen]}>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={isOpen ? '#2563EB' : '#64748B'}
          />
        </View>
      </View>

      {isOpen ? (
        <View style={styles.answerBox}>
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function FAQScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [openId, setOpenId] = useState<string | null>('1');

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();

    return FAQ_DATA.filter((item) => {
      const categoryMatch =
        selectedCategory === 'Tümü' || item.category === selectedCategory;

      const textMatch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return categoryMatch && textMatch;
    });
  }, [search, selectedCategory]);

  const handleToggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={['#F8FBFF', '#EEF5FF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroBadge}>
            <Ionicons name="help-circle-outline" size={14} color="#2563EB" />
            <Text style={styles.heroBadgeText}>Yardım merkezi</Text>
          </View>

          <Text style={styles.heroTitle}>Sıkça Sorulan Sorular</Text>
          <Text style={styles.heroSubtitle}>
            Otoplans kullanımı ve özellikleri hakkında en çok merak edilen cevaplar burada.
          </Text>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#64748B" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Soru ara..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>
        </LinearGradient>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;

              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  activeOpacity={0.88}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      active && styles.categoryChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sorular</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredFaqs.length} sonuç listeleniyor
          </Text>

          <View style={styles.faqList}>
            {filteredFaqs.map((item) => (
              <FAQCard
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F8FC' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 140 },

  heroCard: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFFD9',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 999,
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
    marginBottom: 18,
  },
  searchBox: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#0F172A',
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
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

  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  } as any,
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },

  faqList: {
    marginTop: 8,
  },
  faqCard: {
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 10,
  },
  faqTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  faqTextArea: {
    flex: 1,
    paddingRight: 10,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF3FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  faqQuestion: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
    color: '#0F172A',
  },
  chevronWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chevronWrapOpen: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  answerBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
});