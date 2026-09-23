import { Platform } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LocationItem {
  id?: string;
  name: string;
  area: string;
  city: string;
  state?: string;
  lat: number;
  lng: number;
  accuracy?: number;
  isLiveTracking?: boolean;
  address?: string;
  isPopular?: boolean;
}


export const SERVICE_LOCATIONS: LocationItem[] = [
  // --- Salem (High Precision Cooperative Grid) ---
  { id: "slm-1", area: "Fort", city: "Salem", state: "Tamil Nadu", name: "Fort, Salem", lat: 11.6539, lng: 78.1554, isPopular: true },
  { id: "slm-2", area: "Fairlands", city: "Salem", state: "Tamil Nadu", name: "Fairlands, Salem", lat: 11.6740, lng: 78.1460, isPopular: true },
  { id: "slm-3", area: "Hasthampatti", city: "Salem", state: "Tamil Nadu", name: "Hasthampatti, Salem", lat: 11.6810, lng: 78.1600, isPopular: true },
  { id: "slm-4", area: "Shevapet", city: "Salem", state: "Tamil Nadu", name: "Shevapet, Salem", lat: 11.6500, lng: 78.1400, isPopular: true },
  { id: "slm-5", area: "Suramangalam", city: "Salem", state: "Tamil Nadu", name: "Suramangalam (Junction), Salem", lat: 11.6750, lng: 78.1150, isPopular: true },
  { id: "slm-6", area: "Ammapet", city: "Salem", state: "Tamil Nadu", name: "Ammapet, Salem", lat: 11.6550, lng: 78.1800, isPopular: true },
  { id: "slm-7", area: "Kandhampatti", city: "Salem", state: "Tamil Nadu", name: "Kandhampatti, Salem", lat: 11.6420, lng: 78.1090 },
  { id: "slm-8", area: "Alagapuram", city: "Salem", state: "Tamil Nadu", name: "Alagapuram, Salem", lat: 11.6820, lng: 78.1380 },

  // --- Coimbatore ---
  { id: "cbe-1", area: "Gandhipuram", city: "Coimbatore", state: "Tamil Nadu", name: "Gandhipuram, Coimbatore", lat: 11.0168, lng: 76.9558, isPopular: true },
  { id: "cbe-2", area: "RS Puram", city: "Coimbatore", state: "Tamil Nadu", name: "RS Puram, Coimbatore", lat: 11.0180, lng: 76.9400, isPopular: true },
  { id: "cbe-3", area: "Peelamedu", city: "Coimbatore", state: "Tamil Nadu", name: "Peelamedu, Coimbatore", lat: 11.0240, lng: 77.0020, isPopular: true },
  { id: "cbe-4", area: "Saibaba Colony", city: "Coimbatore", state: "Tamil Nadu", name: "Saibaba Colony, Coimbatore", lat: 11.0310, lng: 76.9420, isPopular: true },
  { id: "cbe-5", area: "Singanallur", city: "Coimbatore", state: "Tamil Nadu", name: "Singanallur, Coimbatore", lat: 11.0020, lng: 77.0250, isPopular: true },
  { id: "cbe-6", area: "Saravanampatti", city: "Coimbatore", state: "Tamil Nadu", name: "Saravanampatti, Coimbatore", lat: 11.0797, lng: 76.9997, isPopular: true },
  { id: "cbe-7", area: "Ramanathapuram", city: "Coimbatore", state: "Tamil Nadu", name: "Ramanathapuram, Coimbatore", lat: 10.9995, lng: 76.9850, isPopular: true },
  { id: "cbe-8", area: "Hopes College", city: "Coimbatore", state: "Tamil Nadu", name: "Hopes College, Coimbatore", lat: 11.0280, lng: 77.0140, isPopular: true },
  { id: "cbe-9", area: "Vadavalli", city: "Coimbatore", state: "Tamil Nadu", name: "Vadavalli, Coimbatore", lat: 11.0280, lng: 76.9020 },
  { id: "cbe-10", area: "Thudiyalur", city: "Coimbatore", state: "Tamil Nadu", name: "Thudiyalur, Coimbatore", lat: 11.0800, lng: 76.9380 },
  { id: "cbe-11", area: "Kovaipudur", city: "Coimbatore", state: "Tamil Nadu", name: "Kovaipudur, Coimbatore", lat: 10.9380, lng: 76.9400 },
  { id: "cbe-12", area: "Ukkadam", city: "Coimbatore", state: "Tamil Nadu", name: "Ukkadam, Coimbatore", lat: 10.9920, lng: 76.9600 },
  { id: "cbe-13", area: "Ganapathy", city: "Coimbatore", state: "Tamil Nadu", name: "Ganapathy, Coimbatore", lat: 11.0370, lng: 76.9730, isPopular: true },
  { id: "cbe-14", area: "Kuniyamuthur", city: "Coimbatore", state: "Tamil Nadu", name: "Kuniyamuthur, Coimbatore", lat: 10.9630, lng: 76.9450 },
  { id: "cbe-15", area: "Ondipudur", city: "Coimbatore", state: "Tamil Nadu", name: "Ondipudur, Coimbatore", lat: 11.0040, lng: 77.0540 },
  { id: "cbe-16", area: "Sundarapuram", city: "Coimbatore", state: "Tamil Nadu", name: "Sundarapuram, Coimbatore", lat: 10.9520, lng: 76.9720 },
  { id: "cbe-17", area: "Goldwins / SITRA", city: "Coimbatore", state: "Tamil Nadu", name: "Goldwins / SITRA, Coimbatore", lat: 11.0350, lng: 77.0420 },
  { id: "cbe-18", area: "Race Course", city: "Coimbatore", state: "Tamil Nadu", name: "Race Course, Coimbatore", lat: 11.0060, lng: 76.9720, isPopular: true },
  { id: "cbe-19", area: "Ram Nagar", city: "Coimbatore", state: "Tamil Nadu", name: "Ram Nagar, Coimbatore", lat: 11.0185, lng: 76.9610 },
  { id: "cbe-20", area: "Kalapatti", city: "Coimbatore", state: "Tamil Nadu", name: "Kalapatti, Coimbatore", lat: 11.0710, lng: 77.0340 },
  { id: "cbe-21", area: "Podanur", city: "Coimbatore", state: "Tamil Nadu", name: "Podanur, Coimbatore", lat: 10.9660, lng: 76.9940 },
  { id: "cbe-22", area: "Pappanaickenpalayam", city: "Coimbatore", state: "Tamil Nadu", name: "Pappanaickenpalayam, Coimbatore", lat: 11.0120, lng: 76.9780 },
  { id: "cbe-23", area: "Town Hall", city: "Coimbatore", state: "Tamil Nadu", name: "Town Hall, Coimbatore", lat: 10.9980, lng: 76.9620 },
  { id: "cbe-24", area: "Pollachi", city: "Coimbatore", state: "Tamil Nadu", name: "Pollachi, Coimbatore", lat: 10.6580, lng: 77.0080 },

  // --- Chennai ---
  { id: "chn-1", area: "T. Nagar", city: "Chennai", state: "Tamil Nadu", name: "T. Nagar, Chennai", lat: 13.0418, lng: 80.2341, isPopular: true },
  { id: "chn-2", area: "Anna Nagar", city: "Chennai", state: "Tamil Nadu", name: "Anna Nagar, Chennai", lat: 13.0850, lng: 80.2101, isPopular: true },
  { id: "chn-3", area: "Adyar", city: "Chennai", state: "Tamil Nadu", name: "Adyar, Chennai", lat: 13.0012, lng: 80.2565, isPopular: true },
  { id: "chn-4", area: "Velachery", city: "Chennai", state: "Tamil Nadu", name: "Velachery, Chennai", lat: 12.9750, lng: 80.2206, isPopular: true },
  { id: "chn-5", area: "Mylapore", city: "Chennai", state: "Tamil Nadu", name: "Mylapore, Chennai", lat: 13.0368, lng: 80.2676 },
  { id: "chn-6", area: "Guindy", city: "Chennai", state: "Tamil Nadu", name: "Guindy, Chennai", lat: 13.0067, lng: 80.2025 },
  { id: "chn-7", area: "Nungambakkam", city: "Chennai", state: "Tamil Nadu", name: "Nungambakkam, Chennai", lat: 13.0569, lng: 80.2425 },
  { id: "chn-8", area: "OMR - Thoraipakkam", city: "Chennai", state: "Tamil Nadu", name: "OMR - Thoraipakkam, Chennai", lat: 12.9360, lng: 80.2310, isPopular: true },

  // --- Madurai ---
  { id: "mdu-1", area: "KK Nagar", city: "Madurai", state: "Tamil Nadu", name: "KK Nagar, Madurai", lat: 9.9252, lng: 78.1498, isPopular: true },
  { id: "mdu-2", area: "Anna Nagar", city: "Madurai", state: "Tamil Nadu", name: "Anna Nagar, Madurai", lat: 9.9190, lng: 78.1450, isPopular: true },
  { id: "mdu-3", area: "Mattuthavani", city: "Madurai", state: "Tamil Nadu", name: "Mattuthavani, Madurai", lat: 9.9450, lng: 78.1560, isPopular: true },

  // --- Tiruchirappalli (Trichy) ---
  { id: "try-1", area: "Thillai Nagar", city: "Tiruchirappalli", state: "Tamil Nadu", name: "Thillai Nagar, Tiruchirappalli", lat: 10.8250, lng: 78.6850, isPopular: true },
  { id: "try-2", area: "Cantonment", city: "Tiruchirappalli", state: "Tamil Nadu", name: "Cantonment, Tiruchirappalli", lat: 10.8060, lng: 78.6870, isPopular: true },

  // --- Tiruppur ---
  { id: "tup-1", area: "Avinashi Road", city: "Tiruppur", state: "Tamil Nadu", name: "Avinashi Road, Tiruppur", lat: 11.1150, lng: 77.3480, isPopular: true },
  { id: "tup-2", area: "Old Bus Stand", city: "Tiruppur", state: "Tamil Nadu", name: "Old Bus Stand, Tiruppur", lat: 11.1085, lng: 77.3411, isPopular: true },

  // --- Erode ---
  { id: "erd-1", area: "Perundurai Road", city: "Erode", state: "Tamil Nadu", name: "Perundurai Road, Erode", lat: 11.3400, lng: 77.7120, isPopular: true },

  // --- Bengaluru ---
  { id: "blr-1", area: "Indiranagar", city: "Bengaluru", state: "Karnataka", name: "Indiranagar, Bengaluru", lat: 12.9784, lng: 77.6408, isPopular: true },
  { id: "blr-2", area: "Koramangala", city: "Bengaluru", state: "Karnataka", name: "Koramangala, Bengaluru", lat: 12.9352, lng: 77.6245, isPopular: true },
  { id: "blr-3", area: "Whitefield", city: "Bengaluru", state: "Karnataka", name: "Whitefield, Bengaluru", lat: 12.9698, lng: 77.7499, isPopular: true },
];

