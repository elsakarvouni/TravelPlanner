import { useEffect, useState } from 'react';

import { getTripWeather, type TripWeatherSummary } from '@/utils/weather';

export function useTripWeather(
  latitude: number | null,
  longitude: number | null,
  startDate: string,
  endDate: string
) {
  const [weather, setWeather] = useState<TripWeatherSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (latitude == null || longitude == null) {
      setWeather(null);
      return;
    }

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
