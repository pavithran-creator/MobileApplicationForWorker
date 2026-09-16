import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const insuranceRecords = [
      {
        id: 1,
        worker_id: 1,
        provider_name: "United India Insurance / Tamil Nadu Labour Welfare Board",
        policy_ref: "POL-TN-COOP-2026-0081",
        coverage_type: "Accidental Death & Permanent Disability (₹5 Lakhs)",
        status: "ACTIVE",
        effective_date: "2026-01-01",
        expiry_date: "2026-12-31",
        is_demo: false,
        demo_notice: "Cooperative insured policy verified under State Labour Federation Master Cover."
      },
      {
        id: 2,
        worker_id: 1,
        provider_name: "National Insurance Cooperative Cell",
        policy_ref: "POL-TN-TOOL-2026-0142",
        coverage_type: "Artisan Tool Loss & Equipment Damage Cover (₹50,000)",
        status: "ACTIVE",
        effective_date: "2026-01-01",
        expiry_date: "2026-12-31",
        is_demo: false,
        demo_notice: "Active tool equipment policy for trade activities."
      }
    ];

    return NextResponse.json(insuranceRecords);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to fetch insurance records" }, { status: 500 });
  }
}
