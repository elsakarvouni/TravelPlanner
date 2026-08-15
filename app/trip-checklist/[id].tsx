import { useEffect, useState } from 'react';
import { Alert, Keyboard, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { STATUS_COLORS } from '@/constants/travel-status';
import { useChecklist } from '@/hooks/use-checklist';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ChecklistItem } from '@/types/checklist';

const ACCENT = STATUS_COLORS.wish;

// hook που κρατάει το ύψος του πληκτρολογίου, για να σηκώνεται το input πάνω από αυτό
// στο iOS χρησιμοποιεί τα "will" events, στο Android τα "did" γιατί δεν έχει pre-animation events
function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => setHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}

// modal με τη λίστα αποσκευών για ένα ταξίδι - προσθέτεις πράγματα, τα τσεκάρεις,
// τα μετονομάζεις (μόνο σε iOS, με Alert.prompt) ή τα σβήνεις με long-press
export default function TripChecklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = Number(id);

  const { items, addItem, toggleItem, updateItemLabel, deleteItem } = useChecklist(tripId);
  const [newLabel, setNewLabel] = useState('');
  const keyboardHeight = useKeyboardHeight();
  const insets = useSafeAreaInsets();

  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');

  // προσθέτει νέο αντικείμενο στη λίστα, αν είναι κενό δεν κάνει τίποτα, και καθαρίζει το input
  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    addItem(label);
    setNewLabel('');
  };

  // menu όταν κάνεις long press σε ένα αντικείμενο. η μετονομασία δείχνεται μόνο σε iOS
  // γιατί το Alert.prompt δεν δουλεύει στο Android
  const handleLongPress = (item: ChecklistItem) => {
    const options: Parameters<typeof Alert.alert>[2] = [];

    if (Platform.OS === 'ios') {
      options.push({
        text: 'Μετονομασία',
        onPress: () => {
          Alert.prompt(
            'Μετονομασία',
            undefined,
            (text) => {
              if (text && text.trim()) updateItemLabel(item.id, text.trim());
            },
            'plain-text',
            item.label
          );
        },
      });
    }

    options.push(
      { text: 'Διαγραφή', style: 'destructive', onPress: () => deleteItem(item.id) },
      { text: 'Άκυρο', style: 'cancel' }
    );

    Alert.alert(item.label, undefined, options);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {items.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: placeholderColor }]}>
            Πρόσθεσε ό,τι χρειάζεται να θυμάσαι για τις αποσκευές σου.
          </ThemedText>
        ) : (
          items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => toggleItem(item.id, !item.is_checked)}
              onLongPress={() => handleLongPress(item)}>
              <IconSymbol
                name={item.is_checked ? 'checkmark.circle.fill' : 'circle'}
                size={24}
                color={item.is_checked ? ACCENT : placeholderColor}
              />
              <ThemedText style={styles.rowLabel}>{item.label}</ThemedText>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* όταν είναι ανοιχτό το πληκτρολόγιο δεν χρειάζεται το extra padding κάτω,
          αφού το πληκτρολόγιο καλύπτει ήδη εκείνο το κομμάτι */}
      <View
        style={[
          styles.inputRow,
          { borderColor, backgroundColor, paddingBottom: keyboardHeight > 0 ? 12 : insets.bottom + 12 },
        ]}>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={newLabel}
          onChangeText={setNewLabel}
          placeholder="Νέο αντικείμενο..."
          placeholderTextColor={placeholderColor}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable style={[styles.addButton, { backgroundColor: ACCENT }]} onPress={handleAdd}>
          <IconSymbol name="plus" size={18} color="#fff" />
        </Pressable>
      </View>

      {/* αυτό είναι απλά ένα spacer για να μη κρύβεται το περιεχόμενο πίσω από το πληκτρολόγιο */}
      {keyboardHeight > 0 && <View style={{ height: keyboardHeight }} />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollFlex: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 16,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
