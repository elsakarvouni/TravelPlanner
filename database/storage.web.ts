import { format } from 'date-fns';
import localforage from 'localforage';

import type { BudgetItem, NewBudgetItem } from '@/types/budget';
import type { ChecklistItem } from '@/types/checklist';
import type { CountryStatusKind, CountryStatusRow } from '@/types/country-status';
import type { ItineraryEntry, NewItineraryEntry } from '@/types/itinerary';
import type { NewTrip, Trip } from '@/types/trip';

// web backend του ενιαίου data layer (@/database/storage) - IndexedDB μέσω localforage, ένα instance
// ανά "table" μέσα στην ίδια database ('travelplanner'), ώστε να μοιάζει με τα SQLite tables.
// Κάθε row αποθηκεύεται σαν plain object με key το String(id). Δεν υπάρχει πραγματικό migrations
// σύστημα εδώ (τα JS objects δεν έχουν άκαμπτες στήλες όπως το SQL) - βλ. database/migrations.ts
// για το αντίστοιχο native migrations system.
function table<T>(storeName: string) {
  return localforage.createInstance({ name: 'travelplanner', storeName });
}

const trips = table<Trip>('trips');
const itineraryEntries = table<ItineraryEntry>('itinerary_entries');
const budgetItems = table<BudgetItem>('budget_items');
const checklistItems = table<ChecklistItem>('checklist_items');
const destinationFavorites = table<true>('destination_favorites');
const countryStatus = table<CountryStatusRow>('country_status');
const meta = table<number>('meta');

// εξομοιώνει το SQLite INTEGER PRIMARY KEY autoincrement - δεν υπάρχει τέτοιο concept στο IndexedDB
async function nextId(counterName: string): Promise<number> {
  const current = (await meta.getItem<number>(`nextId:${counterName}`)) ?? 0;
  const next = current + 1;
  await meta.setItem(`nextId:${counterName}`, next);
  return next;
}

// όταν κάνουμε restore ένα row με συγκεκριμένο id (από backup), σιγουρευόμαστε ότι ο μετρητής
// προσπερνάει αυτό το id, ώστε τα επόμενα plain addX() να μη συγκρουστούν με restored ids
async function bumpNextId(counterName: string, usedId: number): Promise<void> {
  const current = (await meta.getItem<number>(`nextId:${counterName}`)) ?? 0;
  if (usedId > current) {
    await meta.setItem(`nextId:${counterName}`, usedId);
  }
}

async function allValues<T>(store: LocalForage): Promise<T[]> {
  const values: T[] = [];
  await store.iterate<T, void>((value) => {
    values.push(value);
  });
  return values;
}

// ---------- trips ----------

export async function getTrips(): Promise<Trip[]> {
  const rows = await allValues<Trip>(trips);
  return rows.sort((a, b) => a.start_date.localeCompare(b.start_date));
}

export async function getTripById(id: number): Promise<Trip | null> {
  return (await trips.getItem<Trip>(String(id))) ?? null;
}

export async function getUpcomingTrips(): Promise<Trip[]> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const rows = await getTrips();
  return rows.filter((trip) => trip.start_date >= today);
}

export async function addTrip(trip: NewTrip): Promise<Trip> {
  const id = await nextId('trips');
  const row: Trip = { id, ...trip, cover_image: null, auto_added_been: 0 };
  await trips.setItem(String(id), row);
  return row;
}

export async function updateTrip(id: number, trip: NewTrip): Promise<void> {
  const existing = await trips.getItem<Trip>(String(id));
  if (!existing) return;
  await trips.setItem(String(id), { ...existing, ...trip, auto_added_been: 0 });
}

export async function deleteTrip(id: number): Promise<void> {
  await trips.removeItem(String(id));
}

export async function markTripAutoAddedBeen(id: number): Promise<void> {
  const existing = await trips.getItem<Trip>(String(id));
  if (!existing) return;
  await trips.setItem(String(id), { ...existing, auto_added_been: 1 });
}

// γράφει ολόκληρο trip row ΜΕ το δικό του id - χρησιμοποιείται μόνο για restore από backup
export async function restoreTrip(trip: Trip): Promise<void> {
  await trips.setItem(String(trip.id), trip);
  await bumpNextId('trips', trip.id);
}

// αδειάζει όλα τα stores - χρησιμοποιείται πριν από ένα full restore από backup
export async function clearAllData(): Promise<void> {
  await Promise.all([
    trips.clear(),
    itineraryEntries.clear(),
    budgetItems.clear(),
    checklistItems.clear(),
    destinationFavorites.clear(),
    countryStatus.clear(),
    meta.clear(),
  ]);
}

// ---------- itinerary ----------

export async function getItineraryEntries(tripId: number): Promise<ItineraryEntry[]> {
  const rows = await allValues<ItineraryEntry>(itineraryEntries);
  return rows
    .filter((entry) => entry.trip_id === tripId)
    .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
}

export async function addItineraryEntry(tripId: number, entry: NewItineraryEntry): Promise<number> {
  const id = await nextId('itinerary_entries');
  const row: ItineraryEntry = { id, trip_id: tripId, ...entry };
  await itineraryEntries.setItem(String(id), row);
  return id;
}

