import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { COUNTRY_LANGUAGES } from '@/assets/data/country-languages';
import { PHRASEBOOK } from '@/constants/phrasebook';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  countryCode: string | null;
};

export function TripPhrasebookCard({ countryCode }: Props) {
  const borderColor = useThemeColor({}, 'icon');
  const iconColor = useThemeColor({}, 'icon');

  const languageCode = countryCode ? COUNTRY_LANGUAGES[countryCode] : undefined;
  const phrasebook = languageCode ? PHRASEBOOK[languageCode] : undefined;

  return (
    <View>
      <ThemedText style={styles.sectionTitle}>
        Βασικές φράσεις{phrasebook ? ` · ${phrasebook.languageName}` : ''}
      </ThemedText>

      <View style={[styles.card, { borderColor }]}>
        {phrasebook ? (
          phrasebook.phrases.map((phrase) => (
            <View key={phrase.greek} style={[styles.row, { borderColor }]}>
              <ThemedText style={[styles.greek, { color: iconColor }]}>{phrase.greek}</ThemedText>
              <ThemedText style={styles.local}>{phrase.local}</ThemedText>
            </View>
          ))
        ) : (
          <ThemedText style={[styles.note, { color: iconColor }]}>
            {countryCode
              ? 'Δεν έχουμε ακόμα φράσεις για τη γλώσσα αυτού του προορισμού.'
              : 'Δεν ξέρουμε τη χώρα προορισμού. Επεξεργάσου το ταξίδι και επίλεξε τον προορισμό από τη λίστα αυτόματης συμπλήρωσης.'}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  greek: {
    fontSize: 14,
  },
  local: {
    fontSize: 15,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    padding: 12,
  },
});
