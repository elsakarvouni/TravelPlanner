import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { DATABASE_NAME, migrateDbIfNeeded } from '@/database/migrations';
import type { BudgetItem, NewBudgetItem } from '@/types/budget';
import type { ChecklistItem } from '@/types/checklist';
import type { CountryStatusKind, CountryStatusRow } from '@/types/country-status';
import type { ItineraryEntry, NewItineraryEntry } from '@/types/itinerary';
import type { NewTrip, Trip } from '@/types/trip';

// native backend του ενιαίου data layer (@/database/storage) - εδώ ζει όλο το SQLite.
// Ανοίγει τη σύνδεση μία φορά (lazy singleton) και τρέχει τα migrations πριν την πρώτη χρήση,
// χωρίς να χρειάζεται React context/provider - έτσι μπορεί να καλείται από οπουδήποτε (hooks, utils).
let dbPromise: Promise<SQLiteDatabase> | null = null;
function getDb() {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await migrateDbIfNeeded(db);
      return db;
    });
  }
  return dbPromise;
}

// ---------- trips ----------

export async function getTrips(): Promise<Trip[]> {
  const db = await getDb();
  return db.getAllAsync<Trip>('SELECT * FROM trips ORDER BY start_date ASC');
}

export async function getTripById(id: number): Promise<Trip | null> {
  const db = await getDb();
  return db.getFirstAsync<Trip>('SELECT * FROM trips WHERE id = ?', id);
}

export async function getUpcomingTrips(): Promise<Trip[]> {
  const db = await getDb();
  return db.getAllAsync<Trip>(
    "SELECT * FROM trips WHERE date(start_date) >= date('now') ORDER BY start_date ASC"
  );
}

export async function addTrip(trip: NewTrip): Promise<Trip> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO trips
     (title, destination, destination_country_code, destination_latitude, destination_longitude, start_date, end_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    trip.title,
    trip.destination,
    trip.destination_country_code,
    trip.destination_latitude,
    trip.destination_longitude,
    trip.start_date,
    trip.end_date
  );
  return {
    id: result.lastInsertRowId,
    ...trip,
    cover_image: null,
    auto_added_been: 0,
  };
}

export async function updateTrip(id: number, trip: NewTrip): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE trips
     SET title = ?, destination = ?, destination_country_code = ?, destination_latitude = ?,
         destination_longitude = ?, start_date = ?, end_date = ?, auto_added_been = 0
     WHERE id = ?`,
    trip.title,
    trip.destination,
    trip.destination_country_code,
    trip.destination_latitude,
    trip.destination_longitude,
    trip.start_date,
    trip.end_date,
    id
  );
}

export async function deleteTrip(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM trips WHERE id = ?', id);
}

export async function markTripAutoAddedBeen(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE trips SET auto_added_been = 1 WHERE id = ?', id);
}

// γράφει ολόκληρο trip row ΜΕ το δικό του id - χρησιμοποιείται μόνο για restore από backup.
// Το schema δεν έχει AUTOINCREMENT (απλό INTEGER PRIMARY KEY), οπότε το SQLite μόνο του συνεχίζει
// τα επόμενα plain INSERT από το max(id)+1 - δεν χρειάζεται να πειράξουμε κανένα counter.
export async function restoreTrip(trip: Trip): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO trips
     (id, title, destination, destination_country_code, destination_latitude, destination_longitude,
      start_date, end_date, cover_image, auto_added_been)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    trip.id,
    trip.title,
    trip.destination,
    trip.destination_country_code,
    trip.destination_latitude,
    trip.destination_longitude,
    trip.start_date,
    trip.end_date,
    trip.cover_image,
    trip.auto_added_been
  );
}

// αδειάζει όλα τα tables - χρησιμοποιείται πριν από ένα full restore από backup
export async function clearAllData(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM trips;
    DELETE FROM itinerary_entries;
    DELETE FROM budget_items;
    DELETE FROM checklist_items;
    DELETE FROM destination_favorites;
    DELETE FROM country_status;
  `);
}

// ---------- itinerary ----------

export async function getItineraryEntries(tripId: number): Promise<ItineraryEntry[]> {
  const db = await getDb();
  return db.getAllAsync<ItineraryEntry>(
    'SELECT * FROM itinerary_entries WHERE trip_id = ? ORDER BY day ASC, time ASC',
    tripId
  );
}

export async function addItineraryEntry(tripId: number, entry: NewItineraryEntry): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO itinerary_entries
     (trip_id, day, time, type, title, subtitle, notes, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    tripId,
    entry.day,
    entry.time,
    entry.type,
    entry.title,
    entry.subtitle,
    entry.notes,
    entry.latitude,
    entry.longitude
  );
  return result.lastInsertRowId;
}

