import { useCallback, useEffect, useState } from 'react';

import * as storage from '@/database/storage';
import type { NewTrip, Trip } from '@/types/trip';
import { cancelTripNotifications, scheduleTripNotifications } from '@/utils/trip-notifications';

// hook για τα ταξίδια - φόρτωση, προσθήκη, update, delete, και συγχρονίζει τις ειδοποιήσεις κάθε φορά
export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // τα ταξίδια ταξινομημένα με ημερομηνία έναρξης, το πιο κοντινό πρώτο
  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await storage.getTrips();
    setTrips(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // προσθήκη νέου ταξιδιού + στήνει αυτόματα τις ειδοποιήσεις (3 μέρες πριν / 1 μέρα πριν)
  const addTrip = useCallback(
    async (trip: NewTrip) => {
      const created = await storage.addTrip(trip);
      await scheduleTripNotifications({
        id: created.id,
        title: trip.title,
        destination: trip.destination,
        start_date: trip.start_date,
      });
      await refresh();
    },
    [refresh]
  );

  const getTripById = useCallback(async (id: number) => {
    return storage.getTripById(id);
  }, []);

  // update ταξιδιού - resetάρει το auto_added_been σε 0 γιατί αν άλλαξε ο προορισμός/ημερομηνίες
  // δεν ισχύει πια αυτόματα ότι "έχει πάει" εκεί, και ξαναστήνει τις ειδοποιήσεις με τα νέα στοιχεία
  const updateTrip = useCallback(
    async (id: number, trip: NewTrip) => {
      await storage.updateTrip(id, trip);
      await scheduleTripNotifications({
        id,
        title: trip.title,
        destination: trip.destination,
        start_date: trip.start_date,
      });
      await refresh();
    },
    [refresh]
  );

  // σβήσιμο ταξιδιού + ακύρωση τυχόν ειδοποιήσεων που είχαν προγραμματιστεί για αυτό
  const deleteTrip = useCallback(
    async (id: number) => {
      await storage.deleteTrip(id);
      await cancelTripNotifications(id);
      await refresh();
    },
    [refresh]
  );

  return { trips, loading, refresh, addTrip, getTripById, updateTrip, deleteTrip };
}
