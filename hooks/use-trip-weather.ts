import { useEffect, useState } from 'react';

import { getTripWeather, type TripWeatherSummary } from '@/utils/weather';

// hook που φέρνει τον καιρό για το ταξίδι - το βαρύ κομμάτι (forecast vs ιστορικό) είναι στο utils/weather.ts
export function useTripWeather(
  latitude: number | null,
  longitude: number | null,
  startDate: string,
  endDate: string
) {
  const [weather, setWeather] = useState<TripWeatherSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // χωρίς συντεταγμένες δεν έχουμε πού να ψάξουμε καιρό
    if (latitude == null || longitude == null) {
      setWeather(null);
      return;
    }

    // flag για να μην κάνουμε setState αν το component έχει ήδη unmount-αριστεί (ή άλλαξαν οι παράμετροι)
    let cancelled = false;
    setLoading(true);

    getTripWeather(latitude, longitude, startDate, endDate).then((result) => {
      if (!cancelled) {
        setWeather(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, startDate, endDate]);

  return { weather, loading };
}