export const DEFAULT_MOBILE_LOCATION: LocationItem = SERVICE_LOCATIONS[0]; // Fort, Salem
export const PRESET_LOCATIONS: LocationItem[] = SERVICE_LOCATIONS.filter((l) => l.isPopular);

export const LOCATION_STORAGE_KEY = "ondemand_mobile_gps_location";
export const LOCATION_UPDATED_EVENT = "ondemand_mobile_location_updated";

// In-memory listeners for cross-component realtime sync
const locationListeners: Array<(loc: LocationItem) => void> = [];

export function onLocationChange(listener: (loc: LocationItem) => void): () => void {
  locationListeners.push(listener);
  return () => {
    const idx = locationListeners.indexOf(listener);
    if (idx > -1) locationListeners.splice(idx, 1);
  };
}

export function notifyLocationListeners(loc: LocationItem): void {
  locationListeners.forEach((fn) => {
    try {
      fn(loc);
    } catch (e) {
      console.warn("Location listener error:", e);
    }
  });
}

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * Finds the nearest cooperative service hub from our grid
 */
export function findNearestLocation(lat: number, lng: number): LocationItem {
  let nearest: LocationItem = DEFAULT_MOBILE_LOCATION;
  let minDistance = Infinity;

  for (const loc of SERVICE_LOCATIONS) {
    const dist = calculateHaversineKm(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = loc;
    }
  }

  return nearest;
}

