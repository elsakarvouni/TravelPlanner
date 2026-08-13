import { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput } from 'react-native';

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

export function TripForm({ initialValues, submitLabel, savingLabel, onSubmit }: Props) {
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'icon');

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [destination, setDestination] = useState(initialValues?.destination ?? '');
  const [destinationCountryCode, setDestinationCountryCode] = useState<string | null>(
    initialValues?.destination_country_code ?? null
  );
  const [startDate, setStartDate] = useState(initialValues?.start_date ?? '');
  const [endDate, setEndDate] = useState(initialValues?.end_date ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !destination.trim() || !startDate.trim() || !endDate.trim()) {
      Alert.alert('Λείπουν στοιχεία', 'Συμπλήρωσε όλα τα πεδία.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        destination: destination.trim(),
        destination_country_code: destinationCountryCode,
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
          setDestination(text);
          setDestinationCountryCode(null);
        }}
        onSelectPlace={(place) => setDestinationCountryCode(place.countryCode)}
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
