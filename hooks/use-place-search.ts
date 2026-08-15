import { useEffect, useRef, useState } from 'react';

// μια πρόταση τοποθεσίας που γυρνάει το Photon API
export type PlaceSuggestion = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  countryCode: string | null;
};

// το Photon (komoot) είναι δωρεάν geocoding API, το χρησιμοποιούμε για αναζήτηση τοποθεσιών
const PHOTON_URL = 'https://photon.komoot.io/api/';

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    osm_id?: number;
    osm_type?: string;
    name?: string;
    state?: string;
    country?: string;
    countrycode?: string;
  };
};

// hook για αναζήτηση τοποθεσιών καθώς πληκτρολογεί ο χρήστης (autocomplete), με debounce
export function usePlaceSearch(query: string) {
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    // κάτω από 2 χαρακτήρες δεν έχει νόημα να ψάξουμε, καθαρίζουμε τα αποτελέσματα
    if (trimmed.length < 2) {
      controllerRef.current?.abort();
      setResults([]);
      setLoading(false);
      return;
    }

    // περιμένουμε 300ms πριν κάνουμε το request, ώστε να μην σφυροκοπάμε το API σε κάθε πλήκτρο
    const timeout = setTimeout(async () => {
      // ακυρώνουμε τυχόν προηγούμενο request που εκκρεμεί, θέλουμε μόνο το πιο πρόσφατο
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);

      try {
        const url = `${PHOTON_URL}?q=${encodeURIComponent(trimmed)}&limit=6&lang=en`;
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();

        const suggestions: PlaceSuggestion[] = ((data.features ?? []) as PhotonFeature[])
          .map((feature) => {
            const props = feature.properties ?? {};
            // φτιάχνουμε ένα ωραίο label πχ "Αθήνα, Αττική, Ελλάδα" κρατώντας μόνο ό,τι υπάρχει
            const parts = [props.name, props.state, props.country].filter(
              (part): part is string => Boolean(part)
            );
            const label = Array.from(new Set(parts)).join(', ');
            const [lon, lat] = feature.geometry?.coordinates ?? [0, 0];
            return {
              id: `${props.osm_type ?? ''}${props.osm_id ?? label}`,
              label,
              lat,
              lon,
              countryCode: props.countrycode ? props.countrycode.toUpperCase() : null,
            };
          })
          .filter((suggestion) => suggestion.label.length > 0);

        setResults(suggestions);
      } catch (error) {
        // αν το error είναι απλά επειδή ακυρώσαμε εμείς το request, δεν το θεωρούμε πρόβλημα
        if ((error as Error).name !== 'AbortError') {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return { results, loading };
}
