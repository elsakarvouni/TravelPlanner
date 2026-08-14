import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { DestinationFilterButton } from '@/components/destination-filter-button';
import { DestinationFiltersSheet } from '@/components/destination-filters-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CONTINENT_INFO, DESTINATIONS, type Continent } from '@/constants/destinations';
import { useDestinationFilters } from '@/hooks/use-destination-filters';
import { useThemeColor } from '@/hooks/use-theme-color';
import { filtersToParams, matchesFilters } from '@/utils/destination-filters';

export default function ContinentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    continent: Continent;
    tags?: string;
    seasons?: string;
    durations?: string;
  }>();

  const borderColor = useThemeColor({}, 'icon');
  const info = CONTINENT_INFO[params.continent];

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

  const countries = useMemo(() => {
    const matches = DESTINATIONS.filter((d) => d.continent === params.continent && matchesFilters(d, filters));
    const byCountry = new Map<string, { country: string; imageUrl: string; count: number }>();
    for (const destination of matches) {
      const existing = byCountry.get(destination.country);
      if (existing) {
        existing.count += 1;
      } else {
        byCountry.set(destination.country, {
          country: destination.country,
          imageUrl: destination.imageUrl,
          count: 1,
        });
      }
    }
    return Array.from(byCountry.values()).sort((a, b) => a.country.localeCompare(b.country));
  }, [params.continent, filters]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: info ? `${info.emoji} ${info.label}` : 'Ήπειρος',
          headerRight: () => <DestinationFilterButton activeCount={activeFilterCount} onPress={openSheet} />,
        }}
      />

      <FlatList
        data={countries}
        keyExtractor={(item) => item.country}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { borderColor }]}
            onPress={() =>
              router.push({
                pathname: '/country/[country]',
                params: { country: item.country, ...filtersToParams(filters) },
              })
            }>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
            <View style={styles.cardBody}>
              <ThemedText style={styles.cardName}>{item.country}</ThemedText>
              <ThemedText style={styles.cardSubtitle}>
                {item.count} {item.count === 1 ? 'προορισμός' : 'προορισμοί'}
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
    height: 130,
  },
  cardBody: {
    padding: 10,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
});
