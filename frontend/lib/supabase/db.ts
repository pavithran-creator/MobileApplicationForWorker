import { getSupabaseAdmin } from "./admin";
import { dbStore, DBUser, DBBooking, DBPayment, DBInvoice, DBRating, DBFeedback, DBNotification } from "./store";

const supabase = getSupabaseAdmin();

export interface CreateCustomerInput {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  address?: string;
}

export interface CreateWorkerInput {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  address?: string;
  cooperative_id?: number;
  trade?: string;
  experience_years?: number;
  upi_id?: string;
}

export interface CreateBookingInput {
  customerId: number;
  workerId: number;
  serviceId: number;
  scheduledDate: string;
  startTime: string;
  durationMin?: number;
  address: string;
  description?: string;
  isEmergency?: boolean;
}

/**
 * 1. Register Customer directly in Supabase (profiles + customers)
 */
export async function registerCustomerInSupabase(input: CreateCustomerInput) {
  const cleanPhone = input.phone.trim().replace(/[^\d+]/g, "");

  // Insert profile
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .insert({
      name: input.name || "Cooperative Member",
      phone: cleanPhone,
      email: input.email || null,
      role: "CUSTOMER"
    })
    .select()
    .single();

  if (pErr) throw pErr;

  // Insert customer record
  const { data: customer, error: cErr } = await supabase
    .from("customers")
    .insert({
      profile_id: profile.id,
      user_id_num: profile.user_id_num,
      address: input.address || "Coimbatore, Tamil Nadu"
    })
    .select()
    .single();

  if (cErr) throw cErr;

  // Sync to in-memory store
  const syncUser: DBUser = {
    id: profile.user_id_num,
    customer_id: customer.id,
    name: profile.name,
    phone: profile.phone,
    email: profile.email || undefined,
    role: "CUSTOMER",
    address: customer.address
  };
  dbStore.users.push(syncUser);

  return { profile, customer };
}

/**
 * 2. Register Worker directly in Supabase (profiles + workers + worker_skills)
 */
export async function registerWorkerInSupabase(input: CreateWorkerInput) {
  const cleanPhone = input.phone.trim().replace(/[^\d+]/g, "");
  const coopId = input.cooperative_id || 1;
  const expYears = parseFloat(String(input.experience_years || 2.0));

  // Insert profile
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .insert({
      name: input.name || "Verified Worker",
      phone: cleanPhone,
      email: input.email || null,
      role: "WORKER"
    })
    .select()
    .single();

  if (pErr) throw pErr;

  // Insert worker record
  const { data: worker, error: wErr } = await supabase
    .from("workers")
    .insert({
      profile_id: profile.id,
      user_id_num: profile.user_id_num,
      cooperative_id: coopId,
      address: input.address || "Coimbatore, Tamil Nadu",
      experience_years: expYears,
      verification_status: "VERIFIED",
      is_available: true,
      avg_rating: 5.0,
      rating_count: 0,
      upi_id: input.upi_id || `${profile.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@oksbi`,
      base_lat: 11.0168,
      base_lng: 76.9558,
      service_radius_km: 15.0
    })
    .select()
    .single();

  if (wErr) throw wErr;

  // Link skill if trade provided
  const trade = input.trade || "Electrical Wiring";
  const { data: skill } = await supabase
    .from("skills")
    .select("id")
    .ilike("name", `%${trade.split(" ")[0]}%`)
    .limit(1)
    .single();

  const skillId = skill ? skill.id : 1;
  await supabase.from("worker_skills").insert({
    worker_id: worker.id,
    skill_id: skillId,
    level: "expert",
    experience_years: expYears
  });

  // Link matching service
  await supabase.from("worker_services").insert({
    worker_id: worker.id,
    service_id: skillId
  });

  // Sync to in-memory store
  const syncUser: DBUser = {
    id: profile.user_id_num,
    worker_id: worker.id,
    name: profile.name,
    phone: profile.phone,
    email: profile.email || undefined,
    role: "WORKER",
    cooperative_id: coopId,
    address: worker.address,
    experience_years: expYears,
    verification_status: "VERIFIED",
    is_available: true,
    avg_rating: 5.0,
    rating_count: 0,
    skills: [trade],
    upi_id: worker.upi_id
  };
  dbStore.users.push(syncUser);

  return { profile, worker };
}

/**
 * 3. Create Booking in Supabase
 */
