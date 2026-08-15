import type { CountryInfo } from '@/assets/data/countries';

// μια "ενότητα" για SectionList - τίτλος περιοχής + οι χώρες της
export type CountryRegionSection = { title: string; data: CountryInfo[] };

// ομαδοποιεί τις χώρες ανά περιοχή (region) και τα ταξινομεί όλα αλφαβητικά, έτοιμο για SectionList
export function groupCountriesByRegion(countries: CountryInfo[]): CountryRegionSection[] {
  const byRegion = new Map<string, CountryInfo[]>();

  for (const country of countries) {
    const list = byRegion.get(country.region) ?? [];
    list.push(country);
    byRegion.set(country.region, list);
  }

  // πρώτα ταξινομούμε τις περιοχές αλφαβητικά, μετά μέσα σε κάθε περιοχή τις χώρες αλφαβητικά
  return Array.from(byRegion.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, data]) => ({
      title,
      data: [...data].sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
