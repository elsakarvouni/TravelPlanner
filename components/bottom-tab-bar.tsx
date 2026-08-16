import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// custom κάτω μπάρα με τα 3 κουμπιά (search/home/discover) - φτιαγμένη χειροκίνητα αντί για το default tab bar
export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // ψάχνουμε τα routes με βάση το όνομά τους γιατί δεν ξέρουμε σε τι σειρά είναι registered
  const searchRoute = state.routes.find((route) => route.name === 'search');
  const homeRoute = state.routes.find((route) => route.name === 'index');
  const discoverRoute = state.routes.find((route) => route.name === 'discover');
  const activeRouteName = state.routes[state.index]?.name;

  // πάει σε άλλο tab, με λίγο haptic feedback στο ios - δεν κάνει navigate αν είμαστε ήδη εκεί
  const goTo = (routeName?: string) => {
    if (!routeName) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (activeRouteName !== routeName) {
      navigation.navigate(routeName);
    }
  };

  // η μπάρα ήδη έχει δικό της padding (βλ. styles.container/slot) - αν προσθέταμε ολόκληρο το insets.bottom
  // από πάνω, τα εικονίδια έμεναν κολλημένα ψηλά με μεγάλο κενό από κάτω. Αφαιρούμε ένα κομμάτι που ήδη
  // καλύπτει η υπάρχουσα padding, με ελάχιστο 8 ώστε να μένει λογικό κενό και σε συσκευές χωρίς safe area
  const bottomPadding = Math.max(insets.bottom - 10, 8);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, borderTopColor: colors.icon, paddingBottom: bottomPadding },
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
