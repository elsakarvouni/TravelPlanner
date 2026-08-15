import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'travelplanner.db';

// βασική λογική migrations: κοιτάμε το PRAGMA user_version της SQLite (ένας αριθμός που κρατάει το sqlite μόνο του)
// και τρέχουμε διαδοχικά όποια migration blocks λείπουν, ανεβάζοντας το version κάθε φορά. Έτσι σε νέα εγκατάσταση
// τρέχουν όλα από την αρχή, ενώ σε update συσκευής τρέχουν μόνο τα καινούρια
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = result?.user_version ?? 0;

  // v1: το αρχικό table για τα ταξίδια (τίτλος, προορισμός, ημερομηνίες, cover image)
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

  // v2: table για το ποιες χώρες έχεις επισκεφτεί ή θέλεις να επισκεφτείς (been/wish) - χρησιμοποιείται στον world map
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

  // v3: προσθέτουμε country code στο κάθε ταξίδι (χρειάζεται για emergency numbers, phrasebook κλπ) +
  // ένα flag για να ξέρουμε αν έχουμε ήδη προσθέσει αυτόματα τη χώρα στα "been" (βλ. auto-been.ts)
  if (currentVersion < 3) {
    await db.execAsync(`
      ALTER TABLE trips ADD COLUMN destination_country_code TEXT;
      ALTER TABLE trips ADD COLUMN auto_added_been INTEGER NOT NULL DEFAULT 0;
    `);
    await db.execAsync('PRAGMA user_version = 3');
    currentVersion = 3;
  }

  // v4: table για τους προορισμούς που έχει κάνει favorite ο χρήστης (απλά κρατάει τα id τους)
  if (currentVersion < 4) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS destination_favorites (
        destination_id TEXT PRIMARY KEY NOT NULL
      );
    `);
    await db.execAsync('PRAGMA user_version = 4');
    currentVersion = 4;
  }

  // v5: μεγάλη προσθήκη - itinerary (πτήσεις/διαμονή/δραστηριότητες ανά μέρα), checklist items, και budget items
  if (currentVersion < 5) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS itinerary_entries (
        id INTEGER PRIMARY KEY NOT NULL,
        trip_id INTEGER NOT NULL,
        day INTEGER NOT NULL,
        time TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('flight', 'accommodation', 'activity')),
        title TEXT NOT NULL,
        subtitle TEXT,
        notes TEXT,
        latitude REAL,
        longitude REAL
      );

      CREATE TABLE IF NOT EXISTS checklist_items (
        id INTEGER PRIMARY KEY NOT NULL,
        trip_id INTEGER NOT NULL,
        label TEXT NOT NULL,
        is_checked INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS budget_items (
        id INTEGER PRIMARY KEY NOT NULL,
        trip_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        note TEXT
      );
    `);
    await db.execAsync('PRAGMA user_version = 5');
    currentVersion = 5;
  }

  // v6: coords για τον προορισμό του ταξιδιού (lat/lon) - χρειάζονται για καιρό, χάρτη κλπ
  if (currentVersion < 6) {
    await db.execAsync(`
      ALTER TABLE trips ADD COLUMN destination_latitude REAL;
      ALTER TABLE trips ADD COLUMN destination_longitude REAL;
    `);
    await db.execAsync('PRAGMA user_version = 6');
    currentVersion = 6;
  }
}
