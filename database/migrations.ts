import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'travelplanner.db';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        destination TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        cover_image TEXT
      );
    `);
    await db.execAsync('PRAGMA user_version = 1');
    currentVersion = 1;
  }

  if (currentVersion < 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS country_status (
        country_code TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('been', 'wish')),
        PRIMARY KEY (country_code, status)
      );
    `);
    await db.execAsync('PRAGMA user_version = 2');
    currentVersion = 2;
  }

  if (currentVersion < 3) {
    await db.execAsync(`
      ALTER TABLE trips ADD COLUMN destination_country_code TEXT;
      ALTER TABLE trips ADD COLUMN auto_added_been INTEGER NOT NULL DEFAULT 0;
    `);
    await db.execAsync('PRAGMA user_version = 3');
    currentVersion = 3;
  }
}
