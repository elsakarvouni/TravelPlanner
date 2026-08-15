import { differenceInCalendarDays, format, parseISO, subYears } from 'date-fns';

// source λέει από πού ήρθαν τα δεδομένα - πραγματικό forecast ή μέσος όρος από παλιά χρόνια (βλ. παρακάτω)
export type TripWeatherSummary = {
  source: 'forecast' | 'historical';
  avgHigh: number;
  avgLow: number;
  precipitationChance: number;
  weatherCode: number;
  sunrise: string | null;
  sunset: string | null;
};

// κρατάμε μόνο το HH:MM από ένα πλήρες ISO datetime (πχ "2026-08-15T06:23" -> "06:23")
function extractTime(isoDateTime: string | null | undefined): string | null {
  if (!isoDateTime) return null;
  const time = isoDateTime.split('T')[1];
  return time ? time.slice(0, 5) : null;
}

// το Open-Meteo έχει δύο ξεχωριστά APIs - ένα για πρόβλεψη (forecast) και ένα για ιστορικά δεδομένα (archive)
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';
// για το ιστορικό μέσο όρο κοιτάμε τα ίδια ημερολογιακά διαστήματα 1, 2 και 3 χρόνια πριν
const HISTORICAL_YEARS_BACK = [1, 2, 3];

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// βρίσκει την πιο συχνή τιμή σε μια λίστα - το χρησιμοποιούμε για τον weather code
// γιατί δεν έχει νόημα να κάνουμε μέσο όρο σε κωδικούς καιρού (πχ "ήλιος" + "βροχή" / 2 δεν βγάζει νόημα)
function mostCommon(values: number[]): number {
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  let best = values[0];
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

// εδώ αποφασίζουμε ποια πηγή δεδομένων θα χρησιμοποιήσουμε.
// το Open-Meteo forecast δίνει αξιόπιστη πρόβλεψη μόνο για τις επόμενες ~16 μέρες, οπότε:
// - αν το ταξίδι είναι σε 15 μέρες ή λιγότερο -> ζητάμε πραγματικό forecast
// - αν είναι πιο μακριά (πχ σε 2 μήνες) -> δεν υπάρχει ακόμα πρόβλεψη, οπότε παίρνουμε τον μέσο όρο
//   του καιρού τις ίδιες ημερομηνίες τα προηγούμενα 1-3 χρόνια, σαν εκτίμηση του τι να περιμένουμε
export async function getTripWeather(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<TripWeatherSummary | null> {
  try {
    const daysUntilStart = differenceInCalendarDays(parseISO(startDate), new Date());
    if (daysUntilStart <= 15) {
      return await fetchForecast(latitude, longitude, startDate, endDate);
    }
    return await fetchHistoricalAverage(latitude, longitude, startDate, endDate);
  } catch {
    return null;
  }
}

// ζητάει τις επόμενες 16 μέρες πρόβλεψης και κρατάει μόνο τις μέρες που μας αφορούν (διάρκεια ταξιδιού)
async function fetchForecast(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<TripWeatherSummary | null> {
  const url = `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,sunrise,sunset&forecast_days=16&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();

  // το API γυρνάει array με ημερομηνίες (data.daily.time) - βρίσκουμε τα indices που πέφτουν
  // μέσα στο διάστημα του ταξιδιού μας, ώστε μετά να ψάξουμε τις ίδιες θέσεις στα υπόλοιπα arrays
  const times: string[] = data?.daily?.time ?? [];
  const indices = times
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t >= startDate && t <= endDate)
    .map(({ i }) => i);

  if (indices.length === 0) return null;

  const maxTemps = indices.map((i) => data.daily.temperature_2m_max[i]).filter((v) => v != null);
  const minTemps = indices.map((i) => data.daily.temperature_2m_min[i]).filter((v) => v != null);
  const precipitation = indices
    .map((i) => data.daily.precipitation_probability_max?.[i])
    .filter((v) => v != null);
  const codes = indices.map((i) => data.daily.weather_code?.[i]).filter((v) => v != null);

  if (maxTemps.length === 0 || minTemps.length === 0) return null;

  return {
    source: 'forecast',
    avgHigh: average(maxTemps),
    avgLow: average(minTemps),
    precipitationChance: precipitation.length ? average(precipitation) : 0,
    weatherCode: codes.length ? mostCommon(codes) : 0,
    // ανατολή/δύση παίρνουμε μόνο από την πρώτη μέρα του ταξιδιού, δεν χρειάζεται μέσος όρος εδώ
    sunrise: extractTime(data.daily.sunrise?.[indices[0]]),
    sunset: extractTime(data.daily.sunset?.[indices[0]]),
  };
}

// όταν το ταξίδι είναι πολύ μακριά για κανονικό forecast, μαντεύουμε τον καιρό κοιτώντας
// τι έκανε καιρό τις ίδιες ημερομηνίες τα 3 προηγούμενα χρόνια, και βγάζουμε μέσο όρο
async function fetchHistoricalAverage(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<TripWeatherSummary | null> {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  // κάνουμε τα 3 requests (1, 2, 3 χρόνια πίσω) παράλληλα, με τις ίδιες ημέρες/μήνες μετατοπισμένες στο παρελθόν
  const requests = HISTORICAL_YEARS_BACK.map(async (yearsAgo) => {
    const pastStart = format(subYears(start, yearsAgo), 'yyyy-MM-dd');
    const pastEnd = format(subYears(end, yearsAgo), 'yyyy-MM-dd');
    const url = `${ARCHIVE_URL}?latitude=${latitude}&longitude=${longitude}&start_date=${pastStart}&end_date=${pastEnd}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,sunrise,sunset&timezone=auto`;
    const response = await fetch(url);
    return response.ok ? response.json() : null;
  });

  const results = await Promise.all(requests);

  const allMax: number[] = [];
  const allMin: number[] = [];
  const allPrecip: number[] = [];
  const allCodes: number[] = [];
  let sunrise: string | null = null;
  let sunset: string | null = null;

  // μαζεύουμε όλες τις τιμές και από τα 3 χρόνια μαζί σε κοινές λίστες, για να βγάλουμε ενιαίο μέσο όρο
  for (const data of results) {
    const daily = data?.daily;
    if (!daily) continue;
    const maxTemps: (number | null)[] = daily.temperature_2m_max ?? [];
    const minTemps: (number | null)[] = daily.temperature_2m_min ?? [];
    const precip: (number | null)[] = daily.precipitation_sum ?? [];
    const codes: (number | null)[] = daily.weather_code ?? daily.weathercode ?? [];

    for (const v of maxTemps) if (v != null) allMax.push(v);
    for (const v of minTemps) if (v != null) allMin.push(v);
    for (const v of precip) if (v != null) allPrecip.push(v);
    for (const v of codes) if (v != null) allCodes.push(v);

    // ανατολή/δύση τα παίρνουμε μόνο μία φορά (από το πρώτο χρόνο που έχει δεδομένα), δεν έχει νόημα μέσος όρος ωρών
    if (!sunrise) sunrise = extractTime(daily.sunrise?.[0]);
    if (!sunset) sunset = extractTime(daily.sunset?.[0]);
  }

  if (allMax.length === 0 || allMin.length === 0) return null;

  // εδώ το precipitation_sum είναι σε mm βροχής ανά μέρα (όχι ποσοστό όπως στο forecast),
  // οπότε υπολογίζουμε εμείς ένα "ποσοστό βροχής" μετρώντας πόσες μέρες είχαν πάνω από 1mm βροχή
  const rainyDays = allPrecip.filter((v) => v > 1).length;

  return {
    source: 'historical',
    avgHigh: average(allMax),
    avgLow: average(allMin),
    precipitationChance: allPrecip.length ? Math.round((rainyDays / allPrecip.length) * 100) : 0,
    weatherCode: allCodes.length ? mostCommon(allCodes) : 0,
    sunrise,
    sunset,
  };
}

// μετατρέπει τον αριθμητικό weather code (WMO standard) σε emoji για να δείχνει ωραία στο UI
export function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code === 1 || code === 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 57) return '🌦️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '🌨️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code === 85 || code === 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌡️';
}
