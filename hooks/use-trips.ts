import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { NewTrip, Trip } from '@/types/trip';

export function useTrips() {
  const db = useSQLiteContext();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await db.getAllAsync<Trip>('SELECT * FROM trips ORDER BY start_date ASC');
    setTrips(rows);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTrip = useCallback(
    async (trip: NewTrip) => {
      await db.runAsync(
        'INSERT INTO trips (title, destination, destination_country_code, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
        trip.title,
        trip.destination,
        trip.destination_country_code,
        trip.start_date,
        trip.end_date
      );
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

  const updateTrip = useCallback(
    async (id: number, trip: NewTrip) => {
      await db.runAsync(
        `UPDATE trips
         SET title = ?, destination = ?, destination_country_code = ?, start_date = ?, end_date = ?, auto_added_been = 0
         WHERE id = ?`,
        trip.title,
        trip.destination,
        trip.destination_country_code,
        trip.start_date,
        trip.end_date,
        id
      );
      await refresh();
    },
    [db, refresh]
  );

  const deleteTrip = useCallback(
    async (id: number) => {
      await db.runAsync('DELETE FROM trips WHERE id = ?', id);
      await refresh();
    },
    [db, refresh]
  );

  return { trips, loading, refresh, addTrip, getTripById, updateTrip, deleteTrip };
}
