
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  if (Platform.OS === 'web') {
    return (
      <Stack>
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
      </Stack>
    );
  }

  const tabs: TabBarItem[] = [
    {
      route: '/(tabs)/(home)',
      label: 'Dashboard',
      icon: 'house.fill',
    },
  ];

  return (
    <>
      <NativeTabs
        tabBar={() => <FloatingTabBar tabs={tabs} />}
      >
        <NativeTabs.Screen
          name="(home)"
          options={{
            headerShown: false,
          }}
        >
          <Icon ios={{ name: 'house.fill' }} color={colors.text} />
          <Label>Dashboard</Label>
        </NativeTabs.Screen>
      </NativeTabs>
    </>
  );
}
