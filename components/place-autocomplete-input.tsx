import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { usePlaceSearch, type PlaceSuggestion } from '@/hooks/use-place-search';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSelectPlace?: (place: PlaceSuggestion) => void;
  placeholder?: string;
};

export function PlaceAutocompleteInput({ value, onChangeText, onSelectPlace, placeholder }: Props) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { results, loading } = usePlaceSearch(showSuggestions ? value : '');

  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');

  const handleSelect = (place: PlaceSuggestion) => {
    onChangeText(place.label);
    onSelectPlace?.(place);
    setShowSuggestions(false);
  };

  return (
    <View>
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
      />

      {showSuggestions && (loading || results.length > 0) && (
        <View style={[styles.dropdown, { borderColor, backgroundColor }]}>
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" />
            </View>
          )}
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable style={styles.suggestionRow} onPress={() => handleSelect(item)}>
                <ThemedText>{item.label}</ThemedText>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    overflow: 'hidden',
  },
  loadingRow: {
    padding: 10,
  },
  suggestionRow: {
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8888',
  },
});
