import { format } from 'date-fns';

import { parseBackupFile, type BackupData } from '@/utils/data-backup';

function backupFileName() {
  return `travelplanner-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
}

// web - φτιάχνει ένα Blob με το backup και το κατεβάζει σαν αρχείο μέσω ενός προσωρινού <a download>
// (δεν υπάρχει native share sheet στο browser, αυτό είναι το καθιερωμένο download pattern)
export async function exportBackupFile(data: BackupData): Promise<void> {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = backupFileName();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// web - ανοίγει έναν προσωρινό <input type="file"> για να διαλέξει ο χρήστης .json, το διαβάζει και
// το κάνει parse. Επιστρέφει null αν ο χρήστης ακυρώσει τον picker χωρίς να διαλέξει αρχείο.
export async function pickBackupFile(): Promise<BackupData | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';

    const cleanup = () => {
      input.removeEventListener('change', onChange);
      input.removeEventListener('cancel', onCancel);
      document.body.removeChild(input);
    };

    const onChange = async () => {
      const file = input.files?.[0];
      cleanup();
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const content = await file.text();
        resolve(parseBackupFile(content));
      } catch (error) {
        reject(error);
      }
    };

    const onCancel = () => {
      cleanup();
      resolve(null);
    };

    input.addEventListener('change', onChange);
    input.addEventListener('cancel', onCancel);
    document.body.appendChild(input);
    input.click();
  });
}
