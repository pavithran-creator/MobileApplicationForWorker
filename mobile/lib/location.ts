import * as Location from "expo-location";
import { LocationItem } from "../types";

export const DEFAULT_MOBILE_LOCATION: LocationItem = {
  name: "Gandhipuram",
  area: "Gandhipuram",
  city: "Coimbatore",
  lat: 11.0168,
  lng: 76.9558,
};

export const PRESET_LOCATIONS: LocationItem[] = [
  { name: "Gandhipuram", area: "Gandhipuram", city: "Coimbatore", lat: 11.0168, lng: 76.9558 },
  { name: "RS Puram", area: "RS Puram", city: "Coimbatore", lat: 11.0180, lng: 76.9400 },
  { name: "Peelamedu", area: "Peelamedu", city: "Coimbatore", lat: 11.0240, lng: 77.0020 },
  { name: "Saibaba Colony", area: "Saibaba Colony", city: "Coimbatore", lat: 11.0310, lng: 76.9420 },
  { name: "Town Hall", area: "Town Hall", city: "Coimbatore", lat: 10.9980, lng: 76.9620 },
  { name: "Ukkadam", area: "Ukkadam", city: "Coimbatore", lat: 10.9890, lng: 76.9580 },
  { name: "Singanallur", area: "Singanallur", city: "Coimbatore", lat: 11.0020, lng: 77.0250 },
  { name: "T. Nagar", area: "T. Nagar", city: "Chennai", lat: 13.0418, lng: 80.2341 },
  { name: "Anna Nagar", area: "Anna Nagar", city: "Chennai", lat: 13.0850, lng: 80.2101 },
  { name: "KK Nagar", area: "KK Nagar", city: "Madurai", lat: 9.9252, lng: 78.1498 },
];

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
 * Requests device GPS permissions and extracts current device coordinates
 */
export async function getCurrentDeviceLocation(): Promise<LocationItem> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return DEFAULT_MOBILE_LOCATION;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const lat = loc.coords.latitude;
    const lng = loc.coords.longitude;

    // Reverse geocode to find friendly area name
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        const areaName = addr.district || addr.subregion || addr.city || "Current Location";
        return {
          name: `${areaName}`,
          area: areaName,
          city: addr.city || "Tamil Nadu",
          lat,
          lng,
        };
      }
    } catch {
      // Fallback
    }

    return {
      name: "Current GPS Location",
      area: "Coimbatore",
      city: "Coimbatore",
      lat,
      lng,
    };
  } catch (err) {
    console.warn("Location error:", err);
    return DEFAULT_MOBILE_LOCATION;
  }
}
