import { useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, TextInput, View } from 'react-native';

import { UN_COUNTRIES, type CountryInfo } from '@/assets/data/countries';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { STATUS_COLORS } from '@/constants/travel-status';
import { useCountryStatus } from '@/hooks/use-country-status';
import { useThemeColor } from '@/hooks/use-theme-color';
import { groupCountriesByRegion } from '@/utils/group-countries-by-region';

export default function AddCountryScreen() {
  const { been, wish, addStatus } = useCountryStatus();
  const [query, setQuery] = useState('');

  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'icon');

  const sections = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const filtered = trimmed
      ? UN_COUNTRIES.filter((country) => country.name.toLowerCase().includes(trimmed))
      : UN_COUNTRIES;

    return groupCountriesByRegion(filtered);
  }, [query]);

  const handleSelect = (country: CountryInfo) => {
    Alert.alert(`${country.flag} ${country.name}`, 'Πρόσθεσέ το στη λίστα', [
      { text: 'Been', onPress: () => addStatus(country.code, 'been') },
      { text: 'Wish', onPress: () => addStatus(country.code, 'wish') },
      { text: 'Άκυρο', style: 'cancel' },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <TextInput
        style={[styles.search, { color: textColor, borderColor }]}
        value={query}
        onChangeText={setQuery}
        placeholder="Αναζήτηση χώρας"
        placeholderTextColor={placeholderColor}
        autoCapitalize="none"
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.code}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        renderSectionHeader={({ section }) => (
          <ThemedView style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
          </ThemedView>
        )}
        renderItem={({ item }) => {
          const isBeen = been.has(item.code);
          const isWish = wish.has(item.code);
          return (
            <Pressable style={[styles.row, { borderColor }]} onPress={() => handleSelect(item)}>
              <ThemedText style={styles.flag}>{item.flag}</ThemedText>
              <ThemedText style={styles.rowLabel}>{item.name}</ThemedText>
              {isBeen && <View style={[styles.badge, { backgroundColor: STATUS_COLORS.been }]} />}
              {isWish && <View style={[styles.badge, { backgroundColor: STATUS_COLORS.wish }]} />}
            </Pressable>
          );
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  search: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  sectionHeader: {
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.6,
    textTransform: 'uppercase',
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
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
});
