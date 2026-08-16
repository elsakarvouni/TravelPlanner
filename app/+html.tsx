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
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a7ea4" />

        {/* iOS Safari "Add to Home Screen" - χωρίς αυτά ανοίγει σαν απλή σελίδα, όχι standalone app */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TravelPlanner" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
