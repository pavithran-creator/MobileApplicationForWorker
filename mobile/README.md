# ON-DEMAND — Cooperative Service Marketplace (Mobile App)

A standalone React Native & Expo mobile application for the **ON-DEMAND Cooperative Digital Service Marketplace**, located entirely in `mobile/` alongside the existing web application.

---

## Architecture & Isolation Guarantee

- **Completely isolated** from the existing web application in `frontend/`.
- No dependencies are shared or leaked into `frontend/package.json` or root.
- Uses **Expo SDK 51**, **React Native 0.74.5**, and **Expo Router**.
- Anchored in `.vercelignore` (`/mobile/`) so Vercel builds for the web app will NEVER be impacted.
- Connects to the **same live Supabase backend** (`https://xzhvvudoebxnrjdbxjye.supabase.co`) with zero schema modifications.

---

## Key Features

1. **Dual Portals**:
   - **Customer Portal**: Service catalog, GPS worker matching, multimodal AI booking, live booking status tracking, UPI payment recording, statutory tax invoice, worker star ratings.
   - **Worker Portal**: Duty availability switch (`workers.is_available`), incoming job inspection, client problem photo & voice transcript review, job lifecycle updates (Accept -> Arrived -> Start -> Complete), 90% direct fair wage earnings dashboard, cooperative welfare & insurance records.

2. **Multimodal AI Problem Capture**:
   - **Live Camera Capture**: Real-time snapshot with viewfinder reticle, flip, watermark, and timestamp. Strictly **no gallery upload** permitted.
   - **Voice Problem Recorder**: High-fidelity circular microphone button (strictly microphone symbol only, no "m" text) supporting voice note problem descriptions in local languages.

3. **Multilingual Localization**:
   - English, தமிழ் (Tamil), हिन्दी (Hindi).
   - Dynamic language switching persisted in device storage.

4. **Cooperative Fair Wage Model**:
   - Automatic 90% direct wage to workers, 10% cooperative surcharge pool for worker social security, healthcare, and PMSBY accidental insurance.
   - Transparent statutory tax invoice popup with GST and fair wage breakdown.

5. **24/7 Emergency SOS**:
   - Guaranteed 15-minute SLA dispatch for electrical hazards, pipe bursts, and lockout emergencies with live GPS broadcast.

---

## How to Run

### 1. Prerequisites
- Node.js 18+ installed
- Expo Go app installed on your physical iOS or Android phone (available on App Store / Play Store)

### 2. Install Dependencies
```bash
cd mobile
npm install
```

### 3. Start Expo Dev Server
```bash
npx expo start
```
- Press `a` to run on Android Emulator.
- Press `w` to run on Web Browser.
- Scan the terminal QR code with **Expo Go** on your physical phone.

---

## Demo Test Credentials & 1-Click Login

On the onboarding splash screen or login screen, you can use the **1-Click Test Personas**:

| Role | Name | Phone / Login | Password | Key Capabilities |
|---|---|---|---|---|
| **Customer** | Meena Sundaram | `9000000011` | `cust123` | Book services, AI camera/mic capture, UPI settlement, View invoice |
| **Worker** | Suresh Kumar | `9010000001` | `work123` | Duty switch, Accept jobs, View 90% wage earnings, View welfare funds |
