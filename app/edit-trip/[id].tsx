import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TripForm } from '@/components/trip-form';
import { useTrips } from '@/hooks/use-trips';
import type { Trip } from '@/types/trip';

export default function EditTripScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTripById, updateTrip } = useTrips();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const row = await getTripById(Number(id));
      setTrip(row);
      setLoading(false);
    })();
  }, [id, getTripById]);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!trip) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Το ταξίδι δεν βρέθηκε.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <TripForm
      initialValues={trip}
      submitLabel="Αποθήκευση αλλαγών"
      savingLabel="Αποθήκευση..."
      onSubmit={async (values) => {
        await updateTrip(trip.id, values);
        router.back();
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
