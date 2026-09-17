"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LocationItem,
  SERVICE_LOCATIONS,
  GpsExtractionResult,
  getStoredLocation,
  setStoredLocation,
  extractFastGps,
  LOCATION_UPDATED_EVENT,
} from "../lib/locations";

export interface GpsLocationBarProps {
  selectedLocation: LocationItem;
  currentAddress: string;
  onLocationExtracted: (result: GpsExtractionResult) => void;
  bookingForSelf: boolean;
  onBookingForSelfChange: (isSelf: boolean) => void;
  autoExtractOnMount?: boolean;
  themeColor?: "emerald" | "red";
  className?: string;
}

export default function GpsLocationBar({
  selectedLocation,
  currentAddress,
  onLocationExtracted,
  bookingForSelf,
  onBookingForSelfChange,
  autoExtractOnMount = false,
  themeColor = "emerald",
  className = "",
}: GpsLocationBarProps) {
  const [gpsStatus, setGpsStatus] = useState<"idle" | "detecting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastAccuracy, setLastAccuracy] = useState<number | null>(null);
  const [isRefiningAddress, setIsRefiningAddress] = useState(false);
  const [customFlatNote, setCustomFlatNote] = useState("");

  const isEmerald = themeColor === "emerald";
  const primaryBg = isEmerald ? "bg-emerald-700 hover:bg-emerald-800" : "bg-red-600 hover:bg-red-700";
  const primaryRing = isEmerald ? "focus:ring-emerald-600" : "focus:ring-red-600";
  const badgeBg = isEmerald ? "bg-emerald-50 text-emerald-900 border-emerald-200" : "bg-red-50 text-red-900 border-red-200";
  const activePill = isEmerald ? "bg-emerald-800 text-white shadow-sm" : "bg-red-700 text-white shadow-sm";

  // Fast GPS extraction handler
  const handleDetectGps = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsStatus("error");
      setErrorMessage("Geolocation is not supported by your browser. Please select an area manually.");
      return;
    }

    setGpsStatus("detecting");
    setErrorMessage(null);

    try {
      const result = await extractFastGps();
      setGpsStatus("success");
      setLastAccuracy(result.accuracy || 15);
      onBookingForSelfChange(true);
      onLocationExtracted(result);
    } catch (err: any) {
      console.warn("Fast GPS detection warning:", err);
      setGpsStatus("error");
      if (err.code === 1) { // PERMISSION_DENIED
        setErrorMessage("Location permission was denied. You can select your service area manually below.");
      } else if (err.code === 2) { // POSITION_UNAVAILABLE
        setErrorMessage("GPS position unavailable. Please choose your area below.");
      } else {
        setErrorMessage("GPS detection timed out. Using default cooperative area.");
      }
    }
  }, [onBookingForSelfChange, onLocationExtracted]);

  // Check stored location on mount or auto-extract
  useEffect(() => {
    const cached = getStoredLocation();
    if (cached && cached.location && cached.address) {
      setGpsStatus("success");
      setLastAccuracy(cached.accuracy || 12);
      if (bookingForSelf && (!currentAddress || currentAddress.includes("Crosscut"))) {
        onLocationExtracted(cached);
      }
    } else if (autoExtractOnMount && bookingForSelf && gpsStatus === "idle") {
      handleDetectGps();
    }
  }, [autoExtractOnMount, bookingForSelf, handleDetectGps]);

  // Listen for cross-component location sync
  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail) {
        setGpsStatus("success");
        setLastAccuracy(e.detail.accuracy || 12);
      }
    };
    window.addEventListener(LOCATION_UPDATED_EVENT, handleSync);
    return () => window.removeEventListener(LOCATION_UPDATED_EVENT, handleSync);
  }, []);

  const handleAppendFlat = () => {
    if (!customFlatNote.trim()) return;
    const updatedAddress = `${customFlatNote.trim()}, ${currentAddress}`;
    const cached = getStoredLocation();
    if (cached) {
      const updated = { ...cached, address: updatedAddress };
      setStoredLocation(updated);
      onLocationExtracted(updated);
    }
    setIsRefiningAddress(false);
    setCustomFlatNote("");
  };

  return (
    <div className={`p-4 bg-gradient-to-br from-slate-50 via-white to-slate-100/90 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 ${className}`}>
      {/* Top Row: Mode Switcher (Fast GPS My Location vs Book for Others) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Service Destination:
          </span>
          {bookingForSelf && gpsStatus === "success" && lastAccuracy && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeBg} flex items-center gap-1.5 shadow-2xs`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              GPS ±{lastAccuracy}m Accurate
            </span>
          )}
        </div>

        {/* 2 Modes: Self (GPS - Zero Typing) vs Custom / Other Person */}
        <div className="inline-flex p-1 rounded-xl bg-slate-200/80 text-xs font-semibold self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => {
              onBookingForSelfChange(true);
              if (gpsStatus === "idle") handleDetectGps();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              bookingForSelf ? activePill : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Fast GPS (My Location)
          </button>
          <button
            type="button"
            onClick={() => onBookingForSelfChange(false)}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              !bookingForSelf ? activePill : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Book for Others / Other Place
          </button>
        </div>
      </div>

      {/* Main Action Bar for Fast GPS Mode (Zero manual address typing) */}
      {bookingForSelf ? (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={gpsStatus === "detecting"}
              className={`px-4 py-2.5 rounded-xl ${primaryBg} text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 ${primaryRing}`}
            >
              {gpsStatus === "detecting" ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Extracting GPS Location...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {gpsStatus === "success" ? "Re-detect GPS" : "Extract GPS Location"}
                </>
              )}
            </button>

            {/* Extracted Address Card with Auto-Fill Status */}
            <div className="flex-1 bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs flex items-center justify-between shadow-2xs overflow-hidden">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-500 shrink-0 font-medium">GPS Address:</span>
                <span className="text-slate-900 font-bold truncate">
                  {currentAddress &&
                  !currentAddress.toLowerCase().includes("detecting") &&
                  !currentAddress.toLowerCase().includes("extracting")
                    ? currentAddress
                    : selectedLocation.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {gpsStatus === "success" && (
                  <span className="text-emerald-700 text-[11px] font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Auto-filled
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsRefiningAddress(!isRefiningAddress)}
                  className="text-slate-500 hover:text-slate-800 text-[11px] underline font-medium"
                >
                  {isRefiningAddress ? "Close" : "+ Door/Flat No."}
                </button>
              </div>
            </div>
          </div>

          {/* Optional inline expander to append Flat/Door No. without having to manually type the whole address */}
          {isRefiningAddress && (
            <div className="flex items-center gap-2 p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs animate-fadeIn">
              <input
                type="text"
                value={customFlatNote}
                onChange={(e) => setCustomFlatNote(e.target.value)}
                placeholder="e.g. Flat 302, Green Valley Apts"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={handleAppendFlat}
                className="px-3 py-1.5 bg-emerald-800 text-white font-bold text-xs rounded-lg hover:bg-emerald-900 transition-colors shrink-0"
              >
                Add to Address
              </button>
            </div>
          )}

          {/* Quick 1-tap Colony/Area fine-tuning chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 text-[11px] no-scrollbar">
            <span className="text-slate-500 font-bold shrink-0 flex items-center gap-1 text-[10px] uppercase">
              🎯 Pinpoint Colony:
            </span>
            {[
              "Gandhipuram",
              "Peelamedu",
              "RS Puram",
              "Saibaba Colony",
              "Ganapathy",
              "Singanallur",
              "Saravanampatti",
              "Ramanathapuram",
              "Hopes College",
              "Race Course",
              "Thudiyalur",
              "Vadavalli"
            ].map((colony) => {
              const matched = SERVICE_LOCATIONS.find((l) => l.area.toLowerCase() === colony.toLowerCase());
              const isSelected = selectedLocation.area?.toLowerCase() === colony.toLowerCase();
              return (
                <button
                  key={colony}
                  type="button"
                  onClick={() => {
                    if (matched) {
                      const res: GpsExtractionResult = {
                        address: `${matched.area}, ${matched.city}`,
                        location: matched,
                        lat: matched.lat,
                        lng: matched.lng,
                        accuracy: 5,
                        suburb: matched.area,
                        city: matched.city,
                      };
                      setStoredLocation(res);
                      onLocationExtracted(res);
                      setLastAccuracy(5);
                      setGpsStatus("success");
                    }
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-800 text-white shadow-2xs font-bold"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300"
                  }`}
                >
                  {colony}
                </button>
              );
            })}
          </div>

          {/* Helpful micro-copy reassuring customer no typing needed */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 px-1">
            <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Fast GPS active: Nearby cooperative workers are automatically matched without manual typing.</span>
          </div>
        </div>
      ) : (
        /* Explanatory banner when booking for others or another location */
        <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-blue-950">Booking for someone else or another place:</span>
            <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
              Select the recipient&apos;s city and service area below, then enter their street address. Worker search and dispatch will automatically route to cooperative workers nearest to the recipient&apos;s location, not your current GPS.
            </p>
          </div>
        </div>
      )}

      {/* Error / Fallback Notification */}
      {errorMessage && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-[11px]">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-amber-700 hover:text-amber-900 font-bold ml-2 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
