import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import { UserProfile, Role } from "../types";

export interface WorkerProfileData {
  id: string;
  primary_skill: string;
  experience_years: number;
  is_available: boolean;
  cooperative_score: number;
  verification_status: string;
}

export interface GenericProfile {
  id: string | number;
  full_name: string;
  phone: string;
  role: string;
  city?: string;
  address?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  profile: GenericProfile | null;
  workerProfile: WorkerProfileData | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, pass?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  quickLogin: (role: "CUSTOMER" | "WORKER") => Promise<UserProfile>;
  switchPersona: (role: "customer" | "worker") => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  workerProfile: null,
  token: null,
  loading: true,
  login: async () => { throw new Error("Unimplemented"); },
  logout: async () => {},
  signOut: async () => {},
  quickLogin: async () => { throw new Error("Unimplemented"); },
  switchPersona: async () => { throw new Error("Unimplemented"); },
});

export function MobileAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore saved session from AsyncStorage
    Promise.all([
      AsyncStorage.getItem("ondemand_mobile_user"),
      AsyncStorage.getItem("ondemand_mobile_token"),
    ]).then(([savedUser, savedToken]) => {
      if (savedUser && savedToken) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch {
          // Ignore
        }
      }
      setLoading(false);
    });
  }, []);

  const login = async (phone: string): Promise<UserProfile> => {
    const cleanPhone = phone.trim().replace(/[^\d+]/g, "");

    let appUser: UserProfile;

    try {
      // 1. Try to fetch profile from Supabase
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", cleanPhone)
        .single();

      if (!pErr && profile) {
        let worker_id: number | undefined;
        let customer_id: number | undefined;

        if (profile.role === "WORKER") {
          const { data: worker } = await supabase
            .from("workers")
            .select("id")
            .eq("user_id_num", profile.user_id_num)
            .single();
          worker_id = worker ? worker.id : profile.user_id_num;
        } else {
          const { data: customer } = await supabase
            .from("customers")
            .select("id")
            .eq("user_id_num", profile.user_id_num)
            .single();
          customer_id = customer ? customer.id : profile.user_id_num;
        }

        appUser = {
          id: profile.user_id_num || profile.id,
          name: profile.name || profile.full_name || "Cooperative Member",
          phone: profile.phone,
          email: profile.email || undefined,
          role: profile.role as Role,
          worker_id,
          customer_id,
          address: profile.role === "WORKER" ? "Chennai Central, Tamil Nadu" : "142 Crosscut Road, Gandhipuram",
        };
      } else {
        // Fallback demo user if network or seed profile not present
        const isWorker = cleanPhone === "9010000001";
        appUser = {
          id: isWorker ? 1 : 11,
          name: isWorker ? "Suresh Kumar" : "Meena Sundaram",
          phone: cleanPhone,
          role: isWorker ? "WORKER" : "CUSTOMER",
          worker_id: isWorker ? 1 : undefined,
          customer_id: isWorker ? undefined : 11,
          address: isWorker ? "Royapettah, Chennai" : "14 Anna Nagar, Chennai",
        };
      }
    } catch {
      const isWorker = cleanPhone === "9010000001";
      appUser = {
        id: isWorker ? 1 : 11,
        name: isWorker ? "Suresh Kumar" : "Meena Sundaram",
        phone: cleanPhone,
        role: isWorker ? "WORKER" : "CUSTOMER",
        worker_id: isWorker ? 1 : undefined,
        customer_id: isWorker ? undefined : 11,
        address: isWorker ? "Royapettah, Chennai" : "14 Anna Nagar, Chennai",
      };
    }

    const sessionToken = `sb-mobile-token-${appUser.id}-${Date.now()}`;

    await AsyncStorage.setItem("ondemand_mobile_user", JSON.stringify(appUser));
    await AsyncStorage.setItem("ondemand_mobile_token", sessionToken);
    await AsyncStorage.setItem("ondemand_user", JSON.stringify(appUser));
    await AsyncStorage.setItem("ondemand_token", sessionToken);

    setUser(appUser);
    setToken(sessionToken);
    return appUser;
  };

  const quickLogin = async (role: "CUSTOMER" | "WORKER"): Promise<UserProfile> => {
    const targetPhone = role === "CUSTOMER" ? "9000000011" : "9010000001";
    return login(targetPhone);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("ondemand_mobile_user");
    await AsyncStorage.removeItem("ondemand_mobile_token");
    await AsyncStorage.removeItem("ondemand_user");
    await AsyncStorage.removeItem("ondemand_token");
    setUser(null);
    setToken(null);
  };

  const switchPersona = async (role: "customer" | "worker"): Promise<UserProfile> => {
    return quickLogin(role.toUpperCase() as "CUSTOMER" | "WORKER");
  };

  // Derive profile and workerProfile objects
  const profile: GenericProfile | null = user
    ? {
        id: user.id,
        full_name: user.name,
        phone: user.phone,
        role: user.role,
        city: user.address?.split(",")[0] || "Chennai",
        address: user.address,
      }
    : null;

  const workerProfile: WorkerProfileData | null = user
    ? {
        id: String(user.worker_id || "worker-demo-1"),
        primary_skill: "Certified Electrician",
        experience_years: 7,
        is_available: true,
        cooperative_score: 98,
        verification_status: "VERIFIED",
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        workerProfile,
        token,
        loading,
        login,
        logout,
        signOut: logout,
        quickLogin,
        switchPersona,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
