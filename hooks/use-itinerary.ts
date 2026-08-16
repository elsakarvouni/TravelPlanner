import { useCallback, useEffect, useState } from 'react';

import * as storage from '@/database/storage';
import type { ItineraryEntry, NewItineraryEntry } from '@/types/itinerary';

// hook για το πρόγραμμα (itinerary) του ταξιδιού - πτήσεις, διαμονή, δραστηριότητες ανά μέρα
export function useItinerary(tripId: number) {
  const [entries, setEntries] = useState<ItineraryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // ταξινομημένα πρώτα ανά μέρα και μετά ανά ώρα, έτσι βγαίνουν σωστά στη σειρά στη λίστα
  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await storage.getItineraryEntries(tripId);
    setEntries(rows);
    setLoading(false);
  }, [tripId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = useCallback(
    async (entry: NewItineraryEntry) => {
      await storage.addItineraryEntry(tripId, entry);
      await refresh();
    },
    [tripId, refresh]
  );

  // ενημέρωση υπάρχουσας εγγραφής (π.χ. άλλαξε ώρα ή σημειώσεις)
  const updateEntry = useCallback(
    async (id: number, entry: NewItineraryEntry) => {
      await storage.updateItineraryEntry(id, entry);
      await refresh();
    },
    [refresh]
  );

  const deleteEntry = useCallback(
    async (id: number) => {
      await storage.deleteItineraryEntry(id);
      await refresh();
    },
    [refresh]
  );

  return { entries, loading, refresh, addEntry, updateEntry, deleteEntry };
}
