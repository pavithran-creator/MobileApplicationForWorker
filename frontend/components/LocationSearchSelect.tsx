"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { LocationItem, SERVICE_LOCATIONS, POPULAR_CITIES, searchLocations, reverseGeocodeGps, GpsExtractionResult } from "../lib/locations";

interface LocationSearchSelectProps {
  selectedLocation: LocationItem;
  onSelectLocation: (loc: LocationItem) => void;
  onGpsExtracted?: (result: GpsExtractionResult) => void;
  label?: string;
  helperText?: string;
  className?: string;
}

export default function LocationSearchSelect({
  selectedLocation,
  onSelectLocation,
  onGpsExtracted,
  label = "Service Area",
  helperText = "Type area or city name to find verified cooperative coverage",
  className = "",
}: LocationSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter locations dynamically by spelling and city pill
  const filteredLocations = useMemo(() => {
    return searchLocations(searchQuery, selectedCity);
  }, [searchQuery, selectedCity]);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenDropdown = () => {
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSelect = (loc: LocationItem) => {
    onSelectLocation(loc);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleCustomLocation = () => {
    if (!searchQuery.trim()) return;
    const customItem: LocationItem = {
      id: `custom-${Date.now()}`,
      area: searchQuery.trim(),
      city: selectedCity !== "All" ? selectedCity : "Custom Area",
      state: "India",
      name: `${searchQuery.trim()}${selectedCity !== "All" ? `, ${selectedCity}` : ""}`,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    };
    onSelectLocation(customItem);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleGpsQuickDetect = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await reverseGeocodeGps(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
          onSelectLocation(res.location);
          if (onGpsExtracted) onGpsExtracted(res);
          setIsOpen(false);
        } catch (e) {
          console.warn("GPS reverse geocode error:", e);
        } finally {
          setIsDetectingGps(false);
        }
      },
      (err) => {
        console.warn("GPS detect error:", err);
        setIsDetectingGps(false);
        alert("Location permission denied or unavailable. Please choose an area below.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Label and Helper */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {label}
        </label>
        <span className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Cooperative Network
        </span>
      </div>

      {/* Selected Location Card / Trigger Button */}
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : handleOpenDropdown())}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-left flex items-center justify-between shadow-sm group"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center shrink-0 text-emerald-800 group-hover:bg-emerald-200/80 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm truncate">{selectedLocation.area}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 shrink-0">
                {selectedLocation.city}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 truncate">{selectedLocation.name} &bull; {selectedLocation.state}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 pl-2 shrink-0">
          <span className="text-xs hidden sm:inline-block text-slate-600">Change</span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header & Spelling Input */}
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type area or city spelling (e.g. Anna, Peelamedu, Chennai, Salem)..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-800 placeholder-slate-600"
              />
              <svg className="w-4 h-4 text-slate-600 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-600 hover:text-slate-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Quick GPS Location Detection Button */}
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleGpsQuickDetect}
                disabled={isDetectingGps}
                className="w-full px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-300"
              >
                {isDetectingGps ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Extracting GPS Location...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Use Current GPS Location
                  </>
                )}
              </button>
            </div>

            {/* Quick City Filter Pills */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider shrink-0 mr-1">
                City:
              </span>
              {POPULAR_CITIES.map((city) => {
                const isActive = selectedCity === city;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-emerald-800 text-white shadow-sm"
                        : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results List Status */}
          <div className="px-3.5 py-1.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
            <span>
              {filteredLocations.length > 0 ? (
                <>
                  Found <strong className="text-slate-700">{filteredLocations.length}</strong> service{" "}
                  {filteredLocations.length === 1 ? "area" : "areas"}
                  {selectedCity !== "All" && ` in ${selectedCity}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </>
              ) : (
                "No preset localities found"
              )}
            </span>
            <span className="text-[10px] text-slate-600">Select to update booking</span>
          </div>

          {/* Results Scroll Container */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => {
                const isSelected = selectedLocation.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-emerald-50/80 hover:bg-emerald-100/70 text-emerald-950"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{loc.area}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                            {loc.city}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{loc.state}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Selected
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-slate-600 mb-2">
                  No preset localities match &ldquo;<strong>{searchQuery}</strong>&rdquo;
                </p>
                <button
                  type="button"
                  onClick={handleCustomLocation}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Use &ldquo;{searchQuery}&rdquo; as service address
                </button>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Verified cooperative tradespersons dispatch state-wide</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
