import { format } from 'date-fns';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

import { parseBackupFile, type BackupData } from '@/utils/data-backup';

function backupFileName() {
  return `travelplanner-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
}

// native (iOS/Android) - γράφει το backup σε προσωρινό αρχείο στο cache dir και ανοίγει το native
// share sheet, ώστε ο χρήστης να το αποθηκεύσει όπου θέλει (Files, Drive, email, κλπ)
export async function exportBackupFile(data: BackupData): Promise<void> {
  const file = new File(Paths.cache, backupFileName());
  file.create({ overwrite: true });
  file.write(JSON.stringify(data, null, 2));

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Η κοινή χρήση αρχείων δεν είναι διαθέσιμη σε αυτή τη συσκευή.');
  }
  await Sharing.shareAsync(file.uri);
}

// native - ανοίγει τον native file picker, διαβάζει το επιλεγμένο .json και το κάνει parse.
// Επιστρέφει null αν ο χρήστης ακυρώσει τον picker.
export async function pickBackupFile(): Promise<BackupData | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
  if (result.canceled) return null;

  const picked = result.assets[0];
  const content = await new File(picked.uri).text();
  return parseBackupFile(content);
}
