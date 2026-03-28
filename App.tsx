// App.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  NavigationContainer,
  NavigationState,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import EvGuideScreen from './src/screens/EvGuideScreen';
import SearchScreen from './src/screens/SearchScreen';
import KronikSorunScreen from './src/screens/KronikSorunScreen';
import CompareDecisionScreen from './src/screens/CompareDecisionScreen';

import GarageScreen from './src/screens/GarageScreen';
import AccountScreen from './src/screens/AccountScreen';
import LoginScreen from './src/screens/LoginScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import GuidesScreen from './src/screens/GuidesScreen';
import RiskAnalysisScreen from './src/screens/RiskAnalysisScreen';

import BottomNav from './src/components/BottomNav';

export type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  KronikSorun: undefined;
  CompareDecision: undefined;
  EvGuide: undefined;

  Garage: undefined;
  Account: undefined;
  Login: undefined;
  Reminders: undefined;
  Guides: undefined;
  RiskAnalysis: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [currentRouteName, setCurrentRouteName] =
    useState<keyof RootStackParamList | undefined>('Home');

  const defaultScreenOptions: NativeStackNavigationOptions = {
    headerTintColor: '#0F172A',
    headerTitleAlign: 'center',
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: '#F8FAFC',
    },
    headerTitleStyle: {
      fontSize: 17,
      fontWeight: '700',
    },
    contentStyle: {
      backgroundColor: '#F8FAFC',
    },
    animation: Platform.OS === 'ios' ? 'default' : 'fade',
  };

  const handleStateChange = (state?: NavigationState) => {
    try {
      if (!state) return;
      const route = state.routes[state.index ?? 0];
      if (route && typeof route.name === 'string') {
        // @ts-ignore
        setCurrentRouteName(route.name);
      }
    } catch (e) {
      console.warn('[Nav] route state parse error', e);
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer onStateChange={handleStateChange}>
        <View style={styles.root}>
          <View style={styles.stackWrapper}>
            <Stack.Navigator screenOptions={defaultScreenOptions}>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{
                  title: 'Bakım Arama',
                  headerBackVisible: false,
                }}
              />

              <Stack.Screen
                name="KronikSorun"
                component={KronikSorunScreen}
                options={{ title: 'Kronik Sorunlar' }}
              />

              <Stack.Screen
                name="CompareDecision"
                component={CompareDecisionScreen}
                options={{ title: 'Karşılaştırma' }}
              />

              <Stack.Screen
                name="EvGuide"
                component={EvGuideScreen}
                options={{ title: 'Elektrikli Rehberi' }}
              />

              <Stack.Screen
                name="Garage"
                component={GarageScreen}
                options={{ title: 'Garajım' }}
              />

              <Stack.Screen
                name="Account"
                component={AccountScreen}
                options={{ title: 'Hesabım' }}
              />

              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ title: 'Giriş Yap' }}
              />

              <Stack.Screen
                name="Reminders"
                component={RemindersScreen}
                options={{ title: 'Hatırlatıcılar' }}
              />

              <Stack.Screen
                name="Guides"
                component={GuidesScreen}
                options={{ title: 'Bakım Rehberleri' }}
              />

              <Stack.Screen
                name="RiskAnalysis"
                component={RiskAnalysisScreen}
                options={{ title: 'Risk Analizi' }}
              />
            </Stack.Navigator>
          </View>

          <BottomNav currentRouteName={currentRouteName} />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  stackWrapper: {
    flex: 1,
    paddingBottom: 62,
  },
});