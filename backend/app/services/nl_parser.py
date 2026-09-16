import re
from datetime import date, timedelta

SERVICES_MAP = {
    # English
    "electrician": {"id": 1, "name": "Fan & light repair"},
    "electrical": {"id": 1, "name": "Fan & light repair"},
    "wiring": {"id": 2, "name": "Full house wiring check"},
    "plumber": {"id": 3, "name": "Tap & pipe repair"},
    "plumbing": {"id": 3, "name": "Tap & pipe repair"},
    "pipe": {"id": 3, "name": "Tap & pipe repair"},
    "carpenter": {"id": 5, "name": "Furniture repair"},
    "carpentry": {"id": 5, "name": "Furniture repair"},
    "painter": {"id": 6, "name": "1BHK painting"},
    "painting": {"id": 6, "name": "1BHK painting"},
    "driver": {"id": 7, "name": "Local driver 8h"},
    "driving": {"id": 7, "name": "Local driver 8h"},
    "cleaner": {"id": 8, "name": "Deep home cleaning"},
    "cleaning": {"id": 8, "name": "Deep home cleaning"},
    "gardener": {"id": 9, "name": "Lawn & plant maintenance"},
    "caregiver": {"id": 10, "name": "Elderly companion assistance"},
    # Tamil
    "எலக்ட்ரீஷியன்": {"id": 1, "name": "Fan & light repair"},
    "மின்சார": {"id": 1, "name": "Fan & light repair"},
    "மின் பணியாளர்": {"id": 1, "name": "Fan & light repair"},
    "மின் விசிறி": {"id": 1, "name": "Fan & light repair"},
    "வயரிங்": {"id": 2, "name": "Full house wiring check"},
    "பிளம்பர்": {"id": 3, "name": "Tap & pipe repair"},
    "குழாய்": {"id": 3, "name": "Tap & pipe repair"},
    "தச்சர்": {"id": 5, "name": "Furniture repair"},
    "கார்பெண்டர்": {"id": 5, "name": "Furniture repair"},
    "மர வேலை": {"id": 5, "name": "Furniture repair"},
    "பெயிண்டர்": {"id": 6, "name": "1BHK painting"},
    "பெயிண்டிங்": {"id": 6, "name": "1BHK painting"},
    "வண்ணம்": {"id": 6, "name": "1BHK painting"},
    "டிரைவர்": {"id": 7, "name": "Local driver 8h"},
    "ஓட்டுநர்": {"id": 7, "name": "Local driver 8h"},
    "சுத்தம்": {"id": 8, "name": "Deep home cleaning"},
    "கிளீனர்": {"id": 8, "name": "Deep home cleaning"},
    "தோட்டம்": {"id": 9, "name": "Lawn & plant maintenance"},
    "முதியோர்": {"id": 10, "name": "Elderly companion assistance"},
    # Hindi
    "इलेक्ट्रीशियन": {"id": 1, "name": "Fan & light repair"},
    "बिजली": {"id": 1, "name": "Fan & light repair"},
    "वायरिंग": {"id": 2, "name": "Full house wiring check"},
    "प्लंबर": {"id": 3, "name": "Tap & pipe repair"},
    "नल": {"id": 3, "name": "Tap & pipe repair"},
    "पाइप": {"id": 3, "name": "Tap & pipe repair"},
    "बढ़ई": {"id": 5, "name": "Furniture repair"},
    "कारपेंटर": {"id": 5, "name": "Furniture repair"},
    "पेंटर": {"id": 6, "name": "1BHK painting"},
    "पुताई": {"id": 6, "name": "1BHK painting"},
    "ड्राइवर": {"id": 7, "name": "Local driver 8h"},
    "सफाई": {"id": 8, "name": "Deep home cleaning"},
    "माली": {"id": 9, "name": "Lawn & plant maintenance"},
    "देखभाल": {"id": 10, "name": "Elderly companion assistance"}
}

LOCATIONS_MAP = {
    # English
    "gandhipuram": {"name": "Gandhipuram", "lat": 11.0168, "lng": 76.9558},
    "rs puram": {"name": "RS Puram", "lat": 11.0180, "lng": 76.9400},
    "peelamedu": {"name": "Peelamedu", "lat": 11.0240, "lng": 77.0020},
    "saibaba colony": {"name": "Saibaba Colony", "lat": 11.0310, "lng": 76.9420},
    "town hall": {"name": "Town Hall", "lat": 10.9980, "lng": 76.9620},
    "ukkadam": {"name": "Ukkadam", "lat": 10.9890, "lng": 76.9580},
    "singanallur": {"name": "Singanallur", "lat": 11.0020, "lng": 77.0250},
    # Tamil
    "காந்திபுரம்": {"name": "Gandhipuram", "lat": 11.0168, "lng": 76.9558},
    "ஆர்.எஸ்.புரம்": {"name": "RS Puram", "lat": 11.0180, "lng": 76.9400},
    "ஆர் எஸ் புரம்": {"name": "RS Puram", "lat": 11.0180, "lng": 76.9400},
    "பீளமேடு": {"name": "Peelamedu", "lat": 11.0240, "lng": 77.0020},
    "சாய்பாபா காலனி": {"name": "Saibaba Colony", "lat": 11.0310, "lng": 76.9420},
    "டவுன் ஹால்": {"name": "Town Hall", "lat": 10.9980, "lng": 76.9620},
    "உக்கடம்": {"name": "Ukkadam", "lat": 10.9890, "lng": 76.9580},
    "சிங்காநல்லூர்": {"name": "Singanallur", "lat": 11.0020, "lng": 77.0250},
    # Hindi
    "गांधीपुरम": {"name": "Gandhipuram", "lat": 11.0168, "lng": 76.9558},
    "आर एस पुरम": {"name": "RS Puram", "lat": 11.0180, "lng": 76.9400},
    "पीलामेडू": {"name": "Peelamedu", "lat": 11.0240, "lng": 77.0020},
    "साईबाबा कॉलोनी": {"name": "Saibaba Colony", "lat": 11.0310, "lng": 76.9420},
    "टाउन हॉल": {"name": "Town Hall", "lat": 10.9980, "lng": 76.9620},
    "उक्कदम": {"name": "Ukkadam", "lat": 10.9890, "lng": 76.9580},
    "सिंगानल्लूर": {"name": "Singanallur", "lat": 11.0020, "lng": 77.0250}
}

