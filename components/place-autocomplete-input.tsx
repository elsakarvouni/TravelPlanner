import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { usePlaceSearch, type PlaceSuggestion } from '@/hooks/use-place-search';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSelectPlace?: (place: PlaceSuggestion) => void;
  onFocus?: () => void;
  placeholder?: string;
};

export function PlaceAutocompleteInput({ value, onChangeText, onSelectPlace, onFocus, placeholder }: Props) {
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
    <View style={styles.wrapper}>
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setShowSuggestions(true);
        }}
        onFocus={() => {
          setShowSuggestions(true);
          onFocus?.();
        }}
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
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {results.map((item) => (
              <Pressable key={item.id} style={styles.suggestionRow} onPress={() => handleSelect(item)}>
                <ThemedText>{item.label}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    overflow: 'hidden',
    zIndex: 20,
    elevation: 6,
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
