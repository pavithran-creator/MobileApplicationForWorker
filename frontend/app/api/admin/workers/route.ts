import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    let workers = dbStore.users.filter(u => u.role === "WORKER");
    if (statusFilter && statusFilter !== "ALL") {
      workers = workers.filter(w => w.verification_status === statusFilter);
    }

    const out = workers.map(w => {
      const wid = w.worker_id || w.id;
      return {
        id: wid,
        name: w.name,
        phone: w.phone,
        cooperative: w.cooperative || "Gandhipuram Labour Cooperative Society",
        cooperative_id: w.cooperative_id || 1,
        verification_status: w.verification_status || "VERIFIED",
        is_available: w.is_available ?? true,
        avg_rating: w.avg_rating || 4.8,
        rating_count: w.rating_count || 15,
        experience_years: w.experience_years || 5.0,
        address: w.address || "Coimbatore, Tamil Nadu",
        skills: w.skills || ["Electrical repair"],
        certifications: [`ITI-TN-${1000 + wid}`],
        created_at: "2025-01-10"
      };
    });

    return NextResponse.json(out);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to list admin workers" }, { status: 500 });
  }
}
