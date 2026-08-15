import { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';

import { WORLD_MAP_PATHS, WORLD_MAP_VIEW_BOX } from '@/assets/data/world-map';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  highlightedCodes: Set<string>;
  highlightColor: string;
};

// χάρτης όλου του κόσμου φτιαγμένος από SVG paths (ένα path ανά χώρα) - οι χώρες στο highlightedCodes βάφονται με το highlightColor
export function WorldMap({ highlightedCodes, highlightColor }: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  const defaultFill = useThemeColor({}, 'icon');
  const strokeColor = backgroundColor; // το περίγραμμα έχει το ίδιο χρώμα με το background, έτσι φαίνονται σαν "χωρισμένες" οι χώρες

  const paths = useMemo(() => WORLD_MAP_PATHS, []);

  return (
    <Svg viewBox={WORLD_MAP_VIEW_BOX} width="100%" height="100%">
      {paths.map((country) => (
        <Path
          key={country.code}
          d={country.d}
          fill={highlightedCodes.has(country.code) ? highlightColor : defaultFill}
          fillOpacity={highlightedCodes.has(country.code) ? 1 : 0.35}
          stroke={strokeColor}
          strokeWidth={0.5}
        />
      ))}
    </Svg>
  );
}
