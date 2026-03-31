export type CampaignType = 'cause' | 'business';

export interface CreateCampaignInput {
  title: string;
  description: string;
  type: CampaignType;
  category: string;
  location: string;
  contact_email: string;
  goal: string;
  startDate: string;
  endDate: string;
  supporters: string;
  imageFile: File | null;
  imagePreview: string;
}

export interface CreateCampaignPayload {
  title: string;
  description: string;
  contact_email: string;
  location: string;
  category: string;
  campaign_type: CampaignType;
  goals: string;
  image_url: string;
  start_date: string;
  end_date: string;
}

export interface CreatedCampaign {
  campaignId?: number;
  id?: string;
  status?: 'submitted';
  createdAt?: string;
}

export interface CreateCampaignResponse {
  success: boolean;
  message: string;
  data?: CreatedCampaign;
}

export interface CampaignListItem {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  type: CampaignType;
  category: string;
  startDate: string;
  endDate?: string;
  supporters: string;
  location: string;
  contact: string;
  goals: string[];
  upvotes: number;
  downvotes: number;
  videoUrl?: string;
}

export interface FetchCampaignsResponse {
  success: boolean;
  message: string;
  data: CampaignListItem[];
}

export interface UserCampaignItem {
  id: string;
  title: string;
  description: string;
  image: string;
  type: CampaignType;
  category: string;
  status: 'Active' | 'Pending' | 'Completed';
  supporters: string;
  startDate: string;
}

export interface FetchMyCampaignsResponse {
  success: boolean;
  message: string;
  data: UserCampaignItem[];
}

export interface DeleteCampaignResponse {
  success: boolean;
  message: string;
}

export interface CampaignVotesResponse {
  success: boolean;
  message: string;
  data?: {
    upvotes: number;
    downvotes: number;
    userVote: 'upvote' | 'downvote' | null;
  };
}

export interface VoteCampaignResponse {
  success: boolean;
  message: string;
  data?: {
    upvotes: number;
    downvotes: number;
    userVote: 'upvote' | 'downvote' | null;
  };
}

export interface SupportCampaignInput {
  name: string;
  email: string;
  message: string;
  amount: string;
}

export interface SupportCampaignResponse {
  success: boolean;
  message: string;
}

export interface InquiryCampaignInput {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface InquiryCampaignResponse {
  success: boolean;
  message: string;
}

function resolveStoredAuthToken() {
  const rawToken =
    localStorage.getItem('authToken') ?? localStorage.getItem('token') ?? '';

  if (!rawToken) {
    return '';
  }

  const trimmedToken = rawToken.trim();

  if (!trimmedToken) {
    return '';
  }

  // Handles cases where token was stored as JSON string, e.g. "eyJ..."
  if (trimmedToken.startsWith('"') && trimmedToken.endsWith('"')) {
    try {
      return JSON.parse(trimmedToken);
    } catch {
      return trimmedToken.replace(/^"|"$/g, '');
    }
  }

  return trimmedToken;
}

const env =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
    .env ?? {};

const API_BASE_URL = env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const REFRESH_TOKEN_ENDPOINT =
  env.VITE_REFRESH_TOKEN_ENDPOINT ?? `${API_BASE_URL}/auth/refresh`;
const USE_MOCK_CAMPAIGN_API = env.VITE_USE_MOCK_CAMPAIGN_API === 'true';
const CREATE_CAMPAIGN_ENDPOINT = `${API_BASE_URL}/campaigns/create`;
const LIST_CAMPAIGN_ENDPOINTS = [
  `${API_BASE_URL}/campaigns/camapigns`,
  `${API_BASE_URL}/campaigns/campaigns`,
  `${API_BASE_URL}/campaigns`,
];
const MY_CAMPAIGNS_ENDPOINT = `${API_BASE_URL}/campaigns/my-campaigns`;
const CAMPAIGNS_ENDPOINT = `${API_BASE_URL}/campaigns`;
const DEFAULT_CAMPAIGN_IMAGE = '/uploads/default-campaign.svg';
let activeRefreshRequest: Promise<string | null> | null = null;

function broadcastTokenUpdate(token: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent('auth:token-updated', {
      detail: { token },
    }),
  );
}

