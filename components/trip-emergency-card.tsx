import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EMERGENCY_NUMBERS, FALLBACK_EMERGENCY } from '@/constants/emergency-numbers';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  countryCode: string | null;
};

const ROWS: { key: 'general' | 'police' | 'ambulance' | 'fire'; label: string; icon: string }[] = [
  { key: 'general', label: 'Γενική έκτακτη ανάγκη', icon: '🚨' },
  { key: 'police', label: 'Αστυνομία', icon: '👮' },
  { key: 'ambulance', label: 'Ασθενοφόρο', icon: '🚑' },
  { key: 'fire', label: 'Πυροσβεστική', icon: '🚒' },
];

// κάρτα με τα νούμερα έκτακτης ανάγκης της χώρας προορισμού - αν δεν ξέρουμε τη χώρα ή δεν έχουμε στοιχεία, δείχνει το 112 σαν fallback
export function TripEmergencyCard({ countryCode }: Props) {
  const borderColor = useThemeColor({}, 'icon');
  const iconColor = useThemeColor({}, 'icon');

  const numbers = countryCode ? EMERGENCY_NUMBERS[countryCode] : undefined;
  const isFallback = !numbers; // δεν βρήκαμε τη χώρα στη λίστα μας, πάμε με το γενικό 112
  const values = numbers ?? FALLBACK_EMERGENCY;

  const rows = ROWS.filter((row) => values[row.key]); // δείχνουμε μόνο τις γραμμές που όντως έχουν νούμερο

  return (
    <View>
      <ThemedText style={styles.sectionTitle}>Έκτακτη ανάγκη</ThemedText>

      <View style={[styles.card, { borderColor }]}>
        {rows.map((row) => (
          <View key={row.key} style={styles.row}>
            <ThemedText style={styles.rowIcon}>{row.icon}</ThemedText>
            <ThemedText style={styles.rowLabel}>{row.label}</ThemedText>
            <ThemedText style={styles.rowValue}>{values[row.key]}</ThemedText>
          </View>
        ))}

        {isFallback && (
          <ThemedText style={[styles.note, { color: iconColor }]}>
            {countryCode
              ? 'Δεν έχουμε επιβεβαιωμένο νούμερο για αυτή τη χώρα. Το 112 λειτουργεί σε πολλά δίκτυα κινητής παγκοσμίως, αλλά καλό είναι να το επιβεβαιώσεις τοπικά.'
              : 'Δεν ξέρουμε τη χώρα προορισμού. Επεξεργάσου το ταξίδι και επίλεξε τον προορισμό από τη λίστα αυτόματης συμπλήρωσης.'}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowIcon: {
    fontSize: 20,
  },
  rowLabel: {
    flex: 1,
  },
  rowValue: {
    fontWeight: '700',
    fontSize: 16,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    padding: 12,
  },
});
