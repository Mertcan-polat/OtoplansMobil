import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import KronikSorunScreen from '../screens/KronikSorunScreen';
import EvGuideScreen from '../screens/EvGuideScreen';
import AccountScreen from '../screens/AccountScreen';

const Tab = createBottomTabNavigator();

export default function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
        },
        tabBarIcon: ({
          color,
          size,
          focused,
        }: {
          color: string;
          size: number;
          focused: boolean;
        }) => {
          let iconName: string = 'home-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'KronikSorun') {
            iconName = focused ? 'warning' : 'warning-outline';
          } else if (route.name === 'EvGuide') {
            iconName = focused ? 'flash' : 'flash-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Ana Sayfa' }}
      />

      <Tab.Screen
        name="KronikSorun"
        component={KronikSorunScreen}
        options={{ tabBarLabel: 'Kronik' }}
      />

      <Tab.Screen
        name="EvGuide"
        component={EvGuideScreen}
        options={{ tabBarLabel: 'Elektrikli' }}
      />

      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarLabel: 'Hesabım' }}
      />
    </Tab.Navigator>
  );
}