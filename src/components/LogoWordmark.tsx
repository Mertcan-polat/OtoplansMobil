// src/components/LogoWordmark.tsx
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

type Props = { style?: TextStyle };

export default function LogoWordmark({ style }: Props) {
  return <Text style={[styles.text, style]}>Otoplans</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#0f172a',
  },
});
