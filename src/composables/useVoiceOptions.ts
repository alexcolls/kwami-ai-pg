import { computed, ref, watch } from 'vue';
import { useVoicesApi, type Voice } from './useVoicesApi';
import { useLanguagesApi, type Language } from './useLanguagesApi';

// Cache for API-fetched voices
const apiTtsVoices = ref<Record<string, Voice[]>>({});
const apiRealtimeVoices = ref<Record<string, Voice[]>>({});

// Cache for API-fetched languages
const apiSttLanguages = ref<Record<string, Language[]>>({});

export function useVoiceOptions(
    stt: { value: { provider: string } },
    llm: { value: { provider: string } },
    tts: { value: { provider: string } },
    realtime: { value: { provider: string } }
) {
    const { fetchTTSVoicesByProvider, fetchRealtimeVoicesByProvider } = useVoicesApi();
    const { fetchSTTLanguagesByProvider } = useLanguagesApi();

    // Fetch voices from API when provider changes
    async function fetchTtsVoicesForProvider(provider: string) {
        if (apiTtsVoices.value[provider]) return; // Already cached
        try {
            const result = await fetchTTSVoicesByProvider(provider);
            if (result?.voices) {
                apiTtsVoices.value[provider] = result.voices;
            }
        } catch (e) {
            console.warn(`Failed to fetch TTS voices for ${provider}, using fallback`);
        }
    }

    async function fetchRealtimeVoicesForProvider(provider: string) {
        if (apiRealtimeVoices.value[provider]) return; // Already cached
        try {
            const result = await fetchRealtimeVoicesByProvider(provider);
            if (result?.voices) {
                apiRealtimeVoices.value[provider] = result.voices;
            }
        } catch (e) {
            console.warn(`Failed to fetch Realtime voices for ${provider}, using fallback`);
        }
    }

    // Fetch languages from API when provider changes
    async function fetchSttLanguagesForProvider(provider: string) {
        if (apiSttLanguages.value[provider]) return; // Already cached
        try {
            const result = await fetchSTTLanguagesByProvider(provider);
            if (result?.languages) {
                apiSttLanguages.value[provider] = result.languages;
            }
        } catch (e) {
            console.warn(`Failed to fetch STT languages for ${provider}, using fallback`);
        }
    }

    // Watch for provider changes and fetch voices/languages
    watch(() => tts.value.provider, (provider) => {
        fetchTtsVoicesForProvider(provider);
    }, { immediate: true });

    watch(() => realtime.value.provider, (provider) => {
        fetchRealtimeVoicesForProvider(provider);
    }, { immediate: true });

    watch(() => stt.value.provider, (provider) => {
        fetchSttLanguagesForProvider(provider);
    }, { immediate: true });
    // STT Configuration
    const sttProviders = [
        { provider: 'deepgram', label: 'Deepgram', icon: 'simple-icons:deepgram' },
        { provider: 'openai', label: 'OpenAI Whisper', icon: 'simple-icons:openai' },
        { provider: 'assemblyai', label: 'AssemblyAI', icon: 'ph:waveform-duotone' },
        { provider: 'google', label: 'Google Cloud', icon: 'simple-icons:googlecloud' },
        { provider: 'elevenlabs', label: 'ElevenLabs', icon: 'ph:speaker-high-duotone' },
    ];

    const sttModels = computed(() => {
        switch (stt.value.provider) {
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

    // Fallback STT languages (used when API is unavailable)
    const fallbackSttLanguages = [
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

    const sttLanguages = computed(() => {
        const provider = stt.value.provider;

        // Use API languages if available
        const apiLanguages = apiSttLanguages.value[provider];
        if (apiLanguages && apiLanguages.length > 0) {
            return apiLanguages.map(lang => {
                let label = lang.name;
                if (lang.region) {
                    label += ` (${lang.region})`;
                }
                return { value: lang.code, label };
            });
        }

        // Fall back to hardcoded languages
        return fallbackSttLanguages;
    });

    // LLM Configuration
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
        switch (llm.value.provider) {
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

    // TTS Configuration
    const ttsProviders = [
        { provider: 'cartesia', label: 'Cartesia', icon: 'ph:speaker-high-duotone' },
        { provider: 'elevenlabs', label: 'ElevenLabs', icon: 'ph:waveform-duotone' },
        { provider: 'openai', label: 'OpenAI TTS', icon: 'simple-icons:openai' },
        { provider: 'deepgram', label: 'Deepgram Aura', icon: 'simple-icons:deepgram' },
        { provider: 'google', label: 'Google Cloud', icon: 'simple-icons:googlecloud' },
    ];

    const ttsModels = computed(() => {
        switch (tts.value.provider) {
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

    // Fallback TTS voices (used when API is unavailable)
    const fallbackTtsVoices: Record<string, Array<{ id: string; name: string; category: string }>> = {
        cartesia: [
            { id: '79a125e8-cd45-4c13-8a67-188112f4dd22', name: 'British Lady (Sophia)', category: 'Female EN' },
            { id: 'c2ac25f9-ecc4-4f56-9095-651354df60c0', name: 'California Girl', category: 'Female EN' },
            { id: 'a167e0f3-df7e-4d52-a9c3-f949145efdab', name: 'Blake (Newsman)', category: 'Male EN' },
            { id: '2ee87190-8f84-4925-97da-e52547f9462c', name: 'British Narrator', category: 'Male EN' },
        ],
        elevenlabs: [
            { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'Female' },
            { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'Male' },
            { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', category: 'Male' },
        ],
        openai: [
            { id: 'alloy', name: 'Alloy', category: 'Neutral' },
            { id: 'ash', name: 'Ash', category: 'Male' },
            { id: 'coral', name: 'Coral', category: 'Female' },
            { id: 'echo', name: 'Echo', category: 'Male' },
            { id: 'fable', name: 'Fable', category: 'Neutral' },
            { id: 'nova', name: 'Nova', category: 'Female' },
            { id: 'onyx', name: 'Onyx', category: 'Male' },
            { id: 'sage', name: 'Sage', category: 'Female' },
            { id: 'shimmer', name: 'Shimmer', category: 'Female' },
        ],
        deepgram: [
            { id: 'asteria', name: 'Asteria', category: 'Female' },
            { id: 'luna', name: 'Luna', category: 'Female' },
            { id: 'orion', name: 'Orion', category: 'Male' },
            { id: 'zeus', name: 'Zeus', category: 'Male' },
        ],
        google: [
            { id: 'en-US-Studio-O', name: 'Studio O (Female)', category: 'Female' },
            { id: 'en-US-Studio-Q', name: 'Studio Q (Male)', category: 'Male' },
        ],
    };

    const ttsVoices = computed(() => {
        const provider = tts.value.provider;
        
        // Use API voices if available
        const apiVoices = apiTtsVoices.value[provider];
        if (apiVoices && apiVoices.length > 0) {
            return apiVoices.map(v => ({
                id: v.id,
                name: v.name,
                category: v.category || 'Other',
            }));
        }
        
        // Fall back to hardcoded voices
        return fallbackTtsVoices[provider] || [{ id: 'default', name: 'Default', category: 'Default' }];
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

    // Realtime Configuration
    const realtimeProviders = [
        { provider: 'openai', label: 'OpenAI Realtime', icon: 'simple-icons:openai' },
        { provider: 'gemini', label: 'Google Gemini Live', icon: 'simple-icons:googlegemini' },
    ];

    const realtimeModels = computed(() => {
        switch (realtime.value.provider) {
            case 'openai':
                return [
                    { model: 'gpt-4o-realtime-preview', name: 'GPT-4o Realtime Preview' },
                    { model: 'gpt-4o-realtime-preview-2024-10-01', name: 'GPT-4o Realtime (Oct 2024)' },
                    { model: 'gpt-4o-realtime-preview-2024-12-17', name: 'GPT-4o Realtime (Dec 2024)' },
                ];
            case 'gemini':
                return [
                    { model: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Live' },
                ];
            default:
                return [{ model: 'default', name: 'Default' }];
        }
    });

    // Fallback Realtime voices (used when API is unavailable)
    const fallbackRealtimeVoices: Record<string, Array<{ id: string; name: string }>> = {
        openai: [
            { id: 'alloy', name: 'Alloy' },
            { id: 'ash', name: 'Ash' },
            { id: 'ballad', name: 'Ballad' },
            { id: 'coral', name: 'Coral' },
            { id: 'echo', name: 'Echo' },
            { id: 'sage', name: 'Sage' },
            { id: 'shimmer', name: 'Shimmer' },
            { id: 'verse', name: 'Verse' },
        ],
        gemini: [
            { id: 'Puck', name: 'Puck' },
            { id: 'Charon', name: 'Charon' },
            { id: 'Kore', name: 'Kore' },
            { id: 'Fenrir', name: 'Fenrir' },
            { id: 'Aoede', name: 'Aoede' },
        ],
    };

    const realtimeVoices = computed(() => {
        const provider = realtime.value.provider;
        
        // Use API voices if available
        const apiVoices = apiRealtimeVoices.value[provider];
        if (apiVoices && apiVoices.length > 0) {
            return apiVoices.map(v => ({
                id: v.id,
                name: v.name,
            }));
        }
        
        // Fall back to hardcoded voices
        return fallbackRealtimeVoices[provider] || [{ id: 'default', name: 'Default' }];
    });

    const presets = [
        {
            id: 'fast',
            label: 'Fast',
            icon: 'ph:rocket-duotone',
            title: 'Optimized for lowest latency',
            config: {
                stt: { provider: 'deepgram', model: 'nova-3', language: 'en' },
                llm: { provider: 'groq', model: 'llama-3.1-8b-instant', temperature: 0.7, maxTokens: 512 },
                tts: { provider: 'openai', model: 'tts-1', voice: 'nova', speed: 1.0 },
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
                tts: { provider: 'openai', model: 'tts-1', voice: 'nova', speed: 1.0 },
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
                tts: { provider: 'openai', model: 'tts-1-hd', voice: 'nova', speed: 1.0 },
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
                tts: { provider: 'openai', model: 'tts-1', voice: 'nova', speed: 1.0 },
            }
        },
    ];

    return {
        sttProviders,
        sttModels,
        sttLanguages,
        llmProviders,
        llmModels,
        ttsProviders,
        ttsModels,
        ttsVoices,
        groupedVoices,
        realtimeProviders,
        realtimeModels,
        realtimeVoices,
        presets
    };
}
