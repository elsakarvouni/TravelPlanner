import { useEffect, useState } from 'react';
import {
  Button,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { PlaceAutocompleteInput } from '@/components/place-autocomplete-input';
import { ThemedText } from '@/components/themed-text';
import { STATUS_COLORS } from '@/constants/travel-status';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ItineraryEntry, ItineraryEntryType, NewItineraryEntry } from '@/types/itinerary';
import type { TripDay } from '@/utils/trip-days';

const ACCENT = STATUS_COLORS.wish;

// ο time picker θέλει Date object, εμείς κρατάμε την ώρα σαν string "HH:mm" - άρα το μετατρέπουμε εδώ
function timeStringToDate(time: string): Date {
  const date = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
}

const ENTRY_TYPES: { type: ItineraryEntryType; label: string; icon: string }[] = [
  { type: 'flight', label: 'Πτήση', icon: '✈️' },
  { type: 'accommodation', label: 'Διαμονή', icon: '🛏️' },
  { type: 'activity', label: 'Δραστηριότητα', icon: '📍' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  days: TripDay[];
  defaultDay: number;
  editingEntry?: ItineraryEntry | null;
  onSubmit: (entry: NewItineraryEntry) => Promise<void>;
};

// sheet 2 βημάτων: πρώτα διαλέγεις τύπο (πτήση/διαμονή/δραστηριότητα), μετά συμπληρώνεις τα στοιχεία
export function AddItineraryEntrySheet({ visible, onClose, days, defaultDay, editingEntry, onSubmit }: Props) {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [type, setType] = useState<ItineraryEntryType>('activity');
  const [day, setDay] = useState(defaultDay);
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');

  // όταν ανοίγει το sheet, αν επεξεργαζόμαστε υπάρχουσα εγγραφή πάμε κατευθείαν στο βήμα των λεπτομερειών,
  // αλλιώς ξεκινάμε από την επιλογή τύπου με καθαρά πεδία
  useEffect(() => {
    if (!visible) return;

    setShowTimePicker(false);

    if (editingEntry) {
      setStep('details');
      setType(editingEntry.type);
      setDay(editingEntry.day);
      setTime(editingEntry.time);
      setTitle(editingEntry.title);
      setSubtitle(editingEntry.subtitle ?? '');
      setNotes(editingEntry.notes ?? '');
      setAddress(editingEntry.subtitle ?? '');
      setLatitude(editingEntry.latitude);
      setLongitude(editingEntry.longitude);
    } else {
      setStep('type');
      setType('activity');
      setDay(defaultDay);
      setTime('');
      setTitle('');
      setSubtitle('');
      setNotes('');
      setAddress('');
      setLatitude(null);
      setLongitude(null);
    }
  }, [visible, editingEntry, defaultDay]);

  // πατάς πάνω σε "πτήση/διαμονή/δραστηριότητα" και πάει στο βήμα με τις λεπτομέρειες
  const handlePickType = (picked: ItineraryEntryType) => {
    setType(picked);
    setStep('details');
  };

  // κοινό handler για το time picker και στα δύο platforms - αν το έκλεισες χωρίς να διαλέξεις, δεν κάνουμε τίποτα
  const handleTimeChange = (event: { type: string }, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event.type === 'dismissed' || !selectedDate) return;
    setTime(format(selectedDate, 'HH:mm'));
  };

  // στο android το picker είναι native dialog, στο ios το δείχνουμε inline (spinner) γι' αυτό το branching
  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: timeStringToDate(time),
        mode: 'time',
        is24Hour: true,
        onChange: handleTimeChange,
      });
    } else {
      setShowTimePicker(true);
    }
  };

  // αποθηκεύει την εγγραφή - για πτήσεις το subtitle είναι λεπτομέρειες, για τα άλλα είναι η διεύθυνση
  const handleSave = async () => {
    if (!title.trim() || !time.trim()) return;

    setSaving(true);
    try {
      await onSubmit({
        day,
        time: time.trim(),
        type,
        title: title.trim(),
        subtitle: type === 'flight' ? subtitle.trim() || null : address.trim() || null,
        notes: notes.trim() || null,
        latitude,
        longitude,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const entryTypeMeta = ENTRY_TYPES.find((entry) => entry.type === type);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { backgroundColor }]}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            {step === 'type' ? (
              <>
                <ThemedText style={styles.heading}>Τι θέλεις να προσθέσεις;</ThemedText>
                {ENTRY_TYPES.map((entry) => (
                  <Pressable
                    key={entry.type}
                    style={[styles.typeRow, { borderColor }]}
                    onPress={() => handlePickType(entry.type)}>
                    <ThemedText style={styles.typeIcon}>{entry.icon}</ThemedText>
                    <ThemedText style={styles.typeLabel}>{entry.label}</ThemedText>
                  </Pressable>
                ))}
                <Button title="Άκυρο" onPress={onClose} />
              </>
            ) : (
              <>
                <ThemedText style={styles.heading}>
                  {entryTypeMeta?.icon} {entryTypeMeta?.label}
                </ThemedText>

                <ThemedText style={styles.label}>Μέρα</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayRow}>
                  {days.map((d) => (
                    <Pressable
                      key={d.day}
                      onPress={() => setDay(d.day)}
                      style={[
                        styles.dayChip,
                        { borderColor },
                        day === d.day && { backgroundColor: ACCENT, borderColor: ACCENT },
                      ]}>
                      <ThemedText style={day === d.day ? styles.dayChipTextActive : undefined}>
                        Μέρα {d.day}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>

                <ThemedText style={styles.label}>Ώρα</ThemedText>
                <Pressable style={[styles.input, { borderColor }]} onPress={openTimePicker}>
                  <ThemedText style={!time ? { color: placeholderColor } : undefined}>
                    {time || 'Επίλεξε ώρα'}
                  </ThemedText>
                </Pressable>
                {Platform.OS === 'ios' && showTimePicker && (
                  <View>
                    <DateTimePicker
                      value={timeStringToDate(time)}
                      mode="time"
                      display="spinner"
                      is24Hour
                      onChange={handleTimeChange}
                    />
                    <Pressable onPress={() => setShowTimePicker(false)} style={styles.timeDoneButton}>
                      <ThemedText style={{ color: ACCENT, fontWeight: '700' }}>Έτοιμο</ThemedText>
                    </Pressable>
                  </View>
                )}

                <ThemedText style={styles.label}>Τίτλος</ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor }]}
                  value={title}
                  onChangeText={setTitle}
                  onFocus={() => setShowTimePicker(false)}
                  placeholder={
                    type === 'flight'
                      ? 'π.χ. Πτήση AEGEAN A3 601'
                      : type === 'accommodation'
                        ? 'π.χ. Hotel Roma'
                        : 'π.χ. Κολοσσαίο'
                  }
                  placeholderTextColor={placeholderColor}
                />

                {type === 'flight' ? (
                  <>
                    <ThemedText style={styles.label}>Λεπτομέρειες (π.χ. αεροδρόμια)</ThemedText>
                    <TextInput
                      style={[styles.input, { color: textColor, borderColor }]}
                      value={subtitle}
                      onChangeText={setSubtitle}
                      onFocus={() => setShowTimePicker(false)}
                      placeholder="π.χ. ΑΘΗΝΑ (ATH) → ΡΩΜΗ (FCO)"
                      placeholderTextColor={placeholderColor}
                    />
                  </>
                ) : (
                  <>
                    <ThemedText style={styles.label}>Διεύθυνση (προαιρετικό, για τον χάρτη)</ThemedText>
                    <PlaceAutocompleteInput
                      value={address}
                      onChangeText={setAddress}
                      onSelectPlace={(place) => {
                        setLatitude(place.lat);
                        setLongitude(place.lon);
                      }}
                      onFocus={() => setShowTimePicker(false)}
                      placeholder="π.χ. Piazza del Colosseo, Roma"
                    />
                  </>
                )}

                <ThemedText style={styles.label}>Σημειώσεις</ThemedText>
                <TextInput
                  style={[styles.input, styles.multiline, { color: textColor, borderColor }]}
                  value={notes}
                  onChangeText={setNotes}
                  onFocus={() => setShowTimePicker(false)}
                  placeholder="Προαιρετικές σημειώσεις"
                  placeholderTextColor={placeholderColor}
                  multiline
                />

                <View style={styles.actions}>
                  <Button
                    title="Πίσω"
                    onPress={() => (editingEntry ? onClose() : setStep('type'))}
                  />
                  <Button
                    title={saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
                    onPress={handleSave}
                    disabled={saving || !title.trim() || !time.trim()}
                  />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  timeDoneButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  typeIcon: {
    fontSize: 22,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
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
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  dayRow: {
    flexDirection: 'row',
  },
  dayChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  dayChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
