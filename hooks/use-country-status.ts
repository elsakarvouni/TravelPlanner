import { useCallback, useEffect, useState } from 'react';

import * as storage from '@/database/storage';
import type { CountryStatusKind } from '@/types/country-status';

// hook για το "been to" / "wish to visit" - κρατάει δύο sets με κωδικούς χωρών
export function useCountryStatus() {
  const [been, setBeen] = useState<Set<string>>(new Set());
  const [wish, setWish] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // φέρνει όλες τις γραμμές και τις χωρίζει σε been/wish sets
  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await storage.getCountryStatusRows();
    setBeen(new Set(rows.filter((row) => row.status === 'been').map((row) => row.country_code)));
    setWish(new Set(rows.filter((row) => row.status === 'wish').map((row) => row.country_code)));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // OR IGNORE ώστε να μην σκάσει αν βάλουμε ξανά την ίδια χώρα με το ίδιο status
  const addStatus = useCallback(
    async (countryCode: string, status: CountryStatusKind) => {
      await storage.addCountryStatus(countryCode, status);
      await refresh();
    },
    [refresh]
  );

  const removeStatus = useCallback(
    async (countryCode: string, status: CountryStatusKind) => {
      await storage.removeCountryStatus(countryCode, status);
      await refresh();
    },
    [refresh]
  );

  return { been, wish, loading, refresh, addStatus, removeStatus };
}
