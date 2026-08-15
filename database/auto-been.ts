import { format } from 'date-fns';
import type { SQLiteDatabase } from 'expo-sqlite';

// όταν ένα ταξίδι τελειώσει (η ημερομηνία λήξης έχει περάσει), βάζουμε αυτόματα τη χώρα στα "been" - αλλά μόνο
// μία φορά ανά ταξίδι (flag auto_added_been), έτσι αν ο χρήστης το αφαιρέσει μετά με το χέρι δεν ξαναεμφανίζεται
export async function applyCompletedTripsToBeen(db: SQLiteDatabase) {
  const today = format(new Date(), 'yyyy-MM-dd');

  // ψάχνουμε ταξίδια που έχουν τελειώσει και δεν έχουν ήδη επεξεργαστεί (auto_added_been = 0)
  const completedTrips = await db.getAllAsync<{ id: number; destination_country_code: string }>(
    `SELECT id, destination_country_code FROM trips
     WHERE auto_added_been = 0 AND end_date < ? AND destination_country_code IS NOT NULL`,
    today
  );

  for (const trip of completedTrips) {
    await db.runAsync(
      'INSERT OR IGNORE INTO country_status (country_code, status) VALUES (?, ?)',
      trip.destination_country_code,
      'been'
    );
    // A country you've now been to shouldn't linger on the wishlist.
    // (μια χώρα που πλέον έχεις επισκεφτεί δεν έχει νόημα να είναι ακόμα στη wishlist)
    await db.runAsync(
      'DELETE FROM country_status WHERE country_code = ? AND status = ?',
      trip.destination_country_code,
      'wish'
    );
    await db.runAsync('UPDATE trips SET auto_added_been = 1 WHERE id = ?', trip.id);
  }

  return completedTrips.length > 0; // true αν άλλαξε κάτι, χρήσιμο για το UI να ξέρει αν πρέπει να κάνει refresh
}
