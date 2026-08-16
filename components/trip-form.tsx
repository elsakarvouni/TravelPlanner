import { useState } from 'react';
import { Button, StyleSheet, TextInput } from 'react-native';

import { showAlert } from '@/components/app-alert';
import { DateRangeField } from '@/components/date-range-field';
import { PlaceAutocompleteInput } from '@/components/place-autocomplete-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { NewTrip } from '@/types/trip';

type Props = {
  initialValues?: NewTrip;
  submitLabel: string;
  savingLabel: string;
  onSubmit: (values: NewTrip) => Promise<void>;
};

// φόρμα για δημιουργία/επεξεργασία ταξιδιού - χρησιμοποιείται και στα δύο flows, γι' αυτό παίρνει initialValues προαιρετικά
export function TripForm({ initialValues, submitLabel, savingLabel, onSubmit }: Props) {
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'icon');

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [destination, setDestination] = useState(initialValues?.destination ?? '');
  const [destinationCountryCode, setDestinationCountryCode] = useState<string | null>(
    initialValues?.destination_country_code ?? null
  );
  const [destinationLatitude, setDestinationLatitude] = useState<number | null>(
    initialValues?.destination_latitude ?? null
  );
  const [destinationLongitude, setDestinationLongitude] = useState<number | null>(
    initialValues?.destination_longitude ?? null
  );
  const [startDate, setStartDate] = useState(initialValues?.start_date ?? '');
  const [endDate, setEndDate] = useState(initialValues?.end_date ?? '');
  const [saving, setSaving] = useState(false);

  // validation βασικό (μη κενά πεδία) και μετά καλεί το onSubmit που δίνεται απ' έξω (create ή update ανάλογα την οθόνη)
  const handleSave = async () => {
    if (!title.trim() || !destination.trim() || !startDate.trim() || !endDate.trim()) {
      showAlert('Λείπουν στοιχεία', 'Συμπλήρωσε όλα τα πεδία.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        destination: destination.trim(),
        destination_country_code: destinationCountryCode,
        destination_latitude: destinationLatitude,
        destination_longitude: destinationLongitude,
        start_date: startDate.trim(),
        end_date: endDate.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [styles.input, { color: textColor, borderColor }];

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>Τίτλος ταξιδιού</ThemedText>
      <TextInput
        style={inputStyle}
        value={title}
        onChangeText={setTitle}
        placeholder="π.χ. Καλοκαίρι στην Ιταλία"
        placeholderTextColor={placeholderColor}
      />

      <ThemedText style={styles.label}>Προορισμός</ThemedText>
      <PlaceAutocompleteInput
        value={destination}
        onChangeText={(text) => {
          // αν ο χρήστης αλλάζει το κείμενο με το χέρι, χάνουμε τα coords/country - ξαναγίνεται valid μόνο αν διαλέξει από τη λίστα
          setDestination(text);
          setDestinationCountryCode(null);
          setDestinationLatitude(null);
          setDestinationLongitude(null);
        }}
        onSelectPlace={(place) => {
          // εδώ παίρνουμε τα καλά στοιχεία (χώρα + coords) όταν ο χρήστης επιλέγει πραγματικό τόπο από το autocomplete
          setDestinationCountryCode(place.countryCode);
          setDestinationLatitude(place.lat);
          setDestinationLongitude(place.lon);
        }}
        placeholder="π.χ. Λισαβόνα"
      />

      <ThemedText style={styles.label}>Ημερομηνίες ταξιδιού</ThemedText>
      <DateRangeField
        startDate={startDate}
        endDate={endDate}
        onChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />

      <Button title={saving ? savingLabel : submitLabel} onPress={handleSave} disabled={saving} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
});
