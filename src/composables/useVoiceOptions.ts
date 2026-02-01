import { computed } from 'vue';


export function useVoiceOptions(
    stt: { value: { provider: string } },
    llm: { value: { provider: string } },
    tts: { value: { provider: string } },
    realtime: { value: { provider: string } }
) {
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

    const ttsVoices = computed(() => {
        switch (tts.value.provider) {
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
                // Note: 'ballad' and 'verse' are only available for OpenAI Realtime API, not standard TTS
                return [
                    { id: 'alloy', name: 'Alloy', category: 'Neutral' },
                    { id: 'ash', name: 'Ash', category: 'Male' },
                    { id: 'coral', name: 'Coral', category: 'Female' },
                    { id: 'echo', name: 'Echo', category: 'Male' },
                    { id: 'fable', name: 'Fable', category: 'Neutral' },
                    { id: 'nova', name: 'Nova', category: 'Female' },
                    { id: 'onyx', name: 'Onyx', category: 'Male' },
                    { id: 'sage', name: 'Sage', category: 'Female' },
                    { id: 'shimmer', name: 'Shimmer', category: 'Female' },
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

    const realtimeVoices = computed(() => {
        switch (realtime.value.provider) {
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
            case 'gemini':
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
