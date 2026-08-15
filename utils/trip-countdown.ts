import { differenceInCalendarDays, parseISO } from 'date-fns';

// φτιάχνει το κειμενάκι αντίστροφης μέτρησης που δείχνουμε στην κάρτα του ταξιδιού
export function getTripCountdownLabel(startDate: string, endDate: string): string {
  const today = new Date();
  const daysUntilStart = differenceInCalendarDays(parseISO(startDate), today);
  const daysUntilEnd = differenceInCalendarDays(parseISO(endDate), today);

  // περνάμε τα στάδια: πολλές μέρες ακόμα -> αύριο -> σήμερα -> σε εξέλιξη (έχει ξεκινήσει αλλά δεν τελείωσε) -> τελείωσε
  if (daysUntilStart > 1) return `${daysUntilStart} μέρες ακόμα`;
  if (daysUntilStart === 1) return 'Αύριο!';
  if (daysUntilStart === 0) return 'Ξεκινάει σήμερα!';
  if (daysUntilEnd >= 0) return 'Σε εξέλιξη';
  return 'Ολοκληρώθηκε';
}
