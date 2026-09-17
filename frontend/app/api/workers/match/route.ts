import { NextRequest, NextResponse } from "next/server";
import { matchWorkers } from "@/lib/supabase/matching";
import { dbStore } from "@/lib/supabase/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceIdStr = searchParams.get("service_id");
    if (!serviceIdStr) {
      return NextResponse.json({ detail: "service_id is required" }, { status: 400 });
    }

    // Sync latest worker profiles and QR codes from Supabase
    try {
      const supabase = getSupabaseAdmin();
      const { data: dbWorkers } = await supabase
        .from("workers")
        .select(`
          id,
          user_id_num,
          avg_rating,
          rating_count,
          experience_years,
          upi_id,
          upi_qr_url,
          avatar_url,
          bio,
          address,
          profiles ( name, phone )
        `);

      if (dbWorkers && dbWorkers.length > 0) {
        for (const dw of dbWorkers) {
          const wid = dw.id;
          const u = dbStore.users.find(usr => usr.role === "WORKER" && (usr.worker_id === wid || usr.id === dw.user_id_num || usr.id === wid));
          if (u) {
            if (dw.upi_qr_url) u.upi_qr_url = dw.upi_qr_url;
            if (dw.upi_id) u.upi_id = dw.upi_id;
            if (dw.avatar_url) u.avatar_url = dw.avatar_url;
            if (dw.bio) u.bio = dw.bio;
            if (dw.address) u.address = dw.address;
            const prof: any = Array.isArray(dw.profiles) ? dw.profiles[0] : dw.profiles;
            if (prof?.name) u.name = prof.name;
            if (prof?.phone) u.phone = prof.phone;
          }
        }
      }
    } catch (err) {
      console.warn("Could not sync workers from Supabase in match route:", err);
    }

    const serviceId = parseInt(serviceIdStr, 10);
    const lat = parseFloat(searchParams.get("lat") || "11.0168");
    const lng = parseFloat(searchParams.get("lng") || "76.9558");
    const scheduledDate = searchParams.get("scheduled_date") || undefined;
    const startTime = searchParams.get("start_time") || "10:00";
    const durationMin = parseInt(searchParams.get("duration_min") || "60", 10);

    const candidates = matchWorkers(serviceId, lat, lng, scheduledDate, startTime, durationMin);
    return NextResponse.json(candidates);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Matching query failed" }, { status: 500 });
  }
}
