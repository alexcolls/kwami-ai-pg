<script setup lang="ts">
import { watch } from 'vue';
import { useKwami } from '@/composables/useKwami';
import { useVoiceStore } from '@/stores/voice';
import { storeToRefs } from 'pinia';
import BasePanel from '@/components/ui/BasePanel.vue';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';

import { useVoiceOptions } from '@/composables/useVoiceOptions';
import { useVoiceLiveUpdates } from '@/composables/useVoiceLiveUpdates';

const { kwami, isConnected } = useKwami();
const voiceStore = useVoiceStore();

// Use store refs for reactive state that persists across panel switches
const { pipelineMode, stt, llm, tts, realtime, activePreset } = storeToRefs(voiceStore);

// Extract options using the new composable
const {
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
} = useVoiceOptions(stt, llm, tts, realtime);

// Extract live update logic using the new composable
const {
  // applyConfig,
  updateVoiceLive,
  updateLlmLive,
  updateSttLive
} = useVoiceLiveUpdates(kwami, isConnected, voiceStore, { stt, llm, tts, realtime, pipelineMode });

function applyPresetConfig(preset: typeof presets[0]) {
  voiceStore.setActivePreset(preset.id);
  voiceStore.applyPreset(preset.config as any);
}

// =============================================================================
// Watchers
// =============================================================================

// Reset model when provider changes
watch(() => stt.value.provider, () => {
  stt.value.model = sttModels.value[0]?.model || 'default';
});

watch(() => llm.value.provider, () => {
  llm.value.model = llmModels.value[0]?.model || 'default';
});

watch(() => tts.value.provider, () => {
  tts.value.model = ttsModels.value[0]?.model || 'default';
  tts.value.voice = ttsVoices.value[0]?.id || 'default';
});

watch(() => realtime.value.provider, () => {
  realtime.value.model = realtimeModels.value[0]?.model || 'default';
  realtime.value.voice = realtimeVoices.value[0]?.id || 'default';
});

// Watch for TTS voice changes when connected
watch(() => tts.value.voice, (newVoice, oldVoice) => {
  console.log(`👀 TTS voice changed: ${oldVoice} → ${newVoice}, isConnected: ${isConnected.value}`);
  if (isConnected.value && newVoice) {
    updateVoiceLive();
  }
});

// Watch for TTS speed changes when connected
watch(() => tts.value.speed, (newSpeed, oldSpeed) => {
  console.log(`👀 TTS speed changed: ${oldSpeed} → ${newSpeed}, isConnected: ${isConnected.value}`);
  if (isConnected.value) {
    updateVoiceLive();
  }
});

// Watch for LLM model changes when connected
watch(() => llm.value.model, (newModel, oldModel) => {
  console.log(`👀 LLM model changed: ${oldModel} → ${newModel}, isConnected: ${isConnected.value}`);
  if (isConnected.value) {
    updateLlmLive();
  }
});

// Watch for LLM provider changes when connected
watch(() => llm.value.provider, (newProvider, oldProvider) => {
  console.log(`👀 LLM provider changed: ${oldProvider} → ${newProvider}, isConnected: ${isConnected.value}`);
  if (isConnected.value && newProvider !== oldProvider) {
    // After provider change, model will also update - wait for it
    setTimeout(() => updateLlmLive(), 100);
  }
});

// Watch for LLM temperature changes when connected
watch(() => llm.value.temperature, (newTemp, oldTemp) => {
  console.log(`👀 LLM temperature changed: ${oldTemp} → ${newTemp}, isConnected: ${isConnected.value}`);
  if (isConnected.value) {
    updateLlmLive();
  }
});

// Watch for STT language changes when connected
watch(() => stt.value.language, (newLang, oldLang) => {
  console.log(`👀 STT language changed: ${oldLang} → ${newLang}, isConnected: ${isConnected.value}`);
  if (isConnected.value) {
    updateSttLive();
  }
});
</script>

<template>
  <BasePanel icon="ph:microphone-duotone" title="Voice Pipeline">
    <!-- Mode Selection -->
    <PanelSection>
      <div class="mode-selector">
        <button
          class="mode-btn"
          :class="{ active: pipelineMode === 'stt-llm-tts' }"
          @click="pipelineMode = 'stt-llm-tts'"
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
          @click="applyPresetConfig(preset)"
        >
          <iconify-icon :icon="preset.icon"></iconify-icon>
          <span>{{ preset.label }}</span>
        </button>
      </div>
    </PanelSection>

    <!-- Standard Pipeline Config -->
    <div v-if="pipelineMode === 'stt-llm-tts'" class="pipeline-config">
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
      </PanelSection>
    </div>

    <!-- Realtime Config -->
    <div v-else class="realtime-config">
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
      </PanelSection>
    </div>
  </BasePanel>
</template>

<style scoped>
.mode-selector {
  display: flex;
  background: var(--surface-1);
  padding: 4px;
  border-radius: var(--radius-md);
  gap: 4px;
}

.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
}

.mode-btn.active {
  background: var(--surface-2);
  color: var(--text-primary);
  border-color: var(--glass-border);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.mode-btn:hover:not(.active) {
  color: var(--text-primary);
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.preset-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
}

.preset-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.preset-btn.active {
  background: var(--accent-glow);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.voice-selection {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-left: 2px;
}

.voice-select {
  width: 100%;
  padding: 10px 12px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
}

.voice-select:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-glow);
}

.pipeline-config, .realtime-config {
  display: flex;
  flex-direction: column;
}
</style>
