import { getAdminToken, adminLogout } from './adminAuth';

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
    ?.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

const ADMIN_TOKEN_KEY = 'adminAuthToken';

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAdminToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    // Try refreshing the access token
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const newToken = data.token || data.accessToken;
        if (newToken) {
          localStorage.setItem(ADMIN_TOKEN_KEY, newToken);
          // Retry original request with new token
          const retryHeaders = new Headers(init?.headers);
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
          return fetch(input, { ...init, headers: retryHeaders });
        }
      }
    } catch {
      // refresh failed
    }
    adminLogout();
    window.location.href = '/admin/login';
  }
  return res;
}

export interface AdminUserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  user_type: string;
  created_at: string;
}

export interface AdminCampaignItem {
  id: number;
  title: string;
  description: string;
  contact_email: string;
  location: string;
  category: string;
  campaign_type: string;
  status: string;
  image_url: string;
  goals: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface AdminInquiryItem {
  id: number;
  campaign_id: number;
  campaign_title: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface AdminSupportItem {
  id: number;
  campaign_id: number;
  campaign_title: string;
  user_id: number;
  user_name: string;
  user_email: string;
  amount: number;
  created_at: string;
}

export async function fetchAdminUsers(): Promise<AdminUserItem[]> {
  try {
    const res = await adminFetch(`${API_BASE_URL}/admin/users?limit=100`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchAdminCampaigns(): Promise<AdminCampaignItem[]> {
  try {
    const res = await adminFetch(`${API_BASE_URL}/admin/campaigns?limit=100`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchAdminInquiries(): Promise<AdminInquiryItem[]> {
  try {
    const res = await adminFetch(
      `${API_BASE_URL}/admin/campaigns/inquiries?limit=100`,
      {
        headers: authHeaders(),
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchAdminSupports(): Promise<AdminSupportItem[]> {
  try {
    const res = await adminFetch(
      `${API_BASE_URL}/admin/campaigns/supports?limit=100`,
      {
        headers: authHeaders(),
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchCampaignInquiries(
  campaignId: number,
): Promise<AdminInquiryItem[]> {
  try {
    const res = await adminFetch(
      `${API_BASE_URL}/admin/campaigns/${campaignId}/inquiries`,
      {
        headers: authHeaders(),
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchCampaignSupports(
  campaignId: number,
): Promise<AdminSupportItem[]> {
  try {
    const res = await adminFetch(
      `${API_BASE_URL}/admin/campaigns/${campaignId}/supports`,
      {
        headers: authHeaders(),
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function updateCampaignStatus(
  campaignId: number,
  status: 'pending' | 'active' | 'rejected',
): Promise<boolean> {
  try {
    const res = await adminFetch(
      `${API_BASE_URL}/admin/campaigns/approve/${campaignId}`,
      {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}
