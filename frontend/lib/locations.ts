export interface LocationItem {
  id: string;
  area: string;
  city: string;
  state: string;
  name: string; // e.g. "Gandhipuram, Coimbatore"
  lat: number;
  lng: number;
  isPopular?: boolean;
}

export const SERVICE_LOCATIONS: LocationItem[] = [
  // --- Coimbatore (High Precision Cooperative Grid) ---
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
  { id: "chn-9", area: "Tambaram", city: "Chennai", state: "Tamil Nadu", name: "Tambaram, Chennai", lat: 12.9249, lng: 80.1000 },
  { id: "chn-10", area: "Porur", city: "Chennai", state: "Tamil Nadu", name: "Porur, Chennai", lat: 13.0382, lng: 80.1565 },
  { id: "chn-11", area: "Vadapalani", city: "Chennai", state: "Tamil Nadu", name: "Vadapalani, Chennai", lat: 13.0500, lng: 80.2120 },
  { id: "chn-12", area: "Kilpauk", city: "Chennai", state: "Tamil Nadu", name: "Kilpauk, Chennai", lat: 13.0800, lng: 80.2400 },
  { id: "chn-13", area: "Alwarpet", city: "Chennai", state: "Tamil Nadu", name: "Alwarpet, Chennai", lat: 13.0330, lng: 80.2510 },
  { id: "chn-14", area: "Besant Nagar", city: "Chennai", state: "Tamil Nadu", name: "Besant Nagar, Chennai", lat: 12.9990, lng: 80.2700 },

  // --- Madurai ---
  { id: "mdu-1", area: "KK Nagar", city: "Madurai", state: "Tamil Nadu", name: "KK Nagar, Madurai", lat: 9.9252, lng: 78.1498, isPopular: true },
  { id: "mdu-2", area: "Anna Nagar", city: "Madurai", state: "Tamil Nadu", name: "Anna Nagar, Madurai", lat: 9.9190, lng: 78.1450, isPopular: true },
  { id: "mdu-3", area: "Simmakkal", city: "Madurai", state: "Tamil Nadu", name: "Simmakkal, Madurai", lat: 9.9280, lng: 78.1210 },
  { id: "mdu-4", area: "Mattuthavani", city: "Madurai", state: "Tamil Nadu", name: "Mattuthavani, Madurai", lat: 9.9450, lng: 78.1560, isPopular: true },
  { id: "mdu-5", area: "Goripalayam", city: "Madurai", state: "Tamil Nadu", name: "Goripalayam, Madurai", lat: 9.9320, lng: 78.1320 },
  { id: "mdu-6", area: "Teppakulam", city: "Madurai", state: "Tamil Nadu", name: "Teppakulam, Madurai", lat: 9.9100, lng: 78.1480 },
  { id: "mdu-7", area: "Thirunagar", city: "Madurai", state: "Tamil Nadu", name: "Thirunagar, Madurai", lat: 9.8780, lng: 78.0720 },
  { id: "mdu-8", area: "Sellur", city: "Madurai", state: "Tamil Nadu", name: "Sellur, Madurai", lat: 9.9380, lng: 78.1230 },

  // --- Tiruchirappalli (Trichy) ---
  { id: "try-1", area: "Thillai Nagar", city: "Tiruchirappalli", state: "Tamil Nadu", name: "Thillai Nagar, Tiruchirappalli", lat: 10.8250, lng: 78.6850, isPopular: true },
  { id: "try-2", area: "Cantonment", city: "Tiruchirappalli", state: "Tamil Nadu", name: "Cantonment, Tiruchirappalli", lat: 10.8060, lng: 78.6870, isPopular: true },
  { id: "try-3", area: "Srirangam", city: "Tiruchirappalli", state: "Tamil Nadu", name: "Srirangam, Tiruchirappalli", lat: 10.8620, lng: 78.6940, isPopular: true },
  { id: "try-4", area: "KK Nagar", city: "Tiruchirappalli", state: "Tamil Nadu", name: "KK Nagar, Tiruchirappalli", lat: 10.7850, lng: 78.7050 },
  { id: "try-5", area: "Ponmalai (Golden Rock)", city: "Tiruchirappalli", state: "Tamil Nadu", name: "Ponmalai, Tiruchirappalli", lat: 10.7950, lng: 78.7200 },
  { id: "try-6", area: "Woraiyur", city: "Tiruchirappalli", state: "Tamil Nadu", name: "Woraiyur, Tiruchirappalli", lat: 10.8320, lng: 78.6750 },

  // --- Salem ---
  { id: "slm-1", area: "Fairlands", city: "Salem", state: "Tamil Nadu", name: "Fairlands, Salem", lat: 11.6740, lng: 78.1460, isPopular: true },
  { id: "slm-2", area: "Hasthampatti", city: "Salem", state: "Tamil Nadu", name: "Hasthampatti, Salem", lat: 11.6810, lng: 78.1600, isPopular: true },
  { id: "slm-3", area: "Alagapuram", city: "Salem", state: "Tamil Nadu", name: "Alagapuram, Salem", lat: 11.6720, lng: 78.1380 },
  { id: "slm-4", area: "Suramangalam", city: "Salem", state: "Tamil Nadu", name: "Suramangalam, Salem", lat: 11.6670, lng: 78.1180 },
  { id: "slm-5", area: "Meyyanur", city: "Salem", state: "Tamil Nadu", name: "Meyyanur, Salem", lat: 11.6680, lng: 78.1320 },
  { id: "slm-6", area: "Ammapet", city: "Salem", state: "Tamil Nadu", name: "Ammapet, Salem", lat: 11.6540, lng: 78.1800 },

  // --- Tiruppur ---
  { id: "tup-1", area: "Avinashi Road", city: "Tiruppur", state: "Tamil Nadu", name: "Avinashi Road, Tiruppur", lat: 11.1150, lng: 77.3480, isPopular: true },
  { id: "tup-2", area: "Old Bus Stand", city: "Tiruppur", state: "Tamil Nadu", name: "Old Bus Stand, Tiruppur", lat: 11.1085, lng: 77.3411, isPopular: true },
  { id: "tup-3", area: "Angeripalayam", city: "Tiruppur", state: "Tamil Nadu", name: "Angeripalayam, Tiruppur", lat: 11.1350, lng: 77.3320 },
  { id: "tup-4", area: "Dharapuram Road", city: "Tiruppur", state: "Tamil Nadu", name: "Dharapuram Road, Tiruppur", lat: 11.0950, lng: 77.3550 },
  { id: "tup-5", area: "Rayapuram", city: "Tiruppur", state: "Tamil Nadu", name: "Rayapuram, Tiruppur", lat: 11.1080, lng: 77.3420 },

  // --- Erode ---
  { id: "erd-1", area: "Perundurai Road", city: "Erode", state: "Tamil Nadu", name: "Perundurai Road, Erode", lat: 11.3400, lng: 77.7120, isPopular: true },
  { id: "erd-2", area: "Brough Road", city: "Erode", state: "Tamil Nadu", name: "Brough Road, Erode", lat: 11.3450, lng: 77.7280, isPopular: true },
  { id: "erd-3", area: "Veerappanchatram", city: "Erode", state: "Tamil Nadu", name: "Veerappanchatram, Erode", lat: 11.3610, lng: 77.7210 },
  { id: "erd-4", area: "Thindal", city: "Erode", state: "Tamil Nadu", name: "Thindal, Erode", lat: 11.3200, lng: 77.6780 },

  // --- Bengaluru ---
  { id: "blr-1", area: "Indiranagar", city: "Bengaluru", state: "Karnataka", name: "Indiranagar, Bengaluru", lat: 12.9784, lng: 77.6408, isPopular: true },
  { id: "blr-2", area: "Koramangala", city: "Bengaluru", state: "Karnataka", name: "Koramangala, Bengaluru", lat: 12.9352, lng: 77.6245, isPopular: true },
  { id: "blr-3", area: "Whitefield", city: "Bengaluru", state: "Karnataka", name: "Whitefield, Bengaluru", lat: 12.9698, lng: 77.7499, isPopular: true },
  { id: "blr-4", area: "HSR Layout", city: "Bengaluru", state: "Karnataka", name: "HSR Layout, Bengaluru", lat: 12.9121, lng: 77.6446 },
  { id: "blr-5", area: "Jayanagar", city: "Bengaluru", state: "Karnataka", name: "Jayanagar, Bengaluru", lat: 12.9308, lng: 77.5838 },
  { id: "blr-6", area: "Electronic City", city: "Bengaluru", state: "Karnataka", name: "Electronic City, Bengaluru", lat: 12.8452, lng: 77.6602 },
  { id: "blr-7", area: "Malleshwaram", city: "Bengaluru", state: "Karnataka", name: "Malleshwaram, Bengaluru", lat: 13.0031, lng: 77.5643 },

  // --- Hyderabad ---
  { id: "hyd-1", area: "Hitec City", city: "Hyderabad", state: "Telangana", name: "Hitec City, Hyderabad", lat: 17.4435, lng: 78.3772, isPopular: true },
  { id: "hyd-2", area: "Banjara Hills", city: "Hyderabad", state: "Telangana", name: "Banjara Hills, Hyderabad", lat: 17.4156, lng: 78.4350, isPopular: true },
  { id: "hyd-3", area: "Jubilee Hills", city: "Hyderabad", state: "Telangana", name: "Jubilee Hills, Hyderabad", lat: 17.4319, lng: 78.4074 },
  { id: "hyd-4", area: "Gachibowli", city: "Hyderabad", state: "Telangana", name: "Gachibowli, Hyderabad", lat: 17.4401, lng: 78.3489 },

  // --- Kochi ---
  { id: "cok-1", area: "MG Road", city: "Kochi", state: "Kerala", name: "MG Road, Kochi", lat: 9.9674, lng: 76.2842, isPopular: true },
  { id: "cok-2", area: "Edappally", city: "Kochi", state: "Kerala", name: "Edappally, Kochi", lat: 10.0261, lng: 76.3125, isPopular: true },
  { id: "cok-3", area: "Kakkanad", city: "Kochi", state: "Kerala", name: "Kakkanad, Kochi", lat: 10.0159, lng: 76.3419 },
  { id: "cok-4", area: "Fort Kochi", city: "Kochi", state: "Kerala", name: "Fort Kochi, Kochi", lat: 9.9658, lng: 76.2421 },
];

