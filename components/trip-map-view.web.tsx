import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ItineraryEntry } from '@/types/itinerary';
import type { Pin } from '@/components/leaflet-map-inner';

const ENTRY_ICON: Record<ItineraryEntry['type'], string> = {
  flight: '✈️',
  accommodation: '🛏️',
  activity: '📍',
};

type Props = {
  entries: ItineraryEntry[];
  destination: string;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
};

type LeafletMapInnerProps = { pins: Pin[]; onTileError: () => void };

// web έκδοση του χάρτη - react-leaflet απευθείας πάνω σε πραγματικό DOM (χωρίς WebView, δεν υπάρχει στο browser).
// Το πραγματικό leaflet component φορτώνεται με dynamic import() μέσα σε useEffect, όχι σε static import εδώ:
// το expo router κάνει static/server rendering της σελίδας ταξιδιού σε Node κατά το `expo export`, και το leaflet
// σκάει με "window is not defined" αν εκτελεστεί εκεί. Το useEffect τρέχει μόνο στον browser, άρα είναι ασφαλές.
export function TripMapView({ entries, destination, destinationLatitude, destinationLongitude }: Props) {
  const [loadFailed, setLoadFailed] = useState(false);
  const [LeafletMapInner, setLeafletMapInner] = useState<ComponentType<LeafletMapInnerProps> | null>(null);
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    let cancelled = false;
    import('@/components/leaflet-map-inner')
      .then((mod) => {
        if (!cancelled) setLeafletMapInner(() => mod.LeafletMapInner);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pinnedEntries = useMemo(
    () => entries.filter((entry) => entry.latitude != null && entry.longitude != null),
    [entries]
  );

  const pins: Pin[] = useMemo(
    () =>
      pinnedEntries.map((entry) => ({
        lat: entry.latitude as number,
        lon: entry.longitude as number,
        title: entry.title,
        time: entry.time,
        emoji: ENTRY_ICON[entry.type],
      })),
    [pinnedEntries]
  );

  const openInGoogleMaps = () => {
    const query =
      destinationLatitude != null && destinationLongitude != null
        ? `${destinationLatitude},${destinationLongitude}`
        : encodeURIComponent(destination);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View style={styles.container}>
      {pinnedEntries.length === 0 ? (
        <View style={[styles.empty, { backgroundColor }]}>
          <ThemedText style={{ color: borderColor }}>
            Πρόσθεσε μια διεύθυνση σε μια καταχώρηση για να εμφανιστεί εδώ.
          </ThemedText>
        </View>
      ) : loadFailed ? (
        <View style={[styles.empty, { backgroundColor }]}>
          <ThemedText style={{ color: borderColor, textAlign: 'center' }}>
            Ο χάρτης δεν φόρτωσε. Έλεγξε τη σύνδεση στο internet και δοκίμασε ξανά.
          </ThemedText>
        </View>
      ) : LeafletMapInner ? (
        <LeafletMapInner pins={pins} onTileError={() => setLoadFailed(true)} />
      ) : (
        <View style={[styles.loading, { backgroundColor }]}>
          <ActivityIndicator color={tintColor} />
        </View>
      )}

      <Pressable style={styles.openMapsButton} onPress={openInGoogleMaps} hitSlop={8}>
        <ThemedText style={styles.openMapsIcon}>🗺️</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openMapsButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openMapsIcon: {
    fontSize: 24,
  },
});
