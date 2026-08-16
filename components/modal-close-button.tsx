import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

// κουμπί κλεισίματος πάνω αριστερά για modal-presented οθόνες (add-trip, edit-trip, add-country,
// trip-checklist). Στο native υπάρχει ήδη swipe-down-to-dismiss, αλλά αυτή η χειρονομία δεν υπάρχει
// καθόλου στο web - χωρίς ρητό κουμπί ο χρήστης έμενε κολλημένος στην οθόνη σε PWA/browser, χωρίς
// κανέναν τρόπο να γυρίσει πίσω.
export function ModalCloseButton() {
  const router = useRouter();
  const color = useThemeColor({}, 'text');

  return (
    <Pressable onPress={() => router.back()} hitSlop={12} style={{ padding: 4 }}>
      <IconSymbol name="xmark" size={22} color={color} />
    </Pressable>
  );
}
