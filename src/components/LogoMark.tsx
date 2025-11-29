// src/components/LogoMark.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  size?: number;
  style?: ViewStyle;
};

export default function LogoMark({ size = 32, style }: Props) {
  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderRadius: size / 4,
        },
        style,
      ]}
    >
      <View style={styles.innerCircle} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#2563eb',
  },
});
