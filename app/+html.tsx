import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// custom root HTML document για το static/server rendering στο web (τρέχει ΜΟΝΟ σε Node, ποτέ στον
// browser) - εδώ προσθέτουμε ό,τι χρειάζεται το PWA: link στο manifest, apple touch icon, και τα
// apple-mobile-web-app meta tags που κάνουν δυνατό το "Add to Home Screen" στο iOS Safari χωρίς αυτά
// να ανοίγει πάντα μέσα στο Safari (standalone mode σαν πραγματική εφαρμογή)
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="el">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* viewport-fit=cover είναι απαραίτητο για standalone PWA στο iOS - χωρίς αυτό το env(safe-area-inset-*)
            επιστρέφει πάντα 0 (άρα useSafeAreaInsets() στο bottom tab bar κλπ δεν δουλεύει σωστά), και το
            apple-mobile-web-app-status-bar-style δεν ενεργοποιείται σωστά (μένει λευκή/άσχετη λωρίδα πίσω
            από το ρολόι/notch αντί να δείχνει το περιεχόμενο της εφαρμογής) */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a7ea4" />

        {/* iOS Safari "Add to Home Screen" - χωρίς αυτά ανοίγει σαν απλή σελίδα, όχι standalone app */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TravelPlanner" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* φόντο για html/body ίδιο με το θέμα της εφαρμογής (βλ. constants/theme.ts) - χωρίς αυτό, η
            περιοχή πίσω από το notch/status bar (που τώρα «καλύπτεται» χάρη στο viewport-fit=cover) θα
            έδειχνε το προεπιλεγμένο λευκό φόντο του browser αντί να ταιριάζει με το σκούρο/ανοιχτό θέμα */}
        <style>{`
          html, body { background-color: #fff; }
          @media (prefers-color-scheme: dark) {
            html, body { background-color: #151718; }
          }
        `}</style>

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
