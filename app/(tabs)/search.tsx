import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';

import { UN_COUNTRIES } from '@/assets/data/countries';
import { DestinationFiltersSheet } from '@/components/destination-filters-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  DESTINATIONS,
  DURATION_OPTIONS,
  type Destination,
  type DestinationTag,
  type DurationBucket,
  type Season,
} from '@/constants/destinations';
import { useThemeColor } from '@/hooks/use-theme-color';

const COUNTRY_CODE_BY_NAME = new Map(UN_COUNTRIES.map((country) => [country.name.toLowerCase(), country.code]));

export default function SearchScreen() {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<Set<DestinationTag>>(new Set());
  const [selectedSeasons, setSelectedSeasons] = useState<Set<Season>>(new Set());
  const [selectedDurations, setSelectedDurations] = useState<Set<DurationBucket>>(new Set());
  const [filtersVisible, setFiltersVisible] = useState(false);

  const borderColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const activeFilterCount = selectedTags.size + selectedSeasons.size + selectedDurations.size;

  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter((destination) => {
      const matchesTags = selectedTags.size === 0 || destination.tags.some((tag) => selectedTags.has(tag));
      const matchesSeasons =
        selectedSeasons.size === 0 || destination.seasons.some((season) => selectedSeasons.has(season));
      const matchesDuration =
        selectedDurations.size === 0 ||
        DURATION_OPTIONS.some(
          (option) =>
            selectedDurations.has(option.duration) &&
            destination.suggestedDays.min <= option.range.max &&
            destination.suggestedDays.max >= option.range.min
        );
      return matchesTags && matchesSeasons && matchesDuration;
    });
  }, [selectedTags, selectedSeasons, selectedDurations]);

  const toggleInSet = <T,>(set: Set<T>, value: T, setState: (next: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    setState(next);
  };

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

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={[styles.filterButton, { borderColor }]} onPress={() => setFiltersVisible(true)} hitSlop={8}>
          <IconSymbol name="line.3.horizontal.decrease" size={20} color={textColor} />
          {activeFilterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: tintColor }]}>
              <ThemedText style={styles.filterBadgeText}>{activeFilterCount}</ThemedText>
            </View>
          )}
        </Pressable>

        <ThemedText type="title" style={styles.title}>
          Βρες Ιδέα
        </ThemedText>
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
        data={filteredDestinations}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { borderColor }]}
            onPress={() => handleSelectDestination(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
            <View style={styles.cardBody}>
              <ThemedText style={styles.cardName}>{item.name}</ThemedText>
              <ThemedText style={styles.cardCountry}>{item.country}</ThemedText>
              <ThemedText style={styles.cardDescription} numberOfLines={2}>
                {item.shortDescription}
              </ThemedText>
            </View>
          </Pressable>
        )}
      />

      <DestinationFiltersSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        selectedTags={selectedTags}
        selectedSeasons={selectedSeasons}
        selectedDurations={selectedDurations}
        onToggleTag={(tag) => toggleInSet(selectedTags, tag, setSelectedTags)}
        onToggleSeason={(season) => toggleInSet(selectedSeasons, season, setSelectedSeasons)}
        onToggleDuration={(duration) => toggleInSet(selectedDurations, duration, setSelectedDurations)}
        onClear={() => {
          setSelectedTags(new Set());
          setSelectedSeasons(new Set());
          setSelectedDurations(new Set());
        }}
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
  title: {
    flex: 1,
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
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    opacity: 0.8,
  },
});
