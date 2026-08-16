import { Platform } from 'react-native';

// registράρει το service worker (dist/sw.js, φτιαγμένο από workbox-cli - βλ. workbox-config.js) ώστε
// η εφαρμογή να δουλεύει και offline στο web μετά την πρώτη φόρτωση. Μόνο στο web φυσικά, και μόνο σε
// production build - στο dev server (`npm run web`) δεν υπάρχει καν sw.js, μόνο μετά από πραγματικό
// `npm run build:web`.
export async function registerServiceWorker(): Promise<void> {
  if (Platform.OS !== 'web') return;
  if (__DEV__) return;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch {
    // η εφαρμογή δουλεύει κανονικά και χωρίς service worker, απλά όχι offline - δεν έχει νόημα να
    // ενοχλήσουμε τον χρήστη αν αποτύχει η εγγραφή του
  }
}
