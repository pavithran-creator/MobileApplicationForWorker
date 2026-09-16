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
  // --- Coimbatore ---
  { id: "cbe-1", area: "Gandhipuram", city: "Coimbatore", state: "Tamil Nadu", name: "Gandhipuram, Coimbatore", lat: 11.0168, lng: 76.9558, isPopular: true },
  { id: "cbe-2", area: "RS Puram", city: "Coimbatore", state: "Tamil Nadu", name: "RS Puram, Coimbatore", lat: 11.0180, lng: 76.9400, isPopular: true },
  { id: "cbe-3", area: "Peelamedu", city: "Coimbatore", state: "Tamil Nadu", name: "Peelamedu, Coimbatore", lat: 11.0240, lng: 77.0020, isPopular: true },
  { id: "cbe-4", area: "Saibaba Colony", city: "Coimbatore", state: "Tamil Nadu", name: "Saibaba Colony, Coimbatore", lat: 11.0310, lng: 76.9420, isPopular: true },
  { id: "cbe-5", area: "Singanallur", city: "Coimbatore", state: "Tamil Nadu", name: "Singanallur, Coimbatore", lat: 11.0020, lng: 77.0250 },
  { id: "cbe-6", area: "Saravanampatti", city: "Coimbatore", state: "Tamil Nadu", name: "Saravanampatti, Coimbatore", lat: 11.0797, lng: 76.9997, isPopular: true },
  { id: "cbe-7", area: "Ramanathapuram", city: "Coimbatore", state: "Tamil Nadu", name: "Ramanathapuram, Coimbatore", lat: 10.9995, lng: 76.9850 },
  { id: "cbe-8", area: "Hopes College", city: "Coimbatore", state: "Tamil Nadu", name: "Hopes College, Coimbatore", lat: 11.0280, lng: 77.0140 },
  { id: "cbe-9", area: "Vadavalli", city: "Coimbatore", state: "Tamil Nadu", name: "Vadavalli, Coimbatore", lat: 11.0280, lng: 76.9020 },
  { id: "cbe-10", area: "Thudiyalur", city: "Coimbatore", state: "Tamil Nadu", name: "Thudiyalur, Coimbatore", lat: 11.0800, lng: 76.9380 },
  { id: "cbe-11", area: "Kovaipudur", city: "Coimbatore", state: "Tamil Nadu", name: "Kovaipudur, Coimbatore", lat: 10.9380, lng: 76.9400 },
  { id: "cbe-12", area: "Ukkadam", city: "Coimbatore", state: "Tamil Nadu", name: "Ukkadam, Coimbatore", lat: 10.9920, lng: 76.9600 },
  { id: "cbe-13", area: "Pollachi", city: "Coimbatore", state: "Tamil Nadu", name: "Pollachi, Coimbatore", lat: 10.6580, lng: 77.0080 },

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
