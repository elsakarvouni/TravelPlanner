import { subDays, setHours, setMinutes, setSeconds, setMilliseconds, parseISO } from 'date-fns';
import * as Notifications from 'expo-notifications';
import type { SQLiteDatabase } from 'expo-sqlite';

type NotifiableTrip = {
  id: number;
  title: string;
  destination: string;
  start_date: string;
};

function getTripNotificationIds(tripId: number) {
  return {
    threeDayId: `trip-${tripId}-3d`,
    oneDayId: `trip-${tripId}-1d`,
  };
}

function atTime(date: Date, hours: number, minutes: number): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hours), minutes), 0), 0);
}

async function cancelIfExists(identifier: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // Nothing was scheduled with this identifier — nothing to do.
  }
}

export async function cancelTripNotifications(tripId: number) {
  const { threeDayId, oneDayId } = getTripNotificationIds(tripId);
  await cancelIfExists(threeDayId);
  await cancelIfExists(oneDayId);
}

export async function scheduleTripNotifications(trip: NotifiableTrip) {
  const { threeDayId, oneDayId } = getTripNotificationIds(trip.id);
  await cancelTripNotifications(trip.id);

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const startDate = parseISO(trip.start_date);
  const now = new Date();

  const threeDaysBefore = atTime(subDays(startDate, 3), 10, 0);
  if (threeDaysBefore > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: threeDayId,
      content: {
        title: '3 μέρες μέχρι το ταξίδι! 🌍',
        body: `Το ταξίδι σου "${trip.title}" στο ${trip.destination} πλησιάζει!`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: threeDaysBefore },
    });
  }

  const oneDayBefore = atTime(subDays(startDate, 1), 18, 0);
  if (oneDayBefore > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: oneDayId,
      content: {
        title: 'Ετοίμασε βαλίτσες! ✈️',
        body: `Αύριο φεύγεις για ${trip.destination}!`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: oneDayBefore },
    });
  }
}

export async function scheduleAllUpcomingTripNotifications(db: SQLiteDatabase) {
  const trips = await db.getAllAsync<NotifiableTrip>(
    "SELECT id, title, destination, start_date FROM trips WHERE date(start_date) >= date('now')"
  );
  for (const trip of trips) {
    await scheduleTripNotifications(trip);
  }
}
