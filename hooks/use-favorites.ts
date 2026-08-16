import { useCallback, useEffect, useState } from 'react';

import * as storage from '@/database/storage';

// hook για τους αγαπημένους προορισμούς - απλά ένα set με τα ids τους
export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const ids = await storage.getFavoriteIds();
    setFavoriteIds(new Set(ids));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // αν είναι ήδη αγαπημένο το βγάζουμε, αλλιώς το προσθέτουμε
  const toggleFavorite = useCallback(
    async (destinationId: string) => {
      if (favoriteIds.has(destinationId)) {
        await storage.removeFavorite(destinationId);
      } else {
        await storage.addFavorite(destinationId);
      }
      await refresh();
    },
    [favoriteIds, refresh]
  );

  return { favoriteIds, loading, refresh, toggleFavorite };
}
