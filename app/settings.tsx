import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { showAlert } from '@/components/app-alert';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { exportBackupFile, pickBackupFile } from '@/utils/backup-file';
import { buildBackup, restoreBackup } from '@/utils/data-backup';

// οθόνη Ρυθμίσεων - προς το παρόν μόνο export/import backup όλων των τοπικών δεδομένων
// (trips, itinerary, budget, checklist, favorites, been/wish χώρες), χρήσιμο κυρίως στο web
// όπου το Safari μπορεί να σβήσει το τοπικό PWA storage μετά από ~7 μέρες αχρησίας
export default function SettingsScreen() {
  const router = useRouter();
  const borderColor = useThemeColor({}, 'icon');
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await buildBackup();
      await exportBackupFile(data);
    } catch (error) {
      showAlert('Η εξαγωγή απέτυχε', error instanceof Error ? error.message : 'Δοκίμασε ξανά.');
    } finally {
      setExporting(false);
    }
  };

  const performImport = async () => {
    setImporting(true);
    try {
      const data = await pickBackupFile();
      if (!data) return; // ο χρήστης ακύρωσε τον picker

      await restoreBackup(data);
      showAlert('Η εισαγωγή ολοκληρώθηκε', 'Τα δεδομένα σου αποκαταστάθηκαν.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (error) {
      showAlert('Η εισαγωγή απέτυχε', error instanceof Error ? error.message : 'Δοκίμασε ξανά.');
    } finally {
      setImporting(false);
    }
  };

  const handleImportPress = () => {
    showAlert(
      'Εισαγωγή δεδομένων',
      'Αυτό θα αντικαταστήσει όλα τα τρέχοντα δεδομένα σου (ταξίδια, πρόγραμμα, έξοδα, λίστες, αγαπημένα) με ό,τι υπάρχει στο αρχείο. Συνέχεια;',
      [
        { text: 'Άκυρο', style: 'cancel' },
        { text: 'Αντικατάσταση', style: 'destructive', onPress: performImport },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.section}>
        <ThemedText type="subtitle">Αντίγραφο ασφαλείας</ThemedText>
        <ThemedText style={styles.sectionDescription}>
          Όλα τα δεδομένα σου αποθηκεύονται μόνο σε αυτή τη συσκευή/browser. Κράτα ένα αντίγραφο τακτικά,
          ειδικά αν χρησιμοποιείς την εφαρμογή από το Safari, όπου τα τοπικά δεδομένα μπορεί να διαγραφούν
          μετά από παρατεταμένη αχρησία.
        </ThemedText>

        <Pressable
          style={[styles.button, { borderColor }]}
          onPress={handleExport}
          disabled={exporting || importing}>
          {exporting ? (
            <ActivityIndicator />
          ) : (
            <ThemedText style={styles.buttonLabel}>Εξαγωγή δεδομένων</ThemedText>
          )}
        </Pressable>

        <Pressable
          style={[styles.button, { borderColor }]}
          onPress={handleImportPress}
          disabled={exporting || importing}>
          {importing ? (
            <ActivityIndicator />
          ) : (
            <ThemedText style={styles.buttonLabel}>Εισαγωγή δεδομένων</ThemedText>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    gap: 12,
  },
  sectionDescription: {
    opacity: 0.6,
    lineHeight: 20,
  },
  button: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonLabel: {
    fontWeight: '600',
  },
});
