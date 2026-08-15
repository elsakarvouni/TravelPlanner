export type ItineraryEntryType = 'flight' | 'accommodation' | 'activity';

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
