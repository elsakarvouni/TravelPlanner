// τρεις τύποι εγγραφών στο πρόγραμμα - πτήση, διαμονή, δραστηριότητα
export type ItineraryEntryType = 'flight' | 'accommodation' | 'activity';

// μια εγγραφή στο πρόγραμμα του ταξιδιού, το day είναι σχετικό (1η μέρα, 2η μέρα κτλ), όχι πραγματική ημερομηνία
export type ItineraryEntry = {
  id: number;
  trip_id: number;
  day: number;
  time: string;
  type: ItineraryEntryType;
  title: string;
  subtitle: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
};

// το ίδιο αλλά χωρίς id, για δημιουργία νέας εγγραφής
export type NewItineraryEntry = {
  day: number;
  time: string;
  type: ItineraryEntryType;
  title: string;
  subtitle: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
};
