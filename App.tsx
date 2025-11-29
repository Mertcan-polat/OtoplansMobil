import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import EvGuideScreen from './src/screens/EvGuideScreen';
import SearchScreen from './src/screens/SearchScreen';
import KronikSorunScreen from './src/screens/KronikSorunScreen';
import CompareDecisionScreen from './src/screens/CompareDecisionScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{ title: 'Bakım Arama' }}
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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
