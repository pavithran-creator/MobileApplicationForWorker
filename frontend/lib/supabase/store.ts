import { getSupabaseAdmin } from "./admin";

export interface DBUser {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: "CUSTOMER" | "WORKER" | "COOP_ADMIN" | "FED_ADMIN";
  password_hash?: string;
  worker_id?: number;
  customer_id?: number;
  address?: string;
  cooperative_id?: number;
  verification_status?: string;
  avg_rating?: number;
  rating_count?: number;
  experience_years?: number;
  skills?: string[];
  cooperative?: string;
  is_available?: boolean;
  avatar_url?: string;
  bio?: string;
  upi_id?: string;
  upi_qr_url?: string;
}

export interface DBCoop {
  id: number;
  name: string;
  area: string;
  lat: number;
  lng: number;
  federation_id: number;
}

export interface DBService {
  id: number;
  category_id: number;
  name: string;
  description: string;
  base_price: number;
  worker_earning: number;
  coop_charge: number;
  requires_certification: boolean;
  skill_id?: number;
}

export interface DBBooking {
  id: number;
  customer_id: number;
  worker_id: number;
  service_id: number;
  scheduled_date: string;
  start_time: string;
  duration_min: number;
  lat: number;
  lng: number;
  address: string;
  description: string;
  status: string;
  is_emergency: boolean;
  service_amount: number;
  coop_charge: number;
  total_amount: number;
  created_at: string;
}

export interface DBPayment {
  id: number;
  booking_id: number;
  amount: number;
  provider: string;
  provider_ref: string;
  status: string;
  is_demo: boolean;
  created_at: string;
}

export interface DBInvoice {
  id: number;
  booking_id: number;
  invoice_no: string;
  total: number;
  payment_status: string;
  created_at: string;
  items: { label: string; amount: number }[];
}

export interface DBRating {
  id: number;
  booking_id: number;
  worker_id: number;
  customer_id: number;
  stars: number;
  created_at: string;
}

export interface DBFeedback {
  id: number;
  booking_id: number;
  worker_id: number;
  customer_id: number;
  message: string;
  created_at: string;
}

