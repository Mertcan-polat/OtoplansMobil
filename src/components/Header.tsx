// src/components/Header.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LogoMark from './LogoMark';
import LogoWordmark from './LogoWordmark';

export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <LogoMark size={28} />
        <LogoWordmark />
      </View>
      <Text style={styles.subtitle}>Aracın için doğru bakım, doğru zamanda.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,                 // eskiden büyükse 4–6 civarına çek
    backgroundColor: '#e5f0ff',
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 11,
    color: '#4b5563',
  },
});
