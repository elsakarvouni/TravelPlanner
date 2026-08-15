import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// στο web το static rendering τρέχει πρώτα στο server, οπότε δεν ξέρουμε ακόμα το πραγματικό color scheme
// γι' αυτό επιστρέφουμε πάντα 'light' μέχρι να «ξυπνήσει» (hydrate) το component στον client
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
