import { DURATION_OPTIONS, type Destination, type DestinationTag, type DurationBucket, type Season } from '@/constants/destinations';

export type DestinationFilters = {
  tags: Set<DestinationTag>;
  seasons: Set<Season>;
  durations: Set<DurationBucket>;
};

// μετατρέπει τα φίλτρα σε query params για να μπουν στο URL (π.χ. όταν κάνουμε navigate)
export function filtersToParams(filters: DestinationFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.tags.size > 0) params.tags = Array.from(filters.tags).join(',');
  if (filters.seasons.size > 0) params.seasons = Array.from(filters.seasons).join(',');
  if (filters.durations.size > 0) params.durations = Array.from(filters.durations).join(',');
  return params;
}

// το αντίστροφο - παίρνει τα params από το URL και τα ξαναφτιάχνει σε Sets
export function paramsToFilters(params: {
  tags?: string;
  seasons?: string;
  durations?: string;
}): DestinationFilters {
  return {
    tags: new Set((params.tags?.split(',').filter(Boolean) ?? []) as DestinationTag[]),
    seasons: new Set((params.seasons?.split(',').filter(Boolean) ?? []) as Season[]),
    durations: new Set((params.durations?.split(',').filter(Boolean) ?? []) as DurationBucket[]),
  };
}

// ελέγχει αν ένας προορισμός ταιριάζει με τα επιλεγμένα φίλτρα - κενό φίλτρο σημαίνει "ταιριάζει με όλα"
export function matchesFilters(destination: Destination, filters: DestinationFilters): boolean {
  const matchesTags = filters.tags.size === 0 || destination.tags.some((tag) => filters.tags.has(tag));
  const matchesSeasons =
    filters.seasons.size === 0 || destination.seasons.some((season) => filters.seasons.has(season));
  // για τη διάρκεια κοιτάμε αν το εύρος προτεινόμενων ημερών του προορισμού επικαλύπτεται
  // με το εύρος του επιλεγμένου duration bucket (π.χ. "σαββατοκύριακο" = 2-3 μέρες)
  const matchesDuration =
    filters.durations.size === 0 ||
    DURATION_OPTIONS.some(
      (option) =>
        filters.durations.has(option.duration) &&
        destination.suggestedDays.min <= option.range.max &&
        destination.suggestedDays.max >= option.range.min
    );
  return matchesTags && matchesSeasons && matchesDuration;
}
