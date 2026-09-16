-- ==============================================================================
-- ON-DEMAND LABOUR COOPERATIVE MARKETPLACE — POSTGRESQL SEED DATA (SUPABASE)
-- ==============================================================================

-- 1. Federation
INSERT INTO public.federations (id, name, region)
VALUES (1, 'Tamil Nadu Labour Cooperative Federation', 'Tamil Nadu')
ON CONFLICT (id) DO NOTHING;

-- 2. Cooperatives
INSERT INTO public.cooperatives (id, federation_id, name, area, lat, lng) VALUES
(1, 1, 'Gandhipuram Labour Cooperative Society', 'Gandhipuram', 11.0168, 76.9558),
(2, 1, 'RS Puram Workers Cooperative Society', 'RS Puram', 11.0180, 76.9400),
(3, 1, 'Peelamedu Seva Labour Cooperative', 'Peelamedu', 11.0240, 77.0020),
(4, 1, 'Saibaba Colony Labour Welfare Cooperative', 'Saibaba Colony', 11.0310, 76.9420),
(5, 1, 'Singanallur Artisan Cooperative Society', 'Singanallur', 11.0020, 77.0250),
(6, 1, 'Chennai Central Labour Cooperative Society', 'T. Nagar', 13.0418, 80.2341),
(7, 1, 'North Chennai Cooperative Trades Society', 'Anna Nagar', 13.0850, 80.2101),
(8, 1, 'Madurai District Workers Cooperative Society', 'KK Nagar', 9.9252, 78.1498),
(9, 1, 'Tiruchirappalli Labour Cooperative Society', 'Thillai Nagar', 10.8250, 78.6850),
(10, 1, 'Salem City Cooperative Trades Society', 'Fairlands', 11.6740, 78.1460),
(11, 1, 'Tiruppur Textile & Labour Cooperative Society', 'Avinashi Road', 11.1150, 77.3480),
(12, 1, 'Bengaluru Regional Trades Cooperative', 'Indiranagar', 12.9784, 77.6408)
ON CONFLICT (id) DO NOTHING;

-- 3. Service Categories
INSERT INTO public.service_categories (id, name, description) VALUES
(1, 'Electrical', 'Certified cooperative electrical services'),
(2, 'Plumbing', 'Certified cooperative plumbing services'),
(3, 'Carpentry', 'Certified cooperative carpentry services'),
(4, 'Painting', 'Certified cooperative painting services'),
(5, 'Driving', 'Certified cooperative driving services'),
(6, 'Cleaning', 'Certified cooperative cleaning services'),
(7, 'Gardening', 'Certified cooperative gardening services'),
(8, 'Caregiving', 'Certified cooperative caregiving services')
ON CONFLICT (id) DO NOTHING;

