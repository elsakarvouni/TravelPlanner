export type ExpenseCategoryKey = 'transport' | 'accommodation' | 'food' | 'activities' | 'shopping' | 'other';

export const EXPENSE_CATEGORIES: { key: ExpenseCategoryKey; label: string; icon: string }[] = [
  { key: 'transport', label: 'Μεταφορές', icon: '🚗' },
  { key: 'accommodation', label: 'Διαμονή', icon: '🏨' },
  { key: 'food', label: 'Φαγητό', icon: '🍽️' },
  { key: 'activities', label: 'Δραστηριότητες', icon: '🎟️' },
  { key: 'shopping', label: 'Αγορές', icon: '🛍️' },
  { key: 'other', label: 'Άλλο', icon: '💶' },
];

const CATEGORY_MAP = new Map(EXPENSE_CATEGORIES.map((c) => [c.key, c]));

// βρίσκει το category object (label+icon) από το key - αν είναι κάτι που δεν αναγνωρίζουμε, το βάζουμε στο "Άλλο" αλλά κρατάμε το αρχικό όνομα
export function getExpenseCategory(category: string): { key: ExpenseCategoryKey; label: string; icon: string } {
  const known = CATEGORY_MAP.get(category as ExpenseCategoryKey);
  if (known) return known;
  return { key: 'other', label: category, icon: '💶' };
}

// formatting για ποσά σε ευρώ, ελληνικό locale (π.χ. 1.234,56 €)
export function formatMoney(amount: number) {
  return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(amount);
}