export async function updateItineraryEntry(id: number, entry: NewItineraryEntry): Promise<void> {
  const existing = await itineraryEntries.getItem<ItineraryEntry>(String(id));
  if (!existing) return;
  await itineraryEntries.setItem(String(id), { ...existing, ...entry });
}

export async function deleteItineraryEntry(id: number): Promise<void> {
  await itineraryEntries.removeItem(String(id));
}

// χωρίς φίλτρο trip_id - χρησιμοποιείται μόνο για export backup
export async function getAllItineraryEntries(): Promise<ItineraryEntry[]> {
  return allValues<ItineraryEntry>(itineraryEntries);
}

// γράφει ολόκληρη εγγραφή ΜΕ το δικό της id - χρησιμοποιείται μόνο για restore από backup
export async function restoreItineraryEntry(entry: ItineraryEntry): Promise<void> {
  await itineraryEntries.setItem(String(entry.id), entry);
  await bumpNextId('itinerary_entries', entry.id);
}

// ---------- budget ----------

export async function getBudgetItems(tripId: number): Promise<BudgetItem[]> {
  const rows = await allValues<BudgetItem>(budgetItems);
  return rows.filter((item) => item.trip_id === tripId).sort((a, b) => b.id - a.id);
}

export async function addBudgetItem(tripId: number, item: NewBudgetItem): Promise<number> {
  const id = await nextId('budget_items');
  const row: BudgetItem = { id, trip_id: tripId, ...item };
  await budgetItems.setItem(String(id), row);
  return id;
}

export async function updateBudgetItem(id: number, item: NewBudgetItem): Promise<void> {
  const existing = await budgetItems.getItem<BudgetItem>(String(id));
  if (!existing) return;
  await budgetItems.setItem(String(id), { ...existing, ...item });
}

export async function deleteBudgetItem(id: number): Promise<void> {
  await budgetItems.removeItem(String(id));
}

// χωρίς φίλτρο trip_id - χρησιμοποιείται μόνο για export backup
export async function getAllBudgetItems(): Promise<BudgetItem[]> {
  return allValues<BudgetItem>(budgetItems);
}

// γράφει ολόκληρη εγγραφή ΜΕ το δικό της id - χρησιμοποιείται μόνο για restore από backup
export async function restoreBudgetItem(item: BudgetItem): Promise<void> {
  await budgetItems.setItem(String(item.id), item);
  await bumpNextId('budget_items', item.id);
}

// ---------- checklist ----------

export async function getChecklistItems(tripId: number): Promise<ChecklistItem[]> {
  const rows = await allValues<ChecklistItem>(checklistItems);
  return rows.filter((item) => item.trip_id === tripId).sort((a, b) => a.id - b.id);
}

export async function addChecklistItem(tripId: number, label: string): Promise<number> {
  const id = await nextId('checklist_items');
  const row: ChecklistItem = { id, trip_id: tripId, label, is_checked: 0 };
  await checklistItems.setItem(String(id), row);
  return id;
}

export async function toggleChecklistItem(id: number, isChecked: boolean): Promise<void> {
  const existing = await checklistItems.getItem<ChecklistItem>(String(id));
  if (!existing) return;
  await checklistItems.setItem(String(id), { ...existing, is_checked: isChecked ? 1 : 0 });
}

export async function updateChecklistItemLabel(id: number, label: string): Promise<void> {
  const existing = await checklistItems.getItem<ChecklistItem>(String(id));
  if (!existing) return;
  await checklistItems.setItem(String(id), { ...existing, label });
}

export async function deleteChecklistItem(id: number): Promise<void> {
  await checklistItems.removeItem(String(id));
}

// χωρίς φίλτρο trip_id - χρησιμοποιείται μόνο για export backup
export async function getAllChecklistItems(): Promise<ChecklistItem[]> {
  return allValues<ChecklistItem>(checklistItems);
}

// γράφει ολόκληρη εγγραφή ΜΕ το δικό της id - χρησιμοποιείται μόνο για restore από backup
export async function restoreChecklistItem(item: ChecklistItem): Promise<void> {
  await checklistItems.setItem(String(item.id), item);
  await bumpNextId('checklist_items', item.id);
}

// ---------- favorites ----------

export async function getFavoriteIds(): Promise<string[]> {
  const ids: string[] = [];
  await destinationFavorites.iterate<true, void>((_value, key) => {
    ids.push(key);
  });
  return ids;
}

export async function addFavorite(destinationId: string): Promise<void> {
  await destinationFavorites.setItem(destinationId, true);
}

export async function removeFavorite(destinationId: string): Promise<void> {
  await destinationFavorites.removeItem(destinationId);
}

// ---------- country status ----------

export async function getCountryStatusRows(): Promise<CountryStatusRow[]> {
  return allValues<CountryStatusRow>(countryStatus);
}

function countryStatusKey(countryCode: string, status: CountryStatusKind) {
  return `${countryCode}:${status}`;
}

export async function addCountryStatus(countryCode: string, status: CountryStatusKind): Promise<void> {
  const key = countryStatusKey(countryCode, status);
  const existing = await countryStatus.getItem<CountryStatusRow>(key);
  if (existing) return;
  await countryStatus.setItem(key, { country_code: countryCode, status });
}

export async function removeCountryStatus(countryCode: string, status: CountryStatusKind): Promise<void> {
  await countryStatus.removeItem(countryStatusKey(countryCode, status));
}