function broadcastLogout() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event('auth:logout'));
}

function clearStoredAuthSession() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

async function refreshAccessToken(): Promise<string | null> {
  if (activeRefreshRequest) {
    return activeRefreshRequest;
  }

  activeRefreshRequest = (async () => {
    try {
      const response = await fetch(REFRESH_TOKEN_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      let payload: any = {};

      if (contentType?.includes('application/json')) {
        payload = await response.json();
      }

      if (!response.ok) {
        return null;
      }

      const nextToken = String(
        payload?.token ??
          payload?.accessToken ??
          payload?.data?.token ??
          payload?.data?.accessToken ??
          '',
      ).trim();

      if (!nextToken) {
        return null;
      }

      localStorage.setItem('authToken', nextToken);
      broadcastTokenUpdate(nextToken);
      return nextToken;
    } catch {
      return null;
    }
  })().finally(() => {
    activeRefreshRequest = null;
  });

  const refreshedToken = await activeRefreshRequest;

  if (!refreshedToken) {
    clearStoredAuthSession();
    broadcastLogout();

    if (
      typeof window !== 'undefined' &&
      window.location.pathname !== '/login'
    ) {
      window.location.assign('/login');
    }
  }

  return refreshedToken;
}

async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const baseHeaders = new Headers(init.headers ?? {});
  const currentToken = resolveStoredAuthToken();

  if (currentToken && !baseHeaders.has('Authorization')) {
    baseHeaders.set('Authorization', `Bearer ${currentToken}`);
  }

  const response = await fetch(input, {
    ...init,
    headers: baseHeaders,
    credentials: init.credentials ?? 'include',
  });

  if (response.status !== 401 || !currentToken) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    return response;
  }

  const retryHeaders = new Headers(init.headers ?? {});
  retryHeaders.set('Authorization', `Bearer ${refreshedToken}`);

  return fetch(input, {
    ...init,
    headers: retryHeaders,
    credentials: init.credentials ?? 'include',
  });
}

function getApiOrigin() {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
}

function resolveCampaignImageUrl(value: unknown) {
  if (typeof value !== 'string') {
    return DEFAULT_CAMPAIGN_IMAGE;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return DEFAULT_CAMPAIGN_IMAGE;
  }

  if (/^(https?:|data:|blob:)/i.test(trimmedValue)) {
    return trimmedValue;
  }

  const normalizedPath = trimmedValue.replace(/\\/g, '/');

  const apiOrigin = getApiOrigin();
  if (!apiOrigin) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith('/')) {
    return `${apiOrigin}${normalizedPath}`;
  }

  if (normalizedPath.includes('/')) {
    const cleanedPath = normalizedPath.replace(/^\.\//, '');
    return `${apiOrigin}/${cleanedPath}`;
  }

  return `${apiOrigin}/uploads/${normalizedPath}`;
}

function formatSupporters(value: unknown) {
  if (typeof value === 'number') {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }

    return String(value);
  }

  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return '0';
}

function normalizeGoals(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((goal) => String(goal).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|;/)
      .map((goal) => goal.trim())
      .filter(Boolean);
  }

  return [];
}

function extractCampaignArray(payload: any): any[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.campaigns)) {
    return payload.campaigns;
  }

  if (Array.isArray(payload?.data?.campaigns)) {
    return payload.data.campaigns;
  }

  return [];
}

