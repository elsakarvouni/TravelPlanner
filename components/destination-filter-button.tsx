import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  activeCount: number;
  onPress: () => void;
};

export function DestinationFilterButton({ activeCount, onPress }: Props) {
  const borderColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <Pressable style={[styles.filterButton, { borderColor }]} onPress={onPress} hitSlop={8}>
      <IconSymbol name="line.3.horizontal.decrease" size={20} color={textColor} />
      {activeCount > 0 && (
        <View style={[styles.filterBadge, { backgroundColor: tintColor }]}>
          <ThemedText style={styles.filterBadgeText}>{activeCount}</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
