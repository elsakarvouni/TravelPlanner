import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export function useFavorites() {
  const db = useSQLiteContext();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await db.getAllAsync<{ destination_id: string }>(
      'SELECT destination_id FROM destination_favorites'
    );
    setFavoriteIds(new Set(rows.map((row) => row.destination_id)));
    setLoading(false);
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleFavorite = useCallback(
    async (destinationId: string) => {
      if (favoriteIds.has(destinationId)) {
        await db.runAsync('DELETE FROM destination_favorites WHERE destination_id = ?', destinationId);
      } else {
        await db.runAsync(
          'INSERT OR IGNORE INTO destination_favorites (destination_id) VALUES (?)',
          destinationId
        );
      }
      await refresh();
    },
    [db, favoriteIds, refresh]
  );

  return { favoriteIds, loading, refresh, toggleFavorite };
}
