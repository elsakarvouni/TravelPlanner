// ρυθμίσεις για workbox-cli generateSW - παίρνει ό,τι παρήγαγε το `expo export --platform web` μέσα
// στο dist/ και φτιάχνει ένα service worker (dist/sw.js) που τα cache-άρει όλα (app shell: JS/CSS/HTML/
// icons), ώστε η εφαρμογή να ανοίγει και χωρίς σύνδεση αφού έχει φορτωθεί μία φορά. Τρέχει σαν δεύτερο
// βήμα μέσα στο "build:web" script (βλ. package.json) - βλ. και utils/register-service-worker.ts για το
// πώς registράρεται το sw.js στον browser.
module.exports = {
  globDirectory: 'dist',
  globPatterns: ['**/*.{html,js,css,json,png,jpg,jpeg,svg,ico,ttf,otf,woff,woff2}'],
  swDest: 'dist/sw.js',
  // το κύριο JS bundle είναι ~5MB (react-native-web + όλη η εφαρμογή) - το default όριο του workbox
  // (2MB) θα το άφηνε έξω από το cache, ακυρώνοντας ουσιαστικά το offline app shell
  maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
  // ενεργοποιεί το νέο service worker αμέσως σε κάθε deploy αντί να περιμένει να κλείσουν όλα τα tabs -
  // πιο απλό UX για μια εφαρμογή σαν αυτή, χωρίς να χρειάζεται "νέα έκδοση διαθέσιμη, κάνε refresh" prompt
  skipWaiting: true,
  clientsClaim: true,
};