function mapCampaignListItem(record: any): CampaignListItem {
  const goals = normalizeGoals(record?.goals ?? record?.goal);
  const description =
    record?.description?.trim?.() || 'No campaign description available yet.';
  const location = record?.location?.trim?.() || 'Online';
  const contact =
    record?.contact_email?.trim?.() ||
    record?.contact?.trim?.() ||
    'Not provided';

  return {
    id: String(record?.id ?? record?.campaignId ?? crypto.randomUUID()),
    title: record?.title?.trim?.() || 'Untitled campaign',
    description,
    fullDescription: record?.fullDescription?.trim?.() || description,
    image: resolveCampaignImageUrl(record?.image_url ?? record?.image),
    type:
      record?.campaign_type === 'business' || record?.type === 'business'
        ? 'business'
        : 'cause',
    category: record?.category?.trim?.() || 'General',
    startDate:
      record?.start_date?.trim?.() || record?.startDate?.trim?.() || 'TBD',
    endDate:
      record?.end_date?.trim?.() || record?.endDate?.trim?.() || undefined,
    supporters: formatSupporters(record?.supporters),
    location,
    contact,
    goals:
      goals.length > 0 ? goals : ['Campaign goals will be announced soon.'],
    upvotes: Number(record?.upvotes) || 0,
    downvotes: Number(record?.downvotes) || 0,
    videoUrl:
      record?.video_url?.trim?.() || record?.videoUrl?.trim?.() || undefined,
  };
}

function mapCampaignStatus(value: unknown): 'Active' | 'Pending' | 'Completed' {
  const normalizedValue = String(value ?? '')
    .trim()
    .toLowerCase();

  if (
    normalizedValue === 'active' ||
    normalizedValue === 'approved' ||
    normalizedValue === '1' ||
    normalizedValue === 'true'
  ) {
    return 'Active';
  }

  if (
    normalizedValue === 'completed' ||
    normalizedValue === 'closed' ||
    normalizedValue === 'done'
  ) {
    return 'Completed';
  }

  return 'Pending';
}

function mapUserCampaignItem(record: any): UserCampaignItem {
  return {
    id: String(record?.id ?? record?.campaignId ?? crypto.randomUUID()),
    title: record?.title?.trim?.() || 'Untitled campaign',
    description:
      record?.description?.trim?.() || 'No campaign description available yet.',
    image: resolveCampaignImageUrl(record?.image_url ?? record?.image),
    type:
      record?.campaign_type === 'business' || record?.type === 'business'
        ? 'business'
        : 'cause',
    category: record?.category?.trim?.() || 'General',
    status: mapCampaignStatus(record?.status ?? record?.is_approved),
    supporters: formatSupporters(record?.supporters),
    startDate:
      record?.start_date?.trim?.() || record?.startDate?.trim?.() || 'TBD',
  };
}

function mapCreateCampaignPayload(
  input: CreateCampaignInput,
): CreateCampaignPayload {
  const resolvedContactEmail =
    (input as CreateCampaignInput & { contact?: string }).contact_email ??
    (input as CreateCampaignInput & { contact?: string }).contact ??
    '';

  const resolvedImageUrl = input.imageFile
    ? input.imageFile.name
    : input.imagePreview;

  return {
    title: input.title.trim(),
    description: input.description.trim(),
    contact_email: resolvedContactEmail.trim(),
    location: input.location,
    category: input.category.trim(),
    campaign_type: input.type,
    goals: input.goal.trim(),
    image_url: resolvedImageUrl,
    start_date: input.startDate,
    end_date: input.endDate,
  };
}

async function createCampaignRequest(
  input: CreateCampaignInput,
  payload: CreateCampaignPayload,
): Promise<CreateCampaignResponse> {
  try {
    const authToken = resolveStoredAuthToken();
    const headers: Record<string, string> = {};

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const hasImageFile = Boolean(input.imageFile);
    let body: BodyInit;

    if (hasImageFile && input.imageFile) {
      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('description', payload.description);
      formData.append('contact_email', payload.contact_email);
      formData.append('location', payload.location);
      formData.append('category', payload.category);
      formData.append('campaign_type', payload.campaign_type);
      formData.append('goals', payload.goals);
      formData.append('image_url', payload.image_url);
      formData.append('start_date', payload.start_date);
      formData.append('end_date', payload.end_date);
      formData.append('image', input.imageFile);
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(payload);
    }

    const response = await authenticatedFetch(CREATE_CAMPAIGN_ENDPOINT, {
      method: 'POST',
      headers,
      body,
    });

    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      return {
        success: false,
        message: `Campaign API returned an unexpected response: ${text.substring(0, 120)}`,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || data?.error || 'Failed to create campaign.',
      };
    }

    return {
      success: true,
      message: data?.message || 'Campaign created successfully.',
      data: data?.data || data,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return {
      success: false,
      message: `Connection error: ${errorMessage}. The API is expected at ${CREATE_CAMPAIGN_ENDPOINT}`,
    };
  }
}

