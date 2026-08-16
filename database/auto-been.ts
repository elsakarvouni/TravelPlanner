import { format } from 'date-fns';

import * as storage from '@/database/storage';

// όταν ένα ταξίδι τελειώσει (η ημερομηνία λήξης έχει περάσει), βάζουμε αυτόματα τη χώρα στα "been" - αλλά μόνο
// μία φορά ανά ταξίδι (flag auto_added_been), έτσι αν ο χρήστης το αφαιρέσει μετά με το χέρι δεν ξαναεμφανίζεται
export async function applyCompletedTripsToBeen(): Promise<boolean> {
  const today = format(new Date(), 'yyyy-MM-dd');

  // ψάχνουμε ταξίδια που έχουν τελειώσει και δεν έχουν ήδη επεξεργαστεί (auto_added_been = 0)
  const trips = await storage.getTrips();
  const completedTrips = trips.filter(
    (trip) => trip.auto_added_been === 0 && trip.end_date < today && trip.destination_country_code !== null
  );

  for (const trip of completedTrips) {
    await storage.addCountryStatus(trip.destination_country_code as string, 'been');
    // A country you've now been to shouldn't linger on the wishlist.
    // (μια χώρα που πλέον έχεις επισκεφτεί δεν έχει νόημα να είναι ακόμα στη wishlist)
    await storage.removeCountryStatus(trip.destination_country_code as string, 'wish');
    await storage.markTripAutoAddedBeen(trip.id);
  }

  return completedTrips.length > 0; // true αν άλλαξε κάτι, χρήσιμο για το UI να ξέρει αν πρέπει να κάνει refresh
}
