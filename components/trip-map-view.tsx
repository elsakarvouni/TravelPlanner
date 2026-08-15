import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ItineraryEntry } from '@/types/itinerary';

const ENTRY_ICON: Record<ItineraryEntry['type'], string> = {
  flight: '✈️',
  accommodation: '🛏️',
  activity: '📍',
};

type Props = {
  entries: ItineraryEntry[];
  destination: string;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
};

// φτιάχνει ολόκληρο HTML string με Leaflet map μέσα, για να το φορτώσουμε σε WebView (δεν υπάρχει native map component εδώ)
function buildMapHtml(
  pins: { lat: number; lon: number; title: string; time: string; emoji: string }[]
) {
  const data = JSON.stringify(pins); // περνάμε τα pins μέσα στο html σαν JSON για να τα διαβάσει το js του leaflet

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body { height: 100%; width: 100%; margin: 0; padding: 0; }
    #map { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #ddd; }
    #error {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: none; align-items: center; justify-content: center; text-align: center;
      padding: 24px; font-family: -apple-system, Roboto, sans-serif; color: #666; box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="error">Ο χάρτης δεν φόρτωσε. Έλεγξε τη σύνδεση στο internet.</div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    function showError() {
      document.getElementById('map').style.display = 'none';
      document.getElementById('error').style.display = 'flex';
    }

    if (typeof L === 'undefined') {
      showError();
    } else {
      try {
        var pins = ${data};
        var map = L.map('map', { zoomControl: true });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(map);

        var markers = pins.map(function (pin) {
          var icon = L.divIcon({
            html: '<div style="font-size:26px;line-height:26px;">' + pin.emoji + '</div>',
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });
          var marker = L.marker([pin.lat, pin.lon], { icon: icon }).addTo(map);

          var popup = document.createElement('div');
          var titleEl = document.createElement('div');
          titleEl.style.fontWeight = '700';
          titleEl.textContent = pin.title;
          var timeEl = document.createElement('div');
          timeEl.style.color = '#666';
          timeEl.style.marginTop = '2px';
          timeEl.textContent = pin.time;
          popup.appendChild(titleEl);
          popup.appendChild(timeEl);
          marker.bindPopup(popup);

          return marker;
        });

        // αν έχουμε πολλά pins κάνουμε zoom να χωράνε όλα, αν έχουμε ένα μόνο κάνουμε απλά zoom πάνω του
        if (markers.length > 1) {
          var group = L.featureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.25));
        } else if (markers.length === 1) {
          map.setView(markers[0].getLatLng(), 14);
        }

        // το leaflet μερικές φορές μπερδεύεται με το μέγεθος μέσα σε webview, οπότε το ξαναφωνάζουμε μετά από λίγο - λύση/workaround
        function fixSize() {
          map.invalidateSize(true);
        }
        setTimeout(fixSize, 100);
        setTimeout(fixSize, 500);
        window.addEventListener('resize', fixSize);
      } catch (err) {
        showError();
      }
    }
  </script>
</body>
</html>`;
}

// δείχνει χάρτη με όλες τις καταχωρήσεις του itinerary που έχουν συντεταγμένες
export function TripMapView({ entries, destination, destinationLatitude, destinationLongitude }: Props) {
  const [loadFailed, setLoadFailed] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  // κρατάμε μόνο τις καταχωρήσεις που έχουν πραγματικά lat/lon, τις άλλες δεν μπορούμε να τις βάλουμε στο χάρτη
  const pinnedEntries = useMemo(
    () => entries.filter((entry) => entry.latitude != null && entry.longitude != null),
    [entries]
  );

  const html = useMemo(
    () =>
      buildMapHtml(
        pinnedEntries.map((entry) => ({
          lat: entry.latitude as number,
          lon: entry.longitude as number,
          title: entry.title,
          time: entry.time,
          emoji: ENTRY_ICON[entry.type],
        }))
      ),
    [pinnedEntries]
  );

  // ανοίγει το native app του Google Maps - προτιμάμε coords αν τα έχουμε, αλλιώς ψάχνουμε απλά με το όνομα προορισμού
  const openInGoogleMaps = () => {
    const query =
      destinationLatitude != null && destinationLongitude != null
        ? `${destinationLatitude},${destinationLongitude}`
        : encodeURIComponent(destination);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View style={styles.container}>
      {pinnedEntries.length === 0 ? (
        <View style={[styles.empty, { backgroundColor }]}>
          <ThemedText style={{ color: borderColor }}>
            Πρόσθεσε μια διεύθυνση σε μια καταχώρηση για να εμφανιστεί εδώ.
          </ThemedText>
        </View>
      ) : loadFailed ? (
        <View style={[styles.empty, { backgroundColor }]}>
          <ThemedText style={{ color: borderColor, textAlign: 'center' }}>
            Ο χάρτης δεν φόρτωσε. Έλεγξε τη σύνδεση στο internet και δοκίμασε ξανά.
          </ThemedText>
        </View>
      ) : (
        <WebView
          key={pinnedEntries.length}
          style={styles.map}
          originWhitelist={['*']}
          source={{ html }}
          javaScriptEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={[styles.loading, { backgroundColor }]}>
              <ActivityIndicator color={tintColor} />
            </View>
          )}
          onError={() => setLoadFailed(true)}
          onHttpError={() => setLoadFailed(true)}
        />
      )}

      <Pressable style={styles.openMapsButton} onPress={openInGoogleMaps} hitSlop={8}>
        <ThemedText style={styles.openMapsIcon}>🗺️</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openMapsButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openMapsIcon: {
    fontSize: 24,
  },
});
