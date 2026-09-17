import { NextRequest, NextResponse } from "next/server";
import { dbStore, DBUser } from "@/lib/supabase/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    const cleanPhone = (phone || "").trim().replace(/[^\d+]/g, "");
    let user = dbStore.users.find(u => u.phone === cleanPhone);

    if (!user) {
      // Check Supabase profiles table
      try {
        const supabase = getSupabaseAdmin();
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("phone", cleanPhone)
          .single();

        if (profile) {
          let worker_id: number | undefined;
          let customer_id: number | undefined;

          if (profile.role === "WORKER") {
            const { data: worker } = await supabase
              .from("workers")
              .select("id")
              .eq("user_id_num", profile.user_id_num)
              .single();
            worker_id = worker ? worker.id : profile.user_id_num;
          } else if (profile.role === "CUSTOMER") {
            const { data: customer } = await supabase
              .from("customers")
              .select("id")
              .eq("user_id_num", profile.user_id_num)
              .single();
            customer_id = customer ? customer.id : profile.user_id_num;
          }

          const fetchedUser: DBUser = {
            id: profile.user_id_num,
            name: profile.name,
            phone: profile.phone,
            email: profile.email,
            role: profile.role,
            worker_id,
            customer_id
          };
          dbStore.users.push(fetchedUser);
          user = fetchedUser;
        }
      } catch (dbErr) {
        console.warn("Supabase lookup error:", dbErr);
      }
    }

    if (!user) {
      return NextResponse.json({ detail: "Invalid phone number or password" }, { status: 401 });
    }

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
