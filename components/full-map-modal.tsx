import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { WorldMap } from '@/components/world-map';
import { Zoomable } from '@/components/zoomable';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  visible: boolean;
  onClose: () => void;
  highlightedCodes: Set<string>;
  highlightColor: string;
};

// fullscreen modal με τον παγκόσμιο χάρτη, zoomable, με τις χώρες που έχεις επισκεφτεί highlighted
export function FullMapModal({ visible, onClose, highlightedCodes, highlightColor }: Props) {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  // όσο είναι ανοιχτό το modal κλειδώνουμε σε landscape (πιο βολικό για χάρτη), και το ξανακλειδώνουμε portrait όταν κλείνει
  useEffect(() => {
    if (!visible) return;

    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
      onRequestClose={onClose}>
      <GestureHandlerRootView style={[styles.container, { backgroundColor }]}>
        <Pressable
          style={[
            styles.closeButton,
            { top: insets.top + 8, right: insets.right + 16, borderColor },
          ]}
          onPress={onClose}
          hitSlop={10}>
          <IconSymbol name="xmark" size={20} color={textColor} />
        </Pressable>

        <View
          style={[
            styles.mapWrapper,
            { paddingLeft: insets.left + 24, paddingRight: insets.right + 24 },
          ]}>
          <Zoomable>
            <WorldMap highlightedCodes={highlightedCodes} highlightColor={highlightColor} />
          </Zoomable>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapWrapper: {
    flex: 1,
    width: '100%',
  },
});
