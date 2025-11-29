// src/components/MaintenanceSuggestions.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getFeatured } from '../api/client';

type FeaturedItem = {
  marka: string;
  model: string;
  motor_tip: string;
  yil: number | null;
  bakimlar: { text: string; not?: string | null }[];
};

export default function MaintenanceSuggestions() {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [auto, setAuto] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const durationSec = 5;
  const active = items.length ? items[index % items.length] : null;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getFeatured(15)
      .then((data) => {
        if (!mounted) return;
        setItems(data.items ?? []);
        setIndex(0);
        setSecondsLeft(durationSec);
        setError(null);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message || 'Veri alınamadı');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!items.length || !auto) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIndex((i) => (i + 1) % items.length);
          return durationSec;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [items.length, auto]);

  useEffect(() => {
    if (!items.length) return;
    setSecondsLeft(durationSec);
  }, [index, items.length]);

  const prev = useCallback(() => {
    if (!items.length) return;
    setIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  const next = useCallback(() => {
    if (!items.length) return;
    setIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !items.length || !active) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>
          {error ? 'Veriler alınamadı. Lütfen daha sonra tekrar deneyin.' : 'Şu anda gösterilecek öneri yok.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.sectionLabel}>Gerçek kullanıcı verilerinden derlenir</Text>
      <Text style={styles.title}>
        Gerçek Verilerden{' '}
        <Text style={styles.titleHighlight}>Bakım Önerileri</Text>
      </Text>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.motorTip} numberOfLines={1}>
              {active.motor_tip}
            </Text>
            <Text style={styles.vehicle} numberOfLines={1}>
              {active.marka} {active.model}
              {active.yil ? ` (${active.yil})` : ''}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => setAuto((v) => !v)}
              style={styles.autoButton}
            >
              <Text style={styles.autoButtonText}>{auto ? 'Oto: Açık' : 'Oto: Kapalı'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={prev} style={styles.arrowButton}>
              <Text style={styles.arrowText}>{'‹'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={next} style={[styles.arrowButton, styles.arrowButtonPrimary]}>
              <Text style={[styles.arrowText, styles.arrowTextPrimary]}>{'›'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          {active.bakimlar.map((b, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.bullet} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemText}>{b.text}</Text>
                {b.not ? <Text style={styles.itemNote}>{b.not}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.progressOuter}>
          <View
            style={[
              styles.progressInner,
              { width: `${(secondsLeft / durationSec) * 100}%` },
            ]}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerLeft}>
            {auto ? `Sonraki öneri: ${secondsLeft} sn` : 'Manuel mod'}
          </Text>
          <Text style={styles.footerRight}>
            {index + 1}/{items.length}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 16,
  },
  sectionLabel: {
    alignSelf: 'center',
    fontSize: 11,
    color: '#4b5563',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  title: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  titleHighlight: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    paddingHorizontal: 4,
    borderRadius: 999,
  },
  card: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  errorText: {
    fontSize: 13,
    color: '#b91c1c',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  motorTip: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6b7280',
  },
  vehicle: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  autoButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    marginRight: 6,
  },
  autoButtonText: {
    fontSize: 11,
    color: '#374151',
  },
  arrowButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  arrowButtonPrimary: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  arrowText: {
    fontSize: 16,
    color: '#111827',
  },
  arrowTextPrimary: {
    color: '#ffffff',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  bullet: {
    marginTop: 6,
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  itemText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  itemNote: {
    marginTop: 2,
    fontSize: 12,
    color: '#6b7280',
  },
  progressOuter: {
    marginTop: 10,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  progressInner: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  footerRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLeft: {
    fontSize: 11,
    color: '#6b7280',
  },
  footerRight: {
    fontSize: 11,
    color: '#6b7280',
  },
});