/**
 * Real-time IP-based geolocation extractor for web preview, desktop browsers,
 * or when satellite GPS hardware is disabled or blocked.
 */
export async function getIpBasedLocation(): Promise<LocationItem | null> {
  // Strategy 1: ipwho.is (High accuracy IPv4 & IPv6 with city & district level precision)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://ipwho.is/", { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.latitude === "number" && typeof data.longitude === "number") {
        const city = data.city || "Salem";
        const region = data.region || "Tamil Nadu";
        const name = `${city}, ${region}`;
        return {
          id: `ip-${Date.now()}`,
          name,
          area: city,
          city,
          state: region,
          lat: data.latitude,
          lng: data.longitude,
          accuracy: 500,
          address: `${city}, ${region}, India`,
        };
      }
    }
  } catch (err) {
    console.warn("ipwho.is lookup notice:", err);
  }

  // Strategy 2: ip-api.com
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch("http://ip-api.com/json", { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data.status === "success" && typeof data.lat === "number" && typeof data.lon === "number") {
        const city = data.city || "Salem";
        const region = data.regionName || data.region || "Tamil Nadu";
        const name = `${city}, ${region}`;
        return {
          id: `ip-${Date.now()}`,
          name,
          area: city,
          city,
          state: region,
          lat: data.lat,
          lng: data.lon,
          accuracy: 1000,
          address: `${city}, ${region}, India`,
        };
      }
    }
  } catch (err) {
    console.warn("ip-api lookup notice:", err);
  }

  return null;
}

