import { ref, computed } from 'vue';

// Types for API responses

export interface ProviderPricing {
  input_per_1m: number;
  cached_per_1m: number | null;
  output_per_1m: number;
}

export interface InferenceModel {
  model_id: string;
  display_name: string;
  provider: string;
  context_window: number;
  max_output: number | null;
  capabilities: string[];
  speed: 'fast' | 'standard' | 'slow';
  tier: 'flagship' | 'standard' | 'budget';
  description: string | null;
  providers: Record<string, ProviderPricing>;
}

export interface InferenceModelsResponse {
  last_updated: string;
  models: InferenceModel[];
}

export interface PluginModel {
  model_id: string;
  display_name: string;
  provider: string;
  context_window: number;
  max_output: number | null;
  capabilities: string[];
  speed: 'fast' | 'standard' | 'slow';
  tier: 'flagship' | 'standard' | 'budget';
}

export interface PluginModelsResponse {
  source: 'sdk' | 'fallback';
  providers: Record<string, PluginModel[]>;
}

// STT Types
export interface STTPricing {
  build_ship_per_min: number;
  scale_per_min: number;
}

export interface InferenceSTTModel {
  model_id: string;
  display_name: string;
  provider: string;
  languages: string[];
  features: string[];
  speed: 'fast' | 'standard' | 'slow';
  tier: 'flagship' | 'standard' | 'budget';
  description: string | null;
  pricing: STTPricing;
}

export interface InferenceSTTResponse {
  last_updated: string;
  models: InferenceSTTModel[];
}

export interface PluginSTTModel {
  model_id: string;
  display_name: string;
  provider: string;
  languages: string[];
  features: string[];
  speed: 'fast' | 'standard' | 'slow';
  tier: 'flagship' | 'standard' | 'budget';
}

export interface PluginSTTResponse {
  source: 'sdk' | 'fallback';
  providers: Record<string, PluginSTTModel[]>;
}

// TTS Types
export interface TTSPricing {
  build_ship_per_1m_chars: number;
  scale_per_1m_chars: number;
}

export interface InferenceTTSModel {
  model_id: string;
  display_name: string;
  provider: string;
  languages: string[];
  features: string[];
  speed: 'fast' | 'standard' | 'slow';
  tier: 'flagship' | 'standard' | 'budget';
  description: string | null;
  pricing: TTSPricing;
}

export interface InferenceTTSResponse {
  last_updated: string;
  models: InferenceTTSModel[];
}

export interface PluginTTSModel {
  model_id: string;
  display_name: string;
  provider: string;
  languages: string[];
  features: string[];
  speed: 'fast' | 'standard' | 'slow';
  tier: 'flagship' | 'standard' | 'budget';
}

export interface PluginTTSResponse {
  source: 'sdk' | 'fallback';
  providers: Record<string, PluginTTSModel[]>;
}

// Legacy type for Realtime
export interface ModelsResponse {
  source: 'sdk' | 'fallback';
  inference: string[];
  plugins: Record<string, string[]>;
}

export interface CapabilitiesResponse {
  llm: ModelTypeCapabilities;
  stt: ModelTypeCapabilities;
  tts: ModelTypeCapabilities;
  realtime: ModelTypeCapabilities;
  vision: VisionCapableModels;
  video_input: VideoInputModels;
}

export interface ModelTypeCapabilities {
  description: string;
  input: string[];
  output: string[];
  features: string[];
  optional_input?: string[];
}

export interface VisionCapableModels {
  description: string;
  models: Record<string, string[]>;
  usage_notes: string;
}

export interface VideoInputModels {
  description: string;
  models: Record<string, string[]>;
  usage_notes: string;
}

// Singleton state for caching
const llmInferenceModels = ref<InferenceModelsResponse | null>(null);
const llmPluginModels = ref<PluginModelsResponse | null>(null);
const sttInferenceModels = ref<InferenceSTTResponse | null>(null);
const sttPluginModels = ref<PluginSTTResponse | null>(null);
const ttsInferenceModels = ref<InferenceTTSResponse | null>(null);
const ttsPluginModels = ref<PluginTTSResponse | null>(null);
const realtimeModels = ref<ModelsResponse | null>(null);
const capabilities = ref<CapabilitiesResponse | null>(null);

