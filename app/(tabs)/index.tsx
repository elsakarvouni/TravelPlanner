import { useCallback } from 'react';
import { Alert, Button, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTrips } from '@/hooks/use-trips';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Trip } from '@/types/trip';
import { getTripCountdownLabel } from '@/utils/trip-countdown';

export default function HomeScreen() {
  const router = useRouter();
  const { trips, loading, refresh, deleteTrip } = useTrips();
  const borderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const openTripMenu = (trip: Trip) => {
    Alert.alert(trip.title, undefined, [
      {
        text: 'Επεξεργασία ταξιδιού',
        onPress: () => router.push({ pathname: '/edit-trip/[id]', params: { id: String(trip.id) } }),
      },
      {
        text: 'Διαγραφή ταξιδιού',
        style: 'destructive',
        onPress: () => deleteTrip(trip.id),
      },
      { text: 'Άκυρο', style: 'cancel' },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Τα ταξίδια μου</ThemedText>
        <Button title="+ Νέο ταξίδι" onPress={() => router.push('/add-trip')} />
      </View>

      {!loading && trips.length === 0 && (
        <ThemedText style={styles.empty}>Δεν υπάρχουν ταξίδια ακόμα. Πρόσθεσε το πρώτο σου!</ThemedText>
      )}

      <FlatList
        data={trips}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor }]}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
              <Pressable onPress={() => openTripMenu(item)} hitSlop={10}>
                <ThemedText style={styles.menuDots}>•••</ThemedText>
              </Pressable>
            </View>
            <ThemedText>{item.destination}</ThemedText>
            <ThemedText>
              {item.start_date} → {item.end_date}
            </ThemedText>
            <ThemedText style={[styles.countdown, { color: tintColor }]}>
              {getTripCountdownLabel(item.start_date, item.end_date)}
            </ThemedText>
          </View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  empty: {
    marginTop: 32,
    textAlign: 'center',
  },
  card: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  menuDots: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 6,
  },
  countdown: {
    marginTop: 4,
    fontWeight: '600',
  },
});
