"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLang } from "../../lib/i18n";
import { request, getAuthToken, getCurrentUser, setAuthToken, StoredUser } from "../../lib/api";
import { ServiceItem, MatchedWorker, InvoiceRecord } from "../../types";
import StatusBadge from "../../components/StatusBadge";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import InvoiceModal from "../../components/InvoiceModal";
import LocationSearchSelect from "../../components/LocationSearchSelect";
import GpsLocationBar from "../../components/GpsLocationBar";
import { LocationItem, SERVICE_LOCATIONS, DEFAULT_LOCATION, GpsExtractionResult, getStoredLocation, extractFastGps } from "../../lib/locations";

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 1, name: "Fan & light repair", description: "Professional fan & light repair by verified cooperative tradespersons", base_price: 250, worker_earning: 225, coop_charge: 25, requires_certification: true, category_id: 1 },
  { id: 2, name: "Full house wiring check", description: "Comprehensive electrical checkup and circuit inspection", base_price: 900, worker_earning: 810, coop_charge: 90, requires_certification: true, category_id: 1 },
  { id: 3, name: "Tap & pipe repair", description: "Quick fix for leaky faucets, joints, and drainage issues", base_price: 300, worker_earning: 270, coop_charge: 30, requires_certification: false, category_id: 2 },
  { id: 4, name: "Bathroom plumbing overhaul", description: "Complete plumbing refurbishment and fixture setup", base_price: 1200, worker_earning: 1080, coop_charge: 120, requires_certification: false, category_id: 2 },
  { id: 5, name: "Furniture repair", description: "Woodwork, hinge adjustment, and structural reinforcement", base_price: 450, worker_earning: 405, coop_charge: 45, requires_certification: false, category_id: 3 },
  { id: 6, name: "1BHK painting", description: "Interior emulsion painting with wall preparation", base_price: 5000, worker_earning: 4500, coop_charge: 500, requires_certification: false, category_id: 4 },
  { id: 7, name: "Local driver 8h", description: "Certified commercial chauffeur for city travel", base_price: 1000, worker_earning: 900, coop_charge: 100, requires_certification: true, category_id: 5 },
  { id: 8, name: "Deep home cleaning", description: "Intensive sanitization, floor scrubbing, and dusting", base_price: 1500, worker_earning: 1350, coop_charge: 150, requires_certification: false, category_id: 6 },
  { id: 9, name: "Lawn & plant maintenance", description: "Trimming, weeding, and garden beautification", base_price: 400, worker_earning: 360, coop_charge: 40, requires_certification: false, category_id: 7 },
  { id: 10, name: "Elderly companion assistance", description: "Certified home aide for mobility and daily companionship", base_price: 800, worker_earning: 720, coop_charge: 80, requires_certification: true, category_id: 8 },
];

function BookServiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLang();

  // Current session state
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  // Natural Language AI state
  const [nlQuery, setNlQuery] = useState("");
  const [parsingNl, setParsingNl] = useState(false);
  const [nlExplanation, setNlExplanation] = useState<string | null>(null);

  // Booking Form state
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [selectedServiceId, setSelectedServiceId] = useState<number | "">(1);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = useState("10:00");
  const [selectedLocation, setSelectedLocation] = useState<LocationItem>(() => {
    const cached = getStoredLocation();
    return cached?.location || DEFAULT_LOCATION;
  });
  const [address, setAddress] = useState<string>(() => {
    const cached = getStoredLocation();
    return cached?.address || DEFAULT_LOCATION.name;
  });
  const [description, setDescription] = useState("");
  const [bookingForSelf, setBookingForSelf] = useState(true);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  // Worker Matching state
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [matchedWorkers, setMatchedWorkers] = useState<MatchedWorker[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Booking Action state
  const [bookingLoadingId, setBookingLoadingId] = useState<number | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Unified Payment Modal state (User must pay by ONE unified way)
  const [pendingPaymentBooking, setPendingPaymentBooking] = useState<any | null>(null);
  const [enteredUtr, setEnteredUtr] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Audited Statutory Invoice Modal state
  const [viewInvoice, setViewInvoice] = useState<InvoiceRecord | null>(null);

  // Quick View Worker QR state
  const [previewWorkerQr, setPreviewWorkerQr] = useState<MatchedWorker | null>(null);

  const triggerFindWorkers = async (
    serviceId: number,
    loc: LocationItem = selectedLocation,
    dateVal: string = scheduledDate,
    timeVal: string = startTime
  ) => {
    if (!serviceId) return;
    setLoadingWorkers(true);
    setBookingError(null);
    setHasSearched(true);
    const targetLoc = loc || selectedLocation || DEFAULT_LOCATION;

    try {
      const workers = await request<MatchedWorker[]>(
        `/workers/match?service_id=${serviceId}&lat=${targetLoc.lat}&lng=${targetLoc.lng}&scheduled_date=${dateVal}&start_time=${timeVal}&duration_min=60`
      );
      const list = Array.isArray(workers) ? workers : [];
      setMatchedWorkers(list);
    } catch (err: any) {
      console.warn("Workers match fetch failed:", err);
      setBookingError("Geo search failed: " + err.message);
      setMatchedWorkers([]);
    } finally {
      setLoadingWorkers(false);
    }
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());

    // Check if location was passed in searchParams or cached from fast GPS
    const cachedLoc = getStoredLocation();
    let initialLoc = cachedLoc?.location || DEFAULT_LOCATION;
    let initialAddr = cachedLoc?.address || initialLoc.name;

    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const addrParam = searchParams.get("address");

    if (latParam && lngParam) {
      const parsedLat = parseFloat(latParam);
      const parsedLng = parseFloat(lngParam);
      initialLoc = {
        id: `param-${Date.now()}`,
        name: addrParam || `${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)}`,
        area: addrParam?.split(",")[0] || "Detected Area",
        city: "Coimbatore",
        state: "Tamil Nadu",
        lat: parsedLat,
        lng: parsedLng,
      };
      initialAddr = addrParam || initialLoc.name;
    }

    setSelectedLocation(initialLoc);
    setAddress(initialAddr);

    request<ServiceItem[]>("/catalog/services")
      .then((data) => {
        const list = Array.isArray(data) && data.length > 0 ? data : DEFAULT_SERVICES;
        setServices(list);
        let targetId = list[0].id;
        const sParam = searchParams.get("service");
        if (sParam) {
          const sid = parseInt(sParam);
          if (list.some((s) => s.id === sid)) {
            targetId = sid;
          }
        }
        setSelectedServiceId(targetId);
        triggerFindWorkers(targetId, initialLoc, scheduledDate, startTime);
      })
      .catch(() => {
        setServices(DEFAULT_SERVICES);
        setSelectedServiceId(1);
        triggerFindWorkers(1, initialLoc, scheduledDate, startTime);
      });
  }, [searchParams]);

  // Quick 1-Click Customer Sign-In (Direct against SQLite DB)
  const handleQuickCustomerLogin = async () => {
    try {
      const res = await request<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone: "9000000011", password: "cust123" }),
      });
      const token = res.token || res.access_token;
      if (token) setAuthToken(token);
      const userObj: StoredUser = { name: res.name, role: res.role, id: res.user_id, customer_id: res.customer_id, phone: "9000000011" };
      localStorage.setItem("ondemand_user", JSON.stringify(userObj));
      setCurrentUser(userObj);
      setBookingError(null);
    } catch (e: any) {
      setBookingError("Customer sign in error: " + e.message);
    }
  };

  // AI Natural Language Query Parser
  const handleParseNL = async () => {
    if (!nlQuery.trim()) return;
    setParsingNl(true);
    setNlExplanation(null);
    setBookingError(null);

    try {
      const res = await request<any>("/ai/parse-request", {
        method: "POST",
        body: JSON.stringify({ text: nlQuery }),
      });

      let nextSid = selectedServiceId ? Number(selectedServiceId) : 1;
      let nextLoc = selectedLocation;
      let nextDate = scheduledDate;
      let nextTime = startTime;

      if (res.service_id) {
        nextSid = res.service_id;
        setSelectedServiceId(res.service_id);
      }
      if (res.date) {
        nextDate = res.date;
        setScheduledDate(res.date);
      }
      if (res.time) {
        nextTime = res.time;
        setStartTime(res.time);
      }
      if (res.location) {
        const foundLoc = SERVICE_LOCATIONS.find((l) =>
          l.name.toLowerCase().includes(res.location.toLowerCase()) ||
          l.area.toLowerCase().includes(res.location.toLowerCase()) ||
          l.city.toLowerCase().includes(res.location.toLowerCase())
        );
        if (foundLoc) {
          nextLoc = foundLoc;
          setSelectedLocation(foundLoc);
          setAddress(`${res.location}, ${foundLoc.city}`);
        } else {
          setAddress(res.location);
        }
      }
      setNlExplanation(res.explain || t("book.ai_extracted", "AI Extracted parameters successfully"));
      triggerFindWorkers(nextSid, nextLoc, nextDate, nextTime);
    } catch (err: any) {
      setBookingError("AI parser error: " + err.message);
    } finally {
      setParsingNl(false);
    }
  };

  // Find Geo-Matched Workers
  const handleFindWorkers = async () => {
    if (!selectedServiceId) {
      setBookingError("Please select a service trade first.");
      return;
    }
    triggerFindWorkers(Number(selectedServiceId), selectedLocation, scheduledDate, startTime);
  };

  // Step 1: Initialize Booking & Open Unified Payment Modal
  const handleConfirmBooking = async (workerId: number) => {
    let token = getAuthToken();
    let user = getCurrentUser();

    // Auto-authenticate with customer account in DB if not already logged in
    if (!token || user?.role !== "CUSTOMER") {
      try {
        const res = await request<any>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ phone: "9000000011", password: "cust123" }),
        });
        token = res.token || res.access_token;
        if (token) setAuthToken(token);
        user = { name: res.name, role: res.role, id: res.user_id, customer_id: res.customer_id, phone: "9000000011" };
        localStorage.setItem("ondemand_user", JSON.stringify(user));
        setCurrentUser(user);
      } catch (err: any) {
        setBookingError("Please log in with a customer account to confirm booking.");
        return;
      }
    }

    setBookingLoadingId(workerId);
    setBookingError(null);

    const loc = selectedLocation || DEFAULT_LOCATION;
    const finalDescription = !bookingForSelf && (recipientName || recipientPhone)
      ? `${description ? description + " | " : ""}Booking for: ${recipientName || "Recipient"}${recipientPhone ? ` (Ph: ${recipientPhone})` : ""}`
      : (description || "Regular cooperative scheduled service");

    try {
      const res = await request<any>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          worker_id: workerId,
          service_id: Number(selectedServiceId),
          scheduled_date: scheduledDate,
          start_time: startTime,
          duration_min: 60,
          lat: loc.lat,
          lng: loc.lng,
          address: address || loc.name,
          description: finalDescription,
          is_emergency: false,
        }),
      });

      // Prepare unified payment modal
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      setEnteredUtr(`UTR-TNSC-${res.id}-${randomSuffix}`);
      setPendingPaymentBooking(res);
    } catch (err: any) {
      setBookingError(err.message || "Booking failed");
    } finally {
      setBookingLoadingId(null);
    }
  };

  // Step 2: Complete Unified Payment via Bank Transaction UTR & Issue Statutory Invoice
  const handleCompletePayment = async () => {
    if (!pendingPaymentBooking) return;
    setPaymentProcessing(true);
    setBookingError(null);

    try {
      await request<any>("/payments", {
        method: "POST",
        body: JSON.stringify({
          booking_id: pendingPaymentBooking.id,
          succeed: true,
          method: "Tamil Nadu State Apex Cooperative Bank / UPI URL",
          transaction_ref: enteredUtr.trim() || `UTR-TNSC-${pendingPaymentBooking.id}-OK`,
        }),
      });

      // Fetch the audited statutory cooperative tax invoice
      const invoiceData = await request<InvoiceRecord>(`/invoices/${pendingPaymentBooking.id}`);
      setPendingPaymentBooking(null);
      setViewInvoice(invoiceData);
    } catch (err: any) {
      setBookingError("Payment settlement error: " + err.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const selectedServiceObj = services.find((s) => s.id === Number(selectedServiceId));

  // Payment Deep URL (Unified Payment Intent)
  const paymentUpiUrl = pendingPaymentBooking
    ? `upi://pay?pa=tn.labourcoop@sbi&pn=LabourCooperativeFederation&am=${pendingPaymentBooking.total_amount}&tn=Booking_Ref_${pendingPaymentBooking.id}&cu=INR`
    : "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            {t("doorstep.trust_1_title", "Verified Professionals")}
          </span>
          <span className="text-xs text-slate-500">
            {t("doorstep.trust_4_desc", "Quick arrival under 30 minutes for urgent needs and guaranteed slots.")}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
          {t("book.title", "Schedule a Verified Trade Service")}
        </h1>
        <p className="text-slate-600 mt-1 max-w-3xl">
          {t("book.subtitle", "Transparent cooperative pricing, explainable geo-matching, and double-booking conflict prevention.")}
        </p>
      </div>

      {/* Smart Search */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <h2 className="text-base font-bold text-emerald-100">
              {t("book.ai_title", "Natural Language AI Assistant")}
            </h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-800 text-emerald-200">
            {t("doorstep.popular", "Popular")}
          </span>
        </div>
        <p className="text-xs text-emerald-200 mb-4">
          {t("book.ai_desc", "Type what you need in plain language (e.g. 'Need electrician tomorrow at 6 PM near Gandhipuram')")}
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleParseNL()}
            placeholder={t("book.ai_placeholder", "Describe service, date, time, and location...")}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-white placeholder-emerald-400/60 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            onClick={handleParseNL}
            disabled={parsingNl || !nlQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-all disabled:opacity-50 whitespace-nowrap shadow-sm"
          >
            {parsingNl ? t("book.ai_parsing", "Parsing with AI...") : t("book.ai_button", "Parse with AI")}
          </button>
        </div>
        {nlExplanation && (
          <div className="mt-3.5 p-3 rounded-lg bg-emerald-800/60 border border-emerald-600/40 text-xs text-amber-200 flex items-center gap-2">
            <span>&#10003;</span>
            <span>{nlExplanation}</span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {bookingError && (
        <div className="rounded-xl bg-red-50 border-2 border-red-300 p-4 shadow-sm text-red-800 flex items-start gap-3">
          <div className="text-xl font-bold">&#9888;</div>
          <div className="flex-1 text-xs sm:text-sm">
            <div className="font-bold mb-0.5">{t("book.conflict_title", "Booking Notice")}</div>
            <div>{bookingError}</div>
          </div>
        </div>
      )}

      {/* Booking Form + Worker Results Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Booking Parameters Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 font-heading">
            {t("book.form_service", "Service Trade")} &amp; {t("booking.time", "Time Slot")}
          </h2>

          {/* Customer Authentication State Banner */}
          {currentUser && currentUser.role === "CUSTOMER" ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="text-emerald-900 font-medium">
                  Logged in as: <span className="font-bold">{currentUser.name}</span> (Customer)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                Database Verified
              </span>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-900 font-medium">
                  {currentUser ? `Active Role: ${currentUser.role}` : "Not signed in as Customer"}
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                  Database Pass
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-amber-800">
                  Bookings require verified Customer credentials from database.
                </p>
                <button
                  type="button"
                  onClick={handleQuickCustomerLogin}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition-colors shadow-sm whitespace-nowrap"
                >
                  1-Click Customer Login
                </button>
              </div>
            </div>
          )}

          {/* Service Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t("book.form_service", "Service Trade")}
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => {
                const sid = Number(e.target.value);
                setSelectedServiceId(sid);
                triggerFindWorkers(sid, selectedLocation, scheduledDate, startTime);
              }}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (₹{s.base_price})
                </option>
              ))}
            </select>
          </div>

          {/* Transparent Fair-Wage Pricing Breakdown */}
          {selectedServiceObj && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>{t("book.pricing_title", "Fair Cooperative Tariff")}</span>
                <span className="text-emerald-800 font-extrabold text-sm">₹{selectedServiceObj.base_price}</span>
              </div>
              <div className="space-y-1 pt-1 border-t border-slate-200 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Worker Direct Fair Wage (90%):</span>
                  <span className="font-bold text-slate-900">₹{selectedServiceObj.worker_earning || Math.round(selectedServiceObj.base_price * 0.9)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cooperative Welfare &amp; Admin (10%):</span>
                  <span className="font-bold text-slate-900">₹{selectedServiceObj.coop_charge || Math.round(selectedServiceObj.base_price * 0.1)}</span>
                </div>
              </div>
              {selectedServiceObj.requires_certification && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium pt-1">
                  <span>&#10003;</span>
                  <span>{t("book.req_cert_note", "Requires verified government trade certification")}</span>
                </div>
              )}
            </div>
          )}

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t("book.form_date", "Date")}
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => {
                  setScheduledDate(e.target.value);
                  if (selectedServiceId) {
                    triggerFindWorkers(Number(selectedServiceId), selectedLocation, e.target.value, startTime);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t("book.form_time", "Start Time")}
              </label>
              <select
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (selectedServiceId) {
                    triggerFindWorkers(Number(selectedServiceId), selectedLocation, scheduledDate, e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                {["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((tSlot) => (
                  <option key={tSlot} value={tSlot}>
                    {tSlot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fast GPS Location Extraction & Destination Mode */}
          <div>
            <GpsLocationBar
              selectedLocation={selectedLocation}
              currentAddress={address}
              bookingForSelf={bookingForSelf}
              onBookingForSelfChange={(isSelf) => setBookingForSelf(isSelf)}
              onLocationExtracted={(res) => {
                setSelectedLocation(res.location);
                setAddress(res.address);
                if (selectedServiceId) {
                  triggerFindWorkers(Number(selectedServiceId), res.location, scheduledDate, startTime);
                }
              }}
              autoExtractOnMount={true}
              themeColor="emerald"
            />
          </div>

          {/* Conditional Destination Selection: Booking for Others / Custom Place */}
          {!bookingForSelf ? (
            <div className="space-y-3.5 p-4 bg-blue-50/70 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-950 uppercase tracking-wider">
                <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Recipient Destination & Contact
              </div>

              {/* Destination City & Area Picker for Other Person */}
              <LocationSearchSelect
                selectedLocation={selectedLocation}
                onSelectLocation={(newLoc) => {
                  setSelectedLocation(newLoc);
                  setAddress(newLoc.name);
                  if (selectedServiceId) {
                    triggerFindWorkers(Number(selectedServiceId), newLoc, scheduledDate, startTime);
                  }
                }}
                onGpsExtracted={(res) => {
                  setSelectedLocation(res.location);
                  setAddress(res.address);
                  setBookingForSelf(true);
                  if (selectedServiceId) {
                    triggerFindWorkers(Number(selectedServiceId), res.location, scheduledDate, startTime);
                  }
                }}
                label="Recipient City & Cooperative District"
                helperText="Dispatch will automatically route to cooperative workers closest to this destination"
              />

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recipient Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Parents / Friend Name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recipient Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Recipient Street Address Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Door No, Building & Street Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 24 North Car Street, near Temple, Tiruchirappalli"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                />
              </div>
            </div>
          ) : (
            /* Fast GPS Auto-filled Address for Self */
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Service Address (Auto-filled by Fast GPS - Zero typing needed)
                </label>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ⚡ GPS Locked
                </span>
              </div>
              <input
                type="text"
                value={
                  address &&
                  !address.toLowerCase().includes("detecting") &&
                  !address.toLowerCase().includes("extracting")
                    ? address
                    : selectedLocation.name
                }
                onChange={(e) => setAddress(e.target.value)}
                placeholder={selectedLocation.name}
                className="w-full px-3.5 py-2.5 rounded-lg border border-emerald-300 bg-emerald-50/40 text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Your location has been pinpointed accurately. You don&apos;t need to manually type an address.
              </p>
            </div>
          )}

          {/* Specific Task Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t("book.form_desc", "Specific Work Notes (Optional)")}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Master bedroom switchboard spark, 2nd floor"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            type="button"
            onClick={handleFindWorkers}
            className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm transition-colors shadow-sm"
          >
            {t("book.find_button", "Refresh Verified Tradespersons Search")}
          </button>
        </div>

        {/* Right Column: Matched Workers & Transparent Scoring */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                {t("book.matched_title", "Available Cooperative Tradespersons")}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t("book.matched_subtitle", "Ranked by proximity, verified certification, and skill match.")}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              {matchedWorkers.length} {t("book.workers_found", "Available")}
            </span>
          </div>

          {loadingWorkers ? (
            <div className="space-y-3">
              <LoadingSkeleton type="card" count={3} />
            </div>
          ) : matchedWorkers.length === 0 ? (
            <EmptyState
              title={hasSearched ? t("book.no_workers_title", "No Workers in this Slot") : t("book.init_search_title", "Select Trade & Search")}
              description={
                hasSearched
                  ? t("book.no_workers_desc", "All verified tradespersons in this area are scheduled. Try another time slot or date.")
                  : t("book.init_search_desc", "Pick a service trade and location to view verified professionals.")
              }
              actionText={t("book.init_search_btn", "Search All Cooperatives")}
              onAction={handleFindWorkers}
            />
          ) : (
            <div className="space-y-3.5">
              {matchedWorkers.map((worker) => (
                <div
                  key={worker.worker_id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5 flex-1">
                      {worker.avatar_url ? (
                        <img
                          src={worker.avatar_url}
                          alt={worker.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm shrink-0 bg-slate-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                          {worker.name.charAt(0)}
                        </div>
                      )}
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{worker.name}</h3>
                          <StatusBadge type="verification" status="VERIFIED" />
                          {(worker.upi_qr_url || worker.upi_id) && (
                            <button
                              type="button"
                              onClick={() => setPreviewWorkerQr(worker)}
                              className="text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300 transition-colors inline-flex items-center gap-1 shadow-2xs"
                              title="Click to view worker's direct payment QR"
                            >
                              <span>📲</span>
                              <span>Direct QR</span>
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {worker.cooperative_name} &bull; {worker.experience_years} yrs experience
                          {worker.address && <span className="text-slate-400"> &bull; 📍 {worker.address}</span>}
                        </p>
                        {worker.bio && (
                          <p className="text-xs text-slate-600 italic bg-slate-50 border border-slate-100 p-2 rounded-xl mt-1">
                            &ldquo;{worker.bio}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <div className="text-lg font-black text-emerald-900">{worker.score}/100</div>
                      <div className="text-[11px] text-slate-500">{t("book.match_score", "Explainable Match Score")}</div>
                    </div>
                  </div>

                  {/* Explainable Reasons */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {t("book.matching_reasons", "Why this worker matched")}:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium">
                        ★ {worker.avg_rating.toFixed(1)} ({worker.rating_count} reviews)
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        📍 {worker.distance_km} km from address
                      </span>
                      {worker.reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-500">
                      {t("book.form_time", "Slot")}: <span className="font-bold text-slate-800">{scheduledDate} at {startTime}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConfirmBooking(worker.worker_id)}
                      disabled={bookingLoadingId === worker.worker_id}
                      className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {bookingLoadingId === worker.worker_id ? (
                        <span>Initializing Escrow...</span>
                      ) : (
                        <span>{t("book.confirm_btn", "Book & Pay Escrow")}</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* UNIFIED PAYMENT MODAL: User Must Pay by ONE Unified Way Only */}
      {pendingPaymentBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-auto animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center text-xl font-bold">
                  ₹
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                    Official Escrow Settlement
                  </h3>
                  <p className="text-xs text-emerald-800 font-semibold">
                    Tamil Nadu Labour Cooperative Federation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingPaymentBooking(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Statutory Policy Notice (Single Way Payment Only) */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>🛡</span>
                <span>Statutory Cooperative Payment Rule: One Way Only</span>
              </div>
              <p className="text-[11px] text-amber-800">
                To eliminate middlemen extortion and guarantee 90% direct wage protection, citizens must pay directly to the official 
                Cooperative Federation Central Escrow Account using Bank Transfer or UPI Payment URL. No split or cash payments allowed.
              </p>
            </div>

            {/* Service & Booking Details Summary */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Service &amp; Worker:</span>
                <span className="font-bold text-slate-900">{pendingPaymentBooking.service_name} ({pendingPaymentBooking.worker_name})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-mono font-bold text-slate-900">#{pendingPaymentBooking.id}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-bold">
                <span className="text-slate-700">Total Settled Amount:</span>
                <span className="text-emerald-800 text-base">₹{pendingPaymentBooking.total_amount}</span>
              </div>
            </div>

            {/* WORKER'S DIRECT TRANSACTION QR CODE (Doorstep / Escrow Direct Scan) */}
            {(() => {
              const assignedWorker = matchedWorkers.find((w) => w.worker_id === pendingPaymentBooking.worker_id);
              const workerUpi = assignedWorker?.upi_id || `${pendingPaymentBooking.worker_name.toLowerCase().replace(/\s+/g, '.')}@oksbi`;
              const qrUrl = assignedWorker?.upi_qr_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('upi://pay?pa=' + workerUpi + '&pn=' + pendingPaymentBooking.worker_name + '&am=' + pendingPaymentBooking.total_amount + '&cu=INR')}`;
              const workerDirectUpiUrl = `upi://pay?pa=${workerUpi}&pn=${encodeURIComponent(pendingPaymentBooking.worker_name)}&am=${pendingPaymentBooking.total_amount}&tn=Booking_Ref_${pendingPaymentBooking.id}&cu=INR`;

              return (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white space-y-3.5 border border-emerald-700/80 shadow-md">
                  <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
                        Assigned Worker Transaction QR
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                      Scan &amp; Pay Directly
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-28 h-28 bg-white p-2 rounded-2xl shrink-0 shadow-lg border-2 border-emerald-400/80 flex items-center justify-center overflow-hidden">
                      <img
                        src={qrUrl}
                        alt="Worker Transaction QR"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-1.5 text-xs flex-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        {assignedWorker?.avatar_url && (
                          <img
                            src={assignedWorker.avatar_url}
                            alt={pendingPaymentBooking.worker_name}
                            className="w-6 h-6 rounded-full object-cover border border-emerald-400"
                          />
                        )}
                        <span className="font-extrabold text-sm text-emerald-100">
                          {pendingPaymentBooking.worker_name}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-amber-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/60 inline-block">
                        UPI: {workerUpi}
                      </div>
                      <p className="text-[10px] text-emerald-300/80 leading-relaxed">
                        Point your mobile camera or GPay, PhonePe, Paytm, or BHIM app to scan and settle ₹{pendingPaymentBooking.total_amount}.
                      </p>
                      <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <a
                          href={workerDirectUpiUrl}
                          className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] transition-colors shadow-sm inline-flex items-center gap-1"
                        >
                          <span>⚡</span>
                          <span>Pay Worker UPI</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(workerUpi);
                            alert("Worker UPI ID copied: " + workerUpi);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-[11px] font-medium border border-emerald-600 transition-colors"
                        >
                          Copy UPI
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Unified Method: Bank Account & Payment URL */}
            <div className="space-y-3">
              <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Official Cooperative Bank &amp; UPI Details:
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Beneficiary:</span>
                  <span className="font-bold text-amber-300">TN Labour Coop Federation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Name:</span>
                  <span>TN State Apex Coop Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account No:</span>
                  <span className="font-bold text-emerald-400">921020045678912</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IFSC Code:</span>
                  <span className="font-bold text-emerald-400">TNSC0001001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">UPI VPA:</span>
                  <span className="font-bold text-cyan-300">tn.labourcoop@sbi</span>
                </div>
              </div>

              {/* Direct UPI Payment URL Link */}
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={paymentUpiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>🔗</span>
                  <span>Open UPI / Payment URL</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(paymentUpiUrl);
                    alert("Payment URL copied to clipboard!");
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Copy URL
                </button>
              </div>
            </div>

            {/* Bank Transaction Reference (UTR) Entry */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Bank Transaction Reference / UTR Number:
              </label>
              <input
                type="text"
                value={enteredUtr}
                onChange={(e) => setEnteredUtr(e.target.value)}
                placeholder="e.g. UTR-TNSC-984210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Enter your bank transfer UTR or UPI transaction reference for instant statutory audit clearance.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={paymentProcessing || !enteredUtr.trim()}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors shadow-md disabled:opacity-50"
              >
                {paymentProcessing ? "Verifying Transaction..." : "Verify & Issue Statutory Invoice"}
              </button>
              <button
                type="button"
                onClick={() => setPendingPaymentBooking(null)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW WORKER TRANSACTION QR MODAL */}
      {previewWorkerQr && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-left">
                {previewWorkerQr.avatar_url ? (
                  <img
                    src={previewWorkerQr.avatar_url}
                    alt={previewWorkerQr.name}
                    className="w-10 h-10 rounded-xl object-cover border border-emerald-600 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    {previewWorkerQr.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-slate-900 font-heading text-sm">
                    {previewWorkerQr.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {previewWorkerQr.cooperative_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewWorkerQr(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 inline-block">
              <div className="w-52 h-52 bg-white p-2 rounded-xl shadow-md mx-auto flex items-center justify-center overflow-hidden">
                {previewWorkerQr.upi_qr_url ? (
                  <img src={previewWorkerQr.upi_qr_url} alt="Transaction QR" className="w-full h-full object-contain" />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('upi://pay?pa=' + (previewWorkerQr.upi_id || 'worker@oksbi') + '&pn=' + previewWorkerQr.name + '&cu=INR')}`}
                    alt="Transaction QR"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800">Doorstep Transaction QR</div>
              <div className="font-mono text-xs text-emerald-800 font-bold bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-200 inline-block">
                {previewWorkerQr.upi_id || "suresh.electrician@oksbi"}
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Scan with Google Pay, PhonePe, Paytm, or any UPI app to settle directly with this certified tradesperson.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setPreviewWorkerQr(null)}
                className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDITED STATUTORY COOPERATIVE INVOICE MODAL */}
      {viewInvoice && (
        <InvoiceModal
          invoice={viewInvoice}
          onClose={() => {
            setViewInvoice(null);
            router.push("/dashboard");
          }}
        />
      )}
    </div>
  );
}

export default function BookServicePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-10"><LoadingSkeleton type="card" count={3} /></div>}>
      <BookServiceContent />
    </Suspense>
  );
}
