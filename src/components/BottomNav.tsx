// src/components/BottomNav.tsx

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

let BlurView: React.ComponentType<any> | null = null;
try {
  BlurView = require('expo-blur').BlurView;
} catch {
  BlurView = null;
}

type TabItem = {
  name: string;
  label: string;
  icon: string;
  iconActive: string;
};

const TABS: TabItem[] = [
  {
    name: 'Home',
    label: 'Ana Sayfa',
    icon: 'home-outline',
    iconActive: 'home',
  },
  {
    name: 'Search',
    label: 'Bakım',
    icon: 'search-outline',
    iconActive: 'search',
  },
  {
    name: 'EvGuide',
    label: 'Elektrikli',
    icon: 'flash-outline',
    iconActive: 'flash',
  },
  {
    name: 'Account',
    label: 'Profil',
    icon: 'person-outline',
    iconActive: 'person',
  },
];

const ACTIVE_COLOR = '#2563EB';
const INACTIVE_COLOR = '#64748B';

const TabButton: React.FC<{
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
}> = ({ tab, isActive, onPress }) => {
  const activeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(activeAnim, {
      toValue: isActive ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [isActive, activeAnim]);

  const inactiveOpacity = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const activeOpacity = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <TouchableOpacity
      style={styles.tab}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isActive }}
    >
      <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
        <View style={styles.iconWrap}>
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, styles.iconCenter, { opacity: inactiveOpacity }]}
          >
            <Ionicons name={tab.icon} size={22} color={INACTIVE_COLOR} />
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, styles.iconCenter, { opacity: activeOpacity }]}
          >
            <Ionicons name={tab.iconActive} size={22} color={ACTIVE_COLOR} />
          </Animated.View>
        </View>
      </View>

      <Text style={[styles.label, isActive && styles.labelActive]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
};

type Props = {
  currentRouteName?: string;
};

const BottomNav: React.FC<Props> = ({ currentRouteName }) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const handlePress = (tab: TabItem) => {
    if (currentRouteName === tab.name) return;
    navigation.navigate(tab.name as never);
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.shadowLayer} />

      <View style={styles.container}>
        {BlurView ? (
          <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.fallbackBg]} />
        )}

        <View style={styles.topBorder} />

        <View style={styles.row}>
          {TABS.map((tab) => (
            <TabButton
              key={tab.name}
              tab={tab}
              isActive={currentRouteName === tab.name}
              onPress={() => handlePress(tab)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    zIndex: 100,
  },

  shadowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 12,
  },

  container: {
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.95)',
  },

  fallbackBg: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },

  topBorder: {
    height: 1,
    backgroundColor: 'rgba(226,232,240,0.9)',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 6,
    paddingBottom: 4,
  },

  tab: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    width: 42,
    height: 34,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  iconContainerActive: {
    backgroundColor: 'rgba(37,99,235,0.10)',
  },

  iconWrap: {
    width: 24,
    height: 24,
    position: 'relative',
  },

  iconCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontSize: 11,
    fontWeight: '600',
    color: INACTIVE_COLOR,
    letterSpacing: -0.1,
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },

  labelActive: {
    color: ACTIVE_COLOR,
    fontWeight: '800',
  },
});