export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      federations: {
        Row: {
          id: number
          name: string
          region: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          region?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          region?: string
          created_at?: string
          updated_at?: string
        }
      }
      cooperatives: {
        Row: {
          id: number
          federation_id: number | null
          name: string
          area: string
          lat: number
          lng: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          federation_id?: number | null
          name: string
          area?: string
          lat?: number
          lng?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          federation_id?: number | null
          name?: string
          area?: string
          lat?: number
          lng?: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string // auth.users uuid
          user_id_num: number // sequential integer ID for legacy compatibility
          name: string
          phone: string
          email: string | null
          role: "CUSTOMER" | "WORKER" | "COOP_ADMIN" | "FED_ADMIN"
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id_num?: number
          name: string
          phone: string
          email?: string | null
          role?: "CUSTOMER" | "WORKER" | "COOP_ADMIN" | "FED_ADMIN"
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id_num?: number
          name?: string
          phone?: string
          email?: string | null
          role?: "CUSTOMER" | "WORKER" | "COOP_ADMIN" | "FED_ADMIN"
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: number
          profile_id: string | null
          user_id_num: number | null
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          profile_id?: string | null
          user_id_num?: number | null
          address?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          profile_id?: string | null
          user_id_num?: number | null
          address?: string
          created_at?: string
          updated_at?: string
        }
      }
      workers: {
        Row: {
          id: number
          profile_id: string | null
          user_id_num: number | null
          cooperative_id: number | null
          address: string
          experience_years: number
          verification_status: "REGISTERED" | "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED"
          is_available: boolean
          avg_rating: number
          rating_count: number
          base_lat: number
          base_lng: number
          service_radius_km: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          profile_id?: string | null
          user_id_num?: number | null
          cooperative_id?: number | null
          address?: string
          experience_years?: number
          verification_status?: "REGISTERED" | "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED"
          is_available?: boolean
          avg_rating?: number
          rating_count?: number
          base_lat?: number
          base_lng?: number
          service_radius_km?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          profile_id?: string | null
          user_id_num?: number | null
          cooperative_id?: number | null
          address?: string
          experience_years?: number
          verification_status?: "REGISTERED" | "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED"
          is_available?: boolean
          avg_rating?: number
          rating_count?: number
          base_lat?: number
          base_lng?: number
          service_radius_km?: number
          created_at?: string
          updated_at?: string
        }
      }
      service_categories: {
        Row: {
          id: number
          name: string
          description: string
        }
        Insert: {
          id?: number
          name: string
          description?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
        }
      }
      skills: {
        Row: {
          id: number
          name: string
          category: string
          requires_certification: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          category?: string
          requires_certification?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          category?: string
          requires_certification?: boolean
          created_at?: string
        }
      }
      services: {
        Row: {
          id: number
          category_id: number | null
          name: string
          description: string
          base_price: number
          worker_earning: number
          coop_charge: number
          requires_certification: boolean
          skill_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          category_id?: number | null
          name: string
          description?: string
          base_price?: number
          worker_earning?: number
          coop_charge?: number
          requires_certification?: boolean
          skill_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          category_id?: number | null
          name?: string
          description?: string
          base_price?: number
          worker_earning?: number
          coop_charge?: number
          requires_certification?: boolean
          skill_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: number
          customer_id: number
          worker_id: number
          service_id: number
          scheduled_date: string
          start_time: string
          duration_min: number
          lat: number
          lng: number
          address: string
          description: string
          status: string
          is_emergency: boolean
          service_amount: number
          coop_charge: number
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          customer_id: number
          worker_id: number
          service_id: number
          scheduled_date: string
          start_time: string
          duration_min?: number
          lat?: number
          lng?: number
          address?: string
          description?: string
          status?: string
          is_emergency?: boolean
          service_amount?: number
          coop_charge?: number
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          customer_id?: number
          worker_id?: number
          service_id?: number
          scheduled_date?: string
          start_time?: string
          duration_min?: number
          lat?: number
          lng?: number
          address?: string
          description?: string
          status?: string
          is_emergency?: boolean
          service_amount?: number
          coop_charge?: number
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: number
          booking_id: number
          amount: number
          provider: string
          provider_ref: string
          status: string
          is_demo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          booking_id: number
          amount: number
          provider?: string
          provider_ref?: string
          status?: string
          is_demo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          booking_id?: number
          amount?: number
          provider?: string
          provider_ref?: string
          status?: string
          is_demo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: number
          booking_id: number
          invoice_no: string
          total: number
          payment_status: string
          created_at: string
        }
        Insert: {
          id?: number
          booking_id: number
          invoice_no: string
          total: number
          payment_status?: string
          created_at?: string
        }
        Update: {
          id?: number
          booking_id?: number
          invoice_no?: string
          total?: number
          payment_status?: string
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: number
          booking_id: number
          worker_id: number
          customer_id: number
          stars: number
          created_at: string
        }
        Insert: {
          id?: number
          booking_id: number
          worker_id: number
          customer_id: number
          stars: number
          created_at?: string
        }
        Update: {
          id?: number
          booking_id?: number
          worker_id?: number
          customer_id?: number
          stars?: number
          created_at?: string
        }
      }
    }
  }
}
