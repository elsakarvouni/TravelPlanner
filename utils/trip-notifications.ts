import { subDays, setHours, setMinutes, setSeconds, setMilliseconds, parseISO } from 'date-fns';
import * as Notifications from 'expo-notifications';
import type { SQLiteDatabase } from 'expo-sqlite';

// ό,τι χρειαζόμαστε από ένα ταξίδι για να στήσουμε ειδοποιήσεις, δεν χρειαζόμαστε όλο το Trip object
type NotifiableTrip = {
  id: number;
  title: string;
  destination: string;
  start_date: string;
};

// σταθερά ids ανά ταξίδι ώστε να μπορούμε να τα ακυρώσουμε/ξαναγράψουμε αργότερα
function getTripNotificationIds(tripId: number) {
  return {
    threeDayId: `trip-${tripId}-3d`,
    oneDayId: `trip-${tripId}-1d`,
  };
}

// βάζει συγκεκριμένη ώρα:λεπτό σε μια ημερομηνία, μηδενίζοντας δευτερόλεπτα/χιλιοστά
function atTime(date: Date, hours: number, minutes: number): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hours), minutes), 0), 0);
}

// προσπαθεί να ακυρώσει μια ειδοποίηση, αν δεν υπάρχει τέτοιο id απλά δεν κάνει τίποτα
async function cancelIfExists(identifier: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // Nothing was scheduled with this identifier — nothing to do.
  }
}

// ακυρώνει και τις δύο ειδοποιήσεις (3 μέρες πριν, 1 μέρα πριν) ενός ταξιδιού
export async function cancelTripNotifications(tripId: number) {
  const { threeDayId, oneDayId } = getTripNotificationIds(tripId);
  await cancelIfExists(threeDayId);
  await cancelIfExists(oneDayId);
}

// στήνει τις δύο ειδοποιήσεις για ένα ταξίδι (3 μέρες πριν στις 10:00, 1 μέρα πριν στις 18:00)
// πρώτα ακυρώνει τις παλιές ώστε να μην μαζεύονται διπλές αν καλεστεί ξανά (π.χ. μετά από edit)
export async function scheduleTripNotifications(trip: NotifiableTrip) {
  const { threeDayId, oneDayId } = getTripNotificationIds(trip.id);
  await cancelTripNotifications(trip.id);

  // χωρίς άδεια από τον χρήστη δεν έχει νόημα να προγραμματίσουμε τίποτα
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const startDate = parseISO(trip.start_date);
  const now = new Date();

  // αν η ημερομηνία της ειδοποίησης είναι ήδη στο παρελθόν (π.χ. πρόσθεσες ταξίδι σε 2 μέρες), απλά την προσπερνάμε
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

// τρέχει π.χ. στο app startup - ξαναστήνει τις ειδοποιήσεις για όλα τα ταξίδια που δεν έχουν περάσει ακόμα
export async function scheduleAllUpcomingTripNotifications(db: SQLiteDatabase) {
  const trips = await db.getAllAsync<NotifiableTrip>(
    "SELECT id, title, destination, start_date FROM trips WHERE date(start_date) >= date('now')"
  );
  for (const trip of trips) {
    await scheduleTripNotifications(trip);
  }
}
