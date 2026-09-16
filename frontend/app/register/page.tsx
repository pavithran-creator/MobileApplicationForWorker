"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLang } from "../../lib/i18n";
import { request, setAuthToken } from "../../lib/api";

interface CoopOption {
  id: number;
  name: string;
  district: string;
}

interface SkillOption {
  id: number;
  name: string;
}

const DEFAULT_COOPERATIVES: CoopOption[] = [
  { id: 1, name: "Gandhipuram Labour Cooperative Society", district: "Coimbatore" },
  { id: 2, name: "RS Puram Cooperative Trades Society", district: "Coimbatore" },
  { id: 3, name: "Peelamedu Artisan Contract Society", district: "Coimbatore" },
];

const DEFAULT_SKILLS: SkillOption[] = [
  { id: 1, name: "Electrical repair" },
  { id: 2, name: "Domestic wiring" },
  { id: 3, name: "Tap & pipe repair" },
  { id: 4, name: "Drainage clearing" },
  { id: 5, name: "Wood furniture repair" },
  { id: 6, name: "Interior wall painting" },
  { id: 7, name: "Chauffeur driving" },
  { id: 8, name: "Deep home sanitization" },
  { id: 9, name: "Lawn & landscaping" },
  { id: 10, name: "Elderly companion assistance" },
];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLang();

  const [role, setRole] = useState<"CUSTOMER" | "WORKER">("CUSTOMER");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [cooperativeId, setCooperativeId] = useState<number | "">(1);
  const [experienceYears, setExperienceYears] = useState<number>(2);
  const [trade, setTrade] = useState("Electrical repair");

  const [cooperatives, setCooperatives] = useState<CoopOption[]>(DEFAULT_COOPERATIVES);
  const [skills, setSkills] = useState<SkillOption[]>(DEFAULT_SKILLS);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "worker") {
      setRole("WORKER");
    }

    // Fetch cooperatives and skills
    request<CoopOption[]>("/catalog/cooperatives")
      .then((data) => {
        const list = Array.isArray(data) && data.length > 0 ? data : DEFAULT_COOPERATIVES;
        setCooperatives(list);
        if (list.length > 0 && !cooperativeId) setCooperativeId(list[0].id);
      })
      .catch(() => {
        setCooperatives(DEFAULT_COOPERATIVES);
      });

    request<SkillOption[]>("/catalog/skills")
      .then((data) => {
        const list = Array.isArray(data) && data.length > 0 ? data : DEFAULT_SKILLS;
        setSkills(list);
        if (list.length > 0 && !trade) setTrade(list[0].name);
      })
      .catch(() => {
        setSkills(DEFAULT_SKILLS);
      });
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: any = {
        name,
        phone,
        password,
        role,
        address: address || "Coimbatore, Tamil Nadu",
      };

      if (role === "WORKER") {
        payload.cooperative_id = cooperativeId ? Number(cooperativeId) : 1;
        payload.experience_years = Number(experienceYears) || 2;
        payload.trade = trade || "Electrical repair";
      }

      const res = await request<{ token: string; role: string; id: number; name: string; worker_id?: number; customer_id?: number }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (res.token) setAuthToken(res.token);
      localStorage.setItem(
        "ondemand_user",
        JSON.stringify({
          name: res.name,
          role: res.role,
          id: res.id,
          worker_id: res.worker_id,
          customer_id: res.customer_id,
        })
      );

      if (role === "WORKER") {
        router.push("/worker");
      } else {
        router.push("/book");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-2xl mb-3 shadow-md">
          &#9874;
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
          {t("auth.registerTitle", "Cooperative Member Registration")}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Join the democratic labour cooperative federation network for certified services and fair wages.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          {/* Role Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole("CUSTOMER")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === "CUSTOMER"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("auth.customer", "Customer")}
            </button>
            <button
              type="button"
              onClick={() => setRole("WORKER")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === "WORKER"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("auth.worker", "Skilled Worker")}
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh V"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Residential / Operating Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 24 Gandhipuram 4th Street, Coimbatore"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {role === "WORKER" && (
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800">
                  <span className="font-bold">Cooperative Society Affiliation:</span> As a registered trade member, you will be enrolled into your chosen primary society for welfare benefits, tool maintenance, and peer vetting.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select Primary Cooperative Society
                  </label>
                  <select
                    value={cooperativeId}
                    onChange={(e) => setCooperativeId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {cooperatives.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Primary Trade / Craft
                    </label>
                    <select
                      value={trade}
                      onChange={(e) => setTrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      {skills.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {loading
                  ? "Creating Account..."
                  : role === "WORKER"
                  ? "Register as Trade Worker & Submit for Vetting"
                  : "Register as Household Customer"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-800 hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
