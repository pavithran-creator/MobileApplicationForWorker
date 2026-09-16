"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "../../lib/i18n";
import { request, getAuthToken, getCurrentUser } from "../../lib/api";
import {
  AdminDashboardKPIs,
  AdminWorkerItem,
  DemandForecastResult,
  WorkforceAllocationResult,
} from "../../types";
import StatusBadge from "../../components/StatusBadge";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import AccessDenied from "../../components/AccessDenied";

export default function AdminConsolePage() {
  const router = useRouter();
  const { t } = useLang();

  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(() => getCurrentUser());
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const [activeTab, setActiveTab] = useState<"vetting" | "ai-forecast" | "allocation" | "audit">("vetting");
  const [kpis, setKpis] = useState<AdminDashboardKPIs | null>(null);
  const [workers, setWorkers] = useState<AdminWorkerItem[]>([]);
  const [forecast, setForecast] = useState<DemandForecastResult | null>(null);
  const [allocation, setAllocation] = useState<WorkforceAllocationResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [workerStatusFilter, setWorkerStatusFilter] = useState<string>("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [kpiRes, workerRes, fcRes, allocRes, auditRes] = await Promise.all([
        request<AdminDashboardKPIs>("/admin/dashboard"),
        request<AdminWorkerItem[]>("/admin/workers"),
        request<DemandForecastResult>("/ai/demand-forecast?days=7"),
        request<WorkforceAllocationResult>("/ai/workforce-allocation?days=7"),
        request<any[]>("/admin/audit-logs?limit=25"),
      ]);

      setKpis(kpiRes);
      setWorkers(workerRes);
      setForecast(fcRes);
      setAllocation(allocRes);
      setAuditLogs(auditRes);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load administrative console. Ensure you are signed in as an Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login?redirect=/admin");
      return;
    }

    const user = getCurrentUser();
    setCurrentUser(user);

    if (!user || (user.role !== "COOP_ADMIN" && user.role !== "FED_ADMIN")) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    setIsAuthorized(true);
    fetchAdminData();
  }, []);

  // Worker Verification: Approve / Reject
  const handleVerifyWorker = async (workerId: number, status: "VERIFIED" | "REJECTED") => {
    setActionLoadingId(workerId);
    try {
      await request<any>(`/admin/workers/${workerId}/verification`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          note: `Administrative decision by cooperative officer (${status})`,
        }),
      });
      fetchAdminData();
    } catch (err: any) {
      alert("Verification update failed: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // AI Allocation Decision: Approve / Reject
  const handleAllocationDecision = async (aid: number, approve: boolean) => {
    setActionLoadingId(aid);
    try {
      await request<any>(`/ai/workforce-allocation/${aid}/${approve ? "approve" : "reject"}`, {
        method: "POST",
      });
      fetchAdminData();
    } catch (err: any) {
      alert("Allocation action error: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredWorkers = workers.filter((w) => {
    if (workerStatusFilter === "ALL") return true;
    return w.verification_status === workerStatusFilter;
  });

  if (isAuthorized === false) {
    return (
      <AccessDenied
        requiredRoleName="Cooperative Administrators (COOP_ADMIN / FED_ADMIN)"
        allowedRoles={["COOP_ADMIN", "FED_ADMIN"]}
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t("nav.cooperative", "Cooperative")} {t("nav.admin", "Governance")}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
            {t("admin.portal_title", "Cooperative Federation Admin Console")}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t("admin.portal_subtitle", "State federation oversight, pending verification queue, AI demand forecasting, and workforce reallocation.")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge type="demo" status="Demo" label={t("admin.state_federation", "Tamil Nadu State Federation")} />
          <button
            onClick={fetchAdminData}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs shadow-sm"
          >
            ↻ {t("admin.refresh", "Refresh Data")}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 flex items-center justify-between">
          <span>{errorMsg}</span>
          <Link href="/login" className="font-bold underline text-red-800">
            {t("nav.login", "Sign In")} &rarr;
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      {loading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : kpis ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">{t("admin.kpi_workers", "Total Workers")}</div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading mt-1">
              {kpis.total_workers}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              {kpis.verified_workers} {t("status.verified", "Verified")} &bull; {kpis.pending_verification} {t("status.pending", "Pending")}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">{t("admin.kpi_active", "Active Bookings")}</div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading mt-1">
              {kpis.active_bookings}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {kpis.completed_bookings} {t("status.completed", "Completed")}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">{t("admin.kpi_revenue", "Total Fair Wage Revenue")}</div>
            <div className="text-2xl font-extrabold text-emerald-800 font-heading mt-1">
              ₹{kpis.total_revenue.toFixed(0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {t("dashboard.invoice_worker_wage", "90% Distributed Directly to Workers")}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">{t("book.rating", "Rating")}</div>
            <div className="text-2xl font-extrabold text-amber-500 font-heading mt-1 flex items-center gap-1">
              ★ {kpis.avg_platform_rating}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {t("status.verified", "Verified Reviews")}
            </div>
          </div>
        </div>
      ) : null}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto text-sm font-semibold">
        <button
          onClick={() => setActiveTab("vetting")}
          className={`pb-3.5 transition-all border-b-2 whitespace-nowrap ${
            activeTab === "vetting"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {t("admin.queue_title", "Worker Verification Queue")} ({workers.filter((w) => w.verification_status === "PENDING").length})
        </button>
        <button
          onClick={() => setActiveTab("ai-forecast")}
          className={`pb-3.5 transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "ai-forecast"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>{t("admin.ai_forecasting_title", "AI Demand Forecasting")}</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800">
            60-Day Model
          </span>
        </button>
        <button
          onClick={() => setActiveTab("allocation")}
          className={`pb-3.5 transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "allocation"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>{t("admin.ai_allocation_title", "AI Workforce Allocation")}</span>
          {allocation && allocation.status === "PENDING" && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3.5 transition-all border-b-2 whitespace-nowrap ${
            activeTab === "audit"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {t("admin.audit_title", "System Audit Trail")} ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Worker Verification Queue */}
      {activeTab === "vetting" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center gap-2">
              {["ALL", "PENDING", "VERIFIED", "REJECTED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setWorkerStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    workerStatusFilter === status
                      ? "bg-emerald-800 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500">
              Showing {filteredWorkers.length} tradespersons
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">{t("admin.col_name", "Tradesperson")}</th>
                    <th className="px-5 py-3.5">{t("admin.col_coop", "Cooperative Society")}</th>
                    <th className="px-5 py-3.5">{t("admin.col_trade", "Skills & Qualifications")}</th>
                    <th className="px-5 py-3.5">{t("admin.col_verif", "Status")}</th>
                    <th className="px-5 py-3.5 text-right">{t("admin.col_actions", "Verification Action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWorkers.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{w.name}</div>
                        <div className="text-slate-500 text-[11px]">{w.phone} &bull; {w.experience_years} yrs exp</div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {w.cooperative}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {w.skills.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge type="verification" status={w.verification_status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {w.verification_status !== "VERIFIED" && (
                            <button
                              onClick={() => handleVerifyWorker(w.id, "VERIFIED")}
                              disabled={actionLoadingId === w.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                            >
                              {t("admin.approve_btn", "Approve")}
                            </button>
                          )}
                          {w.verification_status !== "REJECTED" && (
                            <button
                              onClick={() => handleVerifyWorker(w.id, "REJECTED")}
                              disabled={actionLoadingId === w.id}
                              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition-colors disabled:opacity-50"
                            >
                              {t("admin.reject_btn", "Reject")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Demand Forecasting */}
      {activeTab === "ai-forecast" && forecast && (
        <div className="space-y-6">
          {/* Transparent Mode Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl font-bold text-emerald-800">⚙</div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-emerald-950">
                    {t("admin.ai_forecasting_title", "AI Demand Forecasting Engine")}
                  </h3>
                  <StatusBadge type="demo" status="Demo" label={forecast.mode} />
                </div>
                <p className="text-xs text-emerald-800 mt-1 max-w-2xl">
                  {forecast.mode.includes("model-based")
                    ? "Trained on 60 days of historical booking patterns across Coimbatore Cooperative Societies."
                    : "Sparse data mode activated. Displaying baseline heuristic projections."}
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-emerald-900 bg-emerald-200/60 px-3 py-1.5 rounded-lg self-start sm:self-auto">
              Horizon: {forecast.period_days} Days
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("admin.expected_requests", "Predicted Customer Requests")}
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-heading">
                {forecast.expected_requests}
              </div>
              <div className="text-xs text-slate-500">
                {t("admin.demand_level", "Demand Level")}: <span className="font-bold text-amber-600">{forecast.level}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("admin.kpi_verified", "Available Verified Workers")}
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-heading">
                {forecast.available_verified_workers}
              </div>
              <div className="text-xs text-slate-500">
                Active in {forecast.area}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Projected Workforce Gap
              </div>
              <div className={`text-3xl font-extrabold font-heading ${
                forecast.shortage > 0 ? "text-red-600" : "text-emerald-700"
              }`}>
                {forecast.shortage > 0 ? `+${forecast.shortage} Shortage` : "Sufficient Coverage"}
              </div>
              <div className="text-xs text-slate-500">
                Historical Bookings (60d): {forecast.historical_bookings_60d}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI Workforce Allocation */}
      {activeTab === "allocation" && allocation && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  {t("admin.ai_allocation_title", "AI Shortage Rebalancing Recommendation")}
                </h3>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  allocation.status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-800"
                    : allocation.status === "REJECTED"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {allocation.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Recommendation #{allocation.allocation_id} &bull; Target: {allocation.area}
              </p>
            </div>
            <StatusBadge type="demo" status="Demo" label="Human-In-The-Loop Governance" />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="text-sm font-bold text-slate-900">
              {allocation.recommendation}
            </div>
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Algorithmic Rationale:</span> {allocation.reason}
            </div>
            <div className="pt-2 border-t border-slate-200 text-xs text-emerald-800 font-medium flex items-center gap-1.5">
              <span>⚙</span>
              <span>{allocation.governance_rule}</span>
            </div>
          </div>

          {/* Admin Decision Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {allocation.status === "PENDING" ? (
              <>
                <button
                  onClick={() => handleAllocationDecision(allocation.allocation_id, true)}
                  disabled={actionLoadingId === allocation.allocation_id}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {t("admin.approve_alloc", "Approve Workforce Allocation (Apply to Federation Schedule)")}
                </button>
                <button
                  onClick={() => handleAllocationDecision(allocation.allocation_id, false)}
                  disabled={actionLoadingId === allocation.allocation_id}
                  className="px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors disabled:opacity-50"
                >
                  {t("admin.reject_alloc", "Decline Recommendation")}
                </button>
              </>
            ) : (
              <div className="text-xs font-semibold text-slate-500">
                Decision recorded in audit log as <span className="font-bold">{allocation.status}</span>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: System Audit Trail */}
      {activeTab === "audit" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {t("admin.audit_title", "Tamper-Evident System Audit Trail")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("admin.audit_sub", "Real-time log of administrative approvals, worker status modifications, and AI actions.")}
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Live Log Stream
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {log.action}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {log.target}
                    </span>
                  </div>
                  <div className="text-slate-700">
                    {log.meta}
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-mono">
                  <div>By: {log.actor_name}</div>
                  <div>{log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
