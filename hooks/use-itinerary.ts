import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { ItineraryEntry, NewItineraryEntry } from '@/types/itinerary';

// hook για το πρόγραμμα (itinerary) του ταξιδιού - πτήσεις, διαμονή, δραστηριότητες ανά μέρα
export function useItinerary(tripId: number) {
  const db = useSQLiteContext();
  const [entries, setEntries] = useState<ItineraryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // ταξινομημένα πρώτα ανά μέρα και μετά ανά ώρα, έτσι βγαίνουν σωστά στη σειρά στη λίστα
  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await db.getAllAsync<ItineraryEntry>(
      'SELECT * FROM itinerary_entries WHERE trip_id = ? ORDER BY day ASC, time ASC',
      tripId
    );
    setEntries(rows);
    setLoading(false);
  }, [db, tripId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = useCallback(
    async (entry: NewItineraryEntry) => {
      await db.runAsync(
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
      await refresh();
    },
    [db, tripId, refresh]
  );

  // ενημέρωση υπάρχουσας εγγραφής (π.χ. άλλαξε ώρα ή σημειώσεις)
  const updateEntry = useCallback(
    async (id: number, entry: NewItineraryEntry) => {
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
      await refresh();
    },
    [db, refresh]
  );

  const deleteEntry = useCallback(
    async (id: number) => {
      await db.runAsync('DELETE FROM itinerary_entries WHERE id = ?', id);
      await refresh();
    },
    [db, refresh]
  );

  return { entries, loading, refresh, addEntry, updateEntry, deleteEntry };
}
