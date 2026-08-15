import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { BudgetItem, NewBudgetItem } from '@/types/budget';

// hook για το budget ενός ταξιδιού - φέρνει τα έξοδα, προσθέτει/αλλάζει/σβήνει, και υπολογίζει το σύνολο
export function useBudget(tripId: number) {
  const db = useSQLiteContext();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ξαναφορτώνει τα budget items από τη βάση, τα πιο καινούρια πρώτα
  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await db.getAllAsync<BudgetItem>(
      'SELECT * FROM budget_items WHERE trip_id = ? ORDER BY id DESC',
      tripId
    );
    setItems(rows);
    setLoading(false);
  }, [db, tripId]);

  // φόρτωση με το που ανοίγει το hook
  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (item: NewBudgetItem) => {
      await db.runAsync(
        'INSERT INTO budget_items (trip_id, category, amount, note) VALUES (?, ?, ?, ?)',
        tripId,
        item.category,
        item.amount,
        item.note
      );
      await refresh();
    },
    [db, tripId, refresh]
  );

  // ενημέρωση υπάρχοντος εξόδου
  const updateItem = useCallback(
    async (id: number, item: NewBudgetItem) => {
      await db.runAsync(
        'UPDATE budget_items SET category = ?, amount = ?, note = ? WHERE id = ?',
        item.category,
        item.amount,
        item.note,
        id
      );
      await refresh();
    },
    [db, refresh]
  );

  const deleteItem = useCallback(
    async (id: number) => {
      await db.runAsync('DELETE FROM budget_items WHERE id = ?', id);
      await refresh();
    },
    [db, refresh]
  );

  // απλά αθροίζουμε όλα τα ποσά για να βγει το σύνολο του budget
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return { items, loading, total, refresh, addItem, updateItem, deleteItem };
}
