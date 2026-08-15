import Animated from 'react-native-reanimated';

// το χεράκι 👋 που κουνιέται - καθαρό animation μέσω css-like keyframes του reanimated, τίποτα πολύπλοκο
export function HelloWave() {
  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}
