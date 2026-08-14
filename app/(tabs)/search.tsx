import { useCallback, useMemo } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';

import { DestinationFilterButton } from '@/components/destination-filter-button';
import { DestinationFiltersSheet } from '@/components/destination-filters-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CONTINENT_INFO, CONTINENT_ORDER, DESTINATIONS, type Continent } from '@/constants/destinations';
import { useDestinationFilters } from '@/hooks/use-destination-filters';
import { useFavorites } from '@/hooks/use-favorites';
import { useThemeColor } from '@/hooks/use-theme-color';
import { filtersToParams, matchesFilters } from '@/utils/destination-filters';

export default function SearchScreen() {
  const router = useRouter();
  const { favoriteIds, refresh: refreshFavorites } = useFavorites();
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
  } = useDestinationFilters();

  const borderColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  useFocusEffect(
    useCallback(() => {
      refreshFavorites();
    }, [refreshFavorites])
  );

  const continents = useMemo(() => {
    return CONTINENT_ORDER.map((continent) => {
      const count = DESTINATIONS.filter((d) => d.continent === continent && matchesFilters(d, filters)).length;
      return { continent, count };
    }).filter((entry) => entry.count > 0);
  }, [filters]);

  const handleFlightsPress = () => {
    WebBrowser.openBrowserAsync('https://www.skyscanner.com/');
  };

  const handleAccommodationsPress = () => {
    Alert.alert('Καταλύματα', 'Πού θέλεις να ψάξεις;', [
      { text: 'Booking.com', onPress: () => WebBrowser.openBrowserAsync('https://www.booking.com/') },
      { text: 'Airbnb', onPress: () => WebBrowser.openBrowserAsync('https://www.airbnb.com/') },
      { text: 'Άκυρο', style: 'cancel' },
    ]);
  };

  const handleSelectContinent = (continent: Continent) => {
    router.push({
      pathname: '/continent/[continent]',
      params: { continent, ...filtersToParams(filters) },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <DestinationFilterButton activeCount={activeFilterCount} onPress={openSheet} />
        <ThemedText type="title" style={styles.title}>
          Βρες Ιδέα
        </ThemedText>
        <Pressable style={[styles.favoritesButton, { borderColor }]} onPress={() => router.push('/favorites')} hitSlop={8}>
          <IconSymbol name="heart" size={20} color={textColor} />
          {favoriteIds.size > 0 && (
            <View style={[styles.favoritesBadge, { backgroundColor: tintColor }]}>
              <ThemedText style={styles.favoritesBadgeText}>{favoriteIds.size}</ThemedText>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={[styles.actionButton, { borderColor }]} onPress={handleFlightsPress}>
          <ThemedText style={styles.actionLabel}>✈️ Πτήσεις</ThemedText>
        </Pressable>
        <Pressable style={[styles.actionButton, { borderColor }]} onPress={handleAccommodationsPress}>
          <ThemedText style={styles.actionLabel}>🏨 Καταλύματα</ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={continents}
        keyExtractor={(item) => item.continent}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => {
          const info = CONTINENT_INFO[item.continent];
          return (
            <Pressable style={[styles.card, { borderColor }]} onPress={() => handleSelectContinent(item.continent)}>
              <Image source={{ uri: info.imageUrl }} style={styles.cardImage} contentFit="cover" />
              <View style={styles.cardBody}>
                <ThemedText style={styles.cardName}>
                  {info.emoji} {info.label}
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  {item.count} {item.count === 1 ? 'προορισμός' : 'προορισμοί'}
                </ThemedText>
              </View>
            </Pressable>
          );
        }}
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
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    flex: 1,
  },
  favoritesButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoritesBadge: {
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
  favoritesBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionLabel: {
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
});
