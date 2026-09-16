const SERVICES_MAP: Record<string, { id: number; name: string }> = {
  // English
  electrician: { id: 1, name: "Fan & light repair" },
  electrical: { id: 1, name: "Fan & light repair" },
  wiring: { id: 2, name: "Full house wiring check" },
  plumber: { id: 3, name: "Tap & pipe repair" },
  plumbing: { id: 3, name: "Tap & pipe repair" },
  pipe: { id: 3, name: "Tap & pipe repair" },
  carpenter: { id: 5, name: "Furniture repair" },
  carpentry: { id: 5, name: "Furniture repair" },
  wood: { id: 5, name: "Furniture repair" },
  painter: { id: 6, name: "1BHK painting" },
  painting: { id: 6, name: "1BHK painting" },
  driver: { id: 7, name: "Local driver 8h" },
  driving: { id: 7, name: "Local driver 8h" },
  cleaner: { id: 8, name: "Deep home cleaning" },
  cleaning: { id: 8, name: "Deep home cleaning" },
  gardener: { id: 9, name: "Lawn & plant maintenance" },
  gardening: { id: 9, name: "Lawn & plant maintenance" },
  caregiver: { id: 10, name: "Elderly companion assistance" },
  elderly: { id: 10, name: "Elderly companion assistance" },

  // Tamil
  எலக்ட்ரீஷியன்: { id: 1, name: "Fan & light repair" },
  மின்சார: { id: 1, name: "Fan & light repair" },
  மின்பணியாளர்: { id: 1, name: "Fan & light repair" },
  "மின் விசிறி": { id: 1, name: "Fan & light repair" },
  வயரிங்: { id: 2, name: "Full house wiring check" },
  பிளம்பர்: { id: 3, name: "Tap & pipe repair" },
  குழாய்: { id: 3, name: "Tap & pipe repair" },
  தச்சர்: { id: 5, name: "Furniture repair" },
  கார்பெண்டர்: { id: 5, name: "Furniture repair" },
  "மர வேலை": { id: 5, name: "Furniture repair" },
  பெயிண்டர்: { id: 6, name: "1BHK painting" },
  பெயிண்டிங்: { id: 6, name: "1BHK painting" },
  வண்ணம்: { id: 6, name: "1BHK painting" },
  டிரைவர்: { id: 7, name: "Local driver 8h" },
  ஓட்டுநர்: { id: 7, name: "Local driver 8h" },
  சுத்தம்: { id: 8, name: "Deep home cleaning" },
  கிளீனர்: { id: 8, name: "Deep home cleaning" },
  தோட்டம்: { id: 9, name: "Lawn & plant maintenance" },
  முதியோர்: { id: 10, name: "Elderly companion assistance" },

  // Hindi
  इलेक्ट्रीशियन: { id: 1, name: "Fan & light repair" },
  बिजली: { id: 1, name: "Fan & light repair" },
  वायरिंग: { id: 2, name: "Full house wiring check" },
  प्लंबर: { id: 3, name: "Tap & pipe repair" },
  नल: { id: 3, name: "Tap & pipe repair" },
  पाइप: { id: 3, name: "Tap & pipe repair" },
  बढ़ई: { id: 5, name: "Furniture repair" },
  कारपेंटर: { id: 5, name: "Furniture repair" },
  पेंटर: { id: 6, name: "1BHK painting" },
  पुताई: { id: 6, name: "1BHK painting" },
  ड्राइवर: { id: 7, name: "Local driver 8h" },
  सफाई: { id: 8, name: "Deep home cleaning" },
  माली: { id: 9, name: "Lawn & plant maintenance" },
  देखभाल: { id: 10, name: "Elderly companion assistance" }
};

