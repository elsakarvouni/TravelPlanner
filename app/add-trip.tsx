import { useLocalSearchParams, useRouter } from 'expo-router';

import { TripForm } from '@/components/trip-form';
import { useTrips } from '@/hooks/use-trips';

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
        await addTrip(values);
        router.back();
      }}
    />
  );
}
