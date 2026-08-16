import * as storage from '@/database/storage';
import type { BudgetItem } from '@/types/budget';
import type { ChecklistItem } from '@/types/checklist';
import type { CountryStatusRow } from '@/types/country-status';
import type { ItineraryEntry } from '@/types/itinerary';
import type { Trip } from '@/types/trip';

const BACKUP_VERSION = 1;

// όλα τα τοπικά δεδομένα της εφαρμογής μαζί σε ένα αρχείο - trips, itinerary, budget, checklist,
// favorites, και been/wish χώρες. Χρησιμοποιείται για export/import backup (βλ. app/settings.tsx),
// ώστε ο χρήστης να μην τα χάσει αν το Safari σβήσει το τοπικό PWA storage μετά από ανενεργία.
export type BackupData = {
  version: number;
  exportedAt: string;
  trips: Trip[];
  itineraryEntries: ItineraryEntry[];
  budgetItems: BudgetItem[];
  checklistItems: ChecklistItem[];
  favoriteIds: string[];
  countryStatusRows: CountryStatusRow[];
};

export async function buildBackup(): Promise<BackupData> {
  const [trips, itineraryEntries, budgetItems, checklistItems, favoriteIds, countryStatusRows] =
    await Promise.all([
      storage.getTrips(),
      storage.getAllItineraryEntries(),
      storage.getAllBudgetItems(),
      storage.getAllChecklistItems(),
      storage.getFavoriteIds(),
      storage.getCountryStatusRows(),
    ]);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    trips,
    itineraryEntries,
    budgetItems,
    checklistItems,
    favoriteIds,
    countryStatusRows,
  };
}

// πλήρης αντικατάσταση: αδειάζει πρώτα όλα τα τοπικά δεδομένα και μετά ξαναγράφει ό,τι είναι στο backup,
// με τη σειρά trips -> itinerary/budget/checklist (χρειάζονται valid trip_id) -> favorites/country_status
export async function restoreBackup(data: BackupData): Promise<void> {
  await storage.clearAllData();

  for (const trip of data.trips) {
    await storage.restoreTrip(trip);
  }
  for (const entry of data.itineraryEntries) {
    await storage.restoreItineraryEntry(entry);
  }
  for (const item of data.budgetItems) {
    await storage.restoreBudgetItem(item);
  }
  for (const item of data.checklistItems) {
    await storage.restoreChecklistItem(item);
  }
  for (const destinationId of data.favoriteIds) {
    await storage.addFavorite(destinationId);
  }
  for (const row of data.countryStatusRows) {
    await storage.addCountryStatus(row.country_code, row.status);
  }
}

// βασικός runtime έλεγχος σχήματος - το αρχείο έρχεται από τον χρήστη (file picker), όχι από
// κάτι που ελέγχουμε εμείς, οπότε δεν εμπιστευόμαστε το περιεχόμενό του χωρίς έλεγχο
export function parseBackupFile(raw: string): BackupData {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error('Το αρχείο δεν είναι έγκυρο JSON.');
  }

  if (typeof json !== 'object' || json === null) {
    throw new Error('Μη έγκυρο αρχείο backup.');
  }

  const data = json as Record<string, unknown>;
  const arrayFields: (keyof BackupData)[] = [
    'trips',
    'itineraryEntries',
    'budgetItems',
    'checklistItems',
    'favoriteIds',
    'countryStatusRows',
  ];
  for (const field of arrayFields) {
    if (!Array.isArray(data[field])) {
      throw new Error('Το αρχείο δεν μοιάζει με backup της TravelPlanner (λείπει το πεδίο ' + field + ').');
    }
  }

  return data as unknown as BackupData;
}