-- 4. Skills
INSERT INTO public.skills (id, name, category, requires_certification) VALUES
(1, 'Domestic wiring', 'Electrical', true),
(2, 'Electrical repair', 'Electrical', true),
(3, 'Pipe repair', 'Plumbing', false),
(4, 'Bathroom plumbing', 'Plumbing', false),
(5, 'Woodwork', 'Carpentry', false),
(6, 'House painting', 'Painting', false),
(7, 'Car driving', 'Driving', true),
(8, 'Home cleaning', 'Cleaning', false),
(9, 'Lawn maintenance', 'Gardening', false),
(10, 'Elderly assistance', 'Caregiving', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Certifications
INSERT INTO public.certifications (id, name, issuer) VALUES
(1, 'ITI Electrician National Trade Certificate', 'Directorate General of Training'),
(2, 'Plumbing Industry Board Licence', 'National Skill Development Corp'),
(3, 'Professional Driving Licence (LMV)', 'Regional Transport Authority'),
(4, 'Certified Healthcare Aide', 'Indian Red Cross Society')
ON CONFLICT (id) DO NOTHING;

-- 6. Services (Statutory 90% Worker Fair Wage / 10% Cooperative Surcharge)
INSERT INTO public.services (id, category_id, name, description, base_price, worker_earning, coop_charge, requires_certification, skill_id) VALUES
(1, 1, 'Fan & light repair', 'Professional fan & light repair by verified cooperative tradespersons', 250.00, 225.00, 25.00, true, 2),
(2, 1, 'Full house wiring check', 'Professional full house wiring check by verified cooperative tradespersons', 900.00, 810.00, 90.00, true, 1),
(3, 2, 'Tap & pipe repair', 'Professional tap & pipe repair by verified cooperative tradespersons', 300.00, 270.00, 30.00, false, 3),
(4, 2, 'Bathroom plumbing overhaul', 'Professional bathroom plumbing overhaul by verified cooperative tradespersons', 1200.00, 1080.00, 120.00, false, 4),
(5, 3, 'Furniture repair', 'Professional furniture repair by verified cooperative tradespersons', 450.00, 405.00, 45.00, false, 5),
(6, 4, '1BHK painting', 'Professional 1bhk painting by verified cooperative tradespersons', 5000.00, 4500.00, 500.00, false, 6),
(7, 5, 'Local driver 8h', 'Professional local driver 8h by verified cooperative tradespersons', 1000.00, 900.00, 100.00, true, 7),
(8, 6, 'Deep home cleaning', 'Professional deep home cleaning by verified cooperative tradespersons', 1500.00, 1350.00, 150.00, false, 8),
(9, 7, 'Lawn & plant maintenance', 'Professional lawn & plant maintenance by verified cooperative tradespersons', 400.00, 360.00, 40.00, false, 9),
(10, 8, 'Elderly companion assistance', 'Professional elderly companion assistance by verified cooperative tradespersons', 800.00, 720.00, 80.00, true, 10)
ON CONFLICT (id) DO NOTHING;

-- 7. Welfare Benefits & Insurance
INSERT INTO public.welfare_benefits (id, name, description) VALUES
(1, 'ESI-Linked Healthcare Assistance', 'Comprehensive outpatient and hospital benefit support for cooperative members'),
(2, 'Cooperative Accident & Disability Cover', '24/7 accident indemnity and emergency income support'),
(3, 'Labour Pension Facilitation Scheme', 'Government cooperative pension enrollment and provident fund matching'),
(4, 'Skilled Trades Upskilling Stipend', 'Paid training allowances for solar wiring and advanced plumbing trade certifications')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.insurance_providers (id, name, mode) VALUES
(1, 'Tamil Nadu Labour Welfare Insurance (Cooperative Apex)', 'mock')
ON CONFLICT (id) DO NOTHING;

-- 8. Core Users & Profiles
-- Passwords hashed with bcrypt:
-- admin123 -> $2b$12$N8q3aNqX5fQz1Xm9N1sY4.4BfGq4T/R2l8hT1d8W4bV6gC1t7q3ea
-- cust123  -> $2b$12$K8o3aNqX5fQz1Xm9N1sY4.4BfGq4T/R2l8hT1d8W4bV6gC1t7q3ea
-- work123  -> $2b$12$M8p3aNqX5fQz1Xm9N1sY4.4BfGq4T/R2l8hT1d8W4bV6gC1t7q3ea

INSERT INTO public.profiles (user_id_num, name, phone, email, role, is_active) VALUES
(1, 'Dr. K. Arumugam (Federation Director)', '9000000001', 'fed.admin@tnlabourcoop.org', 'FED_ADMIN', true),
(2, 'S. Muthukumar (Gandhipuram Society Secretary)', '9000000002', 'secretary@gandhipuramcoop.org', 'COOP_ADMIN', true),
(3, 'S. Ramanathan (Cooperative Inspection Officer)', '9000000003', 'inspector@tnlabourcoop.org', 'COOP_ADMIN', true),
(4, 'Meena Sundaram', '9000000011', 'meena@example.com', 'CUSTOMER', true),
(5, 'Ravi Chandran', '9000000012', 'ravi@example.com', 'CUSTOMER', true),
(6, 'Anand Natarajan', '9000000013', 'anand@example.com', 'CUSTOMER', true),
(7, 'Kavitha Mohan', '9000000014', 'kavitha@example.com', 'CUSTOMER', true)
ON CONFLICT (phone) DO NOTHING;

-- Customers
INSERT INTO public.customers (id, user_id_num, address) VALUES
(1, 4, '142 Crosscut Road, Gandhipuram, Coimbatore'),
(2, 5, '55 DB Road, RS Puram, Coimbatore'),
(3, 6, '18 Avinashi Road, Peelamedu, Coimbatore'),
(4, 7, '102 Mettupalayam Road, Saibaba Colony, Coimbatore')
ON CONFLICT (id) DO NOTHING;

-- 9. Workers & Trade Profiles
INSERT INTO public.profiles (user_id_num, name, phone, role, is_active) VALUES
(8, 'Suresh Kumar', '9010000001', 'WORKER', true),
(9, 'Kannan Raj', '9010000002', 'WORKER', true),
(10, 'Murugan Vel', '9010000003', 'WORKER', true),
(11, 'Selvi Mani', '9010000004', 'WORKER', true),
(12, 'Raju Pillai', '9010000005', 'WORKER', true),
(13, 'Divya Lakshmi', '9010000006', 'WORKER', true),
(14, 'Kumar Swamy', '9010000007', 'WORKER', true),
(15, 'Anbu Selvan', '9010000008', 'WORKER', true),
(16, 'Velu Chettiar', '9010000009', 'WORKER', true),
(17, 'Priya Balan', '9010000010', 'WORKER', true),
(18, 'Senthil Nathan', '9010000011', 'WORKER', true),
(19, 'Mani Kandan', '9010000012', 'WORKER', true),
(20, 'Arul Dass', '9010000013', 'WORKER', true),
(21, 'Karthik Raja', '9010000014', 'WORKER', true),
(22, 'Vignesh Kumar', '9010000015', 'WORKER', true),
(23, 'Lakshmi Ammal', '9010000016', 'WORKER', true),
(24, 'Subramani M', '9010000017', 'WORKER', true),
(25, 'Revathi Sundaram', '9010000018', 'WORKER', true),
(26, 'Saravanan P', '9010000019', 'WORKER', true),
(27, 'Balamurugan K', '9010000020', 'WORKER', true),
(28, 'Karthik Rajan', '9020000001', 'WORKER', true),
(29, 'Venkatesh S', '9020000002', 'WORKER', true),
(30, 'Manikandan K', '9020000003', 'WORKER', true),
(31, 'Senthil Nathan C', '9020000004', 'WORKER', true),
(32, 'Anitha Ramesh', '9020000005', 'WORKER', true),
(33, 'Muthuvel Pandian', '9020000006', 'WORKER', true),
(34, 'Alagarsamy R', '9020000007', 'WORKER', true),
(35, 'Vijayalakshmi S', '9020000008', 'WORKER', true),
(36, 'Natarajan V', '9020000009', 'WORKER', true),
(37, 'Kulandai Velu', '9020000010', 'WORKER', true),
(38, 'Pradeep Kumar', '9020000015', 'WORKER', true)
ON CONFLICT (phone) DO NOTHING;

-- Worker entity records
INSERT INTO public.workers (id, user_id_num, cooperative_id, address, experience_years, verification_status, is_available, avg_rating, rating_count, base_lat, base_lng, service_radius_km) VALUES
(1, 8, 1, 'Gandhipuram, Coimbatore', 8.5, 'VERIFIED', true, 4.9, 42, 11.0168, 76.9558, 30.0),
(2, 9, 2, 'RS Puram, Coimbatore', 6.5, 'VERIFIED', true, 4.8, 28, 11.0180, 76.9400, 30.0),
(3, 10, 1, 'Gandhipuram, Coimbatore', 9.0, 'VERIFIED', true, 4.8, 55, 11.0168, 76.9558, 30.0),
(4, 11, 1, 'Gandhipuram, Coimbatore', 5.0, 'VERIFIED', true, 4.9, 48, 11.0168, 76.9558, 30.0),
(5, 12, 2, 'RS Puram, Coimbatore', 11.0, 'VERIFIED', true, 4.8, 64, 11.0180, 76.9400, 30.0),
(6, 13, 1, 'Gandhipuram, Coimbatore', 5.5, 'VERIFIED', true, 5.0, 27, 11.0168, 76.9558, 30.0),
(7, 14, 3, 'Peelamedu, Coimbatore', 7.5, 'VERIFIED', true, 4.7, 36, 11.0240, 77.0020, 30.0),
(8, 15, 1, 'Gandhipuram, Coimbatore', 6.5, 'VERIFIED', true, 4.8, 29, 11.0168, 76.9558, 30.0),
(9, 16, 2, 'RS Puram, Coimbatore', 7.5, 'VERIFIED', true, 4.8, 33, 11.0180, 76.9400, 30.0),
(10, 17, 2, 'RS Puram, Coimbatore', 5.5, 'VERIFIED', true, 4.9, 24, 11.0180, 76.9400, 30.0),
(11, 18, 3, 'Peelamedu, Coimbatore', 7.0, 'VERIFIED', true, 4.9, 31, 11.0240, 77.0020, 30.0),
(12, 19, 4, 'Saibaba Colony, Coimbatore', 6.0, 'VERIFIED', true, 4.7, 30, 11.0310, 76.9420, 30.0),
(13, 20, 5, 'Singanallur, Coimbatore', 8.0, 'VERIFIED', true, 4.8, 38, 11.0020, 77.0250, 30.0),
(14, 21, 3, 'Peelamedu, Coimbatore', 8.0, 'VERIFIED', true, 4.9, 41, 11.0240, 77.0020, 30.0),
(15, 22, 5, 'Singanallur, Coimbatore', 6.0, 'VERIFIED', true, 4.8, 25, 11.0020, 77.0250, 30.0),
(16, 23, 4, 'Saibaba Colony, Coimbatore', 7.0, 'VERIFIED', true, 4.9, 39, 11.0310, 76.9420, 30.0),
(17, 24, 5, 'Singanallur, Coimbatore', 6.0, 'VERIFIED', true, 4.7, 21, 11.0020, 77.0250, 30.0),
(18, 25, 3, 'Peelamedu, Coimbatore', 8.0, 'VERIFIED', true, 4.9, 35, 11.0240, 77.0020, 30.0),
(19, 26, 2, 'RS Puram, Coimbatore', 3.0, 'PENDING', true, 0.0, 0, 11.0180, 76.9400, 30.0),
(20, 27, 4, 'Saibaba Colony, Coimbatore', 2.5, 'UNDER_REVIEW', true, 0.0, 0, 11.0310, 76.9420, 30.0),
(21, 28, 6, 'T. Nagar, Chennai', 6.0, 'VERIFIED', true, 4.9, 52, 13.0418, 80.2341, 30.0),
(22, 29, 6, 'T. Nagar, Chennai', 5.0, 'VERIFIED', true, 4.8, 41, 13.0418, 80.2341, 30.0),
(23, 30, 7, 'Anna Nagar, Chennai', 8.0, 'VERIFIED', true, 4.9, 63, 13.0850, 80.2101, 30.0),
(24, 31, 7, 'Anna Nagar, Chennai', 7.0, 'VERIFIED', true, 4.8, 38, 13.0850, 80.2101, 30.0),
(25, 32, 6, 'T. Nagar, Chennai', 4.5, 'VERIFIED', true, 4.9, 29, 13.0418, 80.2341, 30.0),
(26, 33, 8, 'KK Nagar, Madurai', 7.5, 'VERIFIED', true, 4.9, 44, 9.9252, 78.1498, 30.0),
(27, 34, 8, 'KK Nagar, Madurai', 6.0, 'VERIFIED', true, 4.8, 35, 9.9252, 78.1498, 30.0),
(28, 35, 8, 'KK Nagar, Madurai', 5.0, 'VERIFIED', true, 4.9, 40, 9.9252, 78.1498, 30.0),
(29, 36, 9, 'Thillai Nagar, Tiruchirappalli', 6.5, 'VERIFIED', true, 4.8, 33, 10.8250, 78.6850, 30.0),
(30, 37, 9, 'Thillai Nagar, Tiruchirappalli', 9.0, 'VERIFIED', true, 5.0, 48, 10.8250, 78.6850, 30.0),
(31, 38, 12, 'Indiranagar, Bengaluru', 7.0, 'VERIFIED', true, 4.9, 60, 12.9784, 77.6408, 30.0)
ON CONFLICT (id) DO NOTHING;

-- Worker Skills Linkages
INSERT INTO public.worker_skills (worker_id, skill_id, level, experience_years) VALUES
(1, 2, 'expert', 8.5), (1, 1, 'expert', 8.5),
(2, 1, 'expert', 6.5), (2, 2, 'expert', 6.5),
(3, 3, 'expert', 9.0), (3, 4, 'expert', 9.0),
(4, 8, 'intermediate', 5.0),
(5, 5, 'expert', 11.0),
(6, 10, 'intermediate', 5.5),
(7, 7, 'expert', 7.5),
(8, 6, 'expert', 6.5),
(9, 9, 'expert', 7.5),
(10, 4, 'intermediate', 5.5), (10, 3, 'intermediate', 5.5),
(11, 2, 'expert', 7.0), (11, 1, 'expert', 7.0),
(12, 3, 'expert', 6.0), (12, 4, 'expert', 6.0),
(13, 5, 'expert', 8.0),
(14, 6, 'expert', 8.0),
(15, 7, 'expert', 6.0),
(16, 8, 'expert', 7.0),
(17, 9, 'expert', 6.0),
(18, 10, 'expert', 8.0),
(21, 2, 'expert', 6.0), (21, 1, 'expert', 6.0),
(22, 3, 'intermediate', 5.0), (22, 4, 'intermediate', 5.0),
(23, 6, 'expert', 8.0),
(24, 7, 'expert', 7.0),
(25, 8, 'intermediate', 4.5),
(26, 2, 'expert', 7.5), (26, 1, 'expert', 7.5),
(27, 3, 'expert', 6.0),
(28, 8, 'intermediate', 5.0),
(29, 2, 'expert', 6.5), (29, 1, 'expert', 6.5),
(30, 5, 'expert', 9.0),
(31, 2, 'expert', 7.0), (31, 1, 'expert', 7.0)
ON CONFLICT (worker_id, skill_id) DO NOTHING;

-- Worker Services Linkages
INSERT INTO public.worker_services (worker_id, service_id) VALUES
(1, 1), (1, 2),
(2, 1), (2, 2),
(3, 3), (3, 4),
(4, 8),
(5, 5),
(6, 10),
(7, 7),
(8, 6),
(9, 9),
(10, 3), (10, 4),
(11, 1), (11, 2),
(12, 3), (12, 4),
(13, 5),
(14, 6),
(15, 7),
(16, 8),
(17, 9),
(18, 10),
(21, 1), (21, 2),
(22, 3), (22, 4),
(23, 6),
(24, 7),
(25, 8),
(26, 1), (26, 2),
(27, 3),
(28, 8),
(29, 1), (29, 2),
(30, 5),
(31, 1), (31, 2)
ON CONFLICT (worker_id, service_id) DO NOTHING;

-- Worker Certifications
INSERT INTO public.worker_certifications (worker_id, certification_id, cert_number, issuer, verification_status, issue_date, expiry_date) VALUES
(1, 1, 'ITI-TN-1001', 'Directorate General of Training', 'verified', CURRENT_DATE - 700, CURRENT_DATE + 1000),
(2, 1, 'ITI-TN-1002', 'Directorate General of Training', 'verified', CURRENT_DATE - 650, CURRENT_DATE + 1050),
(6, 4, 'CHA-TN-501', 'Indian Red Cross Society', 'verified', CURRENT_DATE - 500, CURRENT_DATE + 600),
(7, 3, 'TN-38-DL-2020007', 'Coimbatore RTO', 'verified', CURRENT_DATE - 1200, CURRENT_DATE + 800),
(11, 1, 'ITI-TN-1011', 'Directorate General of Training', 'verified', CURRENT_DATE - 800, CURRENT_DATE + 900),
(15, 3, 'TN-38-DL-2020015', 'Coimbatore RTO', 'verified', CURRENT_DATE - 900, CURRENT_DATE + 1100),
(18, 4, 'CHA-TN-518', 'Indian Red Cross Society', 'verified', CURRENT_DATE - 400, CURRENT_DATE + 700),
(21, 1, 'ITI-TN-2001', 'Directorate General of Training', 'verified', CURRENT_DATE - 600, CURRENT_DATE + 1000),
(24, 3, 'TN-01-DL-2020024', 'Chennai RTO', 'verified', CURRENT_DATE - 1000, CURRENT_DATE + 1000),
(26, 1, 'ITI-TN-3001', 'Directorate General of Training', 'verified', CURRENT_DATE - 750, CURRENT_DATE + 950),
(29, 1, 'ITI-TN-4001', 'Directorate General of Training', 'verified', CURRENT_DATE - 550, CURRENT_DATE + 1000),
(31, 1, 'ITI-KA-1001', 'Directorate General of Training', 'verified', CURRENT_DATE - 700, CURRENT_DATE + 1000);

-- Worker Availability (Mon-Sun 07:00 - 20:00 for all workers)
DO $$
DECLARE
    w_rec RECORD;
    d_idx INT;
BEGIN
    FOR w_rec IN SELECT id FROM public.workers LOOP
        FOR d_idx IN 0..6 LOOP
            INSERT INTO public.worker_availability (worker_id, weekday, start_time, end_time)
            VALUES (w_rec.id, d_idx, '07:00', '20:00')
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Worker Welfare & Insurance
DO $$
DECLARE
    w_rec RECORD;
    idx INT := 1;
BEGIN
    FOR w_rec IN SELECT id FROM public.workers LOOP
        INSERT INTO public.worker_welfare_enrollments (worker_id, benefit_id, status)
        VALUES (w_rec.id, ((idx % 4) + 1), 'enrolled');

        INSERT INTO public.insurance_records (worker_id, provider_id, policy_ref, coverage_type, status, effective_date, expiry_date, is_demo)
        VALUES (w_rec.id, 1, 'POL-COOP-' || (3000 + idx), 'Cooperative Group Accident & Health Indemnity', 'active', CURRENT_DATE - 180, CURRENT_DATE + 185, true);

        idx := idx + 1;
    END LOOP;
END $$;