/**
 * Reverse geocodes coordinates. Prioritizes device-native geocoder on Android/iOS,
 * and high-fidelity OpenStreetMap Nominatim with street/suburb/city extraction on Web.
 */
export async function reverseGeocodeGps(lat: number, lng: number): Promise<LocationItem> {
  const nearest = findNearestLocation(lat, lng);

  // Strategy 1: Device-Native Reverse Geocoder (Android Geocoder / iOS CLGeocoder)
  if (Platform.OS !== "web") {
    try {
      const nativeAddresses = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (nativeAddresses && nativeAddresses.length > 0) {
        const best = nativeAddresses[0];
        const road = best.street || best.name || "";
        const suburb = best.district || best.subregion || best.city || "";
        const city = best.city || best.subregion || nearest.city;
        const state = best.region || nearest.state || "Tamil Nadu";

        const parts: string[] = [];
        if (road && !parts.includes(road)) parts.push(road);
        if (suburb && !parts.includes(suburb)) parts.push(suburb);
        if (city && !parts.includes(city)) parts.push(city);

        const formattedAddress = parts.length > 0 ? parts.join(", ") : (suburb ? `${suburb}, ${city}` : city);

        return {
          id: `gps-${Date.now()}`,
          name: formattedAddress,
          area: suburb || city,
          city,
          state,
          lat,
          lng,
          address: formattedAddress,
        };
      }
    } catch (nativeGeoErr) {
      console.warn("Native reverseGeocodeAsync notice:", nativeGeoErr);
    }
  }

  // Strategy 2: Nominatim OpenStreetMap (High detail building, suburb, city)
  const fetchNominatim = async (): Promise<LocationItem | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en, ta, hi",
            "User-Agent": "OnDemandLabourCoop/3.0 (India; MobileApp)",
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.street || addr.residential || addr.quarter || "";
        const suburb = addr.suburb || addr.quarter || addr.neighbourhood || addr.subdistrict || addr.village || "";
        const city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || nearest.city;
        const state = addr.state || nearest.state || "Tamil Nadu";

        const parts: string[] = [];
        if (road) parts.push(road);
        if (suburb && !parts.includes(suburb)) parts.push(suburb);
        if (city && !parts.includes(city)) parts.push(city);

        const formattedAddress = parts.length > 0 ? parts.join(", ") : (suburb ? `${suburb}, ${city}` : city);

        return {
          id: `gps-${Date.now()}`,
          name: formattedAddress,
          area: suburb || city,
          city,
          state,
          lat,
          lng,
          address: formattedAddress,
        };
      }
    } catch {
      // Ignore
    } finally {
      clearTimeout(timer);
    }
    return null;
  };

  // Strategy 3: BigDataCloud Client Reverse Geocoding API
  const fetchBigDataCloud = async (): Promise<LocationItem | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { signal: controller.signal }
      );
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const locality = data.locality || data.subLocality || "";
        const city = data.city || nearest.city;
        const state = data.principalSubdivision || nearest.state || "Tamil Nadu";
        const name = locality ? `${locality}, ${city}` : `${city}, ${state}`;

        return {
          id: `gps-${Date.now()}`,
          name,
          area: locality || city,
          city,
          state,
          lat,
          lng,
          address: `${name}, ${state}`,
        };
      }
    } catch {
      // Ignore
    } finally {
      clearTimeout(timer);
    }
    return null;
  };

  try {
    const [nomRes, bdcRes] = await Promise.allSettled([fetchNominatim(), fetchBigDataCloud()]);
    if (nomRes.status === "fulfilled" && nomRes.value) {
      return nomRes.value;
    }
    if (bdcRes.status === "fulfilled" && bdcRes.value) {
      return bdcRes.value;
    }
  } catch (e) {
    console.warn("Geocode error:", e);
  }

  // Graceful fallback to nearest cooperative hub
  return {
    ...nearest,
    lat,
    lng,
    address: `${nearest.name}, Tamil Nadu`,
  };
}

