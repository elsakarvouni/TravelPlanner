import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 6;

// wrapper που κάνει pinch-to-zoom + pan + double tap zoom σε ό,τι βάλεις μέσα του (π.χ. τον world map)
export function Zoomable({ children }: PropsWithChildren) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // γυρνάει τα πάντα πίσω στην αρχική θέση/zoom με ωραίο animation
  const reset = () => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  // pinch με τα δύο δάχτυλα - κρατάμε το scale μέσα στα όρια MIN_SCALE/MAX_SCALE
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const next = savedScale.value * event.scale;
      scale.value = Math.min(Math.max(next, MIN_SCALE), MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // αν επέστρεψε στο κανονικό μέγεθος, καθάρισε και το pan ώστε να μη μείνει μετατοπισμένο
      if (scale.value <= MIN_SCALE) {
        reset();
      }
    });

  // σέρνει τον χάρτη γύρω - αλλά μόνο όταν είμαστε ήδη zoomed in, αλλιώς δεν έχει νόημα να σέρνεις
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value <= MIN_SCALE) return;
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // διπλό tap - αν είναι ήδη zoomed κάνει reset, αλλιώς κάνει zoom στο 3x
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > MIN_SCALE) {
        reset();
      } else {
        scale.value = withTiming(3);
        savedScale.value = 3;
      }
    });

  // race = όποιο gesture αναγνωριστεί πρώτο κερδίζει, αλλά pinch+pan μπορούν να τρέξουν ταυτόχρονα μεταξύ τους
  const composedGesture = Gesture.Race(doubleTapGesture, Gesture.Simultaneous(pinchGesture, panGesture));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
