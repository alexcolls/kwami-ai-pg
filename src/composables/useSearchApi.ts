import { useAuthStore } from '@/stores/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface SearchResultItem {
  title: string;
  url: string;
  content: string;
}

export interface SearchApiResponse {
  query: string;
  results: SearchResultItem[];
  answer: string | null;
}

async function authHeaders(): Promise<HeadersInit> {
  const authStore = useAuthStore();
  const token = await authStore.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function searchWeb(query: string, maxResults = 5): Promise<SearchApiResponse> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, max_results: maxResults }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail || `Search failed: ${res.status}`);
  }
  return res.json();
}
