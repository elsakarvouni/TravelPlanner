import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { ChecklistItem } from '@/types/checklist';

// hook για το checklist του ταξιδιού (βαλίτσα κτλ) - add, toggle, rename, delete
export function useChecklist(tripId: number) {
  const db = useSQLiteContext();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // παίρνει τα items με τη σειρά που μπήκαν (id ASC)
  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await db.getAllAsync<ChecklistItem>(
      'SELECT * FROM checklist_items WHERE trip_id = ? ORDER BY id ASC',
      tripId
    );
    setItems(rows);
    setLoading(false);
  }, [db, tripId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // νέο item, ξεκινάει πάντα ως μη τσεκαρισμένο (0)
  const addItem = useCallback(
    async (label: string) => {
      await db.runAsync('INSERT INTO checklist_items (trip_id, label, is_checked) VALUES (?, ?, 0)', tripId, label);
      await refresh();
    },
    [db, tripId, refresh]
  );

  // κάνει τσεκ/ξετσεκ ένα item - το boolean το μετατρέπουμε σε 0/1 γιατί το sqlite δεν έχει boolean
  const toggleItem = useCallback(
    async (id: number, isChecked: boolean) => {
      await db.runAsync('UPDATE checklist_items SET is_checked = ? WHERE id = ?', isChecked ? 1 : 0, id);
      await refresh();
    },
    [db, refresh]
  );

  // αλλάζει το κείμενο ενός item χωρίς να πειράξει αν είναι τσεκαρισμένο
  const updateItemLabel = useCallback(
    async (id: number, label: string) => {
      await db.runAsync('UPDATE checklist_items SET label = ? WHERE id = ?', label, id);
      await refresh();
    },
    [db, refresh]
  );

  const deleteItem = useCallback(
    async (id: number) => {
      await db.runAsync('DELETE FROM checklist_items WHERE id = ?', id);
      await refresh();
    },
    [db, refresh]
  );

  return { items, loading, refresh, addItem, toggleItem, updateItemLabel, deleteItem };
}
