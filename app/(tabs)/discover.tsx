import { useCallback, useMemo, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { UN_COUNTRIES, type CountryInfo } from '@/assets/data/countries';
import { showAlert } from '@/components/app-alert';
import { FullMapModal } from '@/components/full-map-modal';
import { StatDonut } from '@/components/stat-donut';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WorldMap } from '@/components/world-map';
import { STATUS_COLORS } from '@/constants/travel-status';
import { applyCompletedTripsToBeen } from '@/database/auto-been';
import { useCountryStatus } from '@/hooks/use-country-status';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { CountryStatusKind } from '@/types/country-status';
import { groupCountriesByRegion } from '@/utils/group-countries-by-region';

const TOTAL_COUNTRIES = UN_COUNTRIES.length;
const COUNTRY_BY_CODE = new Map(UN_COUNTRIES.map((country) => [country.code, country]));

// παίρνει τους κωδικούς χωρών (been/wish) και τους γυρνάει σε πλήρη αντικείμενα χώρας
function toCountryList(codes: Set<string>): CountryInfo[] {
  return Array.from(codes)
    .map((code) => COUNTRY_BY_CODE.get(code))
    .filter((country): country is CountryInfo => Boolean(country));
}

// αυτή είναι η οθόνη Discover - έχει 2 σελίδες (been/wish) με χάρτη του κόσμου,
// στατιστικά πόσο τοις εκατό έχω καλύψει, και λίστα με τις χώρες ανά περιοχή
// από εδώ προσθέτω χώρα, τη μετακινώ been<->wish, τη σβήνω, ή βλέπω τον χάρτη σε fullscreen
export default function DiscoverScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { been, wish, refresh, addStatus, removeStatus } = useCountryStatus();
  const [page, setPage] = useState(0);
  const [fullscreenKey, setFullscreenKey] = useState<CountryStatusKind | null>(null);

  const borderColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');

  // κάθε φορά που μπαίνω στην οθόνη: κοιτάει αν κάποιο ταξίδι έχει τελειώσει
  // (έχει περάσει η ημερομηνία) και αν ναι το προσθέτει μόνο του στο been,
  // μετά ξαναφέρνει τα been/wish από τη βάση
  useFocusEffect(
    useCallback(() => {
      (async () => {
        await applyCompletedTripsToBeen();
        await refresh();
      })();
    }, [refresh])
  );

  const beenSections = useMemo(() => groupCountriesByRegion(toCountryList(been)), [been]);
  const wishSections = useMemo(() => groupCountriesByRegion(toCountryList(wish)), [wish]);

  // βλέπει σε ποια σελίδα είμαι (been=0, wish=1) μετά το scroll,
  // απλά στρογγυλοποιεί τη θέση με βάση το πλάτος της οθόνης
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextPage = Math.round(event.nativeEvent.contentOffset.x / width);
    setPage(nextPage);
  };

  // ανοίγει το menu για μια χώρα - μπορείς να την πας στην άλλη λίστα (been<->wish) ή να τη σβήσεις εντελώς
  const openCountryMenu = (country: CountryInfo, status: CountryStatusKind) => {
    const otherStatus: CountryStatusKind = status === 'been' ? 'wish' : 'been';
    showAlert(`${country.flag} ${country.name}`, undefined, [
      {
        text: status === 'been' ? 'Μετακίνηση στα Wish' : 'Μετακίνηση στα Been',
        onPress: async () => {
          await removeStatus(country.code, status);
          await addStatus(country.code, otherStatus);
        },
      },
      {
        text: 'Αφαίρεση από τη λίστα',
        style: 'destructive',
        onPress: () => removeStatus(country.code, status),
      },
      { text: 'Άκυρο', style: 'cancel' },
    ]);
  };

  const pages = [
    { key: 'been' as const, label: 'been', color: STATUS_COLORS.been, codes: been, sections: beenSections },
    { key: 'wish' as const, label: 'wish', color: STATUS_COLORS.wish, codes: wish, sections: wishSections },
  ];

  // ποια σελίδα (been ή wish) δείχνουμε στο fullscreen modal, αν έχει ανοίξει κάποιο
  const fullscreenEntry = pages.find((entry) => entry.key === fullscreenKey);

  return (
    <ThemedView style={styles.container}>
      <Pressable
        style={[styles.addButton, { borderColor }]}
        onPress={() => router.push('/add-country')}
        hitSlop={8}>
        <IconSymbol name="plus" size={22} color={textColor} />
      </Pressable>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}>
        {pages.map((entry) => {
          // πόσο τοις εκατό των χωρών του κόσμου καλύπτει αυτή η λίστα
          const percent = TOTAL_COUNTRIES > 0 ? (entry.codes.size / TOTAL_COUNTRIES) * 100 : 0;
          return (
            <ScrollView key={entry.key} style={{ width }} contentContainerStyle={styles.page}>
              <ThemedText style={[styles.pageTitle, { color: entry.color }]}>{entry.label}</ThemedText>

              <Pressable style={styles.mapWrapper} onPress={() => setFullscreenKey(entry.key)}>
                <WorldMap highlightedCodes={entry.codes} highlightColor={entry.color} />
              </Pressable>

              <View style={styles.dots}>
                {pages.map((dotEntry, index) => (
                  <View
                    key={dotEntry.key}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: index === page ? entry.color : borderColor,
                        opacity: index === page ? 1 : 0.4,
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={[styles.statsCard, { borderColor }]}>
                <View style={styles.statsHeader}>
                  <ThemedText style={styles.statsTitle}>In Total</ThemedText>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statsColumn}>
                    <ThemedText style={[styles.statsNumber, { color: entry.color }]}>
                      {Math.round(percent)}%
                    </ThemedText>
                    <ThemedText style={styles.statsLabel}>World</ThemedText>
                  </View>

                  <StatDonut percent={percent} color={entry.color} />

                  <View style={styles.statsColumn}>
                    <ThemedText style={[styles.statsNumber, { color: entry.color }]}>
                      {entry.codes.size}
                    </ThemedText>
                    <ThemedText style={styles.statsLabel}>Countries</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.statsFooter}>Out of {TOTAL_COUNTRIES} UN Countries</ThemedText>
              </View>

              <View style={styles.listSection}>
                {entry.sections.length === 0 ? (
                  <ThemedText style={styles.emptyText}>Δεν έχεις προσθέσει ακόμα χώρες.</ThemedText>
                ) : (
                  entry.sections.map((section) => (
                    <View key={section.title}>
                      <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
                      {section.data.map((country) => (
                        <Pressable
                          key={country.code}
                          style={[styles.row, { borderColor }]}
                          onPress={() => openCountryMenu(country, entry.key)}>
                          <ThemedText style={styles.flag}>{country.flag}</ThemedText>
                          <ThemedText style={styles.rowLabel}>{country.name}</ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          );
        })}
      </ScrollView>

      <FullMapModal
        visible={fullscreenEntry !== undefined}
        onClose={() => setFullscreenKey(null)}
        highlightedCodes={fullscreenEntry?.codes ?? EMPTY_SET}
        highlightColor={fullscreenEntry?.color ?? STATUS_COLORS.been}
      />
    </ThemedView>
  );
}

const EMPTY_SET: Set<string> = new Set();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  addButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  page: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: '300',
    marginTop: 4,
    marginBottom: 12,
  },
  mapWrapper: {
    height: 220,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statsCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  statsHeader: {
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statsColumn: {
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 26,
    fontWeight: '700',
  },
  statsLabel: {
    marginTop: 2,
    opacity: 0.6,
  },
  statsFooter: {
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.5,
    fontSize: 12,
  },
  listSection: {
    marginTop: 24,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.6,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  flag: {
    fontSize: 22,
  },
  rowLabel: {
    flex: 1,
  },
});
