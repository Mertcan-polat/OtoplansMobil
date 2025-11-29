// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PlaceholderScreen from './PlaceholderScreen';
import EvGuideScreen from '../screens/EvGuideScreen';

export type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  KronikSorun: undefined;
  CompareDecision: undefined;
  Brands: undefined;
  Models: undefined;
  Common: undefined;
  Reviews: undefined;
  ApiDocs: undefined;
  FAQ: undefined;
  Privacy: undefined;
  Terms: undefined;
  Cookies: undefined;
  About: undefined;
  Contact: undefined;
  Changelog: undefined;
  EvGuide: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      {/* Web’deki diğer sayfalar için şimdilik placeholder ekranlar */}
      <Stack.Screen
        name="Search"
        component={PlaceholderScreen}
        options={{ title: 'Bakım Arama' }}
      />
      <Stack.Screen
        name="KronikSorun"
        component={PlaceholderScreen}
        options={{ title: 'Kronik Sorunlar' }}
      />
      <Stack.Screen
        name="CompareDecision"
        component={PlaceholderScreen}
        options={{ title: 'Karşılaştırma' }}
      />
      <Stack.Screen
  name="EvGuide"
  component={EvGuideScreen}
  options={{ title: 'Elektrikli Rehberi' }}
/>
      <Stack.Screen
        name="Brands"
        component={PlaceholderScreen}
        options={{ title: 'Markalar' }}
      />
      <Stack.Screen
        name="Models"
        component={PlaceholderScreen}
        options={{ title: 'Modeller' }}
      />
      <Stack.Screen
        name="Common"
        component={PlaceholderScreen}
        options={{ title: 'Bakım Rehberi' }}
      />
      <Stack.Screen
        name="Reviews"
        component={PlaceholderScreen}
        options={{ title: 'Yorumlar' }}
      />
      <Stack.Screen
        name="ApiDocs"
        component={PlaceholderScreen}
        options={{ title: 'API Dokümanı' }}
      />
      <Stack.Screen
        name="FAQ"
        component={PlaceholderScreen}
        options={{ title: 'SSS' }}
      />
      <Stack.Screen
        name="Privacy"
        component={PlaceholderScreen}
        options={{ title: 'Gizlilik' }}
      />
      <Stack.Screen
        name="Terms"
        component={PlaceholderScreen}
        options={{ title: 'Kullanım Şartları' }}
      />
      <Stack.Screen
        name="Cookies"
        component={PlaceholderScreen}
        options={{ title: 'Çerez Politikası' }}
      />
      <Stack.Screen
        name="About"
        component={PlaceholderScreen}
        options={{ title: 'Hikayemiz' }}
      />
      <Stack.Screen
        name="Contact"
        component={PlaceholderScreen}
        options={{ title: 'İletişim' }}
      />
      <Stack.Screen
        name="Changelog"
        component={PlaceholderScreen}
        options={{ title: 'Sürüm Notları' }}
      />
    </Stack.Navigator>
  );
}
