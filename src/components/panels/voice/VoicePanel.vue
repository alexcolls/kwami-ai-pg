<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useKwami } from '@/composables/useKwami';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import VoiceStt from './VoiceStt.vue';
import VoiceLlm from './VoiceLlm.vue';
import VoiceTts from './VoiceTts.vue';

import type { STTConfig, LLMConfig, TTSConfig } from 'kwami-ai';

const { kwami } = useKwami();

const pipelineMode = ref<'standard' | 'realtime'>('standard');

const stt = reactive({ provider: 'deepgram', model: 'nova-2', language: 'en' });
const llm = reactive({ provider: 'openai', model: 'gpt-4o', temperature: 0.7, maxTokens: 512 });
const tts = reactive({ provider: 'cartesia', voice: 'british_lady', speed: 1.0 });
// const realtime = reactive({ ... }) // Unused for now

const presets = [
  { id: 'fast', label: 'Fast', icon: 'ph:rocket-duotone', title: 'Optimized for speed' },
  { id: 'balanced', label: 'Balanced', icon: 'ph:scales-duotone', title: 'Balance of speed and quality' },
  { id: 'quality', label: 'Quality', icon: 'ph:star-duotone', title: 'Optimized for quality' },
  { id: 'multilingual', label: 'Multi-lang', icon: 'ph:globe-duotone', title: 'Multi-language support' },
];

const activePreset = ref('balanced');

function applyPreset(id: string) {
  activePreset.value = id;
  // TODO: Logic to set stt/llm/tts values based on preset
}

// Extended Mock Data matching Legacy
const sttProviders = [
  { provider: 'deepgram', label: 'Deepgram' },
  { provider: 'assemblyai', label: 'AssemblyAI' },
  { provider: 'cartesia', label: 'Cartesia' },
  { provider: 'elevenlabs', label: 'ElevenLabs' },
  { provider: 'openai', label: 'OpenAI Whisper' },
  { provider: 'google', label: 'Google Cloud' },
  { provider: 'azure', label: 'Azure Speech' },
];

const sttModels = computed(() => {
  if (stt.provider === 'deepgram') {
    return [
      { model: 'nova-3', name: 'Nova 3' },
      { model: 'nova-2', name: 'Nova 2' },
      { model: 'nova-2-conversational-ai', name: 'Nova 2 Conversational' },
    ];
  }
  return [{ model: 'default', name: 'Default Model' }];
});

const llmProviders = [
  { provider: 'openai', label: 'OpenAI' },
  { provider: 'gemini', label: 'Google Gemini' },
  { provider: 'deepseek', label: 'DeepSeek' },
  { provider: 'anthropic', label: 'Anthropic Claude' },
  { provider: 'groq', label: 'Groq' },
  { provider: 'mistral', label: 'Mistral AI' },
  { provider: 'ollama', label: 'Ollama (Local)' },
];

const llmModels = computed(() => {
  if (llm.provider === 'openai') {
    return [
      { model: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
      { model: 'gpt-4.1', name: 'GPT-4.1' },
      { model: 'gpt-4o', name: 'GPT-4o' },
      { model: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    ];
  }
  return [{ model: 'default', name: 'Default Model' }];
});

const ttsProviders = [
  { provider: 'cartesia', label: 'Cartesia' },
  { provider: 'elevenlabs', label: 'ElevenLabs' },
  { provider: 'deepgram', label: 'Deepgram' },
  { provider: 'rime', label: 'Rime' },
  { provider: 'inworld', label: 'Inworld' },
  { provider: 'openai', label: 'OpenAI TTS' },
  { provider: 'azure', label: 'Azure Speech' },
];

const ttsVoices = computed(() => {
  if (tts.provider === 'cartesia') {
    return [
        { id: '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc', name: 'Jacqueline (Female, EN)' },
        { id: 'a167e0f3-df7e-4d52-a9c3-f949145efdab', name: 'Blake (Male, EN)' },
        { id: 'f31cc6a7-c1e8-4764-980c-60a361443dd1', name: 'Robyn (Female, AU)' },
        { id: '5c5ad5e7-1020-476b-8b91-fdcbe9cc313c', name: 'Daniela (Female, ES)' },
    ];
  }
  return [{ id: 'default', name: 'Default Voice' }];
});

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
      tts: { provider: tts.provider, voice: tts.voice, speed: tts.speed } as TTSConfig,
    };
    kwami.value.agent.updateConfig({
      livekit: { ...kwami.value.agent.getConfig().livekit, ...config },
    });
  } else {
    // Realtime logic
  }
  console.log('Voice config applied', { mode: pipelineMode.value, stt, llm, tts });
}

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

      <div v-if="pipelineMode === 'standard'">
        <VoiceStt :config="stt" :providers="sttProviders" :models="sttModels" />
        <VoiceLlm :config="llm" :providers="llmProviders" :models="llmModels" />
        <VoiceTts :config="tts" :providers="ttsProviders" :voices="ttsVoices" />
      </div>

      <div v-else class="realtime-placeholder">
        <iconify-icon
          icon="ph:warning-duotone"
          style="font-size: 24px; color: var(--accent-primary)"
        ></iconify-icon>
        <p>Realtime configuration not yet implemented in this preview.</p>
      </div>

      <PanelSection>
        <BaseButton variant="primary" block icon="ph:check-duotone" @click="applyConfig"
          >Apply Configuration</BaseButton
        >
      </PanelSection>
    </div>
  </div>
</template>

<style scoped>
.mode-selector {
  display: flex;
  background: var(--surface-1);
  padding: 4px;
  border-radius: 10px;
  margin-bottom: 8px;
}
.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  background: none;
  color: var(--text-secondary);
  transition: all 0.2s;
  font-size: 12px;
  font-weight: 500;
}
.mode-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}
.mode-btn.active {
  background: var(--surface-3);
  color: var(--text-primary);
  border: 1px solid var(--accent-primary);
}
.realtime-placeholder {
  padding: 32px;
  text-align: center;
  border: 1px dashed var(--glass-border);
  border-radius: 12px;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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
  padding: 10px 4px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn iconify-icon {
  font-size: 18px;
  color: var(--text-muted);
}

.preset-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.preset-btn.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  color: var(--text-primary);
  box-shadow: 0 4px 12px var(--accent-glow);
}

.preset-btn.active iconify-icon {
  color: var(--accent-primary);
}
</style>
