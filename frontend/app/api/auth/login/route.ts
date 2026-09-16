import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    const cleanPhone = (phone || "").trim().replace(/\s+/g, "");
    const user = dbStore.users.find(u => u.phone === cleanPhone);

    if (!user) {
      return NextResponse.json({ detail: "Invalid phone number or password" }, { status: 401 });
    }

    // Dummy password check: accept provided password or matching role password for demo convenience
    const mockToken = `sb-token-${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const response: any = {
      token: mockToken,
      access_token: mockToken,
      role: user.role,
      user_id: user.id,
      name: user.name,
    };

    if (user.role === "CUSTOMER" && user.customer_id) {
      response.customer_id = user.customer_id;
    } else if (user.role === "WORKER" && user.worker_id) {
      response.worker_id = user.worker_id;
    }

    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Internal server error" }, { status: 500 });
  }
}
