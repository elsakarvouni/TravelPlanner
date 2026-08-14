import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { UN_COUNTRIES } from '@/assets/data/countries';
import { DestinationFilterButton } from '@/components/destination-filter-button';
import { DestinationFiltersSheet } from '@/components/destination-filters-sheet';
import { FavoriteHeartButton } from '@/components/favorite-heart-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DESTINATIONS, type Destination } from '@/constants/destinations';
import { useDestinationFilters } from '@/hooks/use-destination-filters';
import { useFavorites } from '@/hooks/use-favorites';
import { useThemeColor } from '@/hooks/use-theme-color';
import { matchesFilters } from '@/utils/destination-filters';

const COUNTRY_CODE_BY_NAME = new Map(UN_COUNTRIES.map((country) => [country.name.toLowerCase(), country.code]));

export default function CountryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    country: string;
    tags?: string;
    seasons?: string;
    durations?: string;
  }>();

  const borderColor = useThemeColor({}, 'icon');
  const { favoriteIds, toggleFavorite } = useFavorites();

  const {
    filters,
    activeFilterCount,
    selectedTags,
    selectedSeasons,
    selectedDurations,
    sheetVisible,
    openSheet,
    closeSheet,
    toggleTag,
    toggleSeason,
    toggleDuration,
    clear,
  } = useDestinationFilters(params);

  const cities = useMemo(
    () => DESTINATIONS.filter((d) => d.country === params.country && matchesFilters(d, filters)),
    [params.country, filters]
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
      <Stack.Screen
        options={{
          title: params.country,
          headerRight: () => <DestinationFilterButton activeCount={activeFilterCount} onPress={openSheet} />,
        }}
      />

      <FlatList
        data={cities}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <Pressable style={[styles.card, { borderColor }]} onPress={() => handleSelectDestination(item)}>
            <View>
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
              <FavoriteHeartButton
                isFavorite={favoriteIds.has(item.id)}
                onToggle={() => toggleFavorite(item.id)}
              />
            </View>
            <View style={styles.cardBody}>
              <ThemedText style={styles.cardName}>{item.name}</ThemedText>
              <ThemedText style={styles.cardDescription} numberOfLines={2}>
                {item.shortDescription}
              </ThemedText>
            </View>
          </Pressable>
        )}
      />

      <DestinationFiltersSheet
        visible={sheetVisible}
        onClose={closeSheet}
        selectedTags={selectedTags}
        selectedSeasons={selectedSeasons}
        selectedDurations={selectedDurations}
        onToggleTag={toggleTag}
        onToggleSeason={toggleSeason}
        onToggleDuration={toggleDuration}
        onClear={clear}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
  cardDescription: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
});
