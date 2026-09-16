"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "../../lib/i18n";
import { request, getAuthToken, getCurrentUser } from "../../lib/api";
import { UserProfile, BookingRecord, WelfareEnrollment, InsurancePolicyRecord } from "../../types";
import StatusBadge from "../../components/StatusBadge";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import AccessDenied from "../../components/AccessDenied";

export default function WorkerPortalPage() {
  const router = useRouter();
  const { t } = useLang();

  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(() => getCurrentUser());
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workerDetails, setWorkerDetails] = useState<any | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [welfareSchemes, setWelfareSchemes] = useState<WelfareEnrollment[]>([]);
  const [insuranceRecords, setInsuranceRecords] = useState<InsurancePolicyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Add Skill Form
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillExp, setNewSkillExp] = useState(2);
  const [addingSkill, setAddingSkill] = useState(false);

  const fetchWorkerData = async () => {
    try {
      setLoading(true);
      const me = await request<UserProfile>("/auth/me");
      setProfile(me);

      if (me.worker_id) {
        const details = await request<any>(`/workers/${me.worker_id}`).catch(() => null);
        setWorkerDetails(details);
      }

      const [bData, wData, iData] = await Promise.all([
        request<BookingRecord[]>("/bookings").catch(() => []),
        request<any>("/welfare").catch(() => ({ enrollments: [] })),
        request<any>("/insurance").catch(() => []),
      ]);

      setBookings(bData);
      setWelfareSchemes(wData.enrollments || []);
      setInsuranceRecords(Array.isArray(iData) ? iData : []);
    } catch (err: any) {
      setErrorMsg(err.message || t("common.error", "Failed to load worker profile"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login?redirect=/worker");
      return;
    }

    const user = getCurrentUser();
    setCurrentUser(user);

    if (!user || user.role !== "WORKER") {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    setIsAuthorized(true);
    fetchWorkerData();
  }, []);

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId: number, nextStatus: string) => {
    try {
      await request<any>(`/bookings/${bookingId}?status=${nextStatus}`, {
        method: "PATCH",
      });
      fetchWorkerData();
    } catch (err: any) {
      alert("Status update error: " + err.message);
    }
  };

  // Add Skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setAddingSkill(true);
    try {
      await request<any>("/workers/me/skills", {
        method: "POST",
        body: JSON.stringify({
          skill_name: newSkillName,
          category: "Skilled Trade",
          level: "intermediate",
          experience_years: Number(newSkillExp),
        }),
      });
      setNewSkillName("");
      fetchWorkerData();
    } catch (err: any) {
      alert("Error adding skill: " + err.message);
    } finally {
      setAddingSkill(false);
    }
  };

  // Calculate earnings total
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const totalDirectEarnings = completedBookings.reduce(
    (sum, b) => sum + (b.service_amount || b.total_amount * 0.9),
    0
  );

  if (isAuthorized === false) {
    return (
      <AccessDenied
        requiredRoleName="Registered Cooperative Workers (WORKER)"
        allowedRoles={["WORKER"]}
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Bar */}
      {profile && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center text-2xl font-bold shadow-md">
              ⚙
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
                  {profile.name}
                </h1>
                {profile.verification_status && (
                  <StatusBadge
                    type="verification"
                    status={profile.verification_status}
                  />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {profile.cooperative || "Coimbatore Central Labour Cooperative"} &bull; {profile.phone}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                  ★ {profile.avg_rating?.toFixed(1) || "5.0"} ({profile.rating_count || 0})
                </span>
                <span className="text-xs text-slate-500">
                  {t("book.experience", "{years} yrs exp", { years: profile.experience_years || 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Earnings & Jobs Metric Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <div className="text-xs font-semibold text-emerald-800">{t("worker.kpi_earnings", "Direct Earnings")}</div>
              <div className="text-xl font-extrabold text-emerald-900 font-heading mt-0.5">
                ₹{totalDirectEarnings.toFixed(0)}
              </div>
              <div className="text-[10px] text-emerald-700">90% Retained Split</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="text-xs font-semibold text-slate-600">{t("admin.kpi_active", "Total Jobs")}</div>
              <div className="text-xl font-extrabold text-slate-900 font-heading mt-0.5">
                {bookings.length}
              </div>
              <div className="text-[10px] text-slate-500">{t("nav.cooperative", "Cooperative")} Dispatched</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center col-span-2 sm:col-span-1">
              <div className="text-xs font-semibold text-slate-600">{t("admin.kpi_completed", "Completed")}</div>
              <div className="text-xl font-extrabold text-slate-900 font-heading mt-0.5">
                {completedBookings.length}
              </div>
              <div className="text-[10px] text-slate-500">100% {t("status.verified", "Verified")}</div>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Demo Fast-Pass for Pending Workers */}
      {profile?.verification_status === "PENDING" && (
        <div className="rounded-2xl bg-amber-50 border border-amber-300 p-5 shadow-sm text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              Registration Status: Pending Cooperative Vetting
            </div>
            <p className="text-xs text-amber-800 mt-1">
              Your trade registration is currently under review by the society. For demonstration and presentation testing, you can activate this profile instantly.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                if (profile?.worker_id) {
                  await request(`/admin/workers/${profile.worker_id}/verify`, {
                    method: "POST",
                    body: JSON.stringify({ status: "VERIFIED", note: "Demo instant self-verification" }),
                  });
                  fetchWorkerData();
                }
              } catch (e: any) {
                alert("Self-verification: " + e.message);
              }
            }}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs whitespace-nowrap transition-colors shadow-sm"
          >
            1-Click Activate Profile for Demo
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Assigned Bookings */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              {t("worker.assigned_jobs_title", "Assigned Cooperative Jobs & Tasks")}
            </h2>
            <span className="text-xs text-slate-500">
              {bookings.length} {t("worker.kpi_active_jobs", "Total Bookings")}
            </span>
          </div>

          {loading ? (
            <LoadingSkeleton type="table" count={3} />
          ) : bookings.length === 0 ? (
            <EmptyState
              title={t("worker.no_jobs", "No jobs currently assigned")}
              description={t("common.empty", "No records found.")}
            />
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{b.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {b.service_name}
                      </h3>
                      <StatusBadge type="booking" status={b.status} />
                      {b.is_emergency && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                          {t("doorstep.srv.emergency", "EMERGENCY 24/7")}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-emerald-800">
                      Take-Home: ₹{b.service_amount || (b.total_amount * 0.9).toFixed(0)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">{t("auth.customer", "Customer")}:</span>{" "}
                      <span className="font-semibold text-slate-800">{b.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">{t("dashboard.scheduled_for", "Scheduled")}:</span>{" "}
                      <span className="font-semibold text-slate-800">{b.date} at {b.start_time}</span>
                    </div>
                    <div className="sm:col-span-2 text-slate-500">
                      <span className="text-slate-400">{t("dashboard.location", "Location")}:</span> {b.address}
                    </div>
                  </div>

                  {/* Worker Action Buttons for Job Workflow */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    {b.status === "REQUESTED" && (
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id, "WORKER_ACCEPTED")}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors"
                      >
                        {t("status.worker_accepted", "Accept Assignment")}
                      </button>
                    )}
                    {b.status === "WORKER_ACCEPTED" && (
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id, "IN_PROGRESS")}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                      >
                        {t("dashboard.start_service", "Start Work On-Site")}
                      </button>
                    )}
                    {b.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id, "COMPLETED")}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                      >
                        {t("dashboard.complete_service", "Mark Job Completed")}
                      </button>
                    )}
                    {b.status === "COMPLETED" && (
                      <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                        ✓ {t("status.completed", "Completed & Settled")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Skills, Welfare, & Insurance */}
        <div className="lg:col-span-4 space-y-6">
          {/* Skills & Vetting */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
              {t("worker.skills_title", "Trade Skills & Qualifications")}
            </h3>

            {workerDetails?.skills && (
              <div className="flex flex-wrap gap-1.5">
                {workerDetails.skills.map((s: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-xs border border-slate-200"
                  >
                    {s.name || s}
                  </span>
                ))}
              </div>
            )}

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                {t("worker.add_skill_btn", "Add Additional Craft Skill")}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Solar Inverter Setup"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="submit"
                  disabled={addingSkill || !newSkillName.trim()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white font-semibold text-xs hover:bg-emerald-900 disabled:opacity-50"
                >
                  {addingSkill ? "..." : "+ Add"}
                </button>
              </div>
            </form>
          </div>

          {/* Social Security & Welfare Schemes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {t("worker.welfare_title", "Social Security & Welfare")}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {t("worker.active_status", "Active Member")}
              </span>
            </div>

            {welfareSchemes.length === 0 ? (
              <p className="text-xs text-slate-500">{t("common.empty", "No active welfare enrollments found.")}</p>
            ) : (
              <div className="space-y-2">
                {welfareSchemes.map((w) => (
                  <div
                    key={w.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-0.5"
                  >
                    <div className="font-bold text-slate-900">{w.benefit_name}</div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Status: {w.status}</span>
                      <span>Enrolled: {w.enrolled_at}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Insurance Policies */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {t("worker.insurance_title", "Accident & Life Cover")}
              </h3>
              <StatusBadge type="demo" status="Demo" />
            </div>

            {insuranceRecords.length === 0 ? (
              <p className="text-xs text-slate-500">{t("common.empty", "No insurance policy registered.")}</p>
            ) : (
              <div className="space-y-2">
                {insuranceRecords.map((ins) => (
                  <div
                    key={ins.id}
                    className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/80 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{ins.coverage_type}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {ins.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Policy #{ins.policy_ref} &bull; {ins.provider_name}
                    </div>
                    <div className="text-[10px] text-amber-800 italic pt-1">
                      {ins.demo_notice}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
