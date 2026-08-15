import Svg, { Circle } from 'react-native-svg';

import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  percent: number;
  color: string;
  size?: number;
};

// μικρό donut chart φτιαγμένο με δύο κύκλους SVG - ο ένας είναι το "φόντο" και ο άλλος δείχνει το progress
export function StatDonut({ percent, color, size = 64 }: Props) {
  const trackColor = useThemeColor({}, 'icon');
  const strokeWidth = size * 0.14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius; // μήκος περιφέρειας, το χρειαζόμαστε για το dasharray trick
  const progress = Math.max(0, Math.min(1, percent / 100)); // κλείδωμα στο 0-1 ό,τι κι αν έρθει σαν percent
  const center = size / 2;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={trackColor}
        strokeOpacity={0.25}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference * (1 - progress)} // εδώ γίνεται η μαγική δουλειά - "κρύβουμε" το κομμάτι που δεν έχει γεμίσει ακόμα
        strokeLinecap="round"
        fill="none"
        rotation={-90}
        origin={`${center}, ${center}`}
      />
    </Svg>
  );
}
