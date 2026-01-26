import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  STTConfig as LibSTTConfig,
  LLMConfig as LibLLMConfig,
  TTSConfig as LibTTSConfig,
  RealtimeConfig as LibRealtimeConfig,
  STTProvider,
  STTLanguage,
  LLMProvider,
  TTSProvider,
  RealtimeProvider,
  RealtimeModality,
  VoicePipelineType,
  VoicePipelineConfig,
} from 'kwami-ai';

// Extended store configs with required fields for UI
export interface STTConfig extends Omit<LibSTTConfig, 'provider' | 'language'> {
  provider: STTProvider;
  model: string;
  language: STTLanguage;
}

export interface LLMConfig extends Omit<LibLLMConfig, 'provider'> {
  provider: LLMProvider;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface TTSConfig extends Omit<LibTTSConfig, 'provider'> {
  provider: TTSProvider;
  model: string;
  voice: string;
  speed: number;
}

export interface RealtimeConfig extends Omit<LibRealtimeConfig, 'provider' | 'modalities'> {
  provider: RealtimeProvider;
  model: string;
  voice: string;
  modalities: RealtimeModality[];
}

export const useVoiceStore = defineStore('voice', () => {
  // Pipeline mode - using correct VoicePipelineType values
  const pipelineMode = ref<'stt-llm-tts' | 'realtime'>('stt-llm-tts');

  // STT Configuration
  const stt = ref<STTConfig>({
    provider: 'deepgram',
    model: 'nova-2',
    language: 'en',
  });

  // LLM Configuration
  const llm = ref<LLMConfig>({
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1024,
  });

  // TTS Configuration (default to OpenAI which doesn't require paid billing)
  const tts = ref<TTSConfig>({
    provider: 'openai',
    model: 'tts-1',
    voice: 'nova',
    speed: 1.0,
  });

  // Realtime Configuration
  const realtime = ref<RealtimeConfig>({
    provider: 'openai',
    model: 'gpt-4o-realtime-preview',
    voice: 'alloy',
    modalities: ['text', 'audio'],
  });

  // Active preset
  const activePreset = ref('balanced');

  // Update functions
  function updateSTT(config: Partial<STTConfig>) {
    stt.value = { ...stt.value, ...config };
  }

  function updateLLM(config: Partial<LLMConfig>) {
    llm.value = { ...llm.value, ...config };
  }

  function updateTTS(config: Partial<TTSConfig>) {
    tts.value = { ...tts.value, ...config };
  }

  function updateRealtime(config: Partial<RealtimeConfig>) {
    realtime.value = { ...realtime.value, ...config };
  }

  function applyPreset(preset: {
    stt: STTConfig;
    llm: LLMConfig;
    tts: TTSConfig;
  }) {
    stt.value = { ...preset.stt };
    llm.value = { ...preset.llm };
    tts.value = { ...preset.tts };
  }

  function setActivePreset(presetId: string) {
    activePreset.value = presetId;
  }

  function setPipelineMode(mode: 'stt-llm-tts' | 'realtime') {
    pipelineMode.value = mode;
  }

  // Get full voice config for sending to agent
  const voiceConfig = computed((): VoicePipelineConfig => ({
    type: pipelineMode.value,
    stt: stt.value,
    llm: llm.value,
    tts: tts.value,
    realtime: realtime.value,
  }));

  return {
    pipelineMode,
    stt,
    llm,
    tts,
    realtime,
    activePreset,
    updateSTT,
    updateLLM,
    updateTTS,
    updateRealtime,
    applyPreset,
    setActivePreset,
    setPipelineMode,
    voiceConfig,
  };
});
