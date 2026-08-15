import { useLocalSearchParams, useRouter } from 'expo-router';

import { TripForm } from '@/components/trip-form';
import { useTrips } from '@/hooks/use-trips';

// modal για να φτιάξω νέο ταξίδι, χρησιμοποιεί το κοινό TripForm
// αν έρθει προορισμός από άλλη οθόνη (μέσω params) τον προσυμπληρώνει στη φόρμα
export default function AddTripScreen() {
  const router = useRouter();
  const { addTrip } = useTrips();
  const { destination, countryCode } = useLocalSearchParams<{
    destination?: string;
    countryCode?: string;
  }>();

  return (
    <TripForm
      initialValues={
        destination
          ? {
              title: '',
              destination,
              destination_country_code: countryCode || null,
              destination_latitude: null,
              destination_longitude: null,
              start_date: '',
              end_date: '',
            }
          : undefined
      }
      submitLabel="Αποθήκευση ταξιδιού"
      savingLabel="Αποθήκευση..."
      onSubmit={async (values) => {
        // αποθηκεύει το ταξίδι στη βάση και γυρνάει πίσω
        await addTrip(values);
        router.back();
      }}
    />
  );
}
