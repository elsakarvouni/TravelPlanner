import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { el } from 'date-fns/locale';

export type TripDay = {
  day: number;
  date: Date;
  label: string;
};

export function getTripDays(startDate: string, endDate: string): TripDay[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
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

export function getDateForTripDay(startDate: string, day: number): Date {
  return addDays(parseISO(startDate), day - 1);
}
