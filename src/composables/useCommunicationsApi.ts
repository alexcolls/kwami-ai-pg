import { useAuthStore } from '@/stores/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface ChannelRecord {
  id: string;
  kwami_id: string;
  kind: 'voice_phone' | 'whatsapp';
  provider: string;
  status: string;
  phone_number: string;
  display_name?: string | null;
  provider_sender?: string | null;
  capabilities?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface CallEventRecord {
  id: string;
  provider_call_sid?: string | null;
  from_number?: string | null;
  to_number?: string | null;
  status: string;
  created_at: string;
}

export interface MessageEventRecord {
  id: string;
  provider_message_sid?: string | null;
  from_address?: string | null;
  to_address?: string | null;
  provider_status?: string | null;
  body?: string | null;
  created_at: string;
}

export interface KwamiCommunicationsSnapshot {
  kwami: {
    id: string;
    name: string;
    runtimeConfig: Record<string, unknown>;
  };
  channels: ChannelRecord[];
  events: {
    calls: CallEventRecord[];
    messages: MessageEventRecord[];
  };
}

export interface NumberSearchResult {
  phoneNumber: string;
  friendlyName: string;
  region?: string;
  locality?: string;
  postalCode?: string;
  capabilities?: Record<string, boolean>;
}

async function authHeaders(): Promise<HeadersInit> {
  const authStore = useAuthStore();
  const token = await authStore.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchKwamiCommunications(kwamiId: string): Promise<KwamiCommunicationsSnapshot> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/channels/kwamis/${kwamiId}`, { headers });
  return parseJson<KwamiCommunicationsSnapshot>(res);
}

export async function searchKwamiNumbers(
  kwamiId: string,
  params: {
    countryCode: string;
    areaCode?: string;
    contains?: string;
    limit?: number;
  },
): Promise<NumberSearchResult[]> {
  const headers = await authHeaders();
  const query = new URLSearchParams({
    kwamiId,
    countryCode: params.countryCode,
    ...(params.areaCode ? { areaCode: params.areaCode } : {}),
    ...(params.contains ? { contains: params.contains } : {}),
    ...(params.limit ? { limit: String(params.limit) } : {}),
  });
  const res = await fetch(`${API_BASE}/channels/phone/search?${query}`, { headers });
  const data = await parseJson<{ results: NumberSearchResult[] }>(res);
  return data.results;
}

export async function purchaseKwamiNumber(payload: {
  kwamiId: string;
  phoneNumber: string;
  displayName?: string;
  countryCode: string;
}) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/channels/phone/purchase`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function configureWhatsappChannel(payload: {
  channelId: string;
  status?: string;
  providerSender?: string;
  metadata?: Record<string, unknown>;
}) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/channels/whatsapp/configure`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function startOutboundCall(payload: {
  kwamiId: string;
  toNumber: string;
  channelId?: string;
  waitUntilAnswered?: boolean;
}) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/channels/calls/outbound`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function sendWhatsappMessage(payload: {
  kwamiId: string;
  toNumber: string;
  body: string;
  channelId?: string;
}) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/channels/messages/outbound`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}