export async function updateItineraryEntry(id: number, entry: NewItineraryEntry): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE itinerary_entries
     SET day = ?, time = ?, type = ?, title = ?, subtitle = ?, notes = ?, latitude = ?, longitude = ?
     WHERE id = ?`,
    entry.day,
    entry.time,
    entry.type,
    entry.title,
    entry.subtitle,
    entry.notes,
    entry.latitude,
    entry.longitude,
    id
  );
}

export async function deleteItineraryEntry(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM itinerary_entries WHERE id = ?', id);
}

// χωρίς φίλτρο trip_id - χρησιμοποιείται μόνο για export backup
export async function getAllItineraryEntries(): Promise<ItineraryEntry[]> {
  const db = await getDb();
  return db.getAllAsync<ItineraryEntry>('SELECT * FROM itinerary_entries');
}

// γράφει ολόκληρη εγγραφή ΜΕ το δικό της id - χρησιμοποιείται μόνο για restore από backup
export async function restoreItineraryEntry(entry: ItineraryEntry): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO itinerary_entries
     (id, trip_id, day, time, type, title, subtitle, notes, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    entry.id,
    entry.trip_id,
    entry.day,
    entry.time,
    entry.type,
    entry.title,
    entry.subtitle,
    entry.notes,
    entry.latitude,
    entry.longitude
  );
}

// ---------- budget ----------

export async function getBudgetItems(tripId: number): Promise<BudgetItem[]> {
  const db = await getDb();
  return db.getAllAsync<BudgetItem>('SELECT * FROM budget_items WHERE trip_id = ? ORDER BY id DESC', tripId);
}

export async function addBudgetItem(tripId: number, item: NewBudgetItem): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO budget_items (trip_id, category, amount, note) VALUES (?, ?, ?, ?)',
    tripId,
    item.category,
    item.amount,
    item.note
  );
  return result.lastInsertRowId;
}

export async function updateBudgetItem(id: number, item: NewBudgetItem): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE budget_items SET category = ?, amount = ?, note = ? WHERE id = ?',
    item.category,
    item.amount,
    item.note,
    id
  );
}

export async function deleteBudgetItem(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM budget_items WHERE id = ?', id);
}

// χωρίς φίλτρο trip_id - χρησιμοποιείται μόνο για export backup
export async function getAllBudgetItems(): Promise<BudgetItem[]> {
  const db = await getDb();
  return db.getAllAsync<BudgetItem>('SELECT * FROM budget_items');
}

// γράφει ολόκληρη εγγραφή ΜΕ το δικό της id - χρησιμοποιείται μόνο για restore από backup
export async function restoreBudgetItem(item: BudgetItem): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO budget_items (id, trip_id, category, amount, note) VALUES (?, ?, ?, ?, ?)',
    item.id,
    item.trip_id,
    item.category,
    item.amount,
    item.note
  );
}

// ---------- checklist ----------

export async function getChecklistItems(tripId: number): Promise<ChecklistItem[]> {
  const db = await getDb();
  return db.getAllAsync<ChecklistItem>(
    'SELECT * FROM checklist_items WHERE trip_id = ? ORDER BY id ASC',
    tripId
  );
}

export async function addChecklistItem(tripId: number, label: string): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO checklist_items (trip_id, label, is_checked) VALUES (?, ?, 0)',
    tripId,
    label
  );
  return result.lastInsertRowId;
}

export async function toggleChecklistItem(id: number, isChecked: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE checklist_items SET is_checked = ? WHERE id = ?', isChecked ? 1 : 0, id);
}

export async function updateChecklistItemLabel(id: number, label: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE checklist_items SET label = ? WHERE id = ?', label, id);
}

export async function deleteChecklistItem(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM checklist_items WHERE id = ?', id);
}

// χωρίς φίλτρο trip_id - χρησιμοποιείται μόνο για export backup
export async function getAllChecklistItems(): Promise<ChecklistItem[]> {
  const db = await getDb();
  return db.getAllAsync<ChecklistItem>('SELECT * FROM checklist_items');
}

// γράφει ολόκληρη εγγραφή ΜΕ το δικό της id - χρησιμοποιείται μόνο για restore από backup
export async function restoreChecklistItem(item: ChecklistItem): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO checklist_items (id, trip_id, label, is_checked) VALUES (?, ?, ?, ?)',
    item.id,
    item.trip_id,
    item.label,
    item.is_checked
  );
}

// ---------- favorites ----------

export async function getFavoriteIds(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ destination_id: string }>(
    'SELECT destination_id FROM destination_favorites'
  );
  return rows.map((row) => row.destination_id);
}

export async function addFavorite(destinationId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT OR IGNORE INTO destination_favorites (destination_id) VALUES (?)', destinationId);
}

export async function removeFavorite(destinationId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM destination_favorites WHERE destination_id = ?', destinationId);
}

// ---------- country status ----------

export async function getCountryStatusRows(): Promise<CountryStatusRow[]> {
  const db = await getDb();
  return db.getAllAsync<CountryStatusRow>('SELECT * FROM country_status');
}

export async function addCountryStatus(countryCode: string, status: CountryStatusKind): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR IGNORE INTO country_status (country_code, status) VALUES (?, ?)',
    countryCode,
    status
  );
}

export async function removeCountryStatus(countryCode: string, status: CountryStatusKind): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM country_status WHERE country_code = ? AND status = ?',
    countryCode,
    status
  );
}
