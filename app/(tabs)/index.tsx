import { useCallback } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTrips } from '@/hooks/use-trips';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Trip } from '@/types/trip';
import { getTripCountdownLabel } from '@/utils/trip-countdown';
import { getTripCoverImage } from '@/utils/trip-cover-image';
import { STATUS_COLORS } from '@/constants/travel-status';

const ACCENT_COLOR = STATUS_COLORS.wish;

export default function HomeScreen() {
  const router = useRouter();
  const { trips, loading, refresh, deleteTrip } = useTrips();
  const borderColor = useThemeColor({}, 'icon');
  const cardBackground = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const openTripMenu = (trip: Trip) => {
    Alert.alert(trip.title, undefined, [
      {
        text: 'Επεξεργασία ταξιδιού',
        onPress: () => router.push({ pathname: '/edit-trip/[id]', params: { id: String(trip.id) } }),
      },
      {
        text: 'Διαγραφή ταξιδιού',
        style: 'destructive',
        onPress: () => deleteTrip(trip.id),
      },
      { text: 'Άκυρο', style: 'cancel' },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title">Τα ταξίδια μου</ThemedText>
          {trips.length > 0 && (
            <ThemedText style={[styles.headerSubtitle, { color: iconColor }]}>
              {trips.length} {trips.length === 1 ? 'προγραμματισμένο ταξίδι' : 'προγραμματισμένα ταξίδια'}
            </ThemedText>
          )}
        </View>
        <Pressable style={[styles.newTripButton, { backgroundColor: ACCENT_COLOR }]} onPress={() => router.push('/add-trip')}>
          <IconSymbol name="plus" size={16} color="#fff" />
          <ThemedText style={styles.newTripButtonLabel}>Νέο ταξίδι</ThemedText>
        </Pressable>
      </View>

      {!loading && trips.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconCircle, { borderColor }]}>
            <IconSymbol name="paperplane.fill" size={32} color={iconColor} />
          </View>
          <ThemedText style={styles.emptyTitle}>Δεν έχεις ταξίδια ακόμα</ThemedText>
          <ThemedText style={[styles.emptyText, { color: iconColor }]}>
            Πρόσθεσε το πρώτο σου ταξίδι και ξεκίνα να μετράς αντίστροφα.
          </ThemedText>
          <Pressable style={[styles.emptyButton, { backgroundColor: ACCENT_COLOR }]} onPress={() => router.push('/add-trip')}>
            <ThemedText style={styles.newTripButtonLabel}>+ Νέο ταξίδι</ThemedText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={refresh}
          renderItem={({ item }) => {
            const coverImage = getTripCoverImage(item);
            return (
              <Pressable
                style={[styles.card, { borderColor, backgroundColor: cardBackground }]}
                onPress={() => router.push({ pathname: '/trip/[id]', params: { id: String(item.id) } })}>
                <View style={styles.coverWrapper}>
                  {coverImage ? (
                    <Image source={{ uri: coverImage }} style={styles.coverImage} contentFit="cover" />
                  ) : (
                    <View style={[styles.coverPlaceholder, { backgroundColor: ACCENT_COLOR }]}>
                      <IconSymbol name="paperplane.fill" size={28} color="rgba(255,255,255,0.85)" />
                    </View>
                  )}

                  <View style={styles.coverOverlay} />

                  <View style={styles.countdownBadge}>
                    <ThemedText style={styles.countdownBadgeText}>
                      {getTripCountdownLabel(item.start_date, item.end_date)}
                    </ThemedText>
                  </View>

                  <Pressable style={styles.menuButton} onPress={() => openTripMenu(item)} hitSlop={10}>
                    <ThemedText style={styles.menuDots}>•••</ThemedText>
                  </Pressable>

                  <View style={styles.coverTitleWrap}>
                    <ThemedText style={styles.coverTitle} numberOfLines={1}>
                      {item.title}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardRow}>
                    <IconSymbol name="paperplane.fill" size={14} color={iconColor} />
                    <ThemedText style={[styles.cardRowText, { color: textColor }]} numberOfLines={1}>
                      {item.destination}
                    </ThemedText>
                  </View>
                  <View style={styles.cardRow}>
                    <IconSymbol name="chevron.right" size={14} color={iconColor} />
                    <ThemedText style={[styles.cardRowText, { color: iconColor }]}>
                      {item.start_date} → {item.end_date}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
  },
  newTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  newTripButtonLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
    gap: 8,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 12,
    maxWidth: 260,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  listContent: {
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  coverWrapper: {
    height: 140,
    justifyContent: 'flex-end',
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  coverPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  countdownBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: ACCENT_COLOR,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countdownBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDots: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  coverTitleWrap: {
    padding: 12,
  },
  coverTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
  },
  cardBody: {
    padding: 12,
    gap: 6,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardRowText: {
    fontSize: 13,
    flex: 1,
  },
});
