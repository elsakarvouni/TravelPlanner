import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { NewTrip, Trip } from '@/types/trip';
import { cancelTripNotifications, scheduleTripNotifications } from '@/utils/trip-notifications';

// hook για τα ταξίδια - φόρτωση, προσθήκη, update, delete, και συγχρονίζει τις ειδοποιήσεις κάθε φορά
export function useTrips() {
  const db = useSQLiteContext();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // τα ταξίδια ταξινομημένα με ημερομηνία έναρξης, το πιο κοντινό πρώτο
  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await db.getAllAsync<Trip>('SELECT * FROM trips ORDER BY start_date ASC');
    setTrips(rows);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // προσθήκη νέου ταξιδιού + στήνει αυτόματα τις ειδοποιήσεις (3 μέρες πριν / 1 μέρα πριν)
  const addTrip = useCallback(
    async (trip: NewTrip) => {
      const result = await db.runAsync(
        `INSERT INTO trips
         (title, destination, destination_country_code, destination_latitude, destination_longitude, start_date, end_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        trip.title,
        trip.destination,
        trip.destination_country_code,
        trip.destination_latitude,
        trip.destination_longitude,
        trip.start_date,
        trip.end_date
      );
      await scheduleTripNotifications({
        id: result.lastInsertRowId,
        title: trip.title,
        destination: trip.destination,
        start_date: trip.start_date,
      });
      await refresh();
    },
    [db, refresh]
  );

  const getTripById = useCallback(
    async (id: number) => {
      return db.getFirstAsync<Trip>('SELECT * FROM trips WHERE id = ?', id);
    },
    [db]
  );

  // update ταξιδιού - resetάρει το auto_added_been σε 0 γιατί αν άλλαξε ο προορισμός/ημερομηνίες
  // δεν ισχύει πια αυτόματα ότι "έχει πάει" εκεί, και ξαναστήνει τις ειδοποιήσεις με τα νέα στοιχεία
  const updateTrip = useCallback(
    async (id: number, trip: NewTrip) => {
      await db.runAsync(
        `UPDATE trips
         SET title = ?, destination = ?, destination_country_code = ?, destination_latitude = ?,
             destination_longitude = ?, start_date = ?, end_date = ?, auto_added_been = 0
         WHERE id = ?`,
        trip.title,
        trip.destination,
        trip.destination_country_code,
        trip.destination_latitude,
        trip.destination_longitude,
        trip.start_date,
        trip.end_date,
        id
      );
      await scheduleTripNotifications({
        id,
        title: trip.title,
        destination: trip.destination,
        start_date: trip.start_date,
      });
      await refresh();
    },
    [db, refresh]
  );

  // σβήσιμο ταξιδιού + ακύρωση τυχόν ειδοποιήσεων που είχαν προγραμματιστεί για αυτό
  const deleteTrip = useCallback(
    async (id: number) => {
      await db.runAsync('DELETE FROM trips WHERE id = ?', id);
      await cancelTripNotifications(id);
      await refresh();
    },
    [db, refresh]
  );

  return { trips, loading, refresh, addTrip, getTripById, updateTrip, deleteTrip };
}
