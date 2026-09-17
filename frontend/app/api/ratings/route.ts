import { NextRequest, NextResponse } from "next/server";
import { dbStore, DBRating, DBFeedback } from "@/lib/supabase/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { booking_id, stars, message = "", feedback = "" } = body;

    const ratingVal = typeof stars === "number" ? stars : parseInt(stars, 10);
    if (!ratingVal || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json({ detail: "Rating must be between 1 and 5 stars" }, { status: 400 });
    }

    const booking = dbStore.bookings.find(b => b.id === booking_id);
    if (!booking) {
      return NextResponse.json({ detail: "Booking not found" }, { status: 404 });
    }

    // Must be completed
    if (booking.status !== "COMPLETED") {
      return NextResponse.json({ detail: "Only completed service bookings can be rated and reviewed" }, { status: 400 });
    }

    // Check duplicate in Supabase
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase.from("ratings").select("id").eq("booking_id", booking.id).maybeSingle();
    if (existing) {
      return NextResponse.json({ detail: "This booking has already been rated" }, { status: 400 });
    }

    const newRating: DBRating = {
      id: dbStore.ratings.length + 1,
      booking_id: booking.id,
      worker_id: booking.worker_id,
      customer_id: booking.customer_id,
      stars: ratingVal,
      created_at: new Date().toISOString()
    };
    dbStore.ratings.push(newRating);

    const feedbackText = (message || feedback || "").trim();
    if (feedbackText) {
      const newFeedback: DBFeedback = {
        id: dbStore.feedback.length + 1,
        booking_id: booking.id,
        worker_id: booking.worker_id,
        customer_id: booking.customer_id,
        message: feedbackText,
        created_at: new Date().toISOString()
      };
      dbStore.feedback.push(newFeedback);
    }

    try {
      const { recordRatingInSupabase } = await import("@/lib/supabase/db");
      await recordRatingInSupabase(booking.id, booking.worker_id, booking.customer_id, ratingVal, feedbackText);
    } catch (dbErr) {
      console.warn("Supabase rating persistence warning:", dbErr);
    }

    // Recalculate worker average rating accurately from database
    const workerRatings = dbStore.ratings.filter(r => r.worker_id === booking.worker_id);
    const sum = workerRatings.reduce((acc, r) => acc + r.stars, 0);
    const avg = workerRatings.length > 0 ? Math.round((sum / workerRatings.length) * 10) / 10 : ratingVal;

    const worker = dbStore.users.find(u => u.role === "WORKER" && (u.worker_id === booking.worker_id || u.id === booking.worker_id));
    if (worker) {
      worker.avg_rating = avg;
      worker.rating_count = workerRatings.length;
    }

    return NextResponse.json({
      status: "success",
      booking_id: booking.id,
      worker_id: booking.worker_id,
      stars: ratingVal,
      new_worker_average: worker?.avg_rating || ratingVal,
      total_reviews: workerRatings.length
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to submit rating" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workerIdParam = searchParams.get("worker_id");
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    let ratingsList = dbStore.ratings;
    if (workerIdParam) {
      const wid = parseInt(workerIdParam, 10);
      ratingsList = ratingsList.filter(r => r.worker_id === wid);
    }

    const reviews = ratingsList.slice().reverse().slice(0, limit).map(r => {
      const worker = dbStore.users.find(u => u.role === "WORKER" && (u.worker_id === r.worker_id || u.id === r.worker_id));
      const customer = dbStore.users.find(u => u.role === "CUSTOMER" && (u.customer_id === r.customer_id || u.id === r.customer_id));
      const fb = dbStore.feedback.find(f => f.booking_id === r.booking_id);

      return {
        id: r.id,
        booking_id: r.booking_id,
        worker_id: r.worker_id,
        worker_name: worker ? worker.name : `Worker #${r.worker_id}`,
        customer_name: customer ? customer.name : "Verified Customer",
        stars: r.stars,
        message: fb ? fb.message : "Verified cooperative trade service completed satisfactorily.",
        date: r.created_at ? r.created_at.split("T")[0] : new Date().toISOString().split("T")[0]
      };
    });

    return NextResponse.json(reviews);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to fetch reviews" }, { status: 500 });
  }
}
