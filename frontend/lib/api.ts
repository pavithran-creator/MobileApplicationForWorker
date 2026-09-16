export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ondemand_token");
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("ondemand_token", token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ondemand_token");
    localStorage.removeItem("ondemand_user");
  }
}

export interface StoredUser {
  name: string;
  role: string;
  id?: number;
  worker_id?: number;
  customer_id?: number;
  phone?: string;
  address?: string;
}

export function getCurrentUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("ondemand_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: StoredUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("ondemand_user", JSON.stringify(user));
  }
}

export function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEp = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEp}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...(options.headers || {}),
  };

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    if (err?.message === "Failed to fetch" || err?.name === "TypeError") {
      throw new Error("Unable to connect to the cooperative service. Please try again.");
    }
    throw err;
  }

  if (!res.ok) {
    let errorDetail = `HTTP Error ${res.status}`;
    try {
      const errorJson = await res.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail || `HTTP Error ${res.status}`);
  }

  return await res.json();
}
