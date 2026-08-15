import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import * as Notifications from 'expo-notifications';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { DATABASE_NAME, migrateDbIfNeeded } from '@/database/migrations';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { scheduleAllUpcomingTripNotifications } from '@/utils/trip-notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

// λέει στην εφαρμογή τι να κάνει με τις ειδοποιήσεις όσο είναι ανοιχτή -
// να δείχνει banner, να μπαίνουν στη λίστα, να παίζει ήχος, αλλά όχι badge number
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// βοηθητικό component που δεν δείχνει τίποτα, απλά στήνει τις ειδοποιήσεις
// για τα επόμενα ταξίδια - ζητάει άδεια και τις προγραμματίζει με βάση τη βάση
function TripNotificationsSetup() {
  const db = useSQLiteContext();

  useEffect(() => {
    (async () => {
      await Notifications.requestPermissionsAsync();
      await scheduleAllUpcomingTripNotifications(db);
    })();
  }, [db]);

  return null;
}

// το root layout όλης της εφαρμογής - ανοίγει τη βάση SQLite, βάζει το θέμα (light/dark),
// στήνει το stack με όλες τις οθόνες/modals και κλειδώνει την οθόνη σε portrait
export default function RootLayout() {
  const colorScheme = useColorScheme();

  // κλειδώνω σε portrait, δεν έχει νόημα landscape σε αυτή την εφαρμογή
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* ανοίγει (ή φτιάχνει) τη βάση και τρέχει τα migrations πριν δείξει οτιδήποτε άλλο */}
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
        <TripNotificationsSetup />
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen
              name="add-trip"
              options={{ presentation: 'modal', title: 'Νέο Ταξίδι' }}
            />
            <Stack.Screen
              name="edit-trip/[id]"
              options={{ presentation: 'modal', title: 'Επεξεργασία Ταξιδιού' }}
            />
            <Stack.Screen
              name="add-country"
              options={{ presentation: 'modal', title: 'Προσθήκη Χώρας' }}
            />
            <Stack.Screen name="favorites" options={{ title: 'Αγαπημένα' }} />
            <Stack.Screen
              name="trip-checklist/[id]"
              options={{ presentation: 'modal', title: 'Αποσκευές' }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