const LOCATIONS_MAP: Record<string, { name: string; lat: number; lng: number }> = {
  // English
  gandhipuram: { name: "Gandhipuram", lat: 11.0168, lng: 76.9558 },
  "rs puram": { name: "RS Puram", lat: 11.0180, lng: 76.9400 },
  peelamedu: { name: "Peelamedu", lat: 11.0240, lng: 77.0020 },
  "saibaba colony": { name: "Saibaba Colony", lat: 11.0310, lng: 76.9420 },
  "town hall": { name: "Town Hall", lat: 10.9980, lng: 76.9620 },
  ukkadam: { name: "Ukkadam", lat: 10.9890, lng: 76.9580 },
  singanallur: { name: "Singanallur", lat: 11.0020, lng: 77.0250 },

  // Tamil
  காந்திபுரம்: { name: "Gandhipuram", lat: 11.0168, lng: 76.9558 },
  "ஆர்.எஸ்.புரம்": { name: "RS Puram", lat: 11.0180, lng: 76.9400 },
  "ஆர் எஸ் புரம்": { name: "RS Puram", lat: 11.0180, lng: 76.9400 },
  பீளமேடு: { name: "Peelamedu", lat: 11.0240, lng: 77.0020 },
  "சாய்பாபா காலனி": { name: "Saibaba Colony", lat: 11.0310, lng: 76.9420 },
  "டவுன் ஹால்": { name: "Town Hall", lat: 10.9980, lng: 76.9620 },
  உக்கடம்: { name: "Ukkadam", lat: 10.9890, lng: 76.9580 },
  சிங்காநல்லூர்: { name: "Singanallur", lat: 11.0020, lng: 77.0250 },

  // Hindi
  गांधीपुरम: { name: "Gandhipuram", lat: 11.0168, lng: 76.9558 },
  "आर एस पुरम": { name: "RS Puram", lat: 11.0180, lng: 76.9400 },
  पीलामेडू: { name: "Peelamedu", lat: 11.0240, lng: 77.0020 },
  "साईबाबा कॉलोनी": { name: "Saibaba Colony", lat: 11.0310, lng: 76.9420 },
  "टाउन हॉल": { name: "Town Hall", lat: 10.9980, lng: 76.9620 },
  उक्कदम: { name: "Ukkadam", lat: 10.9890, lng: 76.9580 },
  सिंगानल्लूर: { name: "Singanallur", lat: 11.0020, lng: 77.0250 }
};

export function parseNaturalLanguage(text: string) {
  const lower = text.toLowerCase();

  let matchedService: { id: number; name: string } | null = null;
  for (const [kw, svc] of Object.entries(SERVICES_MAP)) {
    if (lower.includes(kw.toLowerCase())) {
      matchedService = svc;
      break;
    }
  }

  let matchedLocation: string | null = null;
  for (const [kw, loc] of Object.entries(LOCATIONS_MAP)) {
    if (lower.includes(kw.toLowerCase())) {
      matchedLocation = loc.name;
      break;
    }
  }

  // Date parsing
  let parsedDate: string | null = null;
  const today = new Date();
  if (lower.includes("tomorrow") || lower.includes("நாளை") || lower.includes("कल")) {
    const d = new Date(today.getTime() + 86400000);
    parsedDate = d.toISOString().split("T")[0];
  } else if (lower.includes("today") || lower.includes("இன்று") || lower.includes("आज")) {
    parsedDate = today.toISOString().split("T")[0];
  }

  // Time parsing (e.g. 10 am, 2:30 pm, 11:00)
  let parsedTime: string | null = null;
  const timeRegex = /(\b(?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\s*(?:am|pm)\b|\b(?:[01]?[0-9]|2[0-3]):[0-5][0-9]\b)/i;
  const timeMatch = lower.match(timeRegex);
  if (timeMatch) {
    const raw = timeMatch[1].trim();
    if (raw.toLowerCase().includes("pm") || raw.toLowerCase().includes("am")) {
      const isPm = raw.toLowerCase().includes("pm");
      const clean = raw.replace(/(am|pm)/i, "").trim();
      const [h, m] = clean.includes(":") ? clean.split(":").map(Number) : [parseInt(clean, 10), 0];
      let hours = isPm && h < 12 ? h + 12 : (!isPm && h === 12 ? 0 : h);
      parsedTime = `${hours.toString().padStart(2, "0")}:${(m || 0).toString().padStart(2, "0")}`;
    } else {
      const [h, m] = raw.split(":").map(Number);
      parsedTime = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  const parts = [];
  if (matchedService) parts.push(`Identified service: ${matchedService.name}`);
  if (matchedLocation) parts.push(`Area: ${matchedLocation}`);
  if (parsedDate) parts.push(`Date: ${parsedDate}`);
  if (parsedTime) parts.push(`Time: ${parsedTime}`);

  return {
    service_id: matchedService ? matchedService.id : 1,
    service_name: matchedService ? matchedService.name : "Fan & light repair",
    location: matchedLocation || "Gandhipuram",
    date: parsedDate || new Date(today.getTime() + 86400000).toISOString().split("T")[0],
    time: parsedTime || "10:00",
    explain: parts.length > 0 ? parts.join(" • ") : "Extracted parameters from query",
    confidence: matchedService ? 0.95 : 0.65
  };
}
