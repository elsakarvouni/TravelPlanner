import { useEffect, useState } from 'react';
import {
  Button,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EXPENSE_CATEGORIES, type ExpenseCategoryKey } from '@/constants/budget-categories';
import { STATUS_COLORS } from '@/constants/travel-status';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { BudgetItem, NewBudgetItem } from '@/types/budget';

const ACCENT = STATUS_COLORS.wish;
const KNOWN_KEYS = new Set(EXPENSE_CATEGORIES.map((c) => c.key));

type Props = {
  visible: boolean;
  onClose: () => void;
  editingItem?: BudgetItem | null;
  onSubmit: (item: NewBudgetItem) => Promise<void>;
};

export function AddExpenseSheet({ visible, onClose, editingItem, onSubmit }: Props) {
  const [category, setCategory] = useState<ExpenseCategoryKey>('other');
  const [customLabel, setCustomLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    if (!visible) return;

    if (editingItem) {
      const isKnown = KNOWN_KEYS.has(editingItem.category as ExpenseCategoryKey);
      setCategory(isKnown ? (editingItem.category as ExpenseCategoryKey) : 'other');
      setCustomLabel(isKnown ? '' : editingItem.category);
      setAmount(String(editingItem.amount));
      setNote(editingItem.note ?? '');
    } else {
      setCategory('other');
      setCustomLabel('');
      setAmount('');
      setNote('');
    }
  }, [visible, editingItem]);

  const parsedAmount = Number(amount.replace(',', '.'));
  const isValid = amount.trim().length > 0 && !Number.isNaN(parsedAmount) && parsedAmount > 0;

  const handleSave = async () => {
    if (!isValid) return;

    setSaving(true);
    try {
      await onSubmit({
        category: category === 'other' && customLabel.trim() ? customLabel.trim() : category,
        amount: parsedAmount,
        note: note.trim() || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { backgroundColor }]}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <ThemedText style={styles.heading}>{editingItem ? 'Επεξεργασία εξόδου' : 'Νέο έξοδο'}</ThemedText>

            <ThemedText style={styles.label}>Κατηγορία</ThemedText>
            <View style={styles.categoryGrid}>
              {EXPENSE_CATEGORIES.map((c) => (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  style={[
                    styles.categoryChip,
                    { borderColor },
                    category === c.key && { backgroundColor: ACCENT, borderColor: ACCENT },
                  ]}>
                  <ThemedText style={styles.categoryIcon}>{c.icon}</ThemedText>
                  <ThemedText style={category === c.key ? styles.categoryLabelActive : undefined}>
                    {c.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {category === 'other' && (
              <>
                <ThemedText style={styles.label}>Όνομα κατηγορίας</ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor }]}
                  value={customLabel}
                  onChangeText={setCustomLabel}
                  placeholder="π.χ. Ενοικίαση αυτοκινήτου"
                  placeholderTextColor={placeholderColor}
                />
              </>
            )}

            <ThemedText style={styles.label}>Ποσό (€)</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="π.χ. 25.50"
              placeholderTextColor={placeholderColor}
              keyboardType="decimal-pad"
            />

            <ThemedText style={styles.label}>Σημείωση</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              value={note}
              onChangeText={setNote}
              placeholder="Προαιρετική σημείωση"
              placeholderTextColor={placeholderColor}
            />

            <View style={styles.actions}>
              <Button title="Άκυρο" onPress={onClose} />
              <Button
                title={saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
                onPress={handleSave}
                disabled={saving || !isValid}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
