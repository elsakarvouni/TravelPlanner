import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TripForm } from '@/components/trip-form';
import { useTrips } from '@/hooks/use-trips';
import type { Trip } from '@/types/trip';

// modal για επεξεργασία ταξιδιού που υπάρχει ήδη - φέρνει το ταξίδι από τη βάση με το id,
// δείχνει loading/error ανάλογα, και χρησιμοποιεί το TripForm ήδη γεμάτο με τα στοιχεία του
export default function EditTripScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTripById, updateTrip } = useTrips();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // φέρνει το ταξίδι με βάση το id - έρχεται ως string από το URL οπότε το κάνω Number
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
        // ενημερώνει το ταξίδι στη βάση και γυρνάει πίσω
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
