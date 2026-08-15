import { Pressable, StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

const FAVORITE_COLOR = '#FF3B30';

type Props = {
  isFavorite: boolean;
  onToggle: () => void;
};

// η καρδούλα πάνω δεξιά στις κάρτες - γεμάτη κόκκινη αν είναι favorite, άδεια λευκή αν όχι
export function FavoriteHeartButton({ isFavorite, onToggle }: Props) {
  return (
    <Pressable style={styles.button} onPress={onToggle} hitSlop={10}>
      <IconSymbol
        name={isFavorite ? 'heart.fill' : 'heart'}
        size={20}
        color={isFavorite ? FAVORITE_COLOR : '#fff'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
