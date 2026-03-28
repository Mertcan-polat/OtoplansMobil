// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlaceholderScreen from './PlaceholderScreen';
import LoginScreen from '../screens/LoginScreen';
import GarageScreen from '../screens/GarageScreen';
import MainTabsNavigator from '../components/MainTabsNavigator';


const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="MainTabs" component={MainTabsNavigator} />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: true, title: 'Giriş Yap' }}
      />

      <Stack.Screen
        name="Garage"
        component={GarageScreen}
        options={{ headerShown: true, title: 'Garajım' }}
      />

      <Stack.Screen
        name="Search"
        component={PlaceholderScreen}
        options={{ headerShown: true, title: 'Bakım Arama' }}
      />
      <Stack.Screen
        name="CompareDecision"
        component={PlaceholderScreen}
        options={{ headerShown: true, title: 'Karşılaştırma' }}
      />
      <Stack.Screen
        name="Brands"
        component={PlaceholderScreen}
        options={{ headerShown: true, title: 'Markalar' }}
      />
      <Stack.Screen
        name="Models"
        component={PlaceholderScreen}
        options={{ headerShown: true, title: 'Modeller' }}
      />
      <Stack.Screen
        name="Common"
        component={PlaceholderScreen}
        options={{ headerShown: true, title: 'Bakım Rehberi' }}
      />
      <Stack.Screen
        name="Reviews"
        component={PlaceholderScreen}
        options={{ headerShown: true, title: 'Yorumlar' }}
      />
      <Stack.Screen
        name="ApiDocs"
        component={PlaceholderScreen}
        options={{ headerShown: true, title: 'API Dokümanı' }}
      />
      <Stack.Screen
        name="Privacy"
        component={PlaceholderScreen}
        options={{ headerShown: true, title: 'Gizlilik' }}
      />
      <Stack.Screen
        name="Terms"
        component={PlaceholderScreen}
        options={{ headerShown: true, title: 'Kullanım Şartları' }}
      />
      <Stack.Screen
        name="Cookies"
        component={PlaceholderScreen}
        options={{ headerShown: true, title: 'Çerez Politikası' }}
      />
      <Stack.Screen
        name="About"
        component={PlaceholderScreen}
        options={{ headerShown: true, title: 'Hikayemiz' }}
      />
      <Stack.Screen
        name="Contact"
        component={PlaceholderScreen}
        options={{ headerShown: true, title: 'İletişim' }}
      />
      <Stack.Screen
        name="Changelog"
        component={PlaceholderScreen}
        options={{ headerShown: true, title: 'Sürüm Notları' }}
      />
    </Stack.Navigator>
  );
}