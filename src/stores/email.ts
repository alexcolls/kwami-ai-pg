import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useWorkspaceStore } from '@/stores/workspace';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export type EmailCategory =
  | 'all'
  | 'travel'
  | 'bills'
  | 'events'
  | 'newsletters'
  | 'personal'
  | 'notifications'
  | 'shopping'
  | 'work'
  | 'uncategorized';

export interface EmailAccount {
  id: string;
  username: string;
  email_address: string;
  is_active: boolean;
}

export interface EmailMessage {
  id: string;
  account_id: string;
  direction: 'inbound' | 'outbound';
  from_address: string;
  to_addresses: string[];
  cc_addresses: string[];
  subject: string;
  body_text: string;
  body_html: string;
  category: EmailCategory;
  action_card_data: Record<string, unknown>;
  is_read: boolean;
  is_archived: boolean;
  is_starred: boolean;
  received_at: string;
  created_at: string;
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
    const err = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const detail = err.detail ?? err.message;
    throw new Error(
      typeof detail === 'string' ? detail : `Request failed: ${res.status}`,
    );
  }
  return res.json() as Promise<T>;
}

export const useEmailStore = defineStore('email', () => {
  const account = ref<EmailAccount | null>(null);
  const messages = ref<EmailMessage[]>([]);
  const activeCategory = ref<EmailCategory>('all');
  const unreadCounts = ref<Record<string, number>>({});
  const selectedMessageId = ref<string | null>(null);

  const isLoading = ref(false);
  const isActivating = ref(false);
  const isCheckingUsername = ref(false);
  const isSending = ref(false);

  const isActivated = computed(() => !!account.value?.is_active);
  const totalUnread = computed(() =>
    Object.values(unreadCounts.value).reduce((a, b) => a + b, 0),
  );
  const selectedMessage = computed(() =>
    messages.value.find((m) => m.id === selectedMessageId.value) ?? null,
  );

  function _kwamiId(): string {
    const ws = useWorkspaceStore();
    return ws.activeWorkspaceId;
  }

  // ----- Account -----

  async function fetchAccount() {
    const kwamiId = _kwamiId();
    if (!kwamiId) return;
    try {
      const headers = await authHeaders();
      const res = await fetch(
        `${API_BASE}/email/account?kwami_id=${encodeURIComponent(kwamiId)}`,
        { headers },
      );
      const data = await parseJson<{ account: EmailAccount | null }>(res);
      account.value = data.account;
    } catch (e) {
      console.warn('Failed to fetch email account:', e);
      account.value = null;
    }
  }

  async function checkUsername(username: string): Promise<{ available: boolean; error?: string }> {
    isCheckingUsername.value = true;
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/email/check-username`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username }),
      });
      return await parseJson<{ available: boolean; error?: string }>(res);
    } finally {
      isCheckingUsername.value = false;
    }
  }

  async function activateEmail(username: string) {
    isActivating.value = true;
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/email/activate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ kwami_id: _kwamiId(), username }),
      });
      const data = await parseJson<EmailAccount>(res);
      account.value = data;
      return data;
    } finally {
      isActivating.value = false;
    }
  }

  async function deactivateEmail() {
    const kwamiId = _kwamiId();
    if (!kwamiId) return;
    const headers = await authHeaders();
    const res = await fetch(
      `${API_BASE}/email/account?kwami_id=${encodeURIComponent(kwamiId)}`,
      { method: 'DELETE', headers },
    );
    await parseJson<{ ok: boolean }>(res);
    account.value = null;
    messages.value = [];
    unreadCounts.value = {};
    activeCategory.value = 'all';
    selectedMessageId.value = null;
  }

  // ----- Inbox -----

  async function fetchInbox(category?: EmailCategory, page = 1) {
    isLoading.value = true;
    try {
      const kwamiId = _kwamiId();
      const params = new URLSearchParams({ kwami_id: kwamiId, page: String(page) });
      if (category && category !== 'all') params.set('category', category);
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/email/inbox?${params}`, { headers });
      const data = await parseJson<{ messages: EmailMessage[] }>(res);
      if (page === 1) {
        messages.value = data.messages;
      } else {
        messages.value = [...messages.value, ...data.messages];
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUnreadCounts() {
    const kwamiId = _kwamiId();
    if (!kwamiId) return;
    const headers = await authHeaders();
    const res = await fetch(
      `${API_BASE}/email/unread-counts?kwami_id=${encodeURIComponent(kwamiId)}`,
      { headers },
    );
    const data = await parseJson<{ counts: Record<string, number> }>(res);
    unreadCounts.value = data.counts;
  }

  async function refreshInbox() {
    await Promise.all([fetchInbox(activeCategory.value), fetchUnreadCounts()]);
  }

  // ----- Single message -----

  async function fetchMessage(messageId: string) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/email/messages/${messageId}`, { headers });
    const data = await parseJson<{ message: EmailMessage }>(res);
    const idx = messages.value.findIndex((m) => m.id === messageId);
    if (idx !== -1) messages.value[idx] = data.message;
    return data.message;
  }

  async function markRead(messageId: string) {
    return _patchMessage(messageId, { is_read: true });
  }

  async function toggleStar(messageId: string) {
    const msg = messages.value.find((m) => m.id === messageId);
    if (!msg) return;
    return _patchMessage(messageId, { is_starred: !msg.is_starred });
  }

  async function archiveMessage(messageId: string) {
    return _patchMessage(messageId, { is_archived: true });
  }

  async function _patchMessage(messageId: string, fields: Record<string, boolean>) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/email/messages/${messageId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(fields),
    });
    const data = await parseJson<{ message: EmailMessage }>(res);
    const idx = messages.value.findIndex((m) => m.id === messageId);
    if (idx !== -1) messages.value[idx] = data.message;
    if (fields.is_archived) {
      messages.value = messages.value.filter((m) => m.id !== messageId);
    }
    await fetchUnreadCounts();
    return data.message;
  }

  // ----- Send -----

  async function sendEmail(params: {
    to: string[];
    subject: string;
    bodyText: string;
    bodyHtml?: string;
    cc?: string[];
  }) {
    isSending.value = true;
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/email/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          kwami_id: _kwamiId(),
          to_addresses: params.to,
          cc_addresses: params.cc ?? [],
          subject: params.subject,
          body_text: params.bodyText,
          body_html: params.bodyHtml ?? '',
        }),
      });
      const data = await parseJson<{ ok: boolean; message: EmailMessage }>(res);
      return data.message;
    } finally {
      isSending.value = false;
    }
  }

  // ----- Selection helpers -----

  function selectMessage(id: string | null) {
    selectedMessageId.value = id;
  }

  function setCategory(cat: EmailCategory) {
    activeCategory.value = cat;
    messages.value = [];
    fetchInbox(cat);
  }

  return {
    account,
    messages,
    activeCategory,
    unreadCounts,
    selectedMessageId,
    selectedMessage,
    isLoading,
    isActivating,
    isCheckingUsername,
    isSending,
    isActivated,
    totalUnread,
    fetchAccount,
    checkUsername,
    activateEmail,
    deactivateEmail,
    fetchInbox,
    fetchUnreadCounts,
    refreshInbox,
    fetchMessage,
    markRead,
    toggleStar,
    archiveMessage,
    sendEmail,
    selectMessage,
    setCategory,
  };
});
