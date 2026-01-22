<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useKwami } from '@/composables/useKwami';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';

import type { STTConfig, LLMConfig, TTSConfig } from 'kwami-ai';

const { kwami, isConnected } = useKwami();

const pipelineMode = ref<'standard' | 'realtime'>('standard');

// =============================================================================
// STT Configuration
// =============================================================================

const stt = reactive({
  provider: 'deepgram',
  model: 'nova-2',
  language: 'en',
});

const sttProviders = [
  { provider: 'deepgram', label: 'Deepgram', icon: 'simple-icons:deepgram' },
  { provider: 'openai', label: 'OpenAI Whisper', icon: 'simple-icons:openai' },
  { provider: 'assemblyai', label: 'AssemblyAI', icon: 'ph:waveform-duotone' },
  { provider: 'google', label: 'Google Cloud', icon: 'simple-icons:googlecloud' },
  { provider: 'elevenlabs', label: 'ElevenLabs', icon: 'ph:speaker-high-duotone' },
];

const sttModels = computed(() => {
  switch (stt.provider) {
    case 'deepgram':
      return [
        { model: 'nova-3', name: 'Nova 3 (Latest)' },
        { model: 'nova-2', name: 'Nova 2' },
        { model: 'nova-2-conversationalai', name: 'Nova 2 Conversational' },
        { model: 'nova-2-phonecall', name: 'Nova 2 Phone Call' },
        { model: 'nova-2-meeting', name: 'Nova 2 Meeting' },
        { model: 'enhanced', name: 'Enhanced' },
        { model: 'base', name: 'Base' },
      ];
    case 'openai':
      return [
        { model: 'whisper-1', name: 'Whisper v1' },
        { model: 'whisper-large-v3', name: 'Whisper Large v3' },
        { model: 'whisper-large-v3-turbo', name: 'Whisper Large v3 Turbo' },
      ];
    case 'assemblyai':
      return [
        { model: 'best', name: 'Best (Recommended)' },
        { model: 'nano', name: 'Nano (Fast)' },
        { model: 'conformer-2', name: 'Conformer 2' },
      ];
    case 'google':
      return [
        { model: 'chirp', name: 'Chirp (Universal)' },
        { model: 'chirp-2', name: 'Chirp 2' },
        { model: 'telephony', name: 'Telephony' },
        { model: 'command_and_search', name: 'Command & Search' },
      ];
    case 'elevenlabs':
      return [
        { model: 'scribe_v1', name: 'Scribe v1' },
      ];
    default:
      return [{ model: 'default', name: 'Default' }];
  }
});

