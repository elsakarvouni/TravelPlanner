import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { AddExpenseSheet } from '@/components/add-expense-sheet';
import { AddItineraryEntrySheet } from '@/components/add-itinerary-entry-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TripEmergencyCard } from '@/components/trip-emergency-card';
import { TripMapView } from '@/components/trip-map-view';
import { TripPhrasebookCard } from '@/components/trip-phrasebook-card';
import { TripWeatherWidget } from '@/components/trip-weather-widget';
import { formatMoney, getExpenseCategory } from '@/constants/budget-categories';
import { STATUS_COLORS } from '@/constants/travel-status';
import { useBudget } from '@/hooks/use-budget';
import { useItinerary } from '@/hooks/use-itinerary';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTrips } from '@/hooks/use-trips';
import type { BudgetItem, NewBudgetItem } from '@/types/budget';
import type { ItineraryEntry, NewItineraryEntry } from '@/types/itinerary';
import type { Trip } from '@/types/trip';
import { getTripCountdownLabel } from '@/utils/trip-countdown';
import { getTripDays } from '@/utils/trip-days';

const ACCENT = STATUS_COLORS.wish;

const ENTRY_ICON: Record<ItineraryEntry['type'], string> = {
  flight: '✈️',
  accommodation: '🛏️',
  activity: '📍',
};

