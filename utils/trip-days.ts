import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { el } from 'date-fns/locale';

// μια μέρα του ταξιδιού - day είναι 1,2,3... (όχι ημερομηνία) για να ταιριάζει με το itinerary
export type TripDay = {
  day: number;
  date: Date;
  label: string;
};

// φτιάχνει τη λίστα με όλες τις μέρες του ταξιδιού, από start μέχρι end, με ελληνικό label πχ "12 Ιουλ"
export function getTripDays(startDate: string, endDate: string): TripDay[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  // +1 γιατί μετράμε και τις δύο άκρες (πχ 1-3 Ιουλίου = 3 μέρες όχι 2), και τουλάχιστον 1 μέρα πάντα
  const totalDays = Math.max(differenceInCalendarDays(end, start) + 1, 1);

  return Array.from({ length: totalDays }, (_, i) => {
    const date = addDays(start, i);
    return {
      day: i + 1,
      date,
      label: format(date, 'd MMM', { locale: el }),
    };
  });
}

// από τον αριθμό μέρας (1,2,3...) του itinerary γυρνάει την πραγματική ημερομηνία
export function getDateForTripDay(startDate: string, day: number): Date {
  return addDays(parseISO(startDate), day - 1);
}
