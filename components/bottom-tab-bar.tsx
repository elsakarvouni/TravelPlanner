import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const searchRoute = state.routes.find((route) => route.name === 'search');
  const homeRoute = state.routes.find((route) => route.name === 'index');
  const discoverRoute = state.routes.find((route) => route.name === 'discover');
  const activeRouteName = state.routes[state.index]?.name;

  const goTo = (routeName?: string) => {
    if (!routeName) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (activeRouteName !== routeName) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, borderTopColor: colors.icon, paddingBottom: insets.bottom },
      ]}>
      <Pressable style={styles.slot} onPress={() => goTo(searchRoute?.name)}>
        <IconSymbol
          name="magnifyingglass"
          size={26}
          color={activeRouteName === 'search' ? colors.tint : colors.tabIconDefault}
        />
      </Pressable>

      <Pressable style={styles.slot} onPress={() => goTo(homeRoute?.name)}>
        <IconSymbol
          name="house.fill"
          size={28}
          color={activeRouteName === 'index' ? colors.tint : colors.tabIconDefault}
        />
      </Pressable>

      <Pressable style={styles.slot} onPress={() => goTo(discoverRoute?.name)}>
        <IconSymbol
          name="globe"
          size={28}
          color={activeRouteName === 'discover' ? colors.tint : colors.tabIconDefault}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});
