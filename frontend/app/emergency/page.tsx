"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "../../lib/i18n";
import { request, getAuthToken } from "../../lib/api";
import { ServiceItem, MatchedWorker } from "../../types";
import StatusBadge from "../../components/StatusBadge";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import LocationSearchSelect from "../../components/LocationSearchSelect";
import GpsLocationBar from "../../components/GpsLocationBar";
import { LocationItem, DEFAULT_LOCATION, getStoredLocation } from "../../lib/locations";

export default function EmergencyPage() {
  const router = useRouter();
  const { t } = useLang();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | "">("");
  const [selectedLocation, setSelectedLocation] = useState<LocationItem>(() => {
    const cached = getStoredLocation();
    return cached?.location || DEFAULT_LOCATION;
  });
  const [address, setAddress] = useState<string>(() => {
    const cached = getStoredLocation();
    return cached?.address || DEFAULT_LOCATION.name;
  });
  const [description, setDescription] = useState("Urgent breakdown, immediate technician needed");
  const [bookingForSelf, setBookingForSelf] = useState(true);

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [emergencyResult, setEmergencyResult] = useState<{
    emergency_id: number;
    candidates: MatchedWorker[];
    candidates_found?: number;
    service_name: string;
    mode: string;
    demo_notice: string;
  } | null>(null);

  const [dispatchLoadingId, setDispatchLoadingId] = useState<number | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    request<ServiceItem[]>("/catalog/services")
      .then((data) => {
        setServices(data);
        if (data.length > 0) setSelectedServiceId(data[0].id);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSearchEmergency = async () => {
    const token = getAuthToken();
    if (!token) {
      setErrorMsg(t("auth.loginSub", "Please log in with a customer account to request emergency dispatch."));
      return;
    }

    if (!selectedServiceId) {
      setErrorMsg(t("emergency.select_trade", "Please select an emergency trade."));
      return;
    }

    setLoadingSearch(true);
    setErrorMsg(null);
    setEmergencyResult(null);

    const loc = selectedLocation || DEFAULT_LOCATION;

    try {
      const res = await request<any>("/emergency-requests", {
        method: "POST",
        body: JSON.stringify({
          service_id: Number(selectedServiceId),
          lat: loc.lat,
          lng: loc.lng,
          address: address || loc.name,
          description: description,
        }),
      });

      setEmergencyResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || t("emergency.no_workers", "Failed to find emergency workers"));
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleDispatchWorker = async (workerId: number) => {
    if (!emergencyResult) return;
    setDispatchLoadingId(workerId);
    setErrorMsg(null);

    const loc = selectedLocation || DEFAULT_LOCATION;
    try {
      const res = await request<any>(`/emergency-requests/${emergencyResult.emergency_id}/dispatch`, {
        method: "POST",
        body: JSON.stringify({
          worker_id: workerId,
          address: address || loc.name,
        }),
      });

      setDispatchSuccess(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch worker");
    } finally {
      setDispatchLoadingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Alert Header */}
      <div className="bg-red-700 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-red-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/60 border border-red-500/40 text-red-100 text-xs font-bold uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              24/7 {t("nav.cooperative", "Cooperative")} Priority
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading">
              {t("emergency.title", "24/7 Priority Emergency Dispatch")}
            </h1>
            <p className="text-sm text-red-100 max-w-xl">
              {t("emergency.subtitle", "Urgent electrical sparks, burst water pipes, or emergency locksmith assistance dispatched within 15-30 minutes.")}
            </p>
          </div>

          <div className="bg-red-800/80 border border-red-600/40 rounded-xl p-4 text-center sm:w-48">
            <div className="text-2xl font-bold font-heading text-white">&lt; 30 {t("doorstep.mins", "mins")}</div>
            <div className="text-xs text-red-200 mt-1">{t("doorstep.trust_4_title", "On-Time Arrival")}</div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-300 p-4 text-xs text-red-800 flex items-start gap-3">
          <span className="text-lg">⚠</span>
          <div className="flex-1">
            <div className="font-bold mb-0.5">{t("common.error", "Emergency Dispatch Notice:")}</div>
            <div>{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Emergency Request Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-3">
          {t("emergency.select_trade", "Emergency Trade Required")}
        </h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t("book.form_service", "Select Emergency Craft / Trade")}
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (₹{s.base_price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <GpsLocationBar
              selectedLocation={selectedLocation}
              currentAddress={address}
              bookingForSelf={bookingForSelf}
              onBookingForSelfChange={(isSelf) => setBookingForSelf(isSelf)}
              onLocationExtracted={(res) => {
                setSelectedLocation(res.location);
                setAddress(res.address);
              }}
              autoExtractOnMount={true}
              themeColor="red"
            />
          </div>

          {!bookingForSelf ? (
            <div className="space-y-3 p-3.5 bg-blue-50/70 rounded-xl border border-blue-200">
              <LocationSearchSelect
                selectedLocation={selectedLocation}
                onSelectLocation={(newLoc) => {
                  setSelectedLocation(newLoc);
                  setAddress(newLoc.name);
                }}
                onGpsExtracted={(res) => {
                  setSelectedLocation(res.location);
                  setAddress(res.address);
                  setBookingForSelf(true);
                }}
                label="Emergency Site City & Area (For Other Person/Location)"
                helperText="Emergency technicians nearest to this location will be summoned"
              />
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {bookingForSelf ? "Emergency Address (Auto-filled by GPS - No typing needed)" : "Site / Recipient Door & Street Address *"}
            </label>
            <span className="text-[11px] text-slate-500">
              {bookingForSelf ? "⚡ Fast GPS Locked" : "Custom emergency destination"}
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
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-600 ${
              bookingForSelf ? "bg-red-50/30 border-red-200 font-medium text-slate-900" : "bg-white border-slate-300"
            }`}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {t("book.form_notes", "Work Requirement Details (Optional)")}
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("book.form_notes_placeholder", "Explain the problem (e.g. main pipe leaking, MCB sparking)...")}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        <button
          onClick={handleSearchEmergency}
          disabled={loadingSearch}
          className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loadingSearch ? t("emergency.dispatching", "Searching active verified candidates in your radius...") : t("emergency.dispatch_btn", "Request Emergency Electrician")}
        </button>
      </div>

      {/* Emergency Candidates List */}
      {loadingSearch ? (
        <LoadingSkeleton type="table" count={2} />
      ) : emergencyResult && emergencyResult.candidates && emergencyResult.candidates.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {t("book.results_title", "Nearby Technicians On-Call")} ({emergencyResult.candidates.length})
              </h3>
              <p className="text-xs text-slate-500">
                {t("book.results_sub", "Sorted by proximity & immediate availability (<30 mins arrival)")}
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              {t("status.verified", "Cooperative Verified")}
            </span>
          </div>

          <div className="space-y-3">
            {emergencyResult.candidates.map((cand) => (
              <div
                key={cand.worker_id}
                className="p-4 rounded-xl border border-slate-200 hover:border-red-400 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{cand.name}</span>
                    <StatusBadge type="verification" status="VERIFIED" />
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {cand.cooperative_name} &bull; {t("book.distance", "{dist} km away", { dist: cand.distance_km.toFixed(1) })} &bull; ★ {cand.avg_rating.toFixed(1)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-emerald-800">{t("book.score", "Match")} {cand.score}/100</div>
                    <div className="text-[10px] text-slate-400">{t("worker.available_on", "Available Now")}</div>
                  </div>
                  <button
                    onClick={() => handleDispatchWorker(cand.worker_id)}
                    disabled={dispatchLoadingId === cand.worker_id}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {dispatchLoadingId === cand.worker_id ? t("emergency.dispatching", "Dispatching...") : t("book.confirm_btn", "Dispatch This Worker")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Dispatch Success Modal */}
      {dispatchSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto font-bold animate-bounce">
              🚨
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                {t("emergency.dispatched_title", "Emergency Dispatch Confirmed!")}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t("book.success_ref", "Booking Reference #")}{dispatchSuccess.booking_id}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">{t("book.success_worker", "Assigned Worker")}:</span>
                <span className="font-bold text-slate-900">{dispatchSuccess.worker_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t("auth.phone", "Registered Phone Number")}:</span>
                <span className="font-bold text-emerald-800">{dispatchSuccess.worker_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t("invoice.status", "Status")}:</span>
                <span className="font-bold text-red-600">{t("status.in_progress", "En Route")}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-semibold">{t("payment.total", "Total Fare")}:</span>
                <span className="font-bold text-slate-900">₹{dispatchSuccess.total_amount}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors text-center"
              >
                {t("book.view_dashboard", "Track on Dashboard")}
              </button>
              <button
                onClick={() => setDispatchSuccess(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                {t("dashboard.close", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
