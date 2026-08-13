import { Tabs } from 'expo-router';

import { BottomTabBar } from '@/components/bottom-tab-bar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Αρχική' }} />
      <Tabs.Screen name="search" options={{ title: 'Αναζήτηση' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
    </Tabs>
  );
}
