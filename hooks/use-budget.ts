import { useCallback, useEffect, useState } from 'react';

import * as storage from '@/database/storage';
import type { BudgetItem, NewBudgetItem } from '@/types/budget';

// hook για το budget ενός ταξιδιού - φέρνει τα έξοδα, προσθέτει/αλλάζει/σβήνει, και υπολογίζει το σύνολο
export function useBudget(tripId: number) {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ξαναφορτώνει τα budget items από τη βάση, τα πιο καινούρια πρώτα
  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await storage.getBudgetItems(tripId);
    setItems(rows);
    setLoading(false);
  }, [tripId]);

  // φόρτωση με το που ανοίγει το hook
  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (item: NewBudgetItem) => {
      await storage.addBudgetItem(tripId, item);
      await refresh();
    },
    [tripId, refresh]
  );

  // ενημέρωση υπάρχοντος εξόδου
  const updateItem = useCallback(
    async (id: number, item: NewBudgetItem) => {
      await storage.updateBudgetItem(id, item);
      await refresh();
    },
    [refresh]
  );

  const deleteItem = useCallback(
    async (id: number) => {
      await storage.deleteBudgetItem(id);
      await refresh();
    },
    [refresh]
  );

  // απλά αθροίζουμε όλα τα ποσά για να βγει το σύνολο του budget
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return { items, loading, total, refresh, addItem, updateItem, deleteItem };
}