async function createCampaignMock(
  payload: CreateCampaignPayload,
): Promise<CreateCampaignResponse> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  return {
    success: true,
    message: 'Mock campaign created successfully.',
    data: {
      id: `campaign_${Date.now()}`,
      ...payload,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    },
  };
}

export async function createCampaign(
  input: CreateCampaignInput,
): Promise<CreateCampaignResponse> {
  const payload = mapCreateCampaignPayload(input);

  console.log('Submitting campaign payload:', payload);

  if (USE_MOCK_CAMPAIGN_API) {
    return createCampaignMock(payload);
  }

  return createCampaignRequest(input, payload);
}

export async function fetchCampaigns(): Promise<FetchCampaignsResponse> {
  const authToken = resolveStoredAuthToken();
  const headers: Record<string, string> = {};

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  for (const endpoint of LIST_CAMPAIGN_ENDPOINTS) {
    try {
      const response = await authenticatedFetch(endpoint, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        continue;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        continue;
      }

      const payload = await response.json();
      const campaigns = extractCampaignArray(payload).map(mapCampaignListItem);

      return {
        success: true,
        message: payload?.message || 'Campaigns loaded successfully.',
        data: campaigns,
      };
    } catch {
      continue;
    }
  }

  return {
    success: false,
    message: 'Failed to load campaigns from the API.',
    data: [],
  };
}

export async function fetchMyCampaigns(): Promise<FetchMyCampaignsResponse> {
  const authToken = resolveStoredAuthToken();

  if (!authToken) {
    return {
      success: false,
      message: 'Please log in to view your campaigns.',
      data: [],
    };
  }

  try {
    const response = await authenticatedFetch(MY_CAMPAIGNS_ENDPOINT, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return {
        success: false,
        message: 'Campaign API returned an unexpected response format.',
        data: [],
      };
    }

    const payload = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          payload?.message ||
          payload?.error ||
          'Failed to load your campaigns.',
        data: [],
      };
    }

    const campaigns = extractCampaignArray(payload).map(mapUserCampaignItem);

    return {
      success: true,
      message: payload?.message || 'Your campaigns loaded successfully.',
      data: campaigns,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return {
      success: false,
      message: `Connection error: ${errorMessage}. The API is expected at ${MY_CAMPAIGNS_ENDPOINT}`,
      data: [],
    };
  }
}

