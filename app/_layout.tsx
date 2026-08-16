import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { AppAlertHost } from '@/components/app-alert';
import { ModalCloseButton } from '@/components/modal-close-button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerServiceWorker } from '@/utils/register-service-worker';
import { scheduleAllUpcomingTripNotifications } from '@/utils/trip-notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

// λέει στην εφαρμογή τι να κάνει με τις ειδοποιήσεις όσο είναι ανοιχτή -
// να δείχνει banner, να μπαίνουν στη λίστα, να παίζει ήχος, αλλά όχι badge number
// (στο web δεν καλούμε καθόλου το expo-notifications - δεν υποστηρίζονται τοπικές scheduled ειδοποιήσεις εκεί)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// βοηθητικό component που δεν δείχνει τίποτα, απλά στήνει τις ειδοποιήσεις
// για τα επόμενα ταξίδια - ζητάει άδεια και τις προγραμματίζει με βάση τη βάση.
// Στο web κάνει silent skip: δεν ζητάμε καν άδεια, ώστε να μην εμφανιστεί το browser permission prompt.
function TripNotificationsSetup() {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    (async () => {
      await Notifications.requestPermissionsAsync();
      await scheduleAllUpcomingTripNotifications();
    })();
  }, []);

  return null;
}

// βοηθητικό component που δεν δείχνει τίποτα, registράρει απλά το service worker στο web
// (βλ. utils/register-service-worker.ts - no-op στο native και στο dev server)
function ServiceWorkerSetup() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}

// το root layout όλης της εφαρμογής - βάζει το θέμα (light/dark), στήνει το stack με όλες τις
// οθόνες/modals και κλειδώνει την οθόνη σε portrait. Η βάση (SQLite στο native, IndexedDB στο web)
// ανοίγει lazily μέσα στο @/database/storage με το που τη χρειαστεί το πρώτο hook, δεν χρειάζεται
// provider εδώ.
export default function RootLayout() {
  const colorScheme = useColorScheme();

  // κλειδώνω σε portrait, δεν έχει νόημα landscape σε αυτή την εφαρμογή - το screen.orientation.lock()
  // δεν υποστηρίζεται σε browsers/desktop (μόνο σε installed PWA σε ορισμένα Android κινητά), οπότε
  // στο web δεν το καλούμε καθόλου αντί να αφήσουμε να πετάξει unhandled promise rejection
  useEffect(() => {
    if (Platform.OS === 'web') return;
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TripNotificationsSetup />
      <ServiceWorkerSetup />
      <AppAlertHost />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen
            name="add-trip"
            options={{ presentation: 'modal', title: 'Νέο Ταξίδι', headerLeft: () => <ModalCloseButton /> }}
          />
          <Stack.Screen
            name="edit-trip/[id]"
            options={{
              presentation: 'modal',
              title: 'Επεξεργασία Ταξιδιού',
              headerLeft: () => <ModalCloseButton />,
            }}
          />
          <Stack.Screen
            name="add-country"
            options={{ presentation: 'modal', title: 'Προσθήκη Χώρας', headerLeft: () => <ModalCloseButton /> }}
          />
          <Stack.Screen name="favorites" options={{ title: 'Αγαπημένα' }} />
          <Stack.Screen name="settings" options={{ title: 'Ρυθμίσεις' }} />
          <Stack.Screen
            name="trip-checklist/[id]"
            options={{ presentation: 'modal', title: 'Αποσκευές', headerLeft: () => <ModalCloseButton /> }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