type TabKey = 'itinerary' | 'map' | 'expenses' | 'info';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = Number(id);
  const router = useRouter();

  const { getTripById } = useTrips();
  const [trip, setTrip] = useState<Trip | null>(null);
  const { entries, addEntry, updateEntry, deleteEntry } = useItinerary(tripId);
  const { items: expenses, total, addItem: addExpense, updateItem: updateExpense, deleteItem: deleteExpense } =
    useBudget(tripId);

  const [tab, setTab] = useState<TabKey>('itinerary');
  const [selectedDay, setSelectedDay] = useState(1);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ItineraryEntry | null>(null);
  const [expenseSheetVisible, setExpenseSheetVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<BudgetItem | null>(null);

  const borderColor = useThemeColor({}, 'icon');
  const iconColor = useThemeColor({}, 'icon');

  const loadTrip = useCallback(async () => {
    const result = await getTripById(tripId);
    setTrip(result ?? null);
  }, [getTripById, tripId]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  const days = useMemo(() => (trip ? getTripDays(trip.start_date, trip.end_date) : []), [trip]);

  const dayEntries = useMemo(
    () => entries.filter((entry) => entry.day === selectedDay),
    [entries, selectedDay]
  );

  const openAddSheet = () => {
    setEditingEntry(null);
    setSheetVisible(true);
  };

  const openEntryMenu = (entry: ItineraryEntry) => {
    Alert.alert(entry.title, undefined, [
      {
        text: 'Επεξεργασία',
        onPress: () => {
          setEditingEntry(entry);
          setSheetVisible(true);
        },
      },
      {
        text: 'Διαγραφή',
        style: 'destructive',
        onPress: () => deleteEntry(entry.id),
      },
      { text: 'Άκυρο', style: 'cancel' },
    ]);
  };

  const handleSubmitEntry = async (values: NewItineraryEntry) => {
    if (editingEntry) {
      await updateEntry(editingEntry.id, values);
    } else {
      await addEntry(values);
    }
  };

  const handleChecklistPress = () => {
    router.push({ pathname: '/trip-checklist/[id]', params: { id: String(tripId) } });
  };

  const openAddExpenseSheet = () => {
    setEditingExpense(null);
    setExpenseSheetVisible(true);
  };

  const openExpenseMenu = (expense: BudgetItem) => {
    Alert.alert(getExpenseCategory(expense.category).label, formatMoney(expense.amount), [
      {
        text: 'Επεξεργασία',
        onPress: () => {
          setEditingExpense(expense);
          setExpenseSheetVisible(true);
        },
      },
      {
        text: 'Διαγραφή',
        style: 'destructive',
        onPress: () => deleteExpense(expense.id),
      },
      { text: 'Άκυρο', style: 'cancel' },
    ]);
  };

  const handleSubmitExpense = async (values: NewBudgetItem) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, values);
    } else {
      await addExpense(values);
    }
  };

  if (!trip) {
    return <ThemedView style={styles.container} />;
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: trip.title }} />

      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="title" numberOfLines={1}>
            {trip.destination}
          </ThemedText>
          <ThemedText style={[styles.dateRange, { color: iconColor }]}>
            {trip.start_date} — {trip.end_date}
          </ThemedText>
          <ThemedText style={[styles.countdown, { color: ACCENT }]}>
            {getTripCountdownLabel(trip.start_date, trip.end_date)}
          </ThemedText>
        </View>
        <Pressable style={[styles.checklistButton, { borderColor }]} onPress={handleChecklistPress} hitSlop={8}>
          <IconSymbol name="checklist" size={20} color={iconColor} />
        </Pressable>
      </View>

      <View style={[styles.tabBar, { borderColor }]}>
        {(
          [
            { key: 'itinerary', label: 'Πρόγραμμα' },
            { key: 'map', label: 'Χάρτης' },
            { key: 'expenses', label: 'Έξοδα' },
            { key: 'info', label: 'Info' },
          ] as { key: TabKey; label: string }[]
        ).map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tabButton, tab === t.key && { borderBottomColor: ACCENT }]}
            onPress={() => setTab(t.key)}>
            <ThemedText style={tab === t.key ? { color: ACCENT, fontWeight: '700' } : { color: iconColor }}>
              {t.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {(tab === 'itinerary' || tab === 'map') && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayRow}>
          {days.map((d) => (
            <Pressable
              key={d.day}
              onPress={() => setSelectedDay(d.day)}
              style={[
                styles.dayChip,
                { borderColor },
                selectedDay === d.day && { backgroundColor: ACCENT, borderColor: ACCENT },
              ]}>
              <ThemedText style={selectedDay === d.day ? styles.dayChipTextActive : undefined}>
                Μέρα {d.day}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {tab === 'itinerary' && (
        <View style={styles.tabContent}>
          <ScrollView contentContainerStyle={styles.entryList}>
            {dayEntries.length === 0 ? (
              <ThemedText style={[styles.emptyText, { color: iconColor }]}>
                Δεν υπάρχουν καταχωρήσεις για αυτή τη μέρα.
              </ThemedText>
            ) : (
              dayEntries.map((entry) => (
                <Pressable
                  key={entry.id}
                  style={[styles.entryRow, { borderColor }]}
                  onPress={() => openEntryMenu(entry)}>
                  <ThemedText style={styles.entryIcon}>{ENTRY_ICON[entry.type]}</ThemedText>
                  <View style={styles.entryTextWrap}>
                    <View style={styles.entryTopRow}>
                      <ThemedText style={styles.entryTime}>{entry.time}</ThemedText>
                      <ThemedText style={styles.entryTitle} numberOfLines={1}>
                        {entry.title}
                      </ThemedText>
                    </View>
                    {entry.subtitle ? (
                      <ThemedText style={[styles.entrySubtitle, { color: iconColor }]} numberOfLines={1}>
                        {entry.subtitle}
                      </ThemedText>
                    ) : null}
                  </View>
                </Pressable>
              ))
            )}

            <Pressable style={[styles.addButton, { backgroundColor: ACCENT }]} onPress={openAddSheet}>
              <ThemedText style={styles.addButtonLabel}>+ Προσθήκη</ThemedText>
            </Pressable>
          </ScrollView>
        </View>
      )}

      {tab === 'map' && <TripMapView entries={dayEntries} />}

      {tab === 'expenses' && (
        <View style={styles.tabContent}>
          <View style={[styles.totalCard, { backgroundColor: ACCENT }]}>
            <ThemedText style={styles.totalLabel}>Σύνολο εξόδων</ThemedText>
            <ThemedText
              style={styles.totalAmount}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}>
              {formatMoney(total)}
            </ThemedText>
          </View>

          <ScrollView contentContainerStyle={styles.entryList}>
            {expenses.length === 0 ? (
              <ThemedText style={[styles.emptyText, { color: iconColor }]}>
                Δεν έχεις καταγράψει έξοδα ακόμα.
              </ThemedText>
            ) : (
              expenses.map((expense) => {
                const categoryInfo = getExpenseCategory(expense.category);
                return (
                  <Pressable
                    key={expense.id}
                    style={[styles.entryRow, { borderColor }]}
                    onPress={() => openExpenseMenu(expense)}>
                    <ThemedText style={styles.entryIcon}>{categoryInfo.icon}</ThemedText>
                    <View style={styles.entryTextWrap}>
                      <ThemedText style={styles.entryTitle} numberOfLines={1}>
                        {categoryInfo.label}
                      </ThemedText>
                      {expense.note ? (
                        <ThemedText style={[styles.entrySubtitle, { color: iconColor }]} numberOfLines={1}>
                          {expense.note}
                        </ThemedText>
                      ) : null}
                    </View>
                    <ThemedText style={styles.expenseAmount}>{formatMoney(expense.amount)}</ThemedText>
                  </Pressable>
                );
              })
            )}

            <Pressable style={[styles.addButton, { backgroundColor: ACCENT }]} onPress={openAddExpenseSheet}>
              <ThemedText style={styles.addButtonLabel}>+ Προσθήκη εξόδου</ThemedText>
            </Pressable>
          </ScrollView>
        </View>
      )}

      {tab === 'info' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.infoContent}>
          <TripWeatherWidget
            latitude={trip.destination_latitude}
            longitude={trip.destination_longitude}
            startDate={trip.start_date}
            endDate={trip.end_date}
          />
          <TripEmergencyCard countryCode={trip.destination_country_code} />
          <TripPhrasebookCard countryCode={trip.destination_country_code} />
        </ScrollView>
      )}

      <AddItineraryEntrySheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        days={days}
        defaultDay={selectedDay}
        editingEntry={editingEntry}
        onSubmit={handleSubmitEntry}
      />

      <AddExpenseSheet
        visible={expenseSheetVisible}
        onClose={() => setExpenseSheetVisible(false)}
        editingItem={editingExpense}
        onSubmit={handleSubmitExpense}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  dateRange: {
    marginTop: 4,
    fontSize: 14,
  },
  countdown: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
  },
  checklistButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabContent: {
    flex: 1,
  },
  dayRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 0,
  },
  dayChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  dayChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  entryList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },
  infoContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  entryIcon: {
    fontSize: 22,
  },
  entryTextWrap: {
    flex: 1,
  },
  entryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryTime: {
    fontWeight: '700',
    fontSize: 13,
  },
  entryTitle: {
    flex: 1,
    fontWeight: '600',
  },
  entrySubtitle: {
    marginTop: 2,
    fontSize: 13,
  },
  addButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonLabel: {
    color: '#fff',
    fontWeight: '700',
  },
  totalCard: {
    margin: 16,
    marginBottom: 4,
    padding: 16,
    borderRadius: 14,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  totalAmount: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    marginTop: 4,
  },
  expenseAmount: {
    fontWeight: '700',
  },
});
