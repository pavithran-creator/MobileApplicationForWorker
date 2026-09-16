import os, random
from datetime import date, timedelta, datetime
from app.db.session import Base, engine, SessionLocal
import app.models.models as M
from app.core.security import hash_password

def seed_database():
    print("[Seed] Resetting database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("[Seed] Creating Federation and Cooperatives across Coimbatore...")
    fed = M.Federation(name="Tamil Nadu Labour Cooperative Federation", region="Tamil Nadu")
    db.add(fed)
    db.flush()

    coops = []
    coop_data = [
        # Coimbatore
        ("Gandhipuram Labour Cooperative Society", "Gandhipuram", 11.0168, 76.9558),
        ("RS Puram Workers Cooperative Society", "RS Puram", 11.0180, 76.9400),
        ("Peelamedu Seva Labour Cooperative", "Peelamedu", 11.0240, 77.0020),
        ("Saibaba Colony Labour Welfare Cooperative", "Saibaba Colony", 11.0310, 76.9420),
        ("Singanallur Artisan Cooperative Society", "Singanallur", 11.0020, 77.0250),
        # Chennai
        ("Chennai Central Labour Cooperative Society", "T. Nagar", 13.0418, 80.2341),
        ("North Chennai Cooperative Trades Society", "Anna Nagar", 13.0850, 80.2101),
        # Madurai
        ("Madurai District Workers Cooperative Society", "KK Nagar", 9.9252, 78.1498),
        # Tiruchirappalli
        ("Tiruchirappalli Labour Cooperative Society", "Thillai Nagar", 10.8250, 78.6850),
        # Salem
        ("Salem City Cooperative Trades Society", "Fairlands", 11.6740, 78.1460),
        # Tiruppur
        ("Tiruppur Textile & Labour Cooperative Society", "Avinashi Road", 11.1150, 77.3480),
        # Bengaluru
        ("Bengaluru Regional Trades Cooperative", "Indiranagar", 12.9784, 77.6408),
    ]
    for n, area, lat, lng in coop_data:
        c = M.Cooperative(federation_id=fed.id, name=n, area=area, lat=lat, lng=lng)
        db.add(c)
        coops.append(c)
    db.flush()

    print("[Seed] Creating Service Categories...")
    cats = {}
    categories = [
        "Electrical", "Plumbing", "Carpentry", "Painting",
        "Driving", "Cleaning", "Gardening", "Caregiving"
    ]
    for cn in categories:
        c = M.ServiceCategory(name=cn, description=f"Certified cooperative {cn.lower()} services")
        db.add(c)
        db.flush()
        cats[cn] = c

    print("[Seed] Creating Skills...")
    skills = {}
    skills_data = [
        ("Domestic wiring", "Electrical", True),
        ("Electrical repair", "Electrical", True),
        ("Pipe repair", "Plumbing", False),
        ("Bathroom plumbing", "Plumbing", False),
        ("Woodwork", "Carpentry", False),
        ("House painting", "Painting", False),
        ("Car driving", "Driving", True),
        ("Home cleaning", "Cleaning", False),
        ("Lawn maintenance", "Gardening", False),
        ("Elderly assistance", "Caregiving", True)
    ]
    for sn, cat, req in skills_data:
        s = M.Skill(name=sn, category=cat, requires_certification=req)
        db.add(s)
        db.flush()
        skills[sn] = s

    print("[Seed] Creating Trade Certifications...")
    certs = {}
    certs_data = [
        ("ITI Electrician National Trade Certificate", "Directorate General of Training"),
        ("Plumbing Industry Board Licence", "National Skill Development Corp"),
        ("Professional Driving Licence (LMV)", "Regional Transport Authority"),
        ("Certified Healthcare Aide", "Indian Red Cross Society")
    ]
    for name, issuer in certs_data:
        c = M.Certification(name=name, issuer=issuer)
        db.add(c)
        db.flush()
        certs[name] = c

    print("[Seed] Creating Services with Fair-Wage Structure (90% Worker, 10% Coop)...")
    svcs = []
    # (id, name, category, total_price, worker_wage, coop_charge, req_cert, skill_name)
    services_data = [
        (1, "Fan & light repair", "Electrical", 250, 225, 25, True, "Electrical repair"),
        (2, "Full house wiring check", "Electrical", 900, 810, 90, True, "Domestic wiring"),
        (3, "Tap & pipe repair", "Plumbing", 300, 270, 30, False, "Pipe repair"),
        (4, "Bathroom plumbing overhaul", "Plumbing", 1200, 1080, 120, False, "Bathroom plumbing"),
        (5, "Furniture repair", "Carpentry", 450, 405, 45, False, "Woodwork"),
        (6, "1BHK painting", "Painting", 5000, 4500, 500, False, "House painting"),
        (7, "Local driver 8h", "Driving", 1000, 900, 100, True, "Car driving"),
        (8, "Deep home cleaning", "Cleaning", 1500, 1350, 150, False, "Home cleaning"),
        (9, "Lawn & plant maintenance", "Gardening", 400, 360, 40, False, "Lawn maintenance"),
        (10, "Elderly companion assistance", "Caregiving", 800, 720, 80, True, "Elderly assistance"),
    ]
    for sid, nm, cat, price, earn, chg, req, sk in services_data:
        s = M.Service(
            id=sid,
            category_id=cats[cat].id,
            name=nm,
            description=f"Professional {nm.lower()} by verified cooperative tradespersons",
            base_price=price,
            worker_earning=earn,
            coop_charge=chg,
            requires_certification=req,
            skill_id=skills[sk].id
        )
        db.add(s)
        svcs.append(s)
    db.flush()

    print("[Seed] Creating Welfare Benefits and Insurance...")
    benefits = [
        ("ESI-Linked Healthcare Assistance", "Comprehensive outpatient and hospital benefit support for cooperative members"),
        ("Cooperative Accident & Disability Cover", "24/7 accident indemnity and emergency income support"),
        ("Labour Pension Facilitation Scheme", "Government cooperative pension enrollment and provident fund matching"),
        ("Skilled Trades Upskilling Stipend", "Paid training allowances for solar wiring and advanced plumbing trade certifications")
    ]
    b_objs = []
    for bn, desc in benefits:
        b = M.WelfareBenefit(name=bn, description=desc)
        db.add(b)
        b_objs.append(b)
    db.flush()

    ins_prov = M.InsuranceProvider(name="Tamil Nadu Labour Welfare Insurance (Cooperative Apex)", mode="mock")
    db.add(ins_prov)
    db.flush()

    print("[Seed] Creating Administrative & Customer Accounts in SQLite...")
    # Federation Admin: 9000000001 / admin123
    fed_admin = M.User(
        name="Dr. K. Arumugam (Federation Director)",
        phone="9000000001",
        email="fed.admin@tnlabourcoop.org",
        password_hash=hash_password("admin123"),
        role=M.Role.FED_ADMIN
    )
    db.add(fed_admin)

    # Cooperative Admin: 9000000002 / admin123
    coop_admin = M.User(
        name="S. Muthukumar (Gandhipuram Society Secretary)",
        phone="9000000002",
        email="secretary@gandhipuramcoop.org",
        password_hash=hash_password("admin123"),
        role=M.Role.COOP_ADMIN
    )
    db.add(coop_admin)

    # Cooperative Admin 2: 9000000003 / admin123
    coop_admin_2 = M.User(
        name="S. Ramanathan (Cooperative Inspection Officer)",
        phone="9000000003",
        email="inspector@tnlabourcoop.org",
        password_hash=hash_password("admin123"),
        role=M.Role.COOP_ADMIN
    )
    db.add(coop_admin_2)

    # Customers:
    custs = []
    customer_data = [
        ("Meena Sundaram", "9000000011", "142 Crosscut Road, Gandhipuram, Coimbatore"),
        ("Ravi Chandran", "9000000012", "55 DB Road, RS Puram, Coimbatore"),
        ("Anand Natarajan", "9000000013", "18 Avinashi Road, Peelamedu, Coimbatore"),
        ("Kavitha Mohan", "9000000014", "102 Mettupalayam Road, Saibaba Colony, Coimbatore"),
    ]
    for n, p, addr in customer_data:
        u = M.User(name=n, phone=p, password_hash=hash_password("cust123"), role=M.Role.CUSTOMER)
        db.add(u)
        db.flush()
        c = M.Customer(user_id=u.id, address=addr)
        db.add(c)
        db.flush()
        custs.append(c)

    print("[Seed] Creating Comprehensive Skilled Workers Covering All 10 Services...")
    # Ensure ALL 10 services have verified, certified workers across all 5 cooperatives!
    # (name, phone, primary_skill, coop_idx, experience, rating, count, status, [additional_skills])
    worker_profiles = [
        # 1. Electrical (Services 1 & 2)
        ("Suresh Kumar", "9010000001", "Electrical repair", 0, 8.5, 4.9, 42, M.VerifStatus.VERIFIED, ["Domestic wiring"]),
        ("Kannan Raj", "9010000002", "Domestic wiring", 1, 6.5, 4.8, 28, M.VerifStatus.VERIFIED, ["Electrical repair"]),
        ("Senthil Nathan", "9010000011", "Electrical repair", 2, 7.0, 4.9, 31, M.VerifStatus.VERIFIED, ["Domestic wiring"]),

        # 2. Plumbing (Services 3 & 4)
        ("Murugan Vel", "9010000003", "Pipe repair", 0, 9.0, 4.8, 55, M.VerifStatus.VERIFIED, ["Bathroom plumbing"]),
        ("Priya Balan", "9010000010", "Bathroom plumbing", 1, 5.5, 4.9, 24, M.VerifStatus.VERIFIED, ["Pipe repair"]),
        ("Mani Kandan", "9010000012", "Pipe repair", 3, 6.0, 4.7, 30, M.VerifStatus.VERIFIED, ["Bathroom plumbing"]),

        # 3. Carpentry (Service 5)
        ("Raju Pillai", "9010000005", "Woodwork", 1, 11.0, 4.8, 64, M.VerifStatus.VERIFIED, []),
        ("Arul Dass", "9010000013", "Woodwork", 4, 8.0, 4.8, 38, M.VerifStatus.VERIFIED, []),

        # 4. Painting (Service 6) - BOTH VERIFIED!
        ("Anbu Selvan", "9010000008", "House painting", 0, 6.5, 4.8, 29, M.VerifStatus.VERIFIED, []),
        ("Karthik Raja", "9010000014", "House painting", 2, 8.0, 4.9, 41, M.VerifStatus.VERIFIED, []),

        # 5. Driving (Service 7)
        ("Kumar Swamy", "9010000007", "Car driving", 2, 7.5, 4.7, 36, M.VerifStatus.VERIFIED, []),
        ("Vignesh Kumar", "9010000015", "Car driving", 4, 6.0, 4.8, 25, M.VerifStatus.VERIFIED, []),

        # 6. Cleaning (Service 8)
        ("Selvi Mani", "9010000004", "Home cleaning", 0, 5.0, 4.9, 48, M.VerifStatus.VERIFIED, []),
        ("Lakshmi Ammal", "9010000016", "Home cleaning", 3, 7.0, 4.9, 39, M.VerifStatus.VERIFIED, []),

        # 7. Gardening (Service 9) - BOTH VERIFIED!
        ("Velu Chettiar", "9010000009", "Lawn maintenance", 1, 7.5, 4.8, 33, M.VerifStatus.VERIFIED, []),
        ("Subramani M", "9010000017", "Lawn maintenance", 4, 6.0, 4.7, 21, M.VerifStatus.VERIFIED, []),

        # 8. Caregiving (Service 10)
        ("Divya Lakshmi", "9010000006", "Elderly assistance", 0, 5.5, 5.0, 27, M.VerifStatus.VERIFIED, []),
        ("Revathi Sundaram", "9010000018", "Elderly assistance", 2, 8.0, 4.9, 35, M.VerifStatus.VERIFIED, []),

        # Pipeline applicants for admin review demo
        ("Saravanan P", "9010000019", "Electrical repair", 1, 3.0, 0.0, 0, M.VerifStatus.PENDING, ["Domestic wiring"]),
        ("Balamurugan K", "9010000020", "Pipe repair", 3, 2.5, 0.0, 0, M.VerifStatus.UNDER_REVIEW, []),

        # Chennai Regional Cooperative Workers
        ("Karthik Rajan", "9020000001", "Electrical repair", 5, 6.0, 4.9, 52, M.VerifStatus.VERIFIED, ["Domestic wiring"]),
        ("Venkatesh S", "9020000002", "Pipe repair", 5, 5.0, 4.8, 41, M.VerifStatus.VERIFIED, ["Bathroom plumbing"]),
        ("Manikandan K", "9020000003", "House painting", 6, 8.0, 4.9, 63, M.VerifStatus.VERIFIED, []),
        ("Senthil Nathan", "9020000004", "Car driving", 6, 7.0, 4.8, 38, M.VerifStatus.VERIFIED, []),
        ("Anitha Ramesh", "9020000005", "Home cleaning", 5, 4.5, 4.9, 29, M.VerifStatus.VERIFIED, []),

        # Madurai Regional Cooperative Workers
        ("Muthuvel Pandian", "9020000006", "Electrical repair", 7, 7.5, 4.9, 44, M.VerifStatus.VERIFIED, ["Domestic wiring"]),
        ("Alagarsamy R", "9020000007", "Pipe repair", 7, 6.0, 4.8, 35, M.VerifStatus.VERIFIED, []),
        ("Vijayalakshmi S", "9020000008", "Home cleaning", 7, 5.0, 4.9, 40, M.VerifStatus.VERIFIED, []),

        # Trichy Regional Cooperative Workers
        ("Natarajan V", "9020000009", "Electrical repair", 8, 6.5, 4.8, 33, M.VerifStatus.VERIFIED, ["Domestic wiring"]),
        ("Kulandai Velu", "9020000010", "Woodwork", 8, 9.0, 5.0, 48, M.VerifStatus.VERIFIED, []),

        # Salem Regional Cooperative Workers
        ("Periasamy G", "9020000011", "Electrical repair", 9, 5.5, 4.8, 31, M.VerifStatus.VERIFIED, ["Domestic wiring"]),
        ("Gowri Shankar", "9020000012", "Pipe repair", 9, 6.0, 4.7, 27, M.VerifStatus.VERIFIED, []),

        # Tiruppur Regional Cooperative Workers
        ("Thangavel P", "9020000013", "Electrical repair", 10, 8.0, 4.9, 50, M.VerifStatus.VERIFIED, ["Domestic wiring"]),
        ("Boopathi M", "9020000014", "Pipe repair", 10, 5.0, 4.8, 32, M.VerifStatus.VERIFIED, []),

        # Bengaluru Regional Cooperative Workers
        ("Pradeep Kumar", "9020000015", "Electrical repair", 11, 7.0, 4.9, 60, M.VerifStatus.VERIFIED, ["Domestic wiring"]),
        ("Santosh Gowda", "9020000016", "Pipe repair", 11, 6.0, 4.8, 45, M.VerifStatus.VERIFIED, ["Bathroom plumbing"]),
        ("Suma Shivanand", "9020000017", "Elderly assistance", 11, 6.5, 5.0, 36, M.VerifStatus.VERIFIED, []),
    ]

    created_workers = []
    random.seed(42)

    for i, profile in enumerate(worker_profiles):
        n, p, sk, ci, exp, rating, count, verif_status, add_skills = profile
        u = M.User(name=n, phone=p, password_hash=hash_password("work123"), role=M.Role.WORKER)
        db.add(u)
        db.flush()

        target_coop = coops[ci] if ci < len(coops) else coops[ci % len(coops)]
        jitter_lat = target_coop.lat + random.uniform(-0.012, 0.012)
        jitter_lng = target_coop.lng + random.uniform(-0.012, 0.012)

        city_name = "Coimbatore"
        if ci in [5, 6]:
            city_name = "Chennai"
        elif ci == 7:
            city_name = "Madurai"
        elif ci == 8:
            city_name = "Tiruchirappalli"
        elif ci == 9:
            city_name = "Salem"
        elif ci == 10:
            city_name = "Tiruppur"
        elif ci == 11:
            city_name = "Bengaluru"

        w = M.Worker(
            user_id=u.id,
            cooperative_id=target_coop.id,
            address=f"{target_coop.area}, {city_name}",
            experience_years=exp,
            verification_status=verif_status,
            is_available=True,
            avg_rating=rating,
            rating_count=count,
            base_lat=round(jitter_lat, 4),
            base_lng=round(jitter_lng, 4),
            service_radius_km=30.0  # Covers metropolitan zone
        )
        db.add(w)
        db.flush()
        created_workers.append(w)

        # Primary skill
        all_worker_skills = [sk] + add_skills
        for w_sk in all_worker_skills:
            if w_sk in skills:
                db.add(M.WorkerSkill(
                    worker_id=w.id,
                    skill_id=skills[w_sk].id,
                    level="expert" if exp >= 6 else "intermediate",
                    experience_years=exp
                ))

        # Certifications
        if "Electrical repair" in all_worker_skills or "Domestic wiring" in all_worker_skills:
            db.add(M.WorkerCertification(
                worker_id=w.id,
                certification_id=certs["ITI Electrician National Trade Certificate"].id,
                cert_number=f"ITI-TN-{1000 + i}",
                issuer="Directorate General of Training",
                verification_status="verified" if verif_status == M.VerifStatus.VERIFIED else "pending",
                issue_date=date.today() - timedelta(days=700),
                expiry_date=date.today() + timedelta(days=1000)
            ))
        elif "Car driving" in all_worker_skills:
            db.add(M.WorkerCertification(
                worker_id=w.id,
                certification_id=certs["Professional Driving Licence (LMV)"].id,
                cert_number=f"TN-38-DL-{2020000 + i}",
                issuer="Coimbatore RTO",
                verification_status="verified",
                issue_date=date.today() - timedelta(days=1200),
                expiry_date=date.today() + timedelta(days=800)
            ))
        elif "Elderly assistance" in all_worker_skills:
            db.add(M.WorkerCertification(
                worker_id=w.id,
                certification_id=certs["Certified Healthcare Aide"].id,
                cert_number=f"CHA-TN-{500 + i}",
                issuer="Indian Red Cross Society",
                verification_status="verified",
                issue_date=date.today() - timedelta(days=500),
                expiry_date=date.today() + timedelta(days=600)
            ))

        # Link worker to all matching services
        for s in svcs:
            if s.skill_id in [skills[x].id for x in all_worker_skills if x in skills]:
                db.add(M.WorkerService(worker_id=w.id, service_id=s.id))

        # Add availability schedule (Monday-Sunday, 07:00 - 20:00)
        for d_idx in range(7):
            db.add(M.WorkerAvailability(
                worker_id=w.id,
                weekday=d_idx,
                start_time="07:00",
                end_time="20:00"
            ))

        # Enroll in welfare scheme
        db.add(M.WorkerWelfare(
            worker_id=w.id,
            benefit_id=b_objs[i % len(b_objs)].id,
            status="enrolled"
        ))

        # Enroll in insurance
        db.add(M.InsuranceRecord(
            worker_id=w.id,
            provider_id=ins_prov.id,
            policy_ref=f"POL-COOP-{3000 + i}",
            coverage_type="Cooperative Group Accident & Health Indemnity",
            status="active",
            effective_date=date.today() - timedelta(days=180),
            expiry_date=date.today() + timedelta(days=185),
            is_demo=True
        ))

    db.commit()

    print("[Seed] Generating 60-day historical bookings, payments, and audited invoices...")
    verified_workers = [w for w in created_workers if w.verification_status == M.VerifStatus.VERIFIED]
    total_seeded_bookings = 0

    for d in range(60):
        day_date = date.today() - timedelta(days=60 - d)
        daily_count = random.randint(5, 10) if day_date.weekday() >= 5 else random.randint(3, 7)

        for _ in range(daily_count):
            w = random.choice(verified_workers)
            ws = db.query(M.WorkerService).filter_by(worker_id=w.id).first()
            if not ws:
                continue
            svc = db.get(M.Service, ws.service_id)
            c = random.choice(custs)
            hour = random.randint(8, 18)

            booking = M.Booking(
                customer_id=c.id,
                worker_id=w.id,
                service_id=svc.id,
                scheduled_date=day_date,
                start_time=f"{hour:02d}:00",
                duration_min=60,
                lat=w.base_lat,
                lng=w.base_lng,
                address=c.address,
                description="Regular cooperative scheduled household maintenance",
                status=M.BookingStatus.COMPLETED,
                service_amount=svc.worker_earning,
                coop_charge=svc.coop_charge,
                total_amount=svc.base_price
            )
            db.add(booking)
            db.flush()

            # Add payment record with Bank UTR reference
            utr_ref = f"UTR-TNSC-{booking.id:04d}-{random.randint(100000, 999999)}"
            payment = M.Payment(
                booking_id=booking.id,
                amount=booking.total_amount,
                provider="Tamil Nadu State Apex Cooperative Bank / UPI",
                provider_ref=utr_ref,
                status=M.PayStatus.SUCCESS,
                is_demo=True
            )
            db.add(payment)

            # Add invoice record with itemized breakdown
            inv = M.Invoice(
                booking_id=booking.id,
                invoice_no=f"INV-TN-COOP-2026-{booking.id:04d}",
                total=booking.total_amount,
                payment_status="PAID"
            )
            db.add(inv)
            db.flush()

            db.add(M.InvoiceItem(
                invoice_id=inv.id,
                label=f"Direct Worker Fair Wage (90% - {w.user.name})",
                amount=booking.service_amount
            ))
            db.add(M.InvoiceItem(
                invoice_id=inv.id,
                label="Cooperative Welfare Fund & Admin Surcharge (10%)",
                amount=booking.coop_charge
            ))

            # Add rating & review for 75% of completed bookings
            if random.random() < 0.75:
                stars = random.choice([4, 5, 5, 5, 4, 5])
                db.add(M.Rating(
                    booking_id=booking.id,
                    worker_id=w.id,
                    customer_id=c.id,
                    stars=stars
                ))

            total_seeded_bookings += 1

    db.commit()
    db.close()
    print(f"[Seed] Successfully seeded {total_seeded_bookings} historical bookings across 60 days.")
    print("[Seed] All 10 trades verified across 5 Coimbatore cooperatives.")
    print("[Seed] Database setup complete!")

if __name__ == "__main__":
    seed_database()
