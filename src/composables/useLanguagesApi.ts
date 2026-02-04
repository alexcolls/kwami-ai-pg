import { ref, computed } from 'vue';

// =============================================================================
// Types
// =============================================================================

export interface Language {
  code: string;
  name: string;
  native_name: string | null;
  region: string | null;
}

export interface ProviderLanguagesResponse {
  provider: string;
  languages: Language[];
  source: 'sdk' | 'yaml';
}

export interface AllLanguagesResponse {
  providers: Record<string, ProviderLanguagesResponse>;
  total_languages: number;
  total_providers: number;
}

export interface LanguageListResponse {
  languages: Language[];
  count: number;
}

// =============================================================================
// Singleton State (cached across component instances)
// =============================================================================

const sttLanguages = ref<AllLanguagesResponse | null>(null);
const ttsLanguages = ref<AllLanguagesResponse | null>(null);
const realtimeLanguages = ref<AllLanguagesResponse | null>(null);
const allLanguages = ref<LanguageListResponse | null>(null);

const sttLanguagesByProvider = ref<Record<string, ProviderLanguagesResponse>>({});
const ttsLanguagesByProvider = ref<Record<string, ProviderLanguagesResponse>>({});
const realtimeLanguagesByProvider = ref<Record<string, ProviderLanguagesResponse>>({});

const isLoading = ref(false);
const error = ref<string | null>(null);

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// =============================================================================
// Composable
// =============================================================================

export function useLanguagesApi() {

  /**
   * Fetch all STT languages grouped by provider
   */
  async function fetchSTTLanguages(): Promise<AllLanguagesResponse | null> {
    if (sttLanguages.value) return sttLanguages.value;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE}/languages/stt`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      sttLanguages.value = await response.json();
      return sttLanguages.value;
    } catch (e) {
      error.value = `Failed to fetch STT languages: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch STT languages for a specific provider
   */
  async function fetchSTTLanguagesByProvider(provider: string): Promise<ProviderLanguagesResponse | null> {
    // Check cache first
    if (sttLanguagesByProvider.value[provider]) {
      return sttLanguagesByProvider.value[provider];
    }

    // Check if we already have all STT languages
    if (sttLanguages.value?.providers[provider]) {
      sttLanguagesByProvider.value[provider] = sttLanguages.value.providers[provider];
      return sttLanguagesByProvider.value[provider];
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE}/languages/stt/${provider}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`STT provider '${provider}' not found`);
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      sttLanguagesByProvider.value[provider] = data;
      return data;
    } catch (e) {
      error.value = `Failed to fetch STT languages for ${provider}: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch all TTS languages grouped by provider
   */
  async function fetchTTSLanguages(): Promise<AllLanguagesResponse | null> {
    if (ttsLanguages.value) return ttsLanguages.value;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE}/languages/tts`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      ttsLanguages.value = await response.json();
      return ttsLanguages.value;
    } catch (e) {
      error.value = `Failed to fetch TTS languages: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch TTS languages for a specific provider
   */
  async function fetchTTSLanguagesByProvider(provider: string): Promise<ProviderLanguagesResponse | null> {
    // Check cache first
    if (ttsLanguagesByProvider.value[provider]) {
      return ttsLanguagesByProvider.value[provider];
    }

    // Check if we already have all TTS languages
    if (ttsLanguages.value?.providers[provider]) {
      ttsLanguagesByProvider.value[provider] = ttsLanguages.value.providers[provider];
      return ttsLanguagesByProvider.value[provider];
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE}/languages/tts/${provider}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`TTS provider '${provider}' not found`);
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      ttsLanguagesByProvider.value[provider] = data;
      return data;
    } catch (e) {
      error.value = `Failed to fetch TTS languages for ${provider}: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch all Realtime languages grouped by provider
   */
  async function fetchRealtimeLanguages(): Promise<AllLanguagesResponse | null> {
    if (realtimeLanguages.value) return realtimeLanguages.value;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE}/languages/realtime`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      realtimeLanguages.value = await response.json();
      return realtimeLanguages.value;
    } catch (e) {
      error.value = `Failed to fetch Realtime languages: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch Realtime languages for a specific provider
   */
  async function fetchRealtimeLanguagesByProvider(provider: string): Promise<ProviderLanguagesResponse | null> {
    // Check cache first
    if (realtimeLanguagesByProvider.value[provider]) {
      return realtimeLanguagesByProvider.value[provider];
    }

    // Check if we already have all realtime languages
    if (realtimeLanguages.value?.providers[provider]) {
      realtimeLanguagesByProvider.value[provider] = realtimeLanguages.value.providers[provider];
      return realtimeLanguagesByProvider.value[provider];
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE}/languages/realtime/${provider}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Realtime provider '${provider}' not found`);
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      realtimeLanguagesByProvider.value[provider] = data;
      return data;
    } catch (e) {
      error.value = `Failed to fetch Realtime languages for ${provider}: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch all known languages (master list)
   */
  async function fetchAllLanguages(): Promise<LanguageListResponse | null> {
    if (allLanguages.value) return allLanguages.value;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE}/languages`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      allLanguages.value = await response.json();
      return allLanguages.value;
    } catch (e) {
      error.value = `Failed to fetch all languages: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get languages for a provider (STT, TTS, or Realtime), fetching if needed
   */
  async function getLanguagesForProvider(
    provider: string,
    type: 'stt' | 'tts' | 'realtime'
  ): Promise<Language[]> {
    let fetchFn: (provider: string) => Promise<ProviderLanguagesResponse | null>;
    
    switch (type) {
      case 'stt':
        fetchFn = fetchSTTLanguagesByProvider;
        break;
      case 'tts':
        fetchFn = fetchTTSLanguagesByProvider;
        break;
      case 'realtime':
        fetchFn = fetchRealtimeLanguagesByProvider;
        break;
    }
    
    const result = await fetchFn(provider);
    return result?.languages || [];
  }

  /**
   * Clear all cached language data
   */
  function clearCache() {
    sttLanguages.value = null;
    ttsLanguages.value = null;
    realtimeLanguages.value = null;
    allLanguages.value = null;
    sttLanguagesByProvider.value = {};
    ttsLanguagesByProvider.value = {};
    realtimeLanguagesByProvider.value = {};
  }

  /**
   * Format a language for display in a dropdown
   */
  function formatLanguageOption(lang: Language): { value: string; label: string } {
    let label = lang.name;
    if (lang.region) {
      label += ` (${lang.region})`;
    }
    return { value: lang.code, label };
  }

  return {
    // State
    sttLanguages: computed(() => sttLanguages.value),
    ttsLanguages: computed(() => ttsLanguages.value),
    realtimeLanguages: computed(() => realtimeLanguages.value),
    allLanguages: computed(() => allLanguages.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Methods
    fetchSTTLanguages,
    fetchSTTLanguagesByProvider,
    fetchTTSLanguages,
    fetchTTSLanguagesByProvider,
    fetchRealtimeLanguages,
    fetchRealtimeLanguagesByProvider,
    fetchAllLanguages,
    getLanguagesForProvider,
    formatLanguageOption,
    clearCache,
  };
}
