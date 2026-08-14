import { useMemo, useState } from 'react';
import { Button, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

import { ThemedText } from '@/components/themed-text';
import { STATUS_COLORS } from '@/constants/travel-status';
import { useThemeColor } from '@/hooks/use-theme-color';

const RANGE_COLOR = STATUS_COLORS.wish;

type Props = {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
};

export function DateRangeField({ startDate, endDate, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);

  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const openPicker = () => {
    setDraftStart(startDate);
    setDraftEnd(endDate);
    setVisible(true);
  };

  const handleDayPress = (day: DateData) => {
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(day.dateString);
      setDraftEnd('');
      return;
    }

    if (day.dateString < draftStart) {
      setDraftStart(day.dateString);
      setDraftEnd('');
      return;
    }

    setDraftEnd(day.dateString);
  };

  const markedDates = useMemo(() => {
    if (!draftStart) return {};

    if (!draftEnd) {
      return {
        [draftStart]: { startingDay: true, endingDay: true, color: RANGE_COLOR, textColor: '#fff' },
      };
    }

    const days = eachDayOfInterval({ start: parseISO(draftStart), end: parseISO(draftEnd) });
    const marks: Record<string, any> = {};
    days.forEach((day, index) => {
      const dateString = format(day, 'yyyy-MM-dd');
      marks[dateString] = {
        color: RANGE_COLOR,
        textColor: '#fff',
        startingDay: index === 0,
        endingDay: index === days.length - 1,
      };
    });
    return marks;
  }, [draftStart, draftEnd]);

  const handleConfirm = () => {
    if (draftStart && draftEnd) {
      onChange(draftStart, draftEnd);
      setVisible(false);
    }
  };

  const label =
    startDate && endDate ? `${startDate} → ${endDate}` : 'Επίλεξε ημερομηνίες ταξιδιού';

  return (
    <>
      <Pressable onPress={openPicker} style={[styles.field, { borderColor }]}>
        <ThemedText style={!startDate ? { color: placeholderColor } : undefined}>{label}</ThemedText>
      </Pressable>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor }]}>
            <Calendar
              minDate={format(new Date(), 'yyyy-MM-dd')}
              markingType="period"
              markedDates={markedDates}
              onDayPress={handleDayPress}
              theme={{
                calendarBackground: backgroundColor,
                dayTextColor: textColor,
                monthTextColor: textColor,
                arrowColor: tintColor,
                todayTextColor: tintColor,
                textDisabledColor: placeholderColor,
              }}
            />
            <View style={styles.actions}>
              <Button title="Άκυρο" onPress={() => setVisible(false)} />
              <Button title="Επιβεβαίωση" onPress={handleConfirm} disabled={!draftStart || !draftEnd} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
