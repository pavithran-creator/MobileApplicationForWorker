import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const wid = parseInt(params.id, 10);
    const worker = dbStore.users.find(u => u.role === "WORKER" && (u.worker_id === wid || u.id === wid));

    if (!worker) {
      return NextResponse.json({ detail: "Worker not found" }, { status: 404 });
    }

    const skills = (worker.skills || ["Electrical repair"]).map((sk, idx) => ({
      id: idx + 1,
      skill_id: idx + 1,
      name: sk,
      level: "expert",
      experience_years: worker.experience_years || 5.0,
    }));

    const certs = [
      {
        id: 1,
        name: "National Trade Certificate (ITI/State Board)",
        cert_number: `ITI-TN-${1000 + (worker.worker_id || worker.id)}`,
        issuer: "Directorate General of Training",
        verification_status: worker.verification_status === "VERIFIED" ? "verified" : "pending",
        expiry_date: "2028-12-31",
      },
    ];

    const services = [1, 2, 3];

    return NextResponse.json({
      id: worker.worker_id || worker.id,
      name: worker.name,
      phone: worker.phone,
      cooperative_name: worker.cooperative || "Gandhipuram Labour Cooperative Society",
      verification_status: worker.verification_status || "VERIFIED",
      is_available: worker.is_available ?? true,
      avg_rating: worker.avg_rating || 4.8,
      rating_count: worker.rating_count || 10,
      experience_years: worker.experience_years || 5.0,
      address: worker.address || "Coimbatore",
      skills,
      certifications: certs,
      services,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to get worker details" }, { status: 500 });
  }
}
