import { UN_COUNTRIES } from '@/assets/data/countries';
import { DESTINATIONS } from '@/constants/destinations';
import type { Trip } from '@/types/trip';

const COUNTRY_NAME_BY_CODE = new Map(UN_COUNTRIES.map((country) => [country.code, country.name]));
const IMAGE_BY_COUNTRY_NAME = new Map(DESTINATIONS.map((d) => [d.country, d.imageUrl]));

export function getTripCoverImage(trip: Trip): string | null {
  if (trip.destination_country_code) {
    const countryName = COUNTRY_NAME_BY_CODE.get(trip.destination_country_code);
    const image = countryName ? IMAGE_BY_COUNTRY_NAME.get(countryName) : undefined;
    if (image) return image;
  }

  const match = DESTINATIONS.find(
    (d) => trip.destination.includes(d.name) || trip.destination.includes(d.country)
  );
  return match?.imageUrl ?? null;
}