export async function createBookingInSupabase(input: CreateBookingInput) {
  // Fetch service details for pricing
  const { data: svc } = await supabase
    .from("services")
    .select("*")
    .eq("id", input.serviceId)
    .single();

  const basePrice = svc ? parseFloat(svc.base_price) : 350.0;
  const workerWage = svc ? parseFloat(svc.worker_earning) : Math.round(basePrice * 0.9);
  const coopCharge = svc ? parseFloat(svc.coop_charge) : (basePrice - workerWage);

  // Insert into bookings table
  const { data: booking, error: bErr } = await supabase
    .from("bookings")
    .insert({
      customer_id: input.customerId,
      worker_id: input.workerId,
      service_id: input.serviceId,
      scheduled_date: input.scheduledDate,
      start_time: input.startTime,
      duration_min: input.durationMin || 60,
      address: input.address,
      description: input.description || "",
      status: "REQUESTED",
      is_emergency: input.isEmergency || false,
      service_amount: workerWage,
      coop_charge: coopCharge,
      total_amount: basePrice
    })
    .select()
    .single();

  if (bErr) throw bErr;

  // Insert status history
  await supabase.from("booking_status_history").insert({
    booking_id: booking.id,
    from_status: null,
    to_status: "REQUESTED"
  });

  // Sync with in-memory store
  const syncBooking: DBBooking = {
    id: booking.id,
    customer_id: booking.customer_id,
    worker_id: booking.worker_id,
    service_id: booking.service_id,
    scheduled_date: booking.scheduled_date,
    start_time: booking.start_time,
    duration_min: booking.duration_min,
    lat: 11.0168,
    lng: 76.9558,
    address: booking.address,
    description: booking.description,
    status: booking.status,
    is_emergency: booking.is_emergency,
    service_amount: workerWage,
    coop_charge: coopCharge,
    total_amount: basePrice,
    created_at: booking.created_at
  };
  dbStore.bookings.push(syncBooking);

  return booking;
}

/**
 * 4. Update Booking Status in Supabase
 */
export async function updateBookingStatusInSupabase(bookingId: number, nextStatus: string, actorId?: number) {
  // Get current booking
  const { data: curr } = await supabase.from("bookings").select("status").eq("id", bookingId).single();
  const prevStatus = curr ? curr.status : null;

  const { data: updated, error: uErr } = await supabase
    .from("bookings")
    .update({ status: nextStatus })
    .eq("id", bookingId)
    .select()
    .single();

  if (uErr) throw uErr;

  // Record history
  await supabase.from("booking_status_history").insert({
    booking_id: bookingId,
    from_status: prevStatus,
    to_status: nextStatus,
    actor_id: actorId || null
  });

  // Sync in-memory store
  const storeBooking = dbStore.bookings.find(b => b.id === bookingId);
  if (storeBooking) {
    storeBooking.status = nextStatus;
  }

  return updated;
}

/**
 * 5. Record Payment in Supabase
 */
export async function recordPaymentInSupabase(bookingId: number, amount: number, provider: string, providerRef: string) {
  const { data: payment, error: pErr } = await supabase
    .from("payments")
    .upsert({
      booking_id: bookingId,
      amount,
      provider,
      provider_ref: providerRef,
      status: "SUCCESS",
      is_demo: true
    }, { onConflict: "booking_id" })
    .select()
    .single();

  if (pErr) throw pErr;

  // Update booking status to CONFIRMED
  await updateBookingStatusInSupabase(bookingId, "CONFIRMED");

  // Sync in-memory store
  const syncPay: DBPayment = {
    id: payment.id,
    booking_id: bookingId,
    amount,
    provider,
    provider_ref: providerRef,
    status: "SUCCESS",
    is_demo: true,
    created_at: payment.created_at
  };
  dbStore.payments.push(syncPay);

  return payment;
}

/**
 * 6. Record Rating & Feedback in Supabase
 */
export async function recordRatingInSupabase(bookingId: number, workerId: number, customerId: number, stars: number, feedbackMsg?: string) {
  const { data: rating, error: rErr } = await supabase
    .from("ratings")
    .insert({
      booking_id: bookingId,
      worker_id: workerId,
      customer_id: customerId,
      stars
    })
    .select()
    .single();

  if (rErr) throw rErr;

  let feedback = null;
  if (feedbackMsg && feedbackMsg.trim()) {
    const { data: fb } = await supabase
      .from("feedback")
      .insert({
        booking_id: bookingId,
        worker_id: workerId,
        customer_id: customerId,
        message: feedbackMsg.trim()
      })
      .select()
      .single();
    feedback = fb;
  }

  // Recalculate average rating for the worker in Supabase
  const { data: ratingsList } = await supabase
    .from("ratings")
    .select("stars")
    .eq("worker_id", workerId);

  if (ratingsList && ratingsList.length > 0) {
    const sum = ratingsList.reduce((acc, cur) => acc + cur.stars, 0);
    const avg = Math.round((sum / ratingsList.length) * 10) / 10;
    await supabase
      .from("workers")
      .update({
        avg_rating: avg,
        rating_count: ratingsList.length
      })
      .eq("id", workerId);
  }

  return { rating, feedback };
}
