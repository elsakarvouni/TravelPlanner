import { UN_COUNTRIES } from '@/assets/data/countries';
import { DESTINATIONS } from '@/constants/destinations';
import type { Trip } from '@/types/trip';

// maps για γρήγορο lookup - κωδικός χώρας -> όνομα, και όνομα χώρας -> εικόνα από τη λίστα προορισμών
const COUNTRY_NAME_BY_CODE = new Map(UN_COUNTRIES.map((country) => [country.code, country.name]));
const IMAGE_BY_COUNTRY_NAME = new Map(DESTINATIONS.map((d) => [d.country, d.imageUrl]));

// βρίσκει μια ταιριαστή φωτογραφία εξωφύλλου για το ταξίδι - πρώτα δοκιμάζει με τον κωδικό χώρας
// (πιο αξιόπιστο), κι αν δεν βρει τίποτα πέφτει σε απλό ταίριασμα ονόματος μέσα στο destination string
export function getTripCoverImage(trip: Trip): string | null {
  if (trip.destination_country_code) {
    const countryName = COUNTRY_NAME_BY_CODE.get(trip.destination_country_code);
    const image = countryName ? IMAGE_BY_COUNTRY_NAME.get(countryName) : undefined;
    if (image) return image;
  }

  // fallback: ψάχνουμε αν το όνομα προορισμού ή η χώρα εμφανίζεται μέσα στο destination text του ταξιδιού
  const match = DESTINATIONS.find(
    (d) => trip.destination.includes(d.name) || trip.destination.includes(d.country)
  );
  return match?.imageUrl ?? null;
}