import json
from app.core.config import settings

def _gemini_parse(text: str):
    if not settings.AI_API_KEY:
        return None
    try:
        from google import genai
        client = genai.Client(api_key=settings.AI_API_KEY)
        prompt = f"""You are an intelligent booking assistant for a verified Labour Cooperative service marketplace in Coimbatore, Tamil Nadu.
Extract service request parameters from the user's input: "{text}"
Available services:
1: Fan & light repair (electrician)
2: Full house wiring check (wiring inspection)
3: Tap & pipe repair (plumbing)
4: Bathroom plumbing overhaul
5: Furniture repair (carpenter)
6: 1BHK painting
7: Local driver 8h
8: Deep home cleaning
9: Lawn & plant maintenance (gardener)
10: Elderly companion assistance

Today's date is {date.today().isoformat()}.
Extract and return ONLY a JSON object with keys:
- service_id (integer 1-10)
- service_name (string)
- date (YYYY-MM-DD)
- time (HH:MM in 24-hour format)
- location (area name in Coimbatore e.g. Gandhipuram, RS Puram, Peelamedu)
- lat (float e.g. 11.0168)
- lng (float e.g. 76.9558)
- confidence (float between 0.0 and 1.0)
- explain (one-sentence human readable explanation)
"""
        for model_name in ["gemini-2.5-flash", "gemini-3.6-flash", "gemini-flash-latest", "gemini-3.5-flash"]:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                raw_text = (response.text or "").strip()
                if "```json" in raw_text:
                    raw_text = raw_text.split("```json")[1].split("```")[0].strip()
                elif "```" in raw_text:
                    raw_text = raw_text.split("```")[1].split("```")[0].strip()
                data = json.loads(raw_text)
                if "service_id" in data and "date" in data:
                    return data
            except Exception:
                continue
    except Exception:
        pass
    return None

def parse(text: str):
    ai_result = _gemini_parse(text)
    if ai_result:
        return ai_result

    t = text.lower().strip()

    # Identify service
    svc_info = {"id": 1, "name": "Fan & light repair"}
    matched_svc = "electrician"
    for k, info in SERVICES_MAP.items():
        if k.lower() in t:
            matched_svc = k
            svc_info = info
            break

    # Identify date
    if "tomorrow" in t or "நாளை" in t or "कल" in t:
        target_date = (date.today() + timedelta(days=1)).isoformat()
    elif "day after" in t or "நாளை மறுநாள்" in t or "परसों" in t:
        target_date = (date.today() + timedelta(days=2)).isoformat()
    elif "today" in t or "இன்று" in t or "आज" in t:
        target_date = date.today().isoformat()
    else:
        target_date = (date.today() + timedelta(days=1)).isoformat()

    # Identify location
    loc_info = {"name": "Gandhipuram", "lat": 11.0168, "lng": 76.9558}
    for loc_key, loc_data in LOCATIONS_MAP.items():
        if loc_key.lower() in t:
            loc_info = loc_data
            break

    # Identify time
    is_pm = any(w in t for w in ["pm", "மாலை", "இரவு", "பிற்பகல்", "शाम", "रात", "दोपहर"])
    is_am = any(w in t for w in ["am", "காலை", "முற்பகல்", "सुबह"])

    m_time = re.search(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", t)
    formatted_time = "18:00"
    if m_time:
        hour = int(m_time.group(1))
        minute = m_time.group(2) or "00"
        ampm = m_time.group(3)
        if (ampm == "pm" or is_pm) and hour < 12:
            hour += 12
        elif (ampm == "am" or is_am) and hour == 12:
            hour = 0
        formatted_time = f"{hour:02d}:{minute}"

    return {
        "service": matched_svc,
        "service_id": svc_info["id"],
        "service_name": svc_info["name"],
        "date": target_date,
        "time": formatted_time,
        "location": loc_info["name"],
        "lat": loc_info["lat"],
        "lng": loc_info["lng"],
        "confidence": 0.95,
        "explain": f"Identified {svc_info['name']} for {target_date} at {formatted_time} near {loc_info['name']}"
    }
