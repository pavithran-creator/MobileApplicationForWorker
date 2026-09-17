import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    let user = null;
    if (token.startsWith("sb-token-")) {
      const parts = token.split("-");
      const uid = parseInt(parts[2], 10);
      user = dbStore.users.find(u => u.id === uid);
    }

    // Default fallback to first active user if token unparseable in test / demo
    if (!user) {
      user = dbStore.users[0];
    }

    const res: any = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email || null,
      role: user.role,
      created_at: new Date().toISOString(),
    };

    if (user.role === "CUSTOMER") {
      res.customer_id = user.customer_id || user.id;
      res.address = user.address || "Coimbatore";
      res.avatar_url = user.avatar_url || "";
    } else if (user.role === "WORKER") {
      res.worker_id = user.worker_id || user.id;
      res.verification_status = user.verification_status || "VERIFIED";
      res.cooperative = user.cooperative || "Gandhipuram Labour Cooperative Society";
      res.avg_rating = user.avg_rating || 4.8;
      res.rating_count = user.rating_count || 10;
      res.experience_years = user.experience_years || 5.0;
      res.address = user.address || "Coimbatore";
      res.avatar_url = user.avatar_url || "";
      res.bio = user.bio || "";
      res.upi_id = user.upi_id || "";
      res.upi_qr_url = user.upi_qr_url || "";
    }

    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to load user profile" }, { status: 500 });
  }
}
