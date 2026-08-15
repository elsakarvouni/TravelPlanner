// ένα έξοδο όπως έρχεται από τη βάση, με id
export type BudgetItem = {
  id: number;
  trip_id: number;
  category: string;
  amount: number;
  note: string | null;
};

// ό,τι χρειάζεται για να φτιάξουμε νέο έξοδο, χωρίς id (το δίνει η βάση)
export type NewBudgetItem = {
  category: string;
  amount: number;
  note: string | null;
};
