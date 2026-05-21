const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ──

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  experience_level: string;
  timezone: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user_id: number;
  name: string;
  email: string;
};

export type AuthError = {
  detail: string;
  status: number;
};

// ── Token storage ──

const TOKEN_KEY = "finpulse_token";
const REFRESH_KEY = "finpulse_refresh";
const USER_KEY = "finpulse_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function saveAuth(data: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(REFRESH_KEY, data.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify({
    id: data.user_id,
    name: data.name,
    email: data.email,
    experience_level: "intermedio",
    timezone: "Europe/Madrid",
  }));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── API calls ──

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Error del servidor" }));
    const err: AuthError = { detail: body.detail || "Error desconocido", status: res.status };
    throw err;
  }

  return res.json();
}

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  saveAuth(data);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveAuth(data);
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const token = getToken();
  if (!token) throw { detail: "No hay sesion", status: 401 } as AuthError;

  return authFetch<AuthUser>("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function refreshSession(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const data = await authFetch<{ access_token: string; refresh_token: string }>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refresh }),
    });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
    return true;
  } catch {
    clearAuth();
    return false;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
