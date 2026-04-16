import type { AdminUser } from '../types/admin.types';

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
    ?.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

const ADMIN_TOKEN_KEY = 'adminAuthToken';
const ADMIN_USER_KEY = 'adminUser';

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return {
        success: false,
        message: 'Server error: Invalid response format.',
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Login failed' };
    }

    const token = data.token || data.accessToken || '';
    if (!token) {
      return { success: false, message: 'No token received from server.' };
    }

    // Decode JWT to check role
    const payload = parseJwtPayload(token);
    if (!payload || payload.role !== 'admin') {
      return {
        success: false,
        message: 'Access denied. Admin privileges required.',
      };
    }

    const adminUser: AdminUser = {
      id: String(payload.id || ''),
      name: data.name || email.split('@')[0],
      email,
      role: 'admin',
    };

    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unexpected error';
    return { success: false, message: `Connection error: ${msg}` };
  }
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminUser(): AdminUser | null {
  const raw = localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken() && !!getAdminUser();
}

export function adminLogout(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

export interface AdminDashboardData {
  totalCampaigns: number;
  totalUsers: number;
  totalInquiries: number;
  totalSupports: number;
  totalFunding: number;
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData | null> {
  try {
    const token = getAdminToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
