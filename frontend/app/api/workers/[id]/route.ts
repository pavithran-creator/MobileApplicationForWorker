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
      avatar_url: worker.avatar_url || "",
      bio: worker.bio || "",
      upi_id: worker.upi_id || "",
      upi_qr_url: worker.upi_qr_url || "",
      skills,
      certifications: certs,
      services,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to get worker details" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const wid = parseInt(params.id, 10);
    const worker = dbStore.users.find(u => u.role === "WORKER" && (u.worker_id === wid || u.id === wid));

    if (!worker) {
      return NextResponse.json({ detail: "Worker not found" }, { status: 404 });
    }

    const body = await req.json();
    if (typeof body.name === "string" && body.name.trim()) worker.name = body.name.trim();
    if (typeof body.phone === "string" && body.phone.trim()) worker.phone = body.phone.trim();
    if (typeof body.address === "string") worker.address = body.address.trim();
    if (typeof body.bio === "string") worker.bio = body.bio.trim();
    if (typeof body.avatar_url === "string") worker.avatar_url = body.avatar_url.trim();
    if (typeof body.upi_id === "string") worker.upi_id = body.upi_id.trim();
    if (typeof body.upi_qr_url === "string") worker.upi_qr_url = body.upi_qr_url.trim();
    if (typeof body.experience_years === "number" && !isNaN(body.experience_years)) {
      worker.experience_years = body.experience_years;
    }

    if (!worker.upi_qr_url && worker.upi_id) {
      const upiUri = `upi://pay?pa=${encodeURIComponent(worker.upi_id)}&pn=${encodeURIComponent(worker.name)}&cu=INR`;
      worker.upi_qr_url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}`;
    }

    return NextResponse.json({
      success: true,
      worker: {
        id: worker.worker_id || worker.id,
        name: worker.name,
        phone: worker.phone,
        avatar_url: worker.avatar_url,
        bio: worker.bio,
        upi_id: worker.upi_id,
        upi_qr_url: worker.upi_qr_url,
        address: worker.address,
        experience_years: worker.experience_years,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to update worker" }, { status: 500 });
  }
}