const isLoading = ref(false);
const error = ref<string | null>(null);

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function useModelsApi() {
  
  async function fetchLLMInferenceModels(): Promise<InferenceModelsResponse | null> {
    if (llmInferenceModels.value) return llmInferenceModels.value;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_BASE}/models/llm`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      llmInferenceModels.value = await response.json();
      return llmInferenceModels.value;
    } catch (e) {
      error.value = `Failed to fetch LLM inference models: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchLLMPluginModels(): Promise<PluginModelsResponse | null> {
    if (llmPluginModels.value) return llmPluginModels.value;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_BASE}/models/llm/plugins`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      llmPluginModels.value = await response.json();
      return llmPluginModels.value;
    } catch (e) {
      error.value = `Failed to fetch LLM plugin models: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSTTInferenceModels(): Promise<InferenceSTTResponse | null> {
    if (sttInferenceModels.value) return sttInferenceModels.value;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_BASE}/models/stt`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      sttInferenceModels.value = await response.json();
      return sttInferenceModels.value;
    } catch (e) {
      error.value = `Failed to fetch STT inference models: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSTTPluginModels(): Promise<PluginSTTResponse | null> {
    if (sttPluginModels.value) return sttPluginModels.value;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_BASE}/models/stt/plugins`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      sttPluginModels.value = await response.json();
      return sttPluginModels.value;
    } catch (e) {
      error.value = `Failed to fetch STT plugin models: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchTTSInferenceModels(): Promise<InferenceTTSResponse | null> {
    if (ttsInferenceModels.value) return ttsInferenceModels.value;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_BASE}/models/tts`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      ttsInferenceModels.value = await response.json();
      return ttsInferenceModels.value;
    } catch (e) {
      error.value = `Failed to fetch TTS inference models: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchTTSPluginModels(): Promise<PluginTTSResponse | null> {
    if (ttsPluginModels.value) return ttsPluginModels.value;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_BASE}/models/tts/plugins`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      ttsPluginModels.value = await response.json();
      return ttsPluginModels.value;
    } catch (e) {
      error.value = `Failed to fetch TTS plugin models: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchRealtimeModels(): Promise<ModelsResponse | null> {
    if (realtimeModels.value) return realtimeModels.value;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_BASE}/models/realtime`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      realtimeModels.value = await response.json();
      return realtimeModels.value;
    } catch (e) {
      error.value = `Failed to fetch Realtime models: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCapabilities(): Promise<CapabilitiesResponse | null> {
    if (capabilities.value) return capabilities.value;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_BASE}/models/capabilities`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      capabilities.value = await response.json();
      return capabilities.value;
    } catch (e) {
      error.value = `Failed to fetch capabilities: ${e}`;
      console.error(error.value);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  // Helper to check if a model supports vision
  function isVisionCapable(provider: string, model: string): boolean {
    if (!capabilities.value?.vision?.models) return false;
    const providerModels = capabilities.value.vision.models[provider.toLowerCase()];
    return providerModels?.some(m => model.includes(m) || m.includes(model)) ?? false;
  }

  // Clear cache to force refresh
  function clearCache() {
    llmInferenceModels.value = null;
    llmPluginModels.value = null;
    sttInferenceModels.value = null;
    sttPluginModels.value = null;
    ttsInferenceModels.value = null;
    ttsPluginModels.value = null;
    realtimeModels.value = null;
    capabilities.value = null;
  }

  return {
    // State
    llmInferenceModels: computed(() => llmInferenceModels.value),
    llmPluginModels: computed(() => llmPluginModels.value),
    sttInferenceModels: computed(() => sttInferenceModels.value),
    sttPluginModels: computed(() => sttPluginModels.value),
    ttsInferenceModels: computed(() => ttsInferenceModels.value),
    ttsPluginModels: computed(() => ttsPluginModels.value),
    realtimeModels: computed(() => realtimeModels.value),
    capabilities: computed(() => capabilities.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    
    // Methods
    fetchLLMInferenceModels,
    fetchLLMPluginModels,
    fetchSTTInferenceModels,
    fetchSTTPluginModels,
    fetchTTSInferenceModels,
    fetchTTSPluginModels,
    fetchRealtimeModels,
    fetchCapabilities,
    isVisionCapable,
    clearCache,
  };
}
