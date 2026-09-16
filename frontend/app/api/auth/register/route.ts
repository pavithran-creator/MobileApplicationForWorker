import { NextRequest, NextResponse } from "next/server";
import { dbStore, DBUser } from "@/lib/supabase/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, password, role = "CUSTOMER", email, cooperative_id, address, trade, experience_years = 2.0 } = body;

    const cleanPhone = (phone || "").trim().replace(/[^\d+]/g, "");
    if (!cleanPhone) {
      return NextResponse.json({ detail: "Phone number is required" }, { status: 400 });
    }

    if (dbStore.users.some(u => u.phone === cleanPhone)) {
      return NextResponse.json({ detail: "Phone number is already registered" }, { status: 400 });
    }

    dbStore.userCounter++;
    const newUserId = dbStore.userCounter;
    let worker_id: number | undefined;
    let customer_id: number | undefined;

    const coop = dbStore.cooperatives.find(c => c.id === cooperative_id) || dbStore.cooperatives[0];

    if (role === "WORKER") {
      worker_id = newUserId;
      const newUser: DBUser = {
        id: newUserId,
        worker_id,
        name: name || "Verified Worker",
        phone: cleanPhone,
        email: email || undefined,
        role: "WORKER",
        cooperative_id: coop.id,
        cooperative: coop.name,
        address: address || `${coop.area}, Coimbatore`,
        experience_years: parseFloat(experience_years) || 2.0,
        verification_status: "PENDING",
        is_available: true,
        avg_rating: 4.8,
        rating_count: 1,
        skills: [trade || "Electrical repair"],
      };
      dbStore.users.push(newUser);
    } else {
      customer_id = newUserId;
      const newUser: DBUser = {
        id: newUserId,
        customer_id,
        name: name || "Cooperative Member",
        phone: cleanPhone,
        email: email || undefined,
        role: "CUSTOMER",
        address: address || "Coimbatore",
      };
      dbStore.users.push(newUser);
    }

    const token = `sb-token-${newUserId}-${Date.now()}`;

    return NextResponse.json({
      id: newUserId,
      name: name || "Member",
      phone: cleanPhone,
      role,
      token,
      worker_id,
      customer_id,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Registration failed" }, { status: 500 });
  }
}