export async function deleteCampaign(
  campaignId: string,
): Promise<DeleteCampaignResponse> {
  const authToken = resolveStoredAuthToken();

  if (!authToken) {
    return {
      success: false,
      message: 'Please log in to delete campaigns.',
    };
  }

  try {
    const response = await authenticatedFetch(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(campaignId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const contentType = response.headers.get('content-type');
    let payload: any = {};

    if (contentType?.includes('application/json')) {
      payload = await response.json();
    }

    if (!response.ok) {
      return {
        success: false,
        message:
          payload?.message || payload?.error || 'Failed to delete campaign.',
      };
    }

    return {
      success: true,
      message: payload?.message || 'Campaign deleted successfully.',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return {
      success: false,
      message: `Connection error: ${errorMessage}. The API is expected at ${CAMPAIGNS_ENDPOINT}`,
    };
  }
}

export async function fetchCampaignVotes(
  campaignId: string,
): Promise<CampaignVotesResponse> {
  const authToken = resolveStoredAuthToken();

  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/campaigns/${encodeURIComponent(campaignId)}/votes`,
      {
        method: 'GET',
        headers: authToken
          ? {
              Authorization: `Bearer ${authToken}`,
            }
          : undefined,
      },
    );

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return {
        success: false,
        message: 'Campaign votes API returned an unexpected response format.',
      };
    }

    const payload = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          payload?.message ||
          payload?.error ||
          'Failed to fetch campaign votes.',
      };
    }

    return {
      success: true,
      message: payload?.message || 'Campaign votes loaded successfully.',
      data: {
        upvotes: Number(payload?.upvotes) || 0,
        downvotes: Number(payload?.downvotes) || 0,
        userVote:
          payload?.userVote === 'upvote' || payload?.userVote === 'downvote'
            ? payload.userVote
            : null,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return {
      success: false,
      message: `Connection error: ${errorMessage}. The API is expected at ${CAMPAIGNS_ENDPOINT}/${campaignId}/votes`,
    };
  }
}

export async function voteCampaign(
  campaignId: string,
  voteType: 'upvote' | 'downvote',
): Promise<VoteCampaignResponse> {
  const authToken = resolveStoredAuthToken();

  if (!authToken) {
    return {
      success: false,
      message: 'Please log in again to vote. Missing auth token.',
    };
  }

  try {
    const response = await authenticatedFetch(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(campaignId)}/vote`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ vote_type: voteType }),
      },
    );

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return {
        success: false,
        message: 'Campaign vote API returned an unexpected response format.',
      };
    }

    const payload = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          payload?.message ||
          payload?.error ||
          (response.status === 401
            ? 'Unauthorized. Please log in again.'
            : 'Failed to submit vote.'),
      };
    }

    return {
      success: true,
      message: payload?.message || 'Vote submitted successfully.',
      data: {
        upvotes: Number(payload?.upvotes) || 0,
        downvotes: Number(payload?.downvotes) || 0,
        userVote:
          payload?.userVote === 'upvote' || payload?.userVote === 'downvote'
            ? payload.userVote
            : null,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return {
      success: false,
      message: `Connection error: ${errorMessage}. The API is expected at ${CAMPAIGNS_ENDPOINT}/${campaignId}/vote`,
    };
  }
}

export async function supportCampaign(
  campaignId: string,
  payload: SupportCampaignInput,
): Promise<SupportCampaignResponse> {
  const authToken = resolveStoredAuthToken();

  if (!authToken) {
    return {
      success: false,
      message: 'Please log in to support this campaign.',
    };
  }

  try {
    const response = await authenticatedFetch(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(campaignId)}/support`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const contentType = response.headers.get('content-type');
    let data: any = {};

    if (contentType?.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || data?.error || 'Failed to support campaign.',
      };
    }

    return {
      success: true,
      message: data?.message || 'Support submitted successfully.',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return {
      success: false,
      message: `Connection error: ${errorMessage}. The API is expected at ${CAMPAIGNS_ENDPOINT}/${campaignId}/support`,
    };
  }
}

export async function inquiryCampaign(
  campaignId: string,
  payload: InquiryCampaignInput,
): Promise<InquiryCampaignResponse> {
  const authToken = resolveStoredAuthToken();

  if (!authToken) {
    return {
      success: false,
      message: 'Please log in to submit an inquiry.',
    };
  }

  try {
    const response = await authenticatedFetch(
      `${CAMPAIGNS_ENDPOINT}/${encodeURIComponent(campaignId)}/inquiry`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const contentType = response.headers.get('content-type');
    let data: any = {};

    if (contentType?.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || data?.error || 'Failed to submit inquiry.',
      };
    }

    return {
      success: true,
      message: data?.message || 'Inquiry submitted successfully.',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return {
      success: false,
      message: `Connection error: ${errorMessage}. The API is expected at ${CAMPAIGNS_ENDPOINT}/${campaignId}/inquiry`,
    };
  }
}
