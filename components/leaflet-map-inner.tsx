import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';

export type Pin = { lat: number; lon: number; title: string; time: string; emoji: string };

// ίδιο emoji-marker styling με το native (WebView + Leaflet) αντίστοιχο, εδώ σαν πραγματικό L.divIcon
function pinIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size:26px;line-height:26px;">${emoji}</div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

// κάνει fit/zoom στα pins κάθε φορά που αλλάζουν (το react-leaflet δεν ξαναδιαβάζει
// τα center/zoom props του MapContainer μετά το πρώτο render)
function FitToPins({ pins }: { pins: Pin[] }) {
  const map = useMap();

  useEffect(() => {
    if (pins.length > 1) {
      const bounds = L.latLngBounds(pins.map((pin) => [pin.lat, pin.lon] as [number, number]));
      map.fitBounds(bounds.pad(0.25));
    } else if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lon], 14);
    }
  }, [pins, map]);

  return null;
}

type Props = {
  pins: Pin[];
  onTileError: () => void;
};

// το πραγματικό react-leaflet map - ζει σε ξεχωριστό αρχείο (χωρίς static import από πουθενά αλλού)
// ώστε να μπορεί να φορτωθεί με dynamic import() μόνο στον browser, ποτέ κατά το static SSR render
// (το leaflet διαβάζει `window` στο module scope και σκάει αν τρέξει σε Node)
export function LeafletMapInner({ pins, onTileError }: Props) {
  return (
    <MapContainer
      key={pins.length}
      center={[pins[0].lat, pins[0].lon]}
      zoom={14}
      zoomControl
      style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        subdomains="abcd"
        maxZoom={20}
        eventHandlers={{ tileerror: onTileError }}
      />
      <FitToPins pins={pins} />
      {pins.map((pin, index) => (
        <Marker key={index} position={[pin.lat, pin.lon]} icon={pinIcon(pin.emoji)}>
          <Popup>
            <div style={{ fontWeight: 700 }}>{pin.title}</div>
            <div style={{ color: '#666', marginTop: 2 }}>{pin.time}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
