import { ref, computed } from 'vue';

// =============================================================================
// Types
// =============================================================================

export interface Voice {
  id: string;
  name: string;
  category: string | null;
  gender: 'male' | 'female' | 'neutral' | null;
  language: string | null;
  description: string | null;
}

export interface ProviderVoicesResponse {
  provider: string;
  voices: Voice[];
  source: 'sdk' | 'yaml';
  count: number;
}

export interface AllVoicesResponse {
  providers: Record<string, ProviderVoicesResponse>;
  total_voices: number;
  total_providers: number;
}

// =============================================================================
// Singleton State (cached across component instances)
// =============================================================================

const ttsVoices = ref<AllVoicesResponse | null>(null);
const realtimeVoices = ref<AllVoicesResponse | null>(null);
const ttsVoicesByProvider = ref<Record<string, ProviderVoicesResponse>>({});
const realtimeVoicesByProvider = ref<Record<string, ProviderVoicesResponse>>({});

const isLoading = ref(false);
const error = ref<string | null>(null);

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// =============================================================================
// Composable
// =============================================================================

export function useVoicesApi() {
  
  /**
   * Fetch all TTS voices grouped by provider
   */
  async function fetchTTSVoices(): Promise<AllVoicesResponse | null> {
    if (ttsVoices.value) return ttsVoices.value;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_BASE}/voices/tts`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      ttsVoices.value = await response.json();
      return ttsVoices.value;
    } catch (e) {
      error.value = `Failed to fetch TTS voices: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch TTS voices for a specific provider
   */
  async function fetchTTSVoicesByProvider(provider: string): Promise<ProviderVoicesResponse | null> {
    // Check cache first
    if (ttsVoicesByProvider.value[provider]) {
      return ttsVoicesByProvider.value[provider];
    }
    
    // Check if we already have all TTS voices
    if (ttsVoices.value?.providers[provider]) {
      ttsVoicesByProvider.value[provider] = ttsVoices.value.providers[provider];
      return ttsVoicesByProvider.value[provider];
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_BASE}/voices/tts/${provider}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`TTS provider '${provider}' not found`);
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      ttsVoicesByProvider.value[provider] = data;
      return data;
    } catch (e) {
      error.value = `Failed to fetch TTS voices for ${provider}: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch all Realtime voices grouped by provider
   */
  async function fetchRealtimeVoices(): Promise<AllVoicesResponse | null> {
    if (realtimeVoices.value) return realtimeVoices.value;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_BASE}/voices/realtime`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      realtimeVoices.value = await response.json();
      return realtimeVoices.value;
    } catch (e) {
      error.value = `Failed to fetch Realtime voices: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch Realtime voices for a specific provider
   */
  async function fetchRealtimeVoicesByProvider(provider: string): Promise<ProviderVoicesResponse | null> {
    // Check cache first
    if (realtimeVoicesByProvider.value[provider]) {
      return realtimeVoicesByProvider.value[provider];
    }
    
    // Check if we already have all realtime voices
    if (realtimeVoices.value?.providers[provider]) {
      realtimeVoicesByProvider.value[provider] = realtimeVoices.value.providers[provider];
      return realtimeVoicesByProvider.value[provider];
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_BASE}/voices/realtime/${provider}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Realtime provider '${provider}' not found`);
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      realtimeVoicesByProvider.value[provider] = data;
      return data;
    } catch (e) {
      error.value = `Failed to fetch Realtime voices for ${provider}: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get voices for a provider (TTS or Realtime), fetching if needed
   */
  async function getVoicesForProvider(
    provider: string, 
    type: 'tts' | 'realtime'
  ): Promise<Voice[]> {
    const fetchFn = type === 'tts' ? fetchTTSVoicesByProvider : fetchRealtimeVoicesByProvider;
    const result = await fetchFn(provider);
    return result?.voices || [];
  }

  /**
   * Clear all cached voice data
   */
  function clearCache() {
    ttsVoices.value = null;
    realtimeVoices.value = null;
    ttsVoicesByProvider.value = {};
    realtimeVoicesByProvider.value = {};
  }

  /**
   * Group voices by category for UI display
   */
  function groupVoicesByCategory(voices: Voice[]): Record<string, Voice[]> {
    const groups: Record<string, Voice[]> = {};
    
    for (const voice of voices) {
      const category = voice.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(voice);
    }
    
    return groups;
  }

  return {
    // State
    ttsVoices: computed(() => ttsVoices.value),
    realtimeVoices: computed(() => realtimeVoices.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    
    // Methods
    fetchTTSVoices,
    fetchTTSVoicesByProvider,
    fetchRealtimeVoices,
    fetchRealtimeVoicesByProvider,
    getVoicesForProvider,
    groupVoicesByCategory,
    clearCache,
  };
}