export interface DBNotification {
  id: number;
  user_id: number;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface DBAuditLog {
  id: number;
  actor_id: number;
  actor_name: string;
  action: string;
  target: string;
  meta: string;
  timestamp: string;
}

export interface DBAllocation {
  id: number;
  service_id: number | null;
  service_name: string;
  area: string;
  expected_demand: number;
  available_workers: number;
  shortage: number;
  recommendation: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
}

// Initial seed data for cooperatives
const INITIAL_COOPS: DBCoop[] = [
  { id: 1, name: "Gandhipuram Labour Cooperative Society", area: "Gandhipuram", lat: 11.0168, lng: 76.9558, federation_id: 1 },
  { id: 2, name: "RS Puram Workers Cooperative Society", area: "RS Puram", lat: 11.0180, lng: 76.9400, federation_id: 1 },
  { id: 3, name: "Peelamedu Seva Labour Cooperative", area: "Peelamedu", lat: 11.0240, lng: 77.0020, federation_id: 1 },
  { id: 4, name: "Saibaba Colony Labour Welfare Cooperative", area: "Saibaba Colony", lat: 11.0310, lng: 76.9420, federation_id: 1 },
  { id: 5, name: "Singanallur Artisan Cooperative Society", area: "Singanallur", lat: 11.0020, lng: 77.0250, federation_id: 1 },
  { id: 6, name: "Chennai Central Labour Cooperative Society", area: "T. Nagar", lat: 13.0418, lng: 80.2341, federation_id: 1 },
  { id: 7, name: "North Chennai Cooperative Trades Society", area: "Anna Nagar", lat: 13.0850, lng: 80.2101, federation_id: 1 },
  { id: 8, name: "Madurai District Workers Cooperative Society", area: "KK Nagar", lat: 9.9252, lng: 78.1498, federation_id: 1 },
  { id: 9, name: "Tiruchirappalli Labour Cooperative Society", area: "Thillai Nagar", lat: 10.8250, lng: 78.6850, federation_id: 1 },
  { id: 10, name: "Salem City Cooperative Trades Society", area: "Fairlands", lat: 11.6740, lng: 78.1460, federation_id: 1 },
  { id: 11, name: "Tiruppur Textile & Labour Cooperative Society", area: "Avinashi Road", lat: 11.1150, lng: 77.3480, federation_id: 1 },
  { id: 12, name: "Bengaluru Regional Trades Cooperative", area: "Indiranagar", lat: 12.9784, lng: 77.6408, federation_id: 1 },
];

// Initial seed data for services (90% Worker Fair Wage / 10% Coop Welfare split)
const INITIAL_SERVICES: DBService[] = [
  { id: 1, category_id: 1, name: "Fan & light repair", description: "Professional fan & light repair by verified cooperative tradespersons", base_price: 250, worker_earning: 225, coop_charge: 25, requires_certification: true, skill_id: 2 },
  { id: 2, category_id: 1, name: "Full house wiring check", description: "Professional full house wiring check by verified cooperative tradespersons", base_price: 900, worker_earning: 810, coop_charge: 90, requires_certification: true, skill_id: 1 },
  { id: 3, category_id: 2, name: "Tap & pipe repair", description: "Professional tap & pipe repair by verified cooperative tradespersons", base_price: 300, worker_earning: 270, coop_charge: 30, requires_certification: false, skill_id: 3 },
  { id: 4, category_id: 2, name: "Bathroom plumbing overhaul", description: "Professional bathroom plumbing overhaul by verified cooperative tradespersons", base_price: 1200, worker_earning: 1080, coop_charge: 120, requires_certification: false, skill_id: 4 },
  { id: 5, category_id: 3, name: "Furniture repair", description: "Professional furniture repair by verified cooperative tradespersons", base_price: 450, worker_earning: 405, coop_charge: 45, requires_certification: false, skill_id: 5 },
  { id: 6, category_id: 4, name: "1BHK painting", description: "Professional 1bhk painting by verified cooperative tradespersons", base_price: 5000, worker_earning: 4500, coop_charge: 500, requires_certification: false, skill_id: 6 },
  { id: 7, category_id: 5, name: "Local driver 8h", description: "Professional local driver 8h by verified cooperative tradespersons", base_price: 1000, worker_earning: 900, coop_charge: 100, requires_certification: true, skill_id: 7 },
  { id: 8, category_id: 6, name: "Deep home cleaning", description: "Professional deep home cleaning by verified cooperative tradespersons", base_price: 1500, worker_earning: 1350, coop_charge: 150, requires_certification: false, skill_id: 8 },
  { id: 9, category_id: 7, name: "Lawn & plant maintenance", description: "Professional lawn & plant maintenance by verified cooperative tradespersons", base_price: 400, worker_earning: 360, coop_charge: 40, requires_certification: false, skill_id: 9 },
  { id: 10, category_id: 8, name: "Elderly companion assistance", description: "Professional elderly companion assistance by verified cooperative tradespersons", base_price: 800, worker_earning: 720, coop_charge: 80, requires_certification: true, skill_id: 10 },
];

// Initial seed categories
const INITIAL_CATEGORIES = [
  { id: 1, name: "Electrical", description: "Certified cooperative electrical services" },
  { id: 2, name: "Plumbing", description: "Certified cooperative plumbing services" },
  { id: 3, "name": "Carpentry", description: "Certified cooperative carpentry services" },
  { id: 4, "name": "Painting", description: "Certified cooperative painting services" },
  { id: 5, "name": "Driving", description: "Certified cooperative driving services" },
  { id: 6, "name": "Cleaning", description: "Certified cooperative cleaning services" },
  { id: 7, "name": "Gardening", description: "Certified cooperative gardening services" },
  { id: 8, "name": "Caregiving", description: "Certified cooperative caregiving services" },
];

// Global in-memory / Supabase-synchronized state
declare global {
  var __supabase_store__: {
    users: DBUser[];
    cooperatives: DBCoop[];
    services: DBService[];
    categories: typeof INITIAL_CATEGORIES;
    bookings: DBBooking[];
    payments: DBPayment[];
    invoices: DBInvoice[];
    ratings: DBRating[];
    feedback: DBFeedback[];
    notifications: DBNotification[];
    auditLogs: DBAuditLog[];
    allocations: DBAllocation[];
    bookingCounter: number;
    paymentCounter: number;
    userCounter: number;
  } | undefined;
}

function initStore() {
  if (!global.__supabase_store__) {
    const users: DBUser[] = [
      // Admins
      { id: 1, name: "Dr. K. Arumugam (Federation Director)", phone: "9000000001", email: "fed.admin@tnlabourcoop.org", role: "FED_ADMIN" },
      { id: 2, name: "S. Muthukumar (Gandhipuram Society Secretary)", phone: "9000000002", email: "secretary@gandhipuramcoop.org", role: "COOP_ADMIN", cooperative: "Gandhipuram Labour Cooperative Society", cooperative_id: 1 },
      { id: 3, name: "S. Ramanathan (Cooperative Inspection Officer)", phone: "9000000003", email: "inspector@tnlabourcoop.org", role: "COOP_ADMIN", cooperative: "Gandhipuram Labour Cooperative Society", cooperative_id: 1 },

      // Customers
      { id: 4, customer_id: 1, name: "Meena Sundaram", phone: "9000000011", email: "meena@example.com", role: "CUSTOMER", address: "142 Crosscut Road, Gandhipuram, Coimbatore" },
      { id: 5, customer_id: 2, name: "Ravi Chandran", phone: "9000000012", email: "ravi@example.com", role: "CUSTOMER", address: "55 DB Road, RS Puram, Coimbatore" },
      { id: 6, customer_id: 3, name: "Anand Natarajan", phone: "9000000013", email: "anand@example.com", role: "CUSTOMER", address: "18 Avinashi Road, Peelamedu, Coimbatore" },
      { id: 7, customer_id: 4, name: "Kavitha Mohan", phone: "9000000014", email: "kavitha@example.com", role: "CUSTOMER", address: "102 Mettupalayam Road, Saibaba Colony, Coimbatore" },

      // Verified Workers
      {
        id: 8,
        worker_id: 1,
        name: "Suresh Kumar",
        phone: "9010000001",
        role: "WORKER",
        cooperative_id: 1,
        cooperative: "Gandhipuram Labour Cooperative Society",
        verification_status: "VERIFIED",
        is_available: true,
        avg_rating: 4.9,
        rating_count: 42,
        experience_years: 8.5,
        skills: ["Electrical repair", "Domestic wiring"],
        address: "Gandhipuram, Coimbatore",
        avatar_url: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80",
        bio: "Senior certified electrician with 8+ years experience in domestic wiring, 3-phase systems, and fault diagnosis. Committed to transparent cooperative rates.",
        upi_id: "suresh.electrician@oksbi",
        upi_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=suresh.electrician@oksbi&pn=Suresh%20Kumar&cu=INR"
      },
      {
        id: 9,
        worker_id: 2,
        name: "Kannan Raj",
        phone: "9010000002",
        role: "WORKER",
        cooperative_id: 2,
        cooperative: "RS Puram Workers Cooperative Society",
        verification_status: "VERIFIED",
        is_available: true,
        avg_rating: 4.8,
        rating_count: 28,
        experience_years: 6.5,
        skills: ["Domestic wiring", "Electrical repair"],
        address: "RS Puram, Coimbatore",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        bio: "Specialized in energy audits, circuit safety tests, and domestic lighting setups. Prompt on-site arrival guaranteed.",
        upi_id: "kannan.raj@apl",
        upi_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=kannan.raj@apl&pn=Kannan%20Raj&cu=INR"
      },
      {
        id: 10,
        worker_id: 3,
        name: "Murugan Vel",
        phone: "9010000003",
        role: "WORKER",
        cooperative_id: 1,
        cooperative: "Gandhipuram Labour Cooperative Society",
        verification_status: "VERIFIED",
        is_available: true,
        avg_rating: 4.8,
        rating_count: 55,
        experience_years: 9.0,
        skills: ["Pipe repair", "Bathroom plumbing"],
        address: "Gandhipuram, Coimbatore",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        bio: "Master plumber covering leak detection, sanitary fixture overhauls, and drainage repairs. High precision work with standard cooperative warranty.",
        upi_id: "murugan.plumber@paytm",
        upi_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=murugan.plumber@paytm&pn=Murugan%20Vel&cu=INR"
      },
      {
        id: 11,
        worker_id: 4,
        name: "Selvi Mani",
        phone: "9010000004",
        role: "WORKER",
        cooperative_id: 1,
        cooperative: "Gandhipuram Labour Cooperative Society",
        verification_status: "VERIFIED",
        is_available: true,
        avg_rating: 4.9,
        rating_count: 48,
        experience_years: 5.0,
        skills: ["Home cleaning"],
        address: "Gandhipuram, Coimbatore",
        avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
        bio: "Expert in deep sanitization, kitchen degreasing, and eco-friendly home care. Dedicated cooperative member with high client satisfaction.",
        upi_id: "selvi.cleaner@oksbi",
        upi_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=selvi.cleaner@oksbi&pn=Selvi%20Mani&cu=INR"
      },
      {
        id: 12,
        worker_id: 5,
        name: "Raju Pillai",
        phone: "9010000005",
        role: "WORKER",
        cooperative_id: 2,
        cooperative: "RS Puram Workers Cooperative Society",
        verification_status: "VERIFIED",
        is_available: true,
        avg_rating: 4.8,
        rating_count: 64,
        experience_years: 11.0,
        skills: ["Woodwork"],
        address: "RS Puram, Coimbatore",
        avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
        bio: "Skilled carpenter with 11+ years of experience in furniture restoration, door hinge alignment, and modular fittings.",
        upi_id: "raju.carpenter@icici",
        upi_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=raju.carpenter@icici&pn=Raju%20Pillai&cu=INR"
      },
      {
        id: 13,
        worker_id: 6,
        name: "Divya Lakshmi",
        phone: "9010000006",
        role: "WORKER",
        cooperative_id: 1,
        cooperative: "Gandhipuram Labour Cooperative Society",
        verification_status: "VERIFIED",
        is_available: true,
        avg_rating: 5.0,
        rating_count: 27,
        experience_years: 5.5,
        skills: ["Elderly assistance"],
        address: "Gandhipuram, Coimbatore",
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
        bio: "Trained compassionate healthcare assistant offering mobility support and companionship for senior citizens.",
        upi_id: "divya.care@oksbi",
        upi_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=divya.care@oksbi&pn=Divya%20Lakshmi&cu=INR"
      },
      {
        id: 14,
        worker_id: 7,
        name: "Kumar Swamy",
        phone: "9010000007",
        role: "WORKER",
        cooperative_id: 3,
        cooperative: "Peelamedu Seva Labour Cooperative",
        verification_status: "VERIFIED",
        is_available: true,
        avg_rating: 4.7,
        rating_count: 36,
        experience_years: 7.5,
        skills: ["Car driving"],
        address: "Peelamedu, Coimbatore",
        avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
        bio: "Commercial badge driver with safe driving record across Tamil Nadu highways and city routes. Punctual and polite.",
        upi_id: "kumar.driver@barodampay",
        upi_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=kumar.driver@barodampay&pn=Kumar%20Swamy&cu=INR"
      },
      {
        id: 15,
        worker_id: 8,
        name: "Anbu Selvan",
        phone: "9010000008",
        role: "WORKER",
        cooperative_id: 1,
        cooperative: "Gandhipuram Labour Cooperative Society",
        verification_status: "VERIFIED",
        is_available: true,
        avg_rating: 4.8,
        rating_count: 29,
        experience_years: 6.5,
        skills: ["House painting"],
        address: "Gandhipuram, Coimbatore",
        avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
        bio: "Professional painter specialized in interior surface preparation, primer coating, and waterproof exterior finishes.",
        upi_id: "anbu.painter@oksbi",
        upi_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=anbu.painter@oksbi&pn=Anbu%20Selvan&cu=INR"
      },
      {
        id: 16,
        worker_id: 9,
        name: "Velu Chettiar",
        phone: "9010000009",
        role: "WORKER",
        cooperative_id: 2,
        cooperative: "RS Puram Workers Cooperative Society",
        verification_status: "VERIFIED",
        is_available: true,
        avg_rating: 4.8,
        rating_count: 33,
        experience_years: 7.5,
        skills: ["Lawn maintenance"],
        address: "RS Puram, Coimbatore",
        avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
        bio: "Landscaping and garden maintenance expert. Tree pruning, turf revitalization, and seasonal plant nourishment.",
        upi_id: "velu.gardener@oksbi",
        upi_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=velu.gardener@oksbi&pn=Velu%20Chettiar&cu=INR"
      },
      {
        id: 17,
        worker_id: 10,
        name: "Priya Balan",
        phone: "9010000010",
        role: "WORKER",
        cooperative_id: 2,
        cooperative: "RS Puram Workers Cooperative Society",
        verification_status: "VERIFIED",
        is_available: true,
        avg_rating: 4.9,
        rating_count: 24,
        experience_years: 5.5,
        skills: ["Bathroom plumbing", "Pipe repair"],
        address: "RS Puram, Coimbatore",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        bio: "Certified plumbing technician for residential water supply installations, motor pump issues, and solar heater connections.",
        upi_id: "priya.plumber@oksbi",
        upi_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=priya.plumber@oksbi&pn=Priya%20Balan&cu=INR"
      },
      { id: 18, worker_id: 11, name: "Senthil Nathan", phone: "9010000011", role: "WORKER", cooperative_id: 3, cooperative: "Peelamedu Seva Labour Cooperative", verification_status: "VERIFIED", is_available: true, avg_rating: 4.9, rating_count: 31, experience_years: 7.0, skills: ["Electrical repair", "Domestic wiring"], address: "Peelamedu, Coimbatore", upi_id: "senthil@oksbi" },
      { id: 19, worker_id: 12, name: "Mani Kandan", phone: "9010000012", role: "WORKER", cooperative_id: 4, cooperative: "Saibaba Colony Labour Welfare Cooperative", verification_status: "VERIFIED", is_available: true, avg_rating: 4.7, rating_count: 30, experience_years: 6.0, skills: ["Pipe repair", "Bathroom plumbing"], address: "Saibaba Colony, Coimbatore", upi_id: "mani@oksbi" },
      { id: 20, worker_id: 13, name: "Arul Dass", phone: "9010000013", role: "WORKER", cooperative_id: 5, cooperative: "Singanallur Artisan Cooperative Society", verification_status: "VERIFIED", is_available: true, avg_rating: 4.8, rating_count: 38, experience_years: 8.0, skills: ["Woodwork"], address: "Singanallur, Coimbatore", upi_id: "arul@oksbi" },
      { id: 21, worker_id: 14, name: "Karthik Raja", phone: "9010000014", role: "WORKER", cooperative_id: 3, cooperative: "Peelamedu Seva Labour Cooperative", verification_status: "VERIFIED", is_available: true, avg_rating: 4.9, rating_count: 41, experience_years: 8.0, skills: ["House painting"], address: "Peelamedu, Coimbatore", upi_id: "karthik@oksbi" },
      { id: 22, worker_id: 15, name: "Vignesh Kumar", phone: "9010000015", role: "WORKER", cooperative_id: 5, cooperative: "Singanallur Artisan Cooperative Society", verification_status: "VERIFIED", is_available: true, avg_rating: 4.8, rating_count: 25, experience_years: 6.0, skills: ["Car driving"], address: "Singanallur, Coimbatore", upi_id: "vignesh@oksbi" },
      { id: 23, worker_id: 16, name: "Lakshmi Ammal", phone: "9010000016", role: "WORKER", cooperative_id: 4, cooperative: "Saibaba Colony Labour Welfare Cooperative", verification_status: "VERIFIED", is_available: true, avg_rating: 4.9, rating_count: 39, experience_years: 7.0, skills: ["Home cleaning"], address: "Saibaba Colony, Coimbatore", upi_id: "lakshmi@oksbi" },
      { id: 24, worker_id: 17, name: "Subramani M", phone: "9010000017", role: "WORKER", cooperative_id: 5, cooperative: "Singanallur Artisan Cooperative Society", verification_status: "VERIFIED", is_available: true, avg_rating: 4.7, rating_count: 21, experience_years: 6.0, skills: ["Lawn maintenance"], address: "Singanallur, Coimbatore", upi_id: "subramani@oksbi" },
      { id: 25, worker_id: 18, name: "Revathi Sundaram", phone: "9010000018", role: "WORKER", cooperative_id: 3, cooperative: "Peelamedu Seva Labour Cooperative", verification_status: "VERIFIED", is_available: true, avg_rating: 4.9, rating_count: 35, experience_years: 8.0, skills: ["Elderly assistance"], address: "Peelamedu, Coimbatore", upi_id: "revathi@oksbi" },
      { id: 26, worker_id: 19, name: "Saravanan P", phone: "9010000019", role: "WORKER", cooperative_id: 2, cooperative: "RS Puram Workers Cooperative Society", verification_status: "PENDING", is_available: true, avg_rating: 0.0, rating_count: 0, experience_years: 3.0, skills: ["Electrical repair"], address: "RS Puram, Coimbatore", upi_id: "saravanan@oksbi" },
      { id: 27, worker_id: 20, name: "Balamurugan K", phone: "9010000020", role: "WORKER", cooperative_id: 4, cooperative: "Saibaba Colony Labour Welfare Cooperative", verification_status: "UNDER_REVIEW", is_available: true, avg_rating: 0.0, rating_count: 0, experience_years: 2.5, skills: ["Pipe repair"], address: "Saibaba Colony, Coimbatore", upi_id: "balamurugan@oksbi" },
    ];

    // Seed historical bookings across 60 days
    const bookings: DBBooking[] = [];
    const payments: DBPayment[] = [];
    const invoices: DBInvoice[] = [];
    const ratings: DBRating[] = [];
    const feedbackList: DBFeedback[] = [];
    let bId = 1;

    for (let day = 50; day >= 1; day--) {
      const d = new Date();
      d.setDate(d.getDate() - day);
      const dateStr = d.toISOString().split("T")[0];
      const worker = users.find(u => u.worker_id === (1 + (day % 10))) || users[7];
      const service = INITIAL_SERVICES[(day % INITIAL_SERVICES.length)];
      const customer = users.find(u => u.customer_id === (1 + (day % 4))) || users[3];

      const booking: DBBooking = {
        id: bId,
        customer_id: customer.customer_id || 1,
        worker_id: worker.worker_id || 1,
        service_id: service.id,
        scheduled_date: dateStr,
        start_time: "10:00",
        duration_min: 60,
        lat: 11.0168,
        lng: 76.9558,
        address: customer.address || "Coimbatore",
        description: "Scheduled household maintenance",
        status: "COMPLETED",
        is_emergency: false,
        service_amount: service.worker_earning,
        coop_charge: service.coop_charge,
        total_amount: service.base_price,
        created_at: new Date(d.getTime() - 86400000).toISOString(),
      };
      bookings.push(booking);

      payments.push({
        id: bId,
        booking_id: bId,
        amount: service.base_price,
        provider: "Tamil Nadu State Apex Cooperative Bank / UPI",
        provider_ref: `UTR-TNSC-${bId.toString().padStart(4, "0")}-HIST`,
        status: "SUCCESS",
        is_demo: true,
        created_at: d.toISOString(),
      });

      invoices.push({
        id: bId,
        booking_id: bId,
        invoice_no: `INV-TN-COOP-2026-${bId.toString().padStart(4, "0")}`,
        total: service.base_price,
        payment_status: "PAID",
        created_at: d.toISOString(),
        items: [
          { label: `Direct Worker Fair Wage (90% - ${worker.name})`, amount: service.worker_earning },
          { label: "Labour Cooperative Welfare Fund & Admin Surcharge (10%)", amount: service.coop_charge }
        ]
      });

      const sampleReviews = [
        "Arrived exactly on time. Very professional trade work and transparent fair wage pricing.",
        "Clean installation and polite behavior. Great cooperative service!",
        "Quick diagnostic and fixed the issue without any extra hidden charges.",
        "Highly skilled tradesperson. Completed the task safely according to regulations.",
        "Very satisfied with the quality of service. Will book again through the cooperative society."
      ];

      if (day % 2 === 0) {
        const starsVal = (day % 3 === 0) ? 4 : 5;
        ratings.push({
          id: bId,
          booking_id: bId,
          worker_id: worker.worker_id || 1,
          customer_id: customer.customer_id || 1,
          stars: starsVal,
          created_at: d.toISOString(),
        });
        feedbackList.push({
          id: bId,
          booking_id: bId,
          worker_id: worker.worker_id || 1,
          customer_id: customer.customer_id || 1,
          message: sampleReviews[day % sampleReviews.length],
          created_at: d.toISOString(),
        });
      }

      bId++;
    }

    const notifications: DBNotification[] = [
      { id: 1, user_id: 1, title: "System Operational", body: "Supabase cooperative marketplace engine initialized.", is_read: false, created_at: new Date().toISOString() },
      { id: 2, user_id: 8, title: "Cooperative Verification Active", body: "Trade license and insurance credentials active.", is_read: true, created_at: new Date().toISOString() },
    ];

    const auditLogs: DBAuditLog[] = [
      { id: 1, actor_id: 1, actor_name: "Dr. K. Arumugam", action: "system.init", target: "supabase:migration", meta: "Supabase PostgreSQL architecture activated", timestamp: new Date().toISOString() }
    ];

    const allocations: DBAllocation[] = [];

    global.__supabase_store__ = {
      users,
      cooperatives: INITIAL_COOPS,
      services: INITIAL_SERVICES,
      categories: INITIAL_CATEGORIES,
      bookings,
      payments,
      invoices,
      ratings,
      feedback: feedbackList,
      notifications,
      auditLogs,
      allocations,
      bookingCounter: bId,
      paymentCounter: bId,
      userCounter: 100,
    };
  }

  // Ensure worker avatar_url, bio, upi_id, and upi_qr_url are initialized even across hot reloads
  for (const u of global.__supabase_store__.users) {
    if (u.role === "WORKER") {
      if (!u.upi_id) {
        const handle = u.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        u.upi_id = `${handle || "worker"}@oksbi`;
      }
      if (!u.upi_qr_url) {
        const upiUri = `upi://pay?pa=${encodeURIComponent(u.upi_id)}&pn=${encodeURIComponent(u.name)}&cu=INR`;
        u.upi_qr_url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;
      }
      if (!u.bio) {
        u.bio = `Certified cooperative ${u.skills?.[0] || "trade"} specialist with ${u.experience_years || 5} years experience. Punctual, transparent fair wages guaranteed.`;
      }
      if (!u.avatar_url) {
        u.avatar_url = "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80";
      }
    }
  }

  return global.__supabase_store__;
}

export const dbStore = initStore();
