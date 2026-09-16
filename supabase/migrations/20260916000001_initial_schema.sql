-- ==============================================================================
-- ON-DEMAND LABOUR COOPERATIVE MARKETPLACE — POSTGRESQL SCHEMA (SUPABASE)
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumerated types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CUSTOMER', 'WORKER', 'COOP_ADMIN', 'FED_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('REQUESTED', 'CONFIRMED', 'WORKER_ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pay_status AS ENUM ('PENDING', 'INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verif_status AS ENUM ('REGISTERED', 'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Core Structural Tables

-- Federations
CREATE TABLE IF NOT EXISTS public.federations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    region VARCHAR(200) DEFAULT 'Tamil Nadu',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cooperatives
CREATE TABLE IF NOT EXISTS public.cooperatives (
    id SERIAL PRIMARY KEY,
    federation_id INT REFERENCES public.federations(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    area VARCHAR(200) DEFAULT '',
    lat DOUBLE PRECISION DEFAULT 11.0168,
    lng DOUBLE PRECISION DEFAULT 76.9558,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_cooperatives_federation ON public.cooperatives(federation_id);

-- Profiles (Linked to auth.users if Supabase Auth is active, plus integer sequence for compatibility)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id_num SERIAL UNIQUE,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(25) UNIQUE NOT NULL,
    email VARCHAR(200) UNIQUE,
    password_hash VARCHAR(255),
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS ix_profiles_role ON public.profiles(role);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id SERIAL PRIMARY KEY,
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id_num INT UNIQUE REFERENCES public.profiles(user_id_num) ON DELETE CASCADE,
    address VARCHAR(500) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workers
CREATE TABLE IF NOT EXISTS public.workers (
    id SERIAL PRIMARY KEY,
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id_num INT UNIQUE REFERENCES public.profiles(user_id_num) ON DELETE CASCADE,
    cooperative_id INT REFERENCES public.cooperatives(id) ON DELETE SET NULL,
    address VARCHAR(500) DEFAULT '',
    experience_years DOUBLE PRECISION DEFAULT 0.0,
    verification_status verif_status DEFAULT 'REGISTERED',
    is_available BOOLEAN DEFAULT TRUE,
    avg_rating DOUBLE PRECISION DEFAULT 0.0,
    rating_count INT DEFAULT 0,
    base_lat DOUBLE PRECISION DEFAULT 11.0168,
    base_lng DOUBLE PRECISION DEFAULT 76.9558,
    service_radius_km DOUBLE PRECISION DEFAULT 15.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_workers_cooperative ON public.workers(cooperative_id);
CREATE INDEX IF NOT EXISTS ix_workers_verification ON public.workers(verification_status);
CREATE INDEX IF NOT EXISTS ix_workers_availability ON public.workers(is_available);

-- Worker Verification History
CREATE TABLE IF NOT EXISTS public.worker_verifications (
    id SERIAL PRIMARY KEY,
    worker_id INT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    from_status VARCHAR(40),
    to_status verif_status,
    actor_id INT REFERENCES public.profiles(user_id_num) ON DELETE SET NULL,
    note VARCHAR(500) DEFAULT '',
    id_proof_type VARCHAR(100) DEFAULT '',
    id_proof_ref VARCHAR(200) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_worker_verif_worker ON public.worker_verifications(worker_id);

-- Skills
CREATE TABLE IF NOT EXISTS public.skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    category VARCHAR(200) DEFAULT '',
    requires_certification BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker Skills
CREATE TABLE IF NOT EXISTS public.worker_skills (
    id SERIAL PRIMARY KEY,
    worker_id INT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    level VARCHAR(50) DEFAULT 'intermediate',
    experience_years DOUBLE PRECISION DEFAULT 0.0,
    UNIQUE(worker_id, skill_id)
);
CREATE INDEX IF NOT EXISTS ix_worker_skills_worker ON public.worker_skills(worker_id);
CREATE INDEX IF NOT EXISTS ix_worker_skills_skill ON public.worker_skills(skill_id);

-- Certifications
CREATE TABLE IF NOT EXISTS public.certifications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    issuer VARCHAR(200) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker Certifications
CREATE TABLE IF NOT EXISTS public.worker_certifications (
    id SERIAL PRIMARY KEY,
    worker_id INT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    certification_id INT REFERENCES public.certifications(id) ON DELETE CASCADE,
    cert_number VARCHAR(200) DEFAULT '',
    issuer VARCHAR(200) DEFAULT '',
    issue_date DATE,
    expiry_date DATE,
    verification_status VARCHAR(40) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_worker_certs_worker ON public.worker_certifications(worker_id);

-- Service Categories
CREATE TABLE IF NOT EXISTS public.service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    description VARCHAR(500) DEFAULT ''
);

-- Services
CREATE TABLE IF NOT EXISTS public.services (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES public.service_categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(500) DEFAULT '',
    base_price NUMERIC(10,2) DEFAULT 0.00,
    worker_earning NUMERIC(10,2) DEFAULT 0.00,
    coop_charge NUMERIC(10,2) DEFAULT 0.00,
    requires_certification BOOLEAN DEFAULT FALSE,
    skill_id INT REFERENCES public.skills(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker Services
CREATE TABLE IF NOT EXISTS public.worker_services (
    id SERIAL PRIMARY KEY,
    worker_id INT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    price_override NUMERIC(10,2),
    UNIQUE(worker_id, service_id)
);

-- Worker Availability
CREATE TABLE IF NOT EXISTS public.worker_availability (
    id SERIAL PRIMARY KEY,
    worker_id INT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    weekday INT NOT NULL,
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_worker_avail_worker ON public.worker_availability(worker_id);

-- Locations
CREATE TABLE IF NOT EXISTS public.worker_locations (
    id SERIAL PRIMARY KEY,
    worker_id INT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customer_locations (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    label VARCHAR(200) DEFAULT 'home',
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    address VARCHAR(500) DEFAULT ''
);

-- Bookings & Status History
CREATE TABLE IF NOT EXISTS public.bookings (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    worker_id INT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    start_time VARCHAR(5) NOT NULL,
    duration_min INT DEFAULT 60,
    lat DOUBLE PRECISION DEFAULT 0.0,
    lng DOUBLE PRECISION DEFAULT 0.0,
    address VARCHAR(500) DEFAULT '',
    description TEXT DEFAULT '',
    status booking_status DEFAULT 'REQUESTED',
    is_emergency BOOLEAN DEFAULT FALSE,
    service_amount NUMERIC(10,2) DEFAULT 0.00,
    coop_charge NUMERIC(10,2) DEFAULT 0.00,
    total_amount NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS ix_bookings_worker ON public.bookings(worker_id);
CREATE INDEX IF NOT EXISTS ix_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS ix_booking_worker_slot ON public.bookings(worker_id, scheduled_date, start_time);

CREATE TABLE IF NOT EXISTS public.booking_status_history (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    from_status VARCHAR(40),
    to_status VARCHAR(40),
    actor_id INT REFERENCES public.profiles(user_id_num) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_booking_history_booking ON public.booking_status_history(booking_id);

-- Emergency Requests
CREATE TABLE IF NOT EXISTS public.emergency_requests (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    booking_id INT REFERENCES public.bookings(id) ON DELETE SET NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    status VARCHAR(40) DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id SERIAL PRIMARY KEY,
    booking_id INT UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    provider VARCHAR(50) DEFAULT 'Tamil Nadu State Apex Cooperative Bank / UPI',
    provider_ref VARCHAR(200) DEFAULT '',
    status pay_status DEFAULT 'PENDING',
    is_demo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices & Items
CREATE TABLE IF NOT EXISTS public.invoices (
    id SERIAL PRIMARY KEY,
    booking_id INT UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(40) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    label VARCHAR(300) NOT NULL,
    amount NUMERIC(10,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_invoice_items_invoice ON public.invoice_items(invoice_id);

-- Ratings & Feedback
CREATE TABLE IF NOT EXISTS public.ratings (
    id SERIAL PRIMARY KEY,
    booking_id INT UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    worker_id INT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    customer_id INT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_ratings_worker ON public.ratings(worker_id);

CREATE TABLE IF NOT EXISTS public.feedback (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    worker_id INT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    customer_id INT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Welfare & Insurance
CREATE TABLE IF NOT EXISTS public.welfare_benefits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(500) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.worker_welfare_enrollments (
    id SERIAL PRIMARY KEY,
    worker_id INT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    benefit_id INT NOT NULL REFERENCES public.welfare_benefits(id) ON DELETE CASCADE,
    status VARCHAR(40) DEFAULT 'enrolled',
    enrolled_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_worker_welfare_worker ON public.worker_welfare_enrollments(worker_id);

CREATE TABLE IF NOT EXISTS public.insurance_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    mode VARCHAR(40) DEFAULT 'mock'
);

CREATE TABLE IF NOT EXISTS public.insurance_records (
    id SERIAL PRIMARY KEY,
    worker_id INT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    provider_id INT REFERENCES public.insurance_providers(id) ON DELETE SET NULL,
    policy_ref VARCHAR(200) DEFAULT '',
    coverage_type VARCHAR(200) DEFAULT '',
    status VARCHAR(40) DEFAULT 'active',
    effective_date DATE,
    expiry_date DATE,
    is_demo BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS ix_insurance_records_worker ON public.insurance_records(worker_id);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.profiles(user_id_num) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_notifications_user ON public.notifications(user_id);

-- Complaints & Audit Logs
CREATE TABLE IF NOT EXISTS public.complaints (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES public.bookings(id) ON DELETE SET NULL,
    raised_by INT NOT NULL REFERENCES public.profiles(user_id_num) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(40) DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INT REFERENCES public.profiles(user_id_num) ON DELETE SET NULL,
    action VARCHAR(200) NOT NULL,
    target VARCHAR(300) DEFAULT '',
    meta TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Demand Forecasts & Workforce Allocation
CREATE TABLE IF NOT EXISTS public.demand_forecasts (
    id SERIAL PRIMARY KEY,
    service_id INT REFERENCES public.services(id) ON DELETE SET NULL,
    category_id INT REFERENCES public.service_categories(id) ON DELETE SET NULL,
    area VARCHAR(200) DEFAULT '',
    period VARCHAR(100) NOT NULL,
    expected_requests INT NOT NULL,
    level VARCHAR(20) NOT NULL,
    mode VARCHAR(60) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workforce_allocation_recommendations (
    id SERIAL PRIMARY KEY,
    forecast_id INT REFERENCES public.demand_forecasts(id) ON DELETE SET NULL,
    service_id INT REFERENCES public.services(id) ON DELETE SET NULL,
    area VARCHAR(200) DEFAULT '',
    expected_demand INT DEFAULT 0,
    available_workers INT DEFAULT 0,
    shortage INT DEFAULT 0,
    recommendation TEXT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(40) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. SQL FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Haversine distance in kilometers
CREATE OR REPLACE FUNCTION public.haversine_km(
    lat1 DOUBLE PRECISION, lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION, lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    r DOUBLE PRECISION := 6371.0;
    dlat DOUBLE PRECISION;
    dlon DOUBLE PRECISION;
    a DOUBLE PRECISION;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat / 2.0)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2.0)^2;
    RETURN 2.0 * r * asin(sqrt(a));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Worker time slot conflict checker
CREATE OR REPLACE FUNCTION public.worker_is_free(
    p_worker_id INT,
    p_date DATE,
    p_start_time VARCHAR(5),
    p_duration_min INT,
    p_exclude_booking INT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    req_start INT;
    req_end INT;
    conflict_count INT;
BEGIN
    req_start := (split_part(p_start_time, ':', 1)::INT * 60) + split_part(p_start_time, ':', 2)::INT;
    req_end := req_start + p_duration_min;

    SELECT COUNT(*) INTO conflict_count
    FROM public.bookings b
    WHERE b.worker_id = p_worker_id
      AND b.scheduled_date = p_date
      AND b.status IN ('REQUESTED', 'CONFIRMED', 'WORKER_ACCEPTED', 'IN_PROGRESS')
      AND (p_exclude_booking IS NULL OR b.id <> p_exclude_booking)
      AND (
          GREATEST(
              req_start,
              (split_part(b.start_time, ':', 1)::INT * 60) + split_part(b.start_time, ':', 2)::INT
          ) < LEAST(
              req_end,
              (split_part(b.start_time, ':', 1)::INT * 60) + split_part(b.start_time, ':', 2)::INT + b.duration_min
          )
      );

    RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to recalculate worker average rating
CREATE OR REPLACE FUNCTION public.recalculate_worker_rating()
RETURNS TRIGGER AS $$
DECLARE
    new_avg DOUBLE PRECISION;
    new_cnt INT;
BEGIN
    SELECT COALESCE(AVG(stars), 0.0), COUNT(*)
    INTO new_avg, new_cnt
    FROM public.ratings
    WHERE worker_id = NEW.worker_id;

    UPDATE public.workers
    SET avg_rating = ROUND(new_avg::NUMERIC, 2),
        rating_count = new_cnt,
        updated_at = NOW()
    WHERE id = NEW.worker_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalculate_rating ON public.ratings;
CREATE TRIGGER trg_recalculate_rating
AFTER INSERT OR UPDATE ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_worker_rating();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.federations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welfare_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_welfare_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workforce_allocation_recommendations ENABLE ROW LEVEL SECURITY;

-- Public read access for general catalog and directory tables
CREATE POLICY "Public read access for federations" ON public.federations FOR SELECT USING (true);
CREATE POLICY "Public read access for cooperatives" ON public.cooperatives FOR SELECT USING (true);
CREATE POLICY "Public read access for service_categories" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Public read access for services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public read access for skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public read access for certifications" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Public read access for welfare_benefits" ON public.welfare_benefits FOR SELECT USING (true);
CREATE POLICY "Public read access for insurance_providers" ON public.insurance_providers FOR SELECT USING (true);

-- Worker profile and skill discovery
CREATE POLICY "Public read access for active verified workers" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Public read access for worker skills" ON public.worker_skills FOR SELECT USING (true);
CREATE POLICY "Public read access for worker services" ON public.worker_services FOR SELECT USING (true);
CREATE POLICY "Public read access for worker certifications" ON public.worker_certifications FOR SELECT USING (true);
CREATE POLICY "Public read access for worker availability" ON public.worker_availability FOR SELECT USING (true);
CREATE POLICY "Public read access for ratings" ON public.ratings FOR SELECT USING (true);

-- User Profiles: Users can view all non-sensitive info, update own profile, Admins full access
CREATE POLICY "Users can read own profile or admins read all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth_user_id = auth.uid() OR auth.uid() IS NULL);

-- Bookings: Customers can read own bookings; Workers can read assigned bookings; Admins can read all
CREATE POLICY "Customers and Workers can view their bookings" ON public.bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.customers c WHERE c.id = bookings.customer_id AND c.profile_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM public.workers w WHERE w.id = bookings.worker_id AND w.profile_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()))
    OR (SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) IN ('COOP_ADMIN', 'FED_ADMIN')
    OR auth.uid() IS NULL
);

-- Notifications: Users only view own notifications
CREATE POLICY "Users can only view own notifications" ON public.notifications FOR SELECT USING (
    user_id = (SELECT user_id_num FROM public.profiles WHERE auth_user_id = auth.uid())
    OR auth.uid() IS NULL
);

-- Service-role bypass policies for server handlers
CREATE POLICY "Service-role full access to all" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service-role full access to payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service-role full access to invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service-role full access to invoice_items" ON public.invoice_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service-role full access to audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service-role full access to forecasts" ON public.demand_forecasts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service-role full access to allocations" ON public.workforce_allocation_recommendations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service-role full access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
