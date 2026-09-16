import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const wid = parseInt(params.id, 10);
    const ratings = dbStore.ratings.filter(r => r.worker_id === wid).slice(-15).reverse();
    const feedback = dbStore.feedback.filter(f => f.worker_id === wid).slice(-15).reverse();

    const reviews = ratings.map(r => {
      const customer = dbStore.users.find(u => u.role === "CUSTOMER" && (u.customer_id === r.customer_id || u.id === r.customer_id));
      const fb = feedback.find(f => f.booking_id === r.booking_id);
      return {
        booking_id: r.booking_id,
        customer_name: customer ? customer.name : "Cooperative Customer",
        stars: r.stars,
        message: fb ? fb.message : "Verified cooperative trade service completed satisfactorily.",
        date: r.created_at ? r.created_at.split("T")[0] : ""
      };
    });

    return NextResponse.json({
      worker_id: wid,
      reviews,
      ratings: ratings.map(r => ({
        stars: r.stars,
        booking_id: r.booking_id,
        date: r.created_at ? r.created_at.split("T")[0] : ""
      })),
      feedback: feedback.map(f => ({
        message: f.message,
        date: f.created_at ? f.created_at.split("T")[0] : ""
      }))
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to fetch ratings" }, { status: 500 });
  }
}
