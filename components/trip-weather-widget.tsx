import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTripWeather } from '@/hooks/use-trip-weather';
import { getWeatherEmoji } from '@/utils/weather';

type Props = {
  latitude: number | null;
  longitude: number | null;
  startDate: string;
  endDate: string;
};

export function TripWeatherWidget({ latitude, longitude, startDate, endDate }: Props) {
  const { weather, loading } = useTripWeather(latitude, longitude, startDate, endDate);
  const borderColor = useThemeColor({}, 'icon');
  const iconColor = useThemeColor({}, 'icon');

  if (latitude == null || longitude == null) {
    return (
      <View style={styles.container}>
        <ThemedText style={[styles.emptyText, { color: iconColor }]}>
          Δεν έχουμε συντεταγμένες για τον προορισμό αυτού του ταξιδιού. Επεξεργάσου το ταξίδι και επίλεξε ξανά
          τον προορισμό από τη λίστα αυτόματης συμπλήρωσης για να δεις καιρό και ώρες ανατολής/δύσης.
        </ThemedText>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={iconColor} />
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.container}>
        <ThemedText style={[styles.emptyText, { color: iconColor }]}>
          Δεν βρέθηκαν δεδομένα καιρού για αυτόν τον προορισμό.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderColor }]}>
        <ThemedText style={styles.emoji}>{getWeatherEmoji(weather.weatherCode)}</ThemedText>
        <ThemedText style={styles.temps}>
          {Math.round(weather.avgHigh)}° / {Math.round(weather.avgLow)}°
        </ThemedText>
        <ThemedText style={[styles.caption, { color: iconColor }]}>
          {weather.source === 'forecast'
            ? `Πρόγνωση καιρού · ${Math.round(weather.precipitationChance)}% πιθανότητα βροχής`
            : `Μέσος καιρός προηγούμενων ετών · ${Math.round(weather.precipitationChance)}% πιθανότητα βροχής`}
        </ThemedText>
      </View>

      {(weather.sunrise || weather.sunset) && (
        <View style={[styles.sunRow, { borderColor }]}>
          <View style={styles.sunItem}>
            <ThemedText style={styles.sunEmoji}>🌅</ThemedText>
            <View>
              <ThemedText style={[styles.sunLabel, { color: iconColor }]}>Ανατολή</ThemedText>
              <ThemedText style={styles.sunTime}>{weather.sunrise ?? '—'}</ThemedText>
            </View>
          </View>
          <View style={styles.sunItem}>
            <ThemedText style={styles.sunEmoji}>🌇</ThemedText>
            <View>
              <ThemedText style={[styles.sunLabel, { color: iconColor }]}>Δύση</ThemedText>
              <ThemedText style={styles.sunTime}>{weather.sunset ?? '—'}</ThemedText>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
  card: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    gap: 4,
  },
  emoji: {
    fontSize: 44,
  },
  temps: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },
  caption: {
    fontSize: 13,
    textAlign: 'center',
  },
  sunRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  sunItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sunEmoji: {
    fontSize: 26,
  },
  sunLabel: {
    fontSize: 12,
  },
  sunTime: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 1,
  },
});
