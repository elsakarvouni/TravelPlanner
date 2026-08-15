import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { CountryStatusKind, CountryStatusRow } from '@/types/country-status';

// hook για το "been to" / "wish to visit" - κρατάει δύο sets με κωδικούς χωρών
export function useCountryStatus() {
  const db = useSQLiteContext();
  const [been, setBeen] = useState<Set<string>>(new Set());
  const [wish, setWish] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // φέρνει όλες τις γραμμές και τις χωρίζει σε been/wish sets
  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await db.getAllAsync<CountryStatusRow>('SELECT * FROM country_status');
    setBeen(new Set(rows.filter((row) => row.status === 'been').map((row) => row.country_code)));
    setWish(new Set(rows.filter((row) => row.status === 'wish').map((row) => row.country_code)));
    setLoading(false);
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // OR IGNORE ώστε να μην σκάσει αν βάλουμε ξανά την ίδια χώρα με το ίδιο status
  const addStatus = useCallback(
    async (countryCode: string, status: CountryStatusKind) => {
      await db.runAsync(
        'INSERT OR IGNORE INTO country_status (country_code, status) VALUES (?, ?)',
        countryCode,
        status
      );
      await refresh();
    },
    [db, refresh]
  );

  const removeStatus = useCallback(
    async (countryCode: string, status: CountryStatusKind) => {
      await db.runAsync(
        'DELETE FROM country_status WHERE country_code = ? AND status = ?',
        countryCode,
        status
      );
      await refresh();
    },
    [db, refresh]
  );

  return { been, wish, loading, refresh, addStatus, removeStatus };
}
