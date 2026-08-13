import { Button, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  DURATION_OPTIONS,
  SEASON_OPTIONS,
  TAG_OPTIONS,
  type DestinationTag,
  type DurationBucket,
  type Season,
} from '@/constants/destinations';
import { STATUS_COLORS } from '@/constants/travel-status';
import { useThemeColor } from '@/hooks/use-theme-color';

const CHIP_COLOR = STATUS_COLORS.wish;

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedTags: Set<DestinationTag>;
  selectedSeasons: Set<Season>;
  selectedDurations: Set<DurationBucket>;
  onToggleTag: (tag: DestinationTag) => void;
  onToggleSeason: (season: Season) => void;
  onToggleDuration: (duration: DurationBucket) => void;
  onClear: () => void;
};

export function DestinationFiltersSheet({
  visible,
  onClose,
  selectedTags,
  selectedSeasons,
  selectedDurations,
  onToggleTag,
  onToggleSeason,
  onToggleDuration,
  onClear,
}: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor }]}>
          <View style={styles.header}>
            <ThemedText type="subtitle">Φίλτρα</ThemedText>
            <Pressable onPress={onClose} hitSlop={10}>
              <ThemedText style={styles.closeLabel}>Κλείσιμο</ThemedText>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <ThemedText style={styles.sectionTitle}>Τύπος</ThemedText>
            <View style={styles.chipsWrap}>
              {TAG_OPTIONS.map((option) => {
                const selected = selectedTags.has(option.tag);
                return (
                  <Pressable
                    key={option.tag}
                    onPress={() => onToggleTag(option.tag)}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? CHIP_COLOR : borderColor,
                        backgroundColor: selected ? CHIP_COLOR : 'transparent',
                      },
                    ]}>
                    <ThemedText style={selected ? styles.chipLabelSelected : undefined}>
                      {option.emoji} {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <ThemedText style={styles.sectionTitle}>Εποχή</ThemedText>
            <View style={styles.chipsWrap}>
              {SEASON_OPTIONS.map((option) => {
                const selected = selectedSeasons.has(option.season);
                return (
                  <Pressable
                    key={option.season}
                    onPress={() => onToggleSeason(option.season)}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? CHIP_COLOR : borderColor,
                        backgroundColor: selected ? CHIP_COLOR : 'transparent',
                      },
                    ]}>
                    <ThemedText style={selected ? styles.chipLabelSelected : undefined}>
                      {option.emoji} {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <ThemedText style={styles.sectionTitle}>Διάρκεια</ThemedText>
            <View style={styles.chipsWrap}>
              {DURATION_OPTIONS.map((option) => {
                const selected = selectedDurations.has(option.duration);
                return (
                  <Pressable
                    key={option.duration}
                    onPress={() => onToggleDuration(option.duration)}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? CHIP_COLOR : borderColor,
                        backgroundColor: selected ? CHIP_COLOR : 'transparent',
                      },
                    ]}>
                    <ThemedText style={selected ? styles.chipLabelSelected : undefined}>
                      {option.emoji} {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Button title="Καθαρισμός φίλτρων" onPress={onClear} />
            <Button title="Εφαρμογή" onPress={onClose} />
          </View>
        </View>
      </View>
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
    maxHeight: '80%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  closeLabel: {
    opacity: 0.6,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipLabelSelected: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
