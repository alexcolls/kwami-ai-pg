import { useAuthStore } from '@/stores/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreditBalance {
  balance: number;
  balance_credits: number;
  lifetime_purchased: number;
  lifetime_used: number;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  price_display: string;
  popular: boolean;
}

export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'bonus' | 'refund';
  amount: number;
  balance_after: number;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface CreditUsageLog {
  id: string;
  session_id: string;
  model_type: 'stt' | 'llm' | 'tts' | 'realtime';
  model_id: string;
  units_used: number;
  cost_usd: number;
  credits_charged: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function authHeaders(): Promise<HeadersInit> {
  const authStore = useAuthStore();
  const token = await authStore.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function fetchBalance(): Promise<CreditBalance> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/credits/balance`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch balance: ${res.status}`);
  return res.json();
}

export async function fetchPacks(): Promise<CreditPack[]> {
  const res = await fetch(`${API_BASE}/credits/packs`);
  if (!res.ok) throw new Error(`Failed to fetch packs: ${res.status}`);
  const data = await res.json();
  return data.packs;
}

export async function createCheckoutSession(
  packId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/credits/purchase`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      pack_id: packId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Purchase failed: ${res.status}`);
  }
  const data = await res.json();
  return data.checkout_url;
}

export async function fetchTransactions(
  limit = 50,
  offset = 0,
): Promise<{ transactions: CreditTransaction[]; count: number }> {
  const headers = await authHeaders();
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const res = await fetch(`${API_BASE}/credits/transactions?${params}`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`);
  return res.json();
}

export async function fetchUsageLogs(
  limit = 50,
  offset = 0,
  sessionId?: string,
): Promise<{ logs: CreditUsageLog[]; count: number }> {
  const headers = await authHeaders();
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (sessionId) params.set('session_id', sessionId);
  const res = await fetch(`${API_BASE}/credits/usage?${params}`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch usage logs: ${res.status}`);
  return res.json();
}
