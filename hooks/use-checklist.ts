import { useCallback, useEffect, useState } from 'react';

import * as storage from '@/database/storage';
import type { ChecklistItem } from '@/types/checklist';

// hook για το checklist του ταξιδιού (βαλίτσα κτλ) - add, toggle, rename, delete
export function useChecklist(tripId: number) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // παίρνει τα items με τη σειρά που μπήκαν (id ASC)
  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await storage.getChecklistItems(tripId);
    setItems(rows);
    setLoading(false);
  }, [tripId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // νέο item, ξεκινάει πάντα ως μη τσεκαρισμένο (0)
  const addItem = useCallback(
    async (label: string) => {
      await storage.addChecklistItem(tripId, label);
      await refresh();
    },
    [tripId, refresh]
  );

  // κάνει τσεκ/ξετσεκ ένα item - το boolean το μετατρέπουμε σε 0/1 γιατί το sqlite δεν έχει boolean
  const toggleItem = useCallback(
    async (id: number, isChecked: boolean) => {
      await storage.toggleChecklistItem(id, isChecked);
      await refresh();
    },
    [refresh]
  );

  // αλλάζει το κείμενο ενός item χωρίς να πειράξει αν είναι τσεκαρισμένο
  const updateItemLabel = useCallback(
    async (id: number, label: string) => {
      await storage.updateChecklistItemLabel(id, label);
      await refresh();
    },
    [refresh]
  );

  const deleteItem = useCallback(
    async (id: number) => {
      await storage.deleteChecklistItem(id);
      await refresh();
    },
    [refresh]
  );

  return { items, loading, refresh, addItem, toggleItem, updateItemLabel, deleteItem };
}
