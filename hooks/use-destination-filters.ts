import { useMemo, useState } from 'react';

import type { DestinationTag, DurationBucket, Season } from '@/constants/destinations';
import { paramsToFilters, type DestinationFilters } from '@/utils/destination-filters';

// βοηθητική - βάζει/βγάζει μια τιμή από ένα Set, επιστρέφοντας καινούριο Set (δεν πειράζουμε το αρχικό)
function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

// hook για τα φίλτρα προορισμών (tags, εποχές, διάρκεια) - παίρνει και αρχικές τιμές από URL params
export function useDestinationFilters(initialParams?: { tags?: string; seasons?: string; durations?: string }) {
  // useMemo με κενό array γιατί θέλουμε να διαβάσουμε τα αρχικά params μόνο μία φορά, στην πρώτη φόρτωση
  const initial = useMemo(() => paramsToFilters(initialParams ?? {}), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedTags, setSelectedTags] = useState<Set<DestinationTag>>(initial.tags);
  const [selectedSeasons, setSelectedSeasons] = useState<Set<Season>>(initial.seasons);
  const [selectedDurations, setSelectedDurations] = useState<Set<DurationBucket>>(initial.durations);
  const [sheetVisible, setSheetVisible] = useState(false);

  const filters: DestinationFilters = useMemo(
    () => ({ tags: selectedTags, seasons: selectedSeasons, durations: selectedDurations }),
    [selectedTags, selectedSeasons, selectedDurations]
  );

  // πόσα φίλτρα είναι ενεργά συνολικά, για το badge στο κουμπί φίλτρων
  const activeFilterCount = selectedTags.size + selectedSeasons.size + selectedDurations.size;

  return {
    filters,
    activeFilterCount,
    selectedTags,
    selectedSeasons,
    selectedDurations,
    sheetVisible,
    openSheet: () => setSheetVisible(true),
    closeSheet: () => setSheetVisible(false),
    toggleTag: (tag: DestinationTag) => setSelectedTags((prev) => toggleInSet(prev, tag)),
    toggleSeason: (season: Season) => setSelectedSeasons((prev) => toggleInSet(prev, season)),
    toggleDuration: (duration: DurationBucket) => setSelectedDurations((prev) => toggleInSet(prev, duration)),
    clear: () => {
      setSelectedTags(new Set());
      setSelectedSeasons(new Set());
      setSelectedDurations(new Set());
    },
  };
}