/**
 * Retrieve cached location from AsyncStorage
 */
export async function getStoredLocation(): Promise<LocationItem | null> {
  try {
    const raw = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Error getting stored location:", err);
  }
  return null;
}

/**
 * Cache location to AsyncStorage and broadcast update to all listening components
 */
export async function setStoredLocation(loc: LocationItem): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
    notifyLocationListeners(loc);

    // If running in browser, also dispatch custom event
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent(LOCATION_UPDATED_EVENT, { detail: loc }));
    }
  } catch (err) {
    console.warn("Error storing location:", err);
  }
}

/**
 * Requests device GPS permissions and extracts current device coordinates.
 * Seamlessly leverages high-precision real-time IP extraction whenever browser
 * permissions or GPS hardware are unavailable.
 */
export async function getCurrentDeviceLocation(): Promise<LocationItem> {
  // Strategy A: Web Browser Geolocation with Instant IP Fallback
  if (Platform.OS === "web") {
    let webCoords: { latitude: number; longitude: number; accuracy?: number } | null = null;

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        webCoords = await new Promise<{ latitude: number; longitude: number; accuracy?: number }>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("Browser GPS timeout")), 4000);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timer);
              if (pos?.coords?.latitude && pos?.coords?.longitude) {
                resolve({
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracy: pos.coords.accuracy,
                });
              } else {
                reject(new Error("Invalid coordinates"));
              }
            },
            (err) => {
              clearTimeout(timer);
              reject(err);
            },
            { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
          );
        });
      } catch (webErr) {
        console.warn("Browser GPS unavailable, extracting via real-time IP geolocation:", webErr);
      }
    }

    if (webCoords) {
      const resolved = await reverseGeocodeGps(webCoords.latitude, webCoords.longitude);
      resolved.accuracy = Math.round(webCoords.accuracy || 15);
      await setStoredLocation(resolved);
      return resolved;
    }

    // IP-assisted accurate geolocation (Resolves true user location in Salem/Tamil Nadu)
    const ipLoc = await getIpBasedLocation();
    if (ipLoc) {
      const resolved = await reverseGeocodeGps(ipLoc.lat, ipLoc.lng);
      resolved.accuracy = ipLoc.accuracy;
      await setStoredLocation(resolved);
      return resolved;
    }

    const stored = await getStoredLocation();
    if (stored && !stored.area?.toLowerCase().includes("gandhipuram")) {
      return stored;
    }
    return DEFAULT_MOBILE_LOCATION;
  }

  // Strategy B: Native Expo Location (Android / iOS)
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("Location permission not granted, checking IP geolocation.");
      const ipLoc = await getIpBasedLocation();
      if (ipLoc) {
        const resolved = await reverseGeocodeGps(ipLoc.lat, ipLoc.lng);
        resolved.accuracy = ipLoc.accuracy;
        await setStoredLocation(resolved);
        return resolved;
      }
      const stored = await getStoredLocation();
      return stored || DEFAULT_MOBILE_LOCATION;
    }

    // Step 1: Check cached last known position for instant zero-wait display
    let initialLat: number | null = null;
    let initialLng: number | null = null;
    let initialAcc: number | undefined = undefined;

    try {
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown?.coords) {
        initialLat = lastKnown.coords.latitude;
        initialLng = lastKnown.coords.longitude;
        initialAcc = Math.round(lastKnown.coords.accuracy || 15);
      }
    } catch {
      // Non-fatal
    }

    // Step 2: Race fresh GPS location fix with 6000ms safety timeout
    const fetchFreshPosition = async () => {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return loc;
    };

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 6000);
    });

    const freshLoc = await Promise.race([fetchFreshPosition(), timeoutPromise]);

    const targetLat = freshLoc?.coords?.latitude ?? initialLat;
    const targetLng = freshLoc?.coords?.longitude ?? initialLng;
    const targetAcc = freshLoc?.coords?.accuracy ? Math.round(freshLoc.coords.accuracy) : initialAcc;

    if (targetLat !== null && targetLng !== null && targetLat !== undefined && targetLng !== undefined) {
      const resolved = await reverseGeocodeGps(targetLat, targetLng);
      resolved.accuracy = targetAcc;
      await setStoredLocation(resolved);
      return resolved;
    }

    const ipLoc = await getIpBasedLocation();
    if (ipLoc) {
      const resolved = await reverseGeocodeGps(ipLoc.lat, ipLoc.lng);
      resolved.accuracy = ipLoc.accuracy;
      await setStoredLocation(resolved);
      return resolved;
    }

    const stored = await getStoredLocation();
    return stored || DEFAULT_MOBILE_LOCATION;
  } catch (nativeErr) {
    console.warn("Native location error:", nativeErr);
    const ipLoc = await getIpBasedLocation();
    if (ipLoc) {
      const resolved = await reverseGeocodeGps(ipLoc.lat, ipLoc.lng);
      await setStoredLocation(resolved);
      return resolved;
    }
    const stored = await getStoredLocation();
    return stored || DEFAULT_MOBILE_LOCATION;
  }
}

