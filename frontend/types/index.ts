export type Role = "CUSTOMER" | "WORKER" | "COOP_ADMIN" | "FED_ADMIN";

export type VerificationStatus = "REGISTERED" | "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";

export type BookingStatus = 
  | "REQUESTED"
  | "CONFIRMED"
  | "WORKER_ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type PaymentStatus = "PENDING" | "INITIATED" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface UserProfile {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  customer_id?: number;
  worker_id?: number;
  verification_status?: VerificationStatus;
  cooperative?: string;
  avg_rating?: number;
  rating_count?: number;
  experience_years?: number;
  avatar_url?: string;
  bio?: string;
  upi_id?: string;
  upi_qr_url?: string;
  address?: string;
}

export interface ServiceItem {
  id: number;
  name: string;
  description: string;
  category_id: number;
  base_price: number;
  worker_earning: number;
  coop_charge: number;
  requires_certification: boolean;
  skill_id?: number;
}

export interface ServiceCategory {
  id: number;
  name: string;
  description: string;
}

export interface MatchedWorker {
  worker_id: number;
  name: string;
  phone: string;
  cooperative_name: string;
  score: number;
  distance_km: number;
  avg_rating: number;
  rating_count: number;
  experience_years: number;
  reasons: string[];
  verification_status?: string;
  avatar_url?: string;
  bio?: string;
  upi_id?: string;
  upi_qr_url?: string;
  address?: string;
}

export interface BookingRecord {
  id: number;
  service_name: string;
  worker_id: number;
  worker_name: string;
  worker_phone: string;
  customer_id: number;
  customer_name: string;
  date: string;
  start_time: string;
  duration_min: number;
  status: BookingStatus;
  is_emergency: boolean;
  total_amount: number;
  service_amount: number;
  coop_charge: number;
  address: string;
  description?: string;
  worker_upi_id?: string;
  worker_upi_qr_url?: string;
}

export interface InvoiceItem {
  label: string;
  amount: number;
}

export interface InvoiceRecord {
  id?: number;
  invoice_no: string;
  booking_id: number;
  date: string;
  created_at?: string;
  total: number;
  worker_wage?: number;
  coop_charge?: number;
  payment_status: string;
  payment_method?: string;
  transaction_ref?: string;
  scheduled_date: string;
  start_time?: string;
  service_name?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  worker_name?: string;
  worker_phone?: string;
  cooperative_name?: string;
  cooperative_area?: string;
  gstin?: string;
  coop_registration_no?: string;
  bank_account_no?: string;
  bank_ifsc?: string;
  bank_name?: string;
  items: InvoiceItem[];
}

export interface AdminDashboardKPIs {
  total_workers: number;
  verified_workers: number;
  pending_verification: number;
  available_workers: number;
  active_bookings: number;
  completed_bookings: number;
  emergency_requests_open: number;
  total_revenue: number;
  avg_platform_rating: number;
}

export interface AdminWorkerItem {
  id: number;
  name: string;
  phone: string;
  cooperative: string;
  cooperative_id: number;
  verification_status: VerificationStatus;
  is_available: boolean;
  avg_rating: number;
  rating_count: number;
  experience_years: number;
  address: string;
  skills: string[];
  certifications: string[];
  created_at: string;
}

export interface DemandForecastResult {
  service_id?: number;
  service_name?: string;
  area: string;
  period_days: number;
  historical_bookings_60d: number;
  expected_requests: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  available_verified_workers: number;
  shortage: number;
  mode: string;
  forecast_id?: number;
}

export interface WorkforceAllocationResult {
  allocation_id: number;
  service_name: string;
  area: string;
  expected_demand: number;
  available_workers: number;
  shortage: number;
  recommendation: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  governance_rule: string;
}

export interface WelfareEnrollment {
  id: number;
  worker_id: number;
  benefit_id: number;
  benefit_name: string;
  status: string;
  enrolled_at: string;
}

export interface InsurancePolicyRecord {
  id: number;
  worker_id: number;
  provider_name: string;
  policy_ref: string;
  coverage_type: string;
  status: string;
  effective_date?: string;
  expiry_date?: string;
  is_demo: boolean;
  demo_notice: string;
}

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  is_read: boolean;
  date: string;
}