export const POPULAR_CITIES = [
  "All",
  "Coimbatore",
  "Chennai",
  "Madurai",
  "Tiruchirappalli",
  "Salem",
  "Tiruppur",
  "Erode",
  "Bengaluru",
];

export const DEFAULT_LOCATION: LocationItem = SERVICE_LOCATIONS[0]; // Gandhipuram, Coimbatore

export function searchLocations(query: string, cityFilter: string = "All"): LocationItem[] {
  const cleanQ = query.trim().toLowerCase();
  
  return SERVICE_LOCATIONS.filter((loc) => {
    // City filter match
    if (cityFilter !== "All" && loc.city.toLowerCase() !== cityFilter.toLowerCase()) {
      return false;
    }

    if (!cleanQ) return true;

    // Search by spelling across Area, City, State, or combined Name
    return (
      loc.area.toLowerCase().includes(cleanQ) ||
      loc.city.toLowerCase().includes(cleanQ) ||
      loc.state.toLowerCase().includes(cleanQ) ||
      loc.name.toLowerCase().includes(cleanQ)
    );
  });
}

/**
 * Calculate distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Finds the nearest cooperative service location for given GPS coordinates
 */
export function findNearestLocation(lat: number, lng: number): LocationItem {
  let nearest: LocationItem = DEFAULT_LOCATION;
  let minDistance = Infinity;

  for (const loc of SERVICE_LOCATIONS) {
    const dist = calculateDistanceKm(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = loc;
    }
  }

  return nearest;
}

