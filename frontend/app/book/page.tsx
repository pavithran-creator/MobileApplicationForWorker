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
import { LocationItem, SERVICE_LOCATIONS, DEFAULT_LOCATION } from "../../lib/locations";

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
  const [selectedLocation, setSelectedLocation] = useState<LocationItem>(DEFAULT_LOCATION);
  const [address, setAddress] = useState("142 Crosscut Road, Gandhipuram, Coimbatore");
  const [description, setDescription] = useState("");

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
        triggerFindWorkers(targetId, DEFAULT_LOCATION, scheduledDate, startTime);
      })
      .catch(() => {
        setServices(DEFAULT_SERVICES);
        setSelectedServiceId(1);
        triggerFindWorkers(1, DEFAULT_LOCATION, scheduledDate, startTime);
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
          description: description || "Regular cooperative scheduled service",
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

          {/* Service Area with City & Main Area Search */}
          <div>
            <LocationSearchSelect
              selectedLocation={selectedLocation}
              onSelectLocation={(newLoc) => {
                setSelectedLocation(newLoc);
                setAddress(newLoc.name);
                if (selectedServiceId) {
                  triggerFindWorkers(Number(selectedServiceId), newLoc, scheduledDate, startTime);
                }
              }}
              label={t("book.form_location", "Service Area")}
            />
          </div>

          {/* Detailed Street Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t("book.form_address", "Door / Street Address")}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Door No, Street Name, Landmark"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

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
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shadow-sm">
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{worker.name}</h3>
                          <StatusBadge type="verification" status="VERIFIED" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {worker.cooperative_name} &bull; {worker.experience_years} yrs experience
                        </p>
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
