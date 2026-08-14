import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { UN_COUNTRIES } from '@/assets/data/countries';
import { FavoriteHeartButton } from '@/components/favorite-heart-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DESTINATIONS, type Destination } from '@/constants/destinations';
import { useFavorites } from '@/hooks/use-favorites';
import { useThemeColor } from '@/hooks/use-theme-color';

const COUNTRY_CODE_BY_NAME = new Map(UN_COUNTRIES.map((country) => [country.name.toLowerCase(), country.code]));
const DESTINATION_BY_ID = new Map(DESTINATIONS.map((destination) => [destination.id, destination]));

export default function FavoritesScreen() {
  const router = useRouter();
  const borderColor = useThemeColor({}, 'icon');
  const { favoriteIds, refresh, toggleFavorite } = useFavorites();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const favorites = useMemo(
    () =>
      Array.from(favoriteIds)
        .map((id) => DESTINATION_BY_ID.get(id))
        .filter((destination): destination is Destination => Boolean(destination))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [favoriteIds]
  );

  const handleSelectDestination = (destination: Destination) => {
    const countryCode = COUNTRY_CODE_BY_NAME.get(destination.country.toLowerCase()) ?? '';
    router.push({
      pathname: '/add-trip',
      params: {
        destination: `${destination.name}, ${destination.country}`,
        countryCode,
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      {favorites.length === 0 ? (
        <ThemedText style={styles.emptyText}>
          Δεν έχεις προσθέσει ακόμα αγαπημένους προορισμούς. Πάτα την καρδιά σε έναν προορισμό για να τον
          προσθέσεις εδώ.
        </ThemedText>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item }) => (
            <Pressable style={[styles.card, { borderColor }]} onPress={() => handleSelectDestination(item)}>
              <View>
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
                <FavoriteHeartButton isFavorite onToggle={() => toggleFavorite(item.id)} />
              </View>
              <View style={styles.cardBody}>
                <ThemedText style={styles.cardName}>{item.name}</ThemedText>
                <ThemedText style={styles.cardCountry}>{item.country}</ThemedText>
              </View>
            </Pressable>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    opacity: 0.6,
  },
  gridRow: {
    gap: 12,
  },
  gridContent: {
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 110,
  },
  cardBody: {
    padding: 10,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardCountry: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
});
