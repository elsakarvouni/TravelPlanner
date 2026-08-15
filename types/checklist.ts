// ένα item της λίστας (π.χ. "πάρε φορτιστή") - is_checked είναι 0/1 γιατί sqlite δεν έχει boolean
export type ChecklistItem = {
  id: number;
  trip_id: number;
  label: string;
  is_checked: number;
};
