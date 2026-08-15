import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
};

function buildMapHtml(
  pins: { lat: number; lon: number; title: string; time: string; emoji: string }[]
) {
  const data = JSON.stringify(pins);

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

        if (markers.length > 1) {
          var group = L.featureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.25));
        } else if (markers.length === 1) {
          map.setView(markers[0].getLatLng(), 14);
        }

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

export function TripMapView({ entries }: Props) {
  const [loadFailed, setLoadFailed] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

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

  if (pinnedEntries.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor }]}>
        <ThemedText style={{ color: borderColor }}>
          Πρόσθεσε μια διεύθυνση σε μια καταχώρηση για να εμφανιστεί εδώ.
        </ThemedText>
      </View>
    );
  }

  if (loadFailed) {
    return (
      <View style={[styles.empty, { backgroundColor }]}>
        <ThemedText style={{ color: borderColor, textAlign: 'center' }}>
          Ο χάρτης δεν φόρτωσε. Έλεγξε τη σύνδεση στο internet και δοκίμασε ξανά.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
});
