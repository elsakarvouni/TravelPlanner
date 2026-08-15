# TravelPlanner

TravelPlanner is a mobile travel-planning app built with React Native and Expo. It lets you plan a trip end to end — itinerary, map, budget, packing list, weather, and even emergency numbers and useful local phrases for your destination — entirely on your own device, with **no account, no sign-in, and no cloud backend**. All data is stored locally with SQLite.

The project was built as an iOS-first Expo (SDK 54) application using file-based routing (`expo-router`), a fully local data layer, and a set of free, key-less public APIs for geocoding, maps, and weather.

## Features

### Trip management
- Create, edit, and delete trips with a title, destination, and date range.
- Destination autocomplete (like Google Maps), backed by the free [Photon](https://photon.komoot.io/) geocoding API — captures coordinates and country automatically.
- A booking-style date range picker for selecting trip dates.
- Home screen with cover-image trip cards, a live countdown to departure, and pull-to-refresh.
- Local push notifications: a reminder 3 days before departure and another the day before ("pack your bags!").

### Trip detail screen
Each trip has its own screen with four tabs:
- **Πρόγραμμα (Itinerary)** — a day-by-day schedule of flights, accommodation, and activities, each with a time, title, notes, and optional address. Entries are added via a guided two-step form and sorted chronologically within each day.
- **Χάρτης (Map)** — an interactive map (OpenStreetMap tiles via Leaflet, running inside a WebView) showing every itinerary entry that has a location, plus a floating button that opens the exact same destination directly in the Google Maps app.
- **Έξοδα (Expenses)** — a running budget tracker with categorized expenses (transport, accommodation, food, activities, shopping, or a custom category), a running total, and per-item notes.
- **Info** — weather for the trip dates (real forecast if the trip is within ~2 weeks, otherwise an estimate based on the last few years' historical averages for the same dates), sunrise/sunset times, country-specific emergency numbers (police / ambulance / fire), and a small phrasebook of essential phrases in the destination's local language.
- A packing checklist (simple, Notes-app-style checkboxes) accessible from the trip header.

### Discover & Explore
- **"Been" / "Wish" world map** — an interactive, pan-and-zoomable SVG world map (rendered offline from real geographic data) where visited and wishlist countries are highlighted in different colors. Countries are automatically marked as visited once a trip to them is completed.
- **Destination discovery** — browse curated destinations by continent → country → city, with filters for tags (beach, culture, nightlife, etc.), season, and trip duration. Includes direct links to Skyscanner, Booking.com, and Airbnb.
- **Favorites** — save destinations you're interested in for later.

### Design
- A custom three-tab bottom bar (Search / Home / Discover) rather than the default Expo Router tab bar, to support an asymmetric layout.
- Full dark-mode support throughout, including calendar, map, and world-map components.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) (SDK 54) + React Native 0.81 |
| Language | TypeScript |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing) |
| Local storage | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) with a versioned migration system |
| Maps | [react-native-webview](https://github.com/react-native-webview/react-native-webview) + [Leaflet](https://leafletjs.com/) with [CARTO](https://carto.com/basemaps) tiles |
| Geocoding | [Photon](https://photon.komoot.io/) (OpenStreetMap-based, free, no API key) |
| Weather | [Open-Meteo](https://open-meteo.com/) (free, no API key) |
| Notifications | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) |
| World map data | [world-atlas](https://github.com/topojson/world-atlas) + [topojson-client](https://github.com/topojson/topojson-client) + [d3-geo](https://github.com/d3/d3-geo), pre-processed offline into static SVG path data |
| Country/language data | [world-countries](https://github.com/mledoze/countries) |
| Animations & gestures | react-native-reanimated, react-native-gesture-handler |
| Date handling | [date-fns](https://date-fns.org/) |

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- The [Expo Go](https://expo.dev/go) app on your phone (iOS or Android), **or** Xcode/Android Studio for a simulator

### Installation

```bash
git clone <this-repo-url>
cd TravelPlanner
npm install
```

### Running the app

```bash
npx expo start
```

This opens the Expo developer tools. From there you can:
- Scan the QR code with the Expo Go app on your phone
- Press `i` to open in the iOS Simulator
- Press `a` to open in the Android Emulator

> **Note:** A handful of features (a native Google/Apple Maps view, and deep-linking directly into other installed apps) would require a custom development build rather than Expo Go, because they rely on native modules or `Info.plist`/`AndroidManifest` entries that Expo Go's shared binary can't include. Everything described above as a feature already works fully inside Expo Go — the in-app map, for example, deliberately uses a WebView + Leaflet instead of a native maps SDK for exactly this reason.

### Other scripts

```bash
npm run lint            # ESLint via expo lint
npm run reset-project   # resets to a blank Expo template (not needed for this project)
```

A few data files under `assets/data/` are pre-generated offline from third-party datasets rather than computed at runtime, to keep the app itself dependency-free at runtime:

```bash
node scripts/generate-world-map-data.js     # builds the world map SVG paths + country list
node scripts/generate-country-languages.js  # builds the country → primary language mapping
node scripts/process-icon.js                # processes the app icon/splash assets
```

## Project structure

```
app/                    Screens (file-based routing via expo-router)
  (tabs)/                 Home, Search ("Find your Trip"), Discover
  trip/[id].tsx            Trip detail screen (Itinerary / Map / Expenses / Info tabs)
  trip-checklist/[id].tsx  Packing checklist
  add-trip.tsx, edit-trip/  Trip creation & editing
  continent/, country/     Destination browsing
components/            Reusable UI components
hooks/                 Data hooks (one per SQLite-backed resource) and other custom hooks
database/              SQLite migrations and one-off data-repair logic
utils/                 Pure helper functions (dates, weather, notifications, filters, ...)
constants/             Static app data (destinations, categories, emergency numbers, phrasebook, theme)
types/                 Shared TypeScript types
assets/data/           Offline-generated datasets (world map, country/language data)
scripts/               Node scripts used to generate the files in assets/data/
```

## Data & privacy

TravelPlanner stores everything — trips, itineraries, expenses, checklists, favorites, and visited-country status — locally on the device using SQLite. There is no user account, no login, and no server that your data is sent to. The only network requests the app makes are to the free public APIs listed above (geocoding, weather, and map tiles), and only with the destination information needed to fetch that data.

## License

All rights reserved. This project was built as a personal/student project — the source code is publicly visible for portfolio purposes, but no license is granted to copy, modify, or reuse it without permission.
