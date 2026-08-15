import { Tabs } from 'expo-router';

import { BottomTabBar } from '@/components/bottom-tab-bar';

// εδώ φτιάχνω το κάτω tab bar με τις 3 καρτέλες (Αρχική, Αναζήτηση, Discover)
// χρησιμοποιώ το δικό μου custom BottomTabBar αντί του default του Expo Router
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
