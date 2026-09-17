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

const AVATAR_PRESETS = [
  { label: "Electrician", url: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80" },
  { label: "Plumber", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" },
  { label: "Home Care", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80" },
  { label: "Carpenter", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" },
  { label: "Health Aide", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" },
  { label: "Driver", url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80" },
];

const SUGGESTED_BIOS = [
  "Senior certified electrician with 8+ years experience in domestic wiring and fault diagnosis.",
  "Master plumber specializing in leak repairs, sanitary overhaul, and pump fixtures.",
  "Experienced carpenter in modular woodwork, hinges, and furniture restoration.",
  "Trained residential technician committed to transparent cooperative fair wages and clean finish.",
];

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

  // Edit Profile Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editUpiId, setEditUpiId] = useState("");
  const [editUpiQrUrl, setEditUpiQrUrl] = useState("");
  const [editExp, setEditExp] = useState(5);
  const [editAddress, setEditAddress] = useState("");

  const handleOpenEditModal = () => {
    if (profile) {
      setEditName(profile.name || "");
      setEditPhone(profile.phone || "");
      setEditBio(profile.bio || "");
      setEditAvatarUrl(profile.avatar_url || "");
      setEditUpiId(profile.upi_id || "");
      setEditUpiQrUrl(profile.upi_qr_url || "");
      setEditExp(profile.experience_years || 5);
      setEditAddress(profile.address || "Coimbatore, Tamil Nadu");
      setProfileSuccessMsg(null);
      setIsEditModalOpen(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: "avatar" | "qr") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (targetField === "avatar") {
        setEditAvatarUrl(dataUrl);
      } else {
        setEditUpiQrUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg(null);
    try {
      let finalQr = editUpiQrUrl;
      if (!finalQr && editUpiId.trim()) {
        const upiUri = `upi://pay?pa=${encodeURIComponent(editUpiId.trim())}&pn=${encodeURIComponent(editName.trim() || "Cooperative Worker")}&cu=INR`;
        finalQr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}`;
      }

      await request<any>("/workers/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          bio: editBio,
          avatar_url: editAvatarUrl,
          upi_id: editUpiId,
          upi_qr_url: finalQr,
          experience_years: Number(editExp),
          address: editAddress,
        }),
      });

      const u = getCurrentUser();
      if (u) {
        u.name = editName;
        localStorage.setItem("ondemand_user", JSON.stringify(u));
        setCurrentUser(u);
      }

      setProfileSuccessMsg("Profile and transaction QR code saved successfully!");
      fetchWorkerData();
      setTimeout(() => {
        setIsEditModalOpen(false);
        setProfileSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      alert("Failed to save profile: " + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            {/* Avatar with Quick Edit Overlay */}
            <div className="relative group shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-600 shadow-md bg-slate-100"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-800 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                  {profile.name ? profile.name.charAt(0) : "⚙"}
                </div>
              )}
              <button
                type="button"
                onClick={handleOpenEditModal}
                title="Edit profile photo & details"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center text-xs shadow-md border-2 border-white transition-transform group-hover:scale-110"
              >
                ✎
              </button>
            </div>

            <div className="space-y-1.5 flex-1">
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
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="ml-auto sm:ml-2 px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <span>✎</span>
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <span>📲</span>
                  <span>My QR Code</span>
                </button>
              </div>

              <p className="text-xs text-slate-500">
                {profile.cooperative || "Coimbatore Central Labour Cooperative"} &bull; {profile.phone}
                {profile.upi_id && (
                  <span className="ml-2 font-mono text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                    UPI: {profile.upi_id}
                  </span>
                )}
              </p>

              {/* Bio Snippet */}
              {profile.bio && (
                <p className="text-xs text-slate-600 italic bg-slate-50 border border-slate-200/60 p-2 rounded-xl max-w-xl">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              )}

              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                  ★ {profile.avg_rating?.toFixed(1) || "5.0"} ({profile.rating_count || 0})
                </span>
                <span className="text-xs text-slate-500">
                  {t("book.experience", "{years} yrs exp", { years: profile.experience_years || 2 })}
                </span>
                {profile.address && (
                  <span className="text-xs text-slate-400">
                    &bull; 📍 {profile.address}
                  </span>
                )}
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

          {/* Dedicated Transaction QR Code & Digital Settlement Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white border border-emerald-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-base font-bold text-emerald-100 font-heading">
                  Transaction &amp; Payout QR
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 border border-emerald-700">
                Direct UPI
              </span>
            </div>

            <div className="flex items-center gap-4 bg-emerald-950/60 p-3 rounded-xl border border-emerald-700/50">
              <div 
                onClick={() => setIsQrModalOpen(true)}
                className="w-24 h-24 bg-white p-1.5 rounded-xl shrink-0 cursor-pointer shadow hover:ring-2 hover:ring-amber-400 transition-all flex items-center justify-center overflow-hidden"
                title="Click to enlarge scannable QR"
              >
                {profile?.upi_qr_url ? (
                  <img src={profile.upi_qr_url} alt="Transaction QR" className="w-full h-full object-contain" />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('upi://pay?pa=' + (profile?.upi_id || 'suresh.electrician@oksbi') + '&pn=' + (profile?.name || 'Worker') + '&cu=INR')}`}
                    alt="Transaction QR"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-amber-300">Doorstep QR Scanner</div>
                <div className="text-[11px] text-emerald-200 font-mono break-all">
                  {profile?.upi_id || "suresh.electrician@oksbi"}
                </div>
                <p className="text-[10px] text-emerald-300/80 leading-relaxed">
                  Customers scan this QR code directly when booking or settling services on-site.
                </p>
                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="text-[10px] font-bold text-amber-300 hover:text-amber-200 underline"
                  >
                    Enlarge QR
                  </button>
                  <span className="text-emerald-700">&bull;</span>
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="text-[10px] font-bold text-emerald-300 hover:text-white underline"
                  >
                    Update QR / UPI
                  </button>
                </div>
              </div>
            </div>
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

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 my-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg">
                  ✎
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                    Edit Worker Profile &amp; Payout QR
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update your public trade profile, avatar, bio, and transaction QR code.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <span>✓</span>
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* 1. Profile Picture Section */}
              <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Profile Photo
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-600 bg-white shadow shrink-0 flex items-center justify-center">
                    {editAvatarUrl ? (
                      <img src={editAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-slate-300">👤</span>
                    )}
                  </div>
                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex flex-wrap gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs cursor-pointer transition-colors shadow-sm">
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "avatar")}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditAvatarUrl("")}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Or pick a trade avatar preset:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setEditAvatarUrl(preset.url)}
                          className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                            editAvatarUrl === preset.url
                              ? "bg-emerald-100 border-emerald-600 text-emerald-900 font-bold"
                              : "bg-white border-slate-300 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Professional Bio Section */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    2. Trade Biography &amp; Experience
                  </label>
                  <span className="text-[11px] text-slate-400">Max 250 characters</span>
                </div>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={250}
                  rows={3}
                  placeholder="Describe your trade specializations, certifications, and service values..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <div className="text-[11px] text-slate-500">Quick suggestions:</div>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_BIOS.map((sug, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setEditBio(sug)}
                      className="text-[10px] text-left px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                    >
                      + {sug.slice(0, 45)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Transaction QR Code & UPI Section */}
              <div className="space-y-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📲</span>
                    <span>3. Direct Transaction QR Code &amp; UPI ID</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Shown to Customer at Booking
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Customers scan this QR code directly when booking or paying for this service.
                </p>

                <div className="grid sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <div className="w-28 h-28 bg-white p-2 rounded-xl border border-emerald-300 shadow-sm flex items-center justify-center overflow-hidden">
                      {editUpiQrUrl ? (
                        <img src={editUpiQrUrl} alt="Transaction QR Preview" className="w-full h-full object-contain" />
                      ) : editUpiId ? (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('upi://pay?pa=' + editUpiId.trim() + '&pn=' + (editName || 'Worker') + '&cu=INR')}`}
                          alt="Generated QR"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 text-center font-mono">No QR</span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-800 font-semibold mt-1">Live Scanner Preview</span>
                  </div>

                  <div className="sm:col-span-8 space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        UPI ID / Virtual Payment Address (VPA)
                      </label>
                      <input
                        type="text"
                        value={editUpiId}
                        onChange={(e) => setEditUpiId(e.target.value)}
                        placeholder="e.g. suresh.electrician@oksbi"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Upload Custom QR Image (Google Pay / PhonePe / Paytm / Apex Bank)
                      </label>
                      <div className="flex gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs cursor-pointer transition-colors shadow-2xs">
                          <span>Choose QR Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "qr")}
                            className="hidden"
                          />
                        </label>
                        {editUpiQrUrl && (
                          <button
                            type="button"
                            onClick={() => setEditUpiQrUrl("")}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                          >
                            Reset to Auto
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Operating Details (Name, Phone, Address, Exp) */}
              <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operating Address / Hub Area</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    value={editExp}
                    onChange={(e) => setEditExp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {savingProfile ? "Saving Profile..." : "Save Profile &amp; QR Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENLARGED TRANSACTION QR MODAL */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="text-left">
                <h3 className="font-extrabold text-slate-900 font-heading text-base">
                  Doorstep Transaction QR
                </h3>
                <p className="text-[11px] text-emerald-800 font-semibold">
                  {profile?.name} &bull; {profile?.cooperative}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 inline-block">
              <div className="w-56 h-56 bg-white p-2.5 rounded-xl shadow-md mx-auto flex items-center justify-center overflow-hidden">
                {profile?.upi_qr_url ? (
                  <img src={profile.upi_qr_url} alt="Transaction QR" className="w-full h-full object-contain" />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('upi://pay?pa=' + (profile?.upi_id || 'suresh.electrician@oksbi') + '&pn=' + (profile?.name || 'Worker') + '&cu=INR')}`}
                    alt="Transaction QR"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800">Scan to Pay via Any UPI App</div>
              <div className="font-mono text-xs text-emerald-800 font-bold bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-200 inline-block">
                {profile?.upi_id || "suresh.electrician@oksbi"}
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                GPay, PhonePe, Paytm, BHIM &amp; Apex Cooperative Bank supported.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
