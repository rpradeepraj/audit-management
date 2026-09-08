import { API_ROUTES } from "../routes";

const TOKEN_KEY = "ams_jwt_token";

// ==========================================
// 1. Local Token Helpers
// ==========================================
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// ==========================================
// 2. Auth API Methods
// ==========================================
export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  error?: string;
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(API_ROUTES.AUTH.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data: AuthResponse = await response.json();

    if (response.ok && data.success && data.token) {
      setToken(data.token);
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to reach authentication server.",
    };
  }
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const token = getToken();
  if (!token) {
    return { success: false, error: "No active session." };
  }

  try {
    const response = await fetch(API_ROUTES.AUTH.ME, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      removeToken();
      return { success: false, error: "Session expired." };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    return { success: false, error: error?.message || "Network error." };
  }
}

export function logoutUser(): void {
  removeToken();
}

export const authService = {
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  login: loginUser,
  getCurrentUser,
  logout: logoutUser,
};

export default authService;