export interface GpsExtractionResult {
  address: string;
  location: LocationItem;
  lat: number;
  lng: number;
  accuracy?: number;
  road?: string;
  suburb?: string;
  city?: string;
  postcode?: string;
}

/**
 * Local storage key and custom event name for synchronized GPS location
 */
export const LOCATION_STORAGE_KEY = "ondemand_customer_gps_location";
export const LOCATION_UPDATED_EVENT = "ondemand_location_updated";

/**
 * Retrieve cached GPS location result from localStorage if available
 */
export function getStoredLocation(): GpsExtractionResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save GPS location to localStorage and broadcast change to other components
 */
export function setStoredLocation(result: GpsExtractionResult): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(result));
    window.dispatchEvent(new CustomEvent(LOCATION_UPDATED_EVENT, { detail: result }));
  } catch (e) {
    console.warn("Could not cache location:", e);
  }
}

/**
 * High-precision reverse geocoding from GPS coordinates into detailed street, building, colony, and city.
 * Combines OpenStreetMap (zoom=18 building level) and BigDataCloud for maximum accuracy and zero rate-limiting.
 */
export async function reverseGeocodeGps(lat: number, lng: number, accuracy?: number): Promise<GpsExtractionResult> {
  const nearestLoc = findNearestLocation(lat, lng);

  // Strategy 1: OpenStreetMap Nominatim with zoom 18 for building/street-level detail
  const fetchNominatim = async (): Promise<GpsExtractionResult | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en, ta",
            "User-Agent": "OnDemandLabourCooperative/2.0 (Verified Service; SIH)"
          },
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        
        const houseNumber = addr.house_number || addr.house_name || "";
        const building = addr.building || addr.amenity || addr.shop || "";
        const road = addr.road || addr.street || addr.residential || addr.pedestrian || addr.footway || "";
        const neighbourhood = addr.neighbourhood || addr.subdistrict || addr.quarter || "";
        const suburb = addr.suburb || addr.locality || neighbourhood || nearestLoc.area;
        const city = addr.city || addr.town || addr.municipality || addr.county || nearestLoc.city;
        const state = addr.state || nearestLoc.state;
        const postcode = addr.postcode ? ` - ${addr.postcode}` : "";

        const parts: string[] = [];
        if (houseNumber && road) {
          parts.push(`${houseNumber}, ${road}`);
        } else if (building && road) {
          parts.push(`${building}, ${road}`);
        } else if (road) {
          parts.push(road);
        } else if (building) {
          parts.push(building);
        }

        if (neighbourhood && !parts.includes(neighbourhood) && neighbourhood !== suburb) {
          parts.push(neighbourhood);
        }
        if (suburb && !parts.includes(suburb)) {
          parts.push(suburb);
        }
        if (city && !parts.includes(city)) {
          parts.push(city);
        }

        const formattedAddress = parts.length > 0 ? `${parts.join(", ")}${postcode}` : (data.display_name || `${nearestLoc.area}, ${nearestLoc.city}`);

        const customLoc: LocationItem = {
          id: `gps-${Date.now()}`,
          area: suburb || nearestLoc.area,
          city: city || nearestLoc.city,
          state: state || nearestLoc.state,
          name: `${suburb || nearestLoc.area}, ${city || nearestLoc.city}`,
          lat,
          lng
        };

        return {
          address: formattedAddress,
          location: customLoc,
          lat,
          lng,
          accuracy,
          road,
          suburb,
          city,
          postcode: addr.postcode
        };
      }
    } catch {
      // Ignore and fallback
    } finally {
      clearTimeout(timeoutId);
    }
    return null;
  };

  // Strategy 2: BigDataCloud Client Reverse Geocoding API (fast, reliable sub-locality resolution)
  const fetchBigDataCloud = async (): Promise<GpsExtractionResult | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const locality = data.locality || data.subLocality || nearestLoc.area;
        const city = data.city || nearestLoc.city;
        const state = data.principalSubdivision || nearestLoc.state;
        const postcode = data.postcode ? ` - ${data.postcode}` : "";

        // Look for informative street/road in localityInfo
        const info = Array.isArray(data.localityInfo?.informative) ? data.localityInfo.informative : [];
        const streetOrRoad = info.find((i: any) => 
          i.description?.toLowerCase().includes("road") || 
          i.description?.toLowerCase().includes("street") ||
          i.name?.toLowerCase().includes("road") ||
          i.name?.toLowerCase().includes("street")
        )?.name || "";

        const parts: string[] = [];
        if (streetOrRoad) parts.push(streetOrRoad);
        if (locality && !parts.includes(locality)) parts.push(locality);
        if (city && !parts.includes(city)) parts.push(city);

        const formattedAddress = parts.length > 0 ? `${parts.join(", ")}${postcode}` : `${locality}, ${city}${postcode}`;

        const customLoc: LocationItem = {
          id: `gps-${Date.now()}`,
          area: locality,
          city,
          state,
          name: `${locality}, ${city}`,
          lat,
          lng
        };

        return {
          address: formattedAddress,
          location: customLoc,
          lat,
          lng,
          accuracy,
          suburb: locality,
          city,
          postcode: data.postcode
        };
      }
    } catch {
      // Ignore
    } finally {
      clearTimeout(timeoutId);
    }
    return null;
  };

  // Execute both in parallel for maximum speed and accuracy
  try {
    const [nominatimResult, bdcResult] = await Promise.allSettled([
      fetchNominatim(),
      fetchBigDataCloud()
    ]);

    if (nominatimResult.status === "fulfilled" && nominatimResult.value) {
      setStoredLocation(nominatimResult.value);
      return nominatimResult.value;
    }

    if (bdcResult.status === "fulfilled" && bdcResult.value) {
      setStoredLocation(bdcResult.value);
      return bdcResult.value;
    }
  } catch (e) {
    console.warn("Dual geocoder warning:", e);
  }

  // Fallback to nearest cooperative node
  const fallbackResult: GpsExtractionResult = {
    address: `${nearestLoc.name}, Tamil Nadu`,
    location: {
      ...nearestLoc,
      lat,
      lng
    },
    lat,
    lng,
    accuracy,
    suburb: nearestLoc.area,
    city: nearestLoc.city
  };

  setStoredLocation(fallbackResult);
  return fallbackResult;
}

/**
 * Fast GPS extraction helper with fresh hardware accuracy (maximumAge: 0) and automatic fallback
 */
export function extractFastGps(options?: PositionOptions): Promise<GpsExtractionResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude, accuracy } = pos.coords;
          const result = await reverseGeocodeGps(latitude, longitude, Math.round(accuracy));
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0, // CRITICAL: zero maximumAge forces fresh real-time satellite GPS hardware fix!
        ...options,
      }
    );
  });
}

