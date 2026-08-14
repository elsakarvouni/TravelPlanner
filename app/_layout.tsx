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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