const sttLanguages = [
  { value: 'en', label: 'English' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es', label: 'Spanish' },
  { value: 'es-419', label: 'Spanish (LATAM)' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese (Mandarin)' },
  { value: 'zh-TW', label: 'Chinese (Traditional)' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ru', label: 'Russian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'pl', label: 'Polish' },
  { value: 'tr', label: 'Turkish' },
  { value: 'multi', label: 'Multi-language' },
];

// =============================================================================
// LLM Configuration
// =============================================================================

const llm = reactive({
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1024,
});

const llmProviders = [
  { provider: 'openai', label: 'OpenAI', icon: 'simple-icons:openai' },
  { provider: 'google', label: 'Google Gemini', icon: 'simple-icons:googlegemini' },
  { provider: 'anthropic', label: 'Anthropic Claude', icon: 'simple-icons:anthropic' },
  { provider: 'groq', label: 'Groq', icon: 'ph:lightning-duotone' },
  { provider: 'deepseek', label: 'DeepSeek', icon: 'ph:brain-duotone' },
  { provider: 'mistral', label: 'Mistral AI', icon: 'ph:wind-duotone' },
  { provider: 'cerebras', label: 'Cerebras', icon: 'ph:cpu-duotone' },
  { provider: 'ollama', label: 'Ollama (Local)', icon: 'ph:house-duotone' },
];

const llmModels = computed(() => {
  switch (llm.provider) {
    case 'openai':
      return [
        { model: 'gpt-4o', name: 'GPT-4o' },
        { model: 'gpt-4o-mini', name: 'GPT-4o Mini' },
        { model: 'gpt-4.1', name: 'GPT-4.1' },
        { model: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
        { model: 'gpt-4.1-nano', name: 'GPT-4.1 Nano' },
        { model: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
        { model: 'gpt-4', name: 'GPT-4' },
        { model: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { model: 'o1', name: 'o1 (Reasoning)' },
        { model: 'o1-mini', name: 'o1 Mini' },
        { model: 'o3-mini', name: 'o3 Mini' },
      ];
    case 'google':
      return [
        { model: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
        { model: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
        { model: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
        { model: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
        { model: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B' },
      ];
    case 'anthropic':
      return [
        { model: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet' },
        { model: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku' },
        { model: 'claude-3-opus-latest', name: 'Claude 3 Opus' },
        { model: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      ];
    case 'groq':
      return [
        { model: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
        { model: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B' },
        { model: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
        { model: 'llama3-70b-8192', name: 'Llama 3 70B' },
        { model: 'llama3-8b-8192', name: 'Llama 3 8B' },
        { model: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
        { model: 'gemma2-9b-it', name: 'Gemma 2 9B' },
      ];
    case 'deepseek':
      return [
        { model: 'deepseek-chat', name: 'DeepSeek Chat' },
        { model: 'deepseek-reasoner', name: 'DeepSeek Reasoner (R1)' },
      ];
    case 'mistral':
      return [
        { model: 'mistral-large-latest', name: 'Mistral Large' },
        { model: 'mistral-medium-latest', name: 'Mistral Medium' },
        { model: 'mistral-small-latest', name: 'Mistral Small' },
        { model: 'open-mixtral-8x22b', name: 'Mixtral 8x22B' },
        { model: 'open-mixtral-8x7b', name: 'Mixtral 8x7B' },
        { model: 'open-mistral-7b', name: 'Mistral 7B' },
      ];
    case 'cerebras':
      return [
        { model: 'llama3.1-70b', name: 'Llama 3.1 70B' },
        { model: 'llama3.1-8b', name: 'Llama 3.1 8B' },
      ];
    case 'ollama':
      return [
        { model: 'llama3.2', name: 'Llama 3.2' },
        { model: 'llama3.1', name: 'Llama 3.1' },
        { model: 'llama3', name: 'Llama 3' },
        { model: 'mistral', name: 'Mistral' },
        { model: 'mixtral', name: 'Mixtral' },
        { model: 'phi3', name: 'Phi 3' },
        { model: 'gemma2', name: 'Gemma 2' },
        { model: 'qwen2.5', name: 'Qwen 2.5' },
      ];
    default:
      return [{ model: 'default', name: 'Default' }];
  }
});

// =============================================================================
// TTS Configuration
// =============================================================================

const tts = reactive({
  provider: 'cartesia',
  model: 'sonic-2',
  voice: '79a125e8-cd45-4c13-8a67-188112f4dd22',
  speed: 1.0,
});

const ttsProviders = [
  { provider: 'cartesia', label: 'Cartesia', icon: 'ph:speaker-high-duotone' },
  { provider: 'elevenlabs', label: 'ElevenLabs', icon: 'ph:waveform-duotone' },
  { provider: 'openai', label: 'OpenAI TTS', icon: 'simple-icons:openai' },
  { provider: 'deepgram', label: 'Deepgram Aura', icon: 'simple-icons:deepgram' },
  { provider: 'google', label: 'Google Cloud', icon: 'simple-icons:googlecloud' },
];

const ttsModels = computed(() => {
  switch (tts.provider) {
    case 'cartesia':
      return [
        { model: 'sonic-2', name: 'Sonic 2 (Latest)' },
        { model: 'sonic-english', name: 'Sonic English' },
        { model: 'sonic-multilingual', name: 'Sonic Multilingual' },
      ];
    case 'elevenlabs':
      return [
        { model: 'eleven_turbo_v2_5', name: 'Turbo v2.5' },
        { model: 'eleven_turbo_v2', name: 'Turbo v2' },
        { model: 'eleven_multilingual_v2', name: 'Multilingual v2' },
        { model: 'eleven_monolingual_v1', name: 'Monolingual v1' },
        { model: 'eleven_flash_v2_5', name: 'Flash v2.5' },
        { model: 'eleven_flash_v2', name: 'Flash v2' },
      ];
    case 'openai':
      return [
        { model: 'tts-1', name: 'TTS-1' },
        { model: 'tts-1-hd', name: 'TTS-1 HD' },
        { model: 'gpt-4o-mini-tts', name: 'GPT-4o Mini TTS' },
      ];
    case 'deepgram':
      return [
        { model: 'aura-asteria-en', name: 'Aura Asteria' },
        { model: 'aura-luna-en', name: 'Aura Luna' },
        { model: 'aura-stella-en', name: 'Aura Stella' },
        { model: 'aura-athena-en', name: 'Aura Athena' },
        { model: 'aura-hera-en', name: 'Aura Hera' },
        { model: 'aura-orion-en', name: 'Aura Orion' },
        { model: 'aura-arcas-en', name: 'Aura Arcas' },
        { model: 'aura-perseus-en', name: 'Aura Perseus' },
        { model: 'aura-angus-en', name: 'Aura Angus' },
        { model: 'aura-orpheus-en', name: 'Aura Orpheus' },
        { model: 'aura-helios-en', name: 'Aura Helios' },
        { model: 'aura-zeus-en', name: 'Aura Zeus' },
      ];
    case 'google':
      return [
        { model: 'en-US-Studio-O', name: 'Studio O (Female)' },
        { model: 'en-US-Studio-Q', name: 'Studio Q (Male)' },
        { model: 'en-US-Neural2-A', name: 'Neural2 A' },
        { model: 'en-US-Neural2-C', name: 'Neural2 C' },
        { model: 'en-US-Neural2-D', name: 'Neural2 D' },
        { model: 'en-US-Neural2-E', name: 'Neural2 E' },
      ];
    default:
      return [{ model: 'default', name: 'Default' }];
  }
});

const ttsVoices = computed(() => {
  switch (tts.provider) {
    case 'cartesia':
      return [
        // English - Female
        { id: '79a125e8-cd45-4c13-8a67-188112f4dd22', name: 'British Lady (Sophia)', category: 'Female EN' },
        { id: '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc', name: 'Jacqueline', category: 'Female EN' },
        { id: 'c2ac25f9-ecc4-4f56-9095-651354df60c0', name: 'California Girl', category: 'Female EN' },
        { id: 'b7d50908-b17c-442d-ad8d-810c63997ed9', name: 'Reading Lady', category: 'Female EN' },
        { id: '00a77add-48d5-4ef6-8157-71e5437b282d', name: 'Sarah', category: 'Female EN' },
        { id: 'ed81fd13-2016-4a49-8fe3-c0d2761695fc', name: 'Midwestern Woman', category: 'Female EN' },
        { id: '5619d38c-cf51-4d8e-9575-48f61a280413', name: 'Maria', category: 'Female EN' },
        { id: 'f146dcec-e481-45be-8ad2-96e1e40e7f32', name: 'Commercial Lady', category: 'Female EN' },
        // English - Male
        { id: 'a167e0f3-df7e-4d52-a9c3-f949145efdab', name: 'Blake (Newsman)', category: 'Male EN' },
        { id: '63ff761f-c1e8-414b-b969-d1833d1c870c', name: 'Commercial Man', category: 'Male EN' },
        { id: '421b3369-f63f-4b03-8980-37a44df1d4e8', name: 'Friendly Sidekick', category: 'Male EN' },
        { id: '638efaaa-4d0c-442e-b701-3fae16aad012', name: 'Southern Man', category: 'Male EN' },
        { id: 'fb26447f-308b-471e-8b00-8e9f04284eb5', name: 'Wise Man', category: 'Male EN' },
        { id: '2ee87190-8f84-4925-97da-e52547f9462c', name: 'British Narrator', category: 'Male EN' },
        // Australian
        { id: 'f31cc6a7-c1e8-4764-980c-60a361443dd1', name: 'Robyn (Australian)', category: 'Female AU' },
        { id: 'c99d36f3-5ffd-4253-803a-535c1bc9c306', name: 'Australian Male', category: 'Male AU' },
        // Spanish
        { id: '5c5ad5e7-1020-476b-8b91-fdcbe9cc313c', name: 'Daniela (Spanish)', category: 'Female ES' },
        { id: '15d0c2e2-8d29-44c3-be23-d585d5f154a1', name: 'Spanish Male', category: 'Male ES' },
        // French
        { id: 'a8a1eb38-5f15-4c1d-8722-7ac0f329f8d7', name: 'French Female', category: 'Female FR' },
        { id: 'ab7c61f5-3daa-47dd-a23b-4ac0aac5f5c3', name: 'French Male', category: 'Male FR' },
        // German
        { id: '3f6e78a1-e5d5-4d7b-9d2a-8a8b9b1a2c3d', name: 'German Female', category: 'Female DE' },
        { id: '4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d', name: 'German Male', category: 'Male DE' },
        // Child voices
        { id: '2b568345-1d48-4047-b25f-7baccf842eb0', name: 'Child (Female)', category: 'Child' },
        { id: '98a34ef2-2140-4c28-9c71-663dc4dd7022', name: 'Child (Male)', category: 'Child' },
      ];
    case 'elevenlabs':
      return [
        // Premade voices
        { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'Female' },
        { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', category: 'Female' },
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'Female' },
        { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', category: 'Female' },
        { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', category: 'Male' },
        { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', category: 'Male' },
        { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'Male' },
        { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', category: 'Male' },
        { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', category: 'Male' },
        { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', category: 'Female' },
        { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', category: 'Female' },
        { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', category: 'Male' },
        { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', category: 'Male' },
        { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', category: 'Male' },
        { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', category: 'Male' },
        { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', category: 'Male' },
        { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', category: 'Female' },
        { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', category: 'Male' },
        { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', category: 'Male' },
        { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', category: 'Male' },
      ];
    case 'openai':
      return [
        { id: 'alloy', name: 'Alloy', category: 'Neutral' },
        { id: 'ash', name: 'Ash', category: 'Male' },
        { id: 'ballad', name: 'Ballad', category: 'Male' },
        { id: 'coral', name: 'Coral', category: 'Female' },
        { id: 'echo', name: 'Echo', category: 'Male' },
        { id: 'fable', name: 'Fable', category: 'Neutral' },
        { id: 'nova', name: 'Nova', category: 'Female' },
        { id: 'onyx', name: 'Onyx', category: 'Male' },
        { id: 'sage', name: 'Sage', category: 'Female' },
        { id: 'shimmer', name: 'Shimmer', category: 'Female' },
        { id: 'verse', name: 'Verse', category: 'Male' },
      ];
    case 'deepgram':
      return [
        { id: 'asteria', name: 'Asteria', category: 'Female' },
        { id: 'luna', name: 'Luna', category: 'Female' },
        { id: 'stella', name: 'Stella', category: 'Female' },
        { id: 'athena', name: 'Athena', category: 'Female' },
        { id: 'hera', name: 'Hera', category: 'Female' },
        { id: 'orion', name: 'Orion', category: 'Male' },
        { id: 'arcas', name: 'Arcas', category: 'Male' },
        { id: 'perseus', name: 'Perseus', category: 'Male' },
        { id: 'angus', name: 'Angus', category: 'Male' },
        { id: 'orpheus', name: 'Orpheus', category: 'Male' },
        { id: 'helios', name: 'Helios', category: 'Male' },
        { id: 'zeus', name: 'Zeus', category: 'Male' },
      ];
    case 'google':
      return [
        { id: 'en-US-Studio-O', name: 'Studio O (Female)', category: 'Female' },
        { id: 'en-US-Studio-Q', name: 'Studio Q (Male)', category: 'Male' },
        { id: 'en-US-Neural2-A', name: 'Neural2 A (Male)', category: 'Male' },
        { id: 'en-US-Neural2-C', name: 'Neural2 C (Female)', category: 'Female' },
        { id: 'en-US-Neural2-D', name: 'Neural2 D (Male)', category: 'Male' },
        { id: 'en-US-Neural2-E', name: 'Neural2 E (Female)', category: 'Female' },
        { id: 'en-US-Neural2-F', name: 'Neural2 F (Female)', category: 'Female' },
        { id: 'en-US-Neural2-G', name: 'Neural2 G (Female)', category: 'Female' },
        { id: 'en-US-Neural2-H', name: 'Neural2 H (Female)', category: 'Female' },
        { id: 'en-US-Neural2-I', name: 'Neural2 I (Male)', category: 'Male' },
        { id: 'en-US-Neural2-J', name: 'Neural2 J (Male)', category: 'Male' },
      ];
    default:
      return [{ id: 'default', name: 'Default', category: 'Default' }];
  }
});

// Group voices by category for better UI
const groupedVoices = computed(() => {
  const voices = ttsVoices.value;
  const groups: Record<string, typeof voices> = {};
  
  voices.forEach(voice => {
    const category = voice.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(voice);
  });
  
  return groups;
});

// =============================================================================
// Realtime Configuration
// =============================================================================

const realtime = reactive({
  provider: 'openai',
  model: 'gpt-4o-realtime-preview',
  voice: 'alloy',
  modalities: ['text', 'audio'] as string[],
});

const realtimeProviders = [
  { provider: 'openai', label: 'OpenAI Realtime', icon: 'simple-icons:openai' },
  { provider: 'google', label: 'Google Gemini Live', icon: 'simple-icons:googlegemini' },
];

const realtimeModels = computed(() => {
  switch (realtime.provider) {
    case 'openai':
      return [
        { model: 'gpt-4o-realtime-preview', name: 'GPT-4o Realtime Preview' },
        { model: 'gpt-4o-realtime-preview-2024-10-01', name: 'GPT-4o Realtime (Oct 2024)' },
        { model: 'gpt-4o-realtime-preview-2024-12-17', name: 'GPT-4o Realtime (Dec 2024)' },
      ];
    case 'google':
      return [
        { model: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Live' },
      ];
    default:
      return [{ model: 'default', name: 'Default' }];
  }
});

const realtimeVoices = computed(() => {
  switch (realtime.provider) {
    case 'openai':
      return [
        { id: 'alloy', name: 'Alloy' },
        { id: 'ash', name: 'Ash' },
        { id: 'ballad', name: 'Ballad' },
        { id: 'coral', name: 'Coral' },
        { id: 'echo', name: 'Echo' },
        { id: 'sage', name: 'Sage' },
        { id: 'shimmer', name: 'Shimmer' },
        { id: 'verse', name: 'Verse' },
      ];
    case 'google':
      return [
        { id: 'Puck', name: 'Puck' },
        { id: 'Charon', name: 'Charon' },
        { id: 'Kore', name: 'Kore' },
        { id: 'Fenrir', name: 'Fenrir' },
        { id: 'Aoede', name: 'Aoede' },
      ];
    default:
      return [{ id: 'default', name: 'Default' }];
  }
});

// =============================================================================
// Presets
// =============================================================================

const presets = [
  { 
    id: 'fast', 
    label: 'Fast', 
    icon: 'ph:rocket-duotone', 
    title: 'Optimized for lowest latency',
    config: {
      stt: { provider: 'deepgram', model: 'nova-3', language: 'en' },
      llm: { provider: 'groq', model: 'llama-3.1-8b-instant', temperature: 0.7, maxTokens: 512 },
      tts: { provider: 'cartesia', model: 'sonic-2', voice: '79a125e8-cd45-4c13-8a67-188112f4dd22', speed: 1.0 },
    }
  },
  { 
    id: 'balanced', 
    label: 'Balanced', 
    icon: 'ph:scales-duotone', 
    title: 'Good balance of speed and quality',
    config: {
      stt: { provider: 'deepgram', model: 'nova-2', language: 'en' },
      llm: { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.7, maxTokens: 1024 },
      tts: { provider: 'cartesia', model: 'sonic-2', voice: '79a125e8-cd45-4c13-8a67-188112f4dd22', speed: 1.0 },
    }
  },
  { 
    id: 'quality', 
    label: 'Quality', 
    icon: 'ph:star-duotone', 
    title: 'Best possible quality',
    config: {
      stt: { provider: 'deepgram', model: 'nova-3', language: 'en' },
      llm: { provider: 'openai', model: 'gpt-4o', temperature: 0.7, maxTokens: 2048 },
      tts: { provider: 'elevenlabs', model: 'eleven_turbo_v2_5', voice: '21m00Tcm4TlvDq8ikWAM', speed: 1.0 },
    }
  },
  { 
    id: 'multilingual', 
    label: 'Multi-lang', 
    icon: 'ph:globe-duotone', 
    title: 'Best for multiple languages',
    config: {
      stt: { provider: 'deepgram', model: 'nova-2', language: 'multi' },
      llm: { provider: 'openai', model: 'gpt-4o', temperature: 0.7, maxTokens: 1024 },
      tts: { provider: 'cartesia', model: 'sonic-multilingual', voice: '79a125e8-cd45-4c13-8a67-188112f4dd22', speed: 1.0 },
    }
  },
];

const activePreset = ref('balanced');

function applyPreset(preset: typeof presets[0]) {
  activePreset.value = preset.id;
  Object.assign(stt, preset.config.stt);
  Object.assign(llm, preset.config.llm);
  Object.assign(tts, preset.config.tts);
}

// =============================================================================
// Actions
// =============================================================================

function applyConfig() {
  if (!kwami.value) return;

  if (pipelineMode.value === 'standard') {
    const config = {
      stt: { provider: stt.provider, model: stt.model, language: stt.language } as STTConfig,
      llm: {
        provider: llm.provider,
        model: llm.model,
        temperature: llm.temperature,
        maxTokens: llm.maxTokens,
      } as LLMConfig,
      tts: { 
        provider: tts.provider, 
        model: tts.model,
        voice: tts.voice, 
        speed: tts.speed 
      } as TTSConfig,
    };
    kwami.value.agent.updateConfig({
      livekit: { ...kwami.value.agent.getConfig().livekit, voice: config },
    });
  } else {
    // Realtime config
    const config = {
      type: 'realtime' as const,
      realtime: {
        provider: realtime.provider,
        model: realtime.model,
        voice: realtime.voice,
        modalities: realtime.modalities,
      }
    };
    kwami.value.agent.updateConfig({
      livekit: { ...kwami.value.agent.getConfig().livekit, voice: config },
    });
  }
  
  console.log('Voice config applied', { mode: pipelineMode.value, stt, llm, tts, realtime });
}

// =============================================================================
// Live Update Functions (for mid-conversation changes)
// =============================================================================

function updateVoiceLive() {
  if (!kwami.value || !isConnected.value) return;
  
  kwami.value.agent.updateVoiceLive({
    voice: tts.voice,
    speed: tts.speed,
    model: tts.model,
    language: stt.language,
  });
  console.log('🔊 Voice updated live:', { voice: tts.voice, speed: tts.speed });
}

function updateLlmLive() {
  if (!kwami.value || !isConnected.value) return;
  
  kwami.value.agent.updateLlmLive({
    provider: llm.provider,
    model: llm.model,
    temperature: llm.temperature,
  });
  console.log('🧠 LLM updated live:', { provider: llm.provider, model: llm.model });
}

function updateSttLive() {
  if (!kwami.value || !isConnected.value) return;
  
  kwami.value.agent.updateVoiceLive({
    language: stt.language,
  });
  console.log('🎤 STT language updated live:', stt.language);
}

// Reset model when provider changes
watch(() => stt.provider, () => {
  stt.model = sttModels.value[0]?.model || 'default';
});

watch(() => llm.provider, () => {
  llm.model = llmModels.value[0]?.model || 'default';
});

watch(() => tts.provider, () => {
  tts.model = ttsModels.value[0]?.model || 'default';
  tts.voice = ttsVoices.value[0]?.id || 'default';
});

watch(() => realtime.provider, () => {
  realtime.model = realtimeModels.value[0]?.model || 'default';
  realtime.voice = realtimeVoices.value[0]?.id || 'default';
});

// =============================================================================
// Live Update Watchers (when connected)
// =============================================================================

// Watch for TTS voice changes when connected
watch(() => tts.voice, (newVoice) => {
  if (isConnected.value && newVoice) {
    updateVoiceLive();
  }
});

// Watch for TTS speed changes when connected
watch(() => tts.speed, () => {
  if (isConnected.value) {
    updateVoiceLive();
  }
});

// Watch for LLM model changes when connected
watch(() => llm.model, () => {
  if (isConnected.value) {
    updateLlmLive();
  }
});

// Watch for LLM provider changes when connected
watch(() => llm.provider, (newProvider, oldProvider) => {
  if (isConnected.value && newProvider !== oldProvider) {
    // After provider change, model will also update - wait for it
    setTimeout(() => updateLlmLive(), 100);
  }
});

// Watch for LLM temperature changes when connected
watch(() => llm.temperature, () => {
  if (isConnected.value) {
    updateLlmLive();
  }
});

// Watch for STT language changes when connected
watch(() => stt.language, () => {
  if (isConnected.value) {
    updateSttLive();
  }
});

onMounted(() => {
  // Sync from kwami if needed
});
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:microphone-duotone" class="panel-icon"></iconify-icon>
      <h2>Voice Pipeline</h2>
    </div>

    <div class="panel-body">
      <!-- Mode Selection -->
      <PanelSection>
        <div class="mode-selector">
          <button
            class="mode-btn"
            :class="{ active: pipelineMode === 'standard' }"
            @click="pipelineMode = 'standard'"
          >
            <iconify-icon icon="ph:arrows-left-right-duotone"></iconify-icon> Standard
          </button>
          <button
            class="mode-btn"
            :class="{ active: pipelineMode === 'realtime' }"
            @click="pipelineMode = 'realtime'"
          >
            <iconify-icon icon="ph:lightning-duotone"></iconify-icon> Realtime
          </button>
        </div>
      </PanelSection>

      <!-- Presets -->
      <PanelSection title="Quick Presets" icon="ph:lightning-duotone">
        <div class="preset-grid">
          <button
            v-for="preset in presets"
            :key="preset.id"
            class="preset-btn"
            :class="{ active: activePreset === preset.id }"
            :title="preset.title"
            @click="applyPreset(preset)"
          >
            <iconify-icon :icon="preset.icon"></iconify-icon>
            <span>{{ preset.label }}</span>
          </button>
        </div>
      </PanelSection>

      <!-- Standard Pipeline Config -->
      <div v-if="pipelineMode === 'standard'" class="pipeline-config">
        <!-- STT Section -->
        <PanelSection title="Speech to Text (STT)" icon="ph:microphone-duotone">
          <div class="config-form">
            <BaseSelect
              label="Provider"
              v-model="stt.provider"
              :options="sttProviders.map((p) => ({ label: p.label, value: p.provider }))"
            />
            <BaseSelect
              label="Model"
              v-model="stt.model"
              :options="sttModels.map((m) => ({ label: m.name, value: m.model }))"
            />
            <BaseSelect
              label="Language"
              v-model="stt.language"
              :options="sttLanguages"
            />
          </div>
        </PanelSection>

        <!-- LLM Section -->
        <PanelSection title="Language Model (LLM)" icon="ph:brain-duotone">
          <div class="config-form">
            <BaseSelect
              label="Provider"
              v-model="llm.provider"
              :options="llmProviders.map((p) => ({ label: p.label, value: p.provider }))"
            />
            <BaseSelect
              label="Model"
              v-model="llm.model"
              :options="llmModels.map((m) => ({ label: m.name, value: m.model }))"
            />
            <BaseSlider 
              label="Temperature" 
              :min="0" 
              :max="1" 
              :step="0.05" 
              v-model="llm.temperature"
              :showValue="true"
            />
            <BaseSlider 
              label="Max Tokens" 
              :min="64" 
              :max="4096" 
              :step="64" 
              v-model="llm.maxTokens"
              :showValue="true"
            />
          </div>
        </PanelSection>

        <!-- TTS Section -->
        <PanelSection title="Text to Speech (TTS)" icon="ph:speaker-high-duotone">
          <div class="config-form">
            <BaseSelect
              label="Provider"
              v-model="tts.provider"
              :options="ttsProviders.map((p) => ({ label: p.label, value: p.provider }))"
            />
            <BaseSelect
              label="Model"
              v-model="tts.model"
              :options="ttsModels.map((m) => ({ label: m.name, value: m.model }))"
            />
            
            <!-- Voice selection with categories -->
            <div class="voice-selection">
              <label class="field-label">Voice</label>
              <select v-model="tts.voice" class="voice-select">
                <optgroup v-for="(voices, category) in groupedVoices" :key="category" :label="category">
                  <option v-for="voice in voices" :key="voice.id" :value="voice.id">
                    {{ voice.name }}
                  </option>
                </optgroup>
              </select>
            </div>
            
            <BaseSlider 
              label="Speed" 
              :min="0.5" 
              :max="2" 
              :step="0.1" 
              v-model="tts.speed"
              :showValue="true"
            />
          </div>
          
          <div class="voice-preview">
            <BaseButton icon="ph:play-duotone" size="sm" variant="secondary">Preview Voice</BaseButton>
          </div>
        </PanelSection>
      </div>

      <!-- Realtime Pipeline Config -->
      <div v-else class="pipeline-config">
        <PanelSection title="Realtime Model" icon="ph:lightning-duotone">
          <div class="config-form">
            <BaseSelect
              label="Provider"
              v-model="realtime.provider"
              :options="realtimeProviders.map((p) => ({ label: p.label, value: p.provider }))"
            />
            <BaseSelect
              label="Model"
              v-model="realtime.model"
              :options="realtimeModels.map((m) => ({ label: m.name, value: m.model }))"
            />
            <BaseSelect
              label="Voice"
              v-model="realtime.voice"
              :options="realtimeVoices.map((v) => ({ label: v.name, value: v.id }))"
            />
          </div>
          
          <div class="realtime-info">
            <iconify-icon icon="ph:info-duotone"></iconify-icon>
            <span>Realtime models provide ultra-low latency by combining STT, LLM, and TTS in a single model.</span>
          </div>
        </PanelSection>
      </div>

      <!-- Apply Button -->
      <PanelSection>
        <div class="action-buttons">
          <BaseButton 
            v-if="!isConnected"
            variant="primary" 
            block 
            icon="ph:check-duotone" 
            @click="applyConfig"
          >
            Apply Configuration
          </BaseButton>
          <div v-else class="live-actions">
            <p class="live-notice">
              <iconify-icon icon="ph:broadcast-duotone"></iconify-icon>
              Connected - Changes apply instantly
            </p>
          </div>
        </div>
      </PanelSection>
    </div>
  </div>
</template>

<style scoped>
.mode-selector {
  display: flex;
  background: var(--surface-1);
  padding: 4px;
  border-radius: var(--radius-md);
  margin-bottom: 8px;
}

.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  transition: all var(--duration-fast) var(--ease-in-out);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
}

.mode-btn iconify-icon {
  font-size: 16px;
}

.mode-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.mode-btn.active {
  background: var(--accent-glow);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  box-shadow: 0 2px 12px var(--accent-glow);
}

.mode-btn.active iconify-icon {
  color: var(--accent-primary);
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 4px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  font-family: inherit;
}

.preset-btn iconify-icon {
  font-size: 20px;
  color: var(--text-muted);
  transition: color var(--duration-fast) ease;
}

.preset-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.preset-btn:hover iconify-icon {
  color: var(--accent-primary);
}

.preset-btn.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  color: var(--text-primary);
  box-shadow: 0 4px 16px var(--accent-glow);
}

.preset-btn.active iconify-icon {
  color: var(--accent-primary);
}

.pipeline-config {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.voice-selection {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
}

.voice-select {
  width: 100%;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--surface-1);
  color: var(--text-primary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2300d9ff' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.voice-select:hover {
  background-color: var(--surface-2);
  border-color: var(--surface-3);
}

.voice-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.voice-select optgroup {
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--surface-2);
  padding: 4px 0;
}

.voice-select option {
  padding: 8px 12px;
  background: var(--glass-bg);
  color: var(--text-primary);
}

.voice-preview {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.realtime-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 14px;
  padding: 12px 14px;
  background: var(--accent-glow);
  border: 1px solid rgba(0, 217, 255, 0.15);
  border-radius: var(--radius-md);
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.realtime-info iconify-icon {
  font-size: 18px;
  color: var(--accent-primary);
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.live-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.live-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(0, 255, 136, 0.1));
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-primary);
  margin: 0;
}

.live-notice iconify-icon {
  font-size: 16px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
