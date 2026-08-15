export type BudgetItem = {
  id: number;
  trip_id: number;
  category: string;
  amount: number;
  note: string | null;
};

export type NewBudgetItem = {
  category: string;
  amount: number;
  note: string | null;
};
