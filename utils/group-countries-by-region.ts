import type { CountryInfo } from '@/assets/data/countries';

export type CountryRegionSection = { title: string; data: CountryInfo[] };

export function groupCountriesByRegion(countries: CountryInfo[]): CountryRegionSection[] {
  const byRegion = new Map<string, CountryInfo[]>();

  for (const country of countries) {
    const list = byRegion.get(country.region) ?? [];
    list.push(country);
    byRegion.set(country.region, list);
  }

  return Array.from(byRegion.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, data]) => ({
      title,
      data: [...data].sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