// -------------------------------------------------------------
// Real-Time Continuous GPS Tracking Engine
// -------------------------------------------------------------
let activeWatchSubscription: Location.LocationSubscription | null = null;
let activeWebWatchId: number | null = null;
let isTracking = false;

/**
 * Check if continuous GPS tracking is currently active
 */
export function isLocationTrackingActive(): boolean {
  return isTracking;
}

/**
 * Start continuous GPS location tracking (updates as device moves)
 */
export async function startLocationTracking(
  onUpdate?: (loc: LocationItem) => void
): Promise<() => void> {
  isTracking = true;

  if (Platform.OS === "web") {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      activeWebWatchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const resolved = await reverseGeocodeGps(lat, lng);
          resolved.accuracy = Math.round(pos.coords.accuracy || 10);
          resolved.isLiveTracking = true;
          await setStoredLocation(resolved);
          if (onUpdate) onUpdate(resolved);
        },
        (err) => console.warn("Web watchPosition error:", err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }
  } else {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        activeWatchSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 4000, // Every 4 seconds
            distanceInterval: 10, // Every 10 meters
          },
          async (loc) => {
            const lat = loc.coords.latitude;
            const lng = loc.coords.longitude;
            const resolved = await reverseGeocodeGps(lat, lng);
            resolved.accuracy = Math.round(loc.coords.accuracy || 10);
            resolved.isLiveTracking = true;
            await setStoredLocation(resolved);
            if (onUpdate) onUpdate(resolved);
          }
        );
      }
    } catch (e) {
      console.warn("Native watchPosition error:", e);
    }
  }

  return () => stopLocationTracking();
}

/**
 * Stop continuous GPS location tracking
 */
export function stopLocationTracking(): void {
  isTracking = false;
  if (activeWatchSubscription) {
    activeWatchSubscription.remove();
    activeWatchSubscription = null;
  }
  if (activeWebWatchId !== null && typeof navigator !== "undefined" && navigator.geolocation) {
    navigator.geolocation.clearWatch(activeWebWatchId);
    activeWebWatchId = null;
  }
}

