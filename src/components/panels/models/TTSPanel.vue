<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useModelsApi, type InferenceTTSModel } from '@/composables/useModelsApi';
import { useVoiceStore } from '@/stores/voice';
import { useKwami } from '@/composables/useKwami';
import { storeToRefs } from 'pinia';
import PanelSection from '@/components/ui/PanelSection.vue';
import TTSModelCard from '@/components/ui/TTSModelCard.vue';

const { fetchTTSInferenceModels, fetchTTSPluginModels, ttsInferenceModels, ttsPluginModels, isLoading } = useModelsApi();
const voiceStore = useVoiceStore();
const { tts } = storeToRefs(voiceStore);
const { kwami, isConnected } = useKwami();

// Local state
const selectedProvider = ref<string>(tts.value.provider);
const selectedModel = ref<string>(tts.value.model);
const activeTab = ref<'inference' | 'plugins'>('inference');
const expandedProvider = ref<string | null>(null);

// Handle accordion toggle - only one open at a time
function handleAccordionToggle(sectionId: string | undefined, wasCollapsed: boolean) {
  if (wasCollapsed) {
    expandedProvider.value = sectionId || null;
  } else {
    expandedProvider.value = null;
  }
}

// Fetch models on mount
onMounted(async () => {
  await Promise.all([
    fetchTTSInferenceModels(),
    fetchTTSPluginModels(),
  ]);
});

// Computed: Inference models grouped by provider
const inferenceModelsByProvider = computed(() => {
  if (!ttsInferenceModels.value?.models) return {};
  
  const grouped: Record<string, InferenceTTSModel[]> = {};
  for (const model of ttsInferenceModels.value.models) {
    const provider = model.provider;
    if (!grouped[provider]) grouped[provider] = [];
    grouped[provider].push(model);
  }
  return grouped;
});

// Computed: Plugin models grouped by provider
const pluginModelsByProvider = computed(() => {
  if (!ttsPluginModels.value?.providers) return {};
  return ttsPluginModels.value.providers;
});

// Check if we have inference models
const hasInferenceModels = computed(() => {
  return ttsInferenceModels.value?.models && ttsInferenceModels.value.models.length > 0;
});

// Check if we have plugin models
const hasPluginModels = computed(() => {
  return Object.keys(pluginModelsByProvider.value).length > 0;
});

// Provider icon mapping
function getProviderIcon(provider: string): string {
  const icons: Record<string, string> = {
    cartesia: 'ph:speaker-high-duotone',
    deepgram: 'simple-icons:deepgram',
    elevenlabs: 'ph:waveform-duotone',
    inworld: 'ph:robot-duotone',
    rime: 'ph:speaker-simple-high-duotone',
    openai: 'simple-icons:openai',
    google: 'simple-icons:googlegemini',
    groq: 'ph:lightning-duotone',
  };
  return icons[provider.toLowerCase()] || 'ph:speaker-high-duotone';
}

// Handle model selection
function selectModel(modelId: string, provider: string) {
  selectedProvider.value = provider;
  selectedModel.value = modelId;
  
  // Update store
  voiceStore.updateTTS({
    provider: provider as any,
    model: modelId,
  });
  
  // If connected, update live
  if (isConnected.value && kwami.value) {
    (kwami.value.agent as any).updateTtsLive({
      provider,
      model: modelId,
    });
    console.log('🗣️ TTS updated live:', { provider, model: modelId });
  }
}

// Watch for external changes to tts store
watch(() => [tts.value.provider, tts.value.model], ([newProvider, newModel]) => {
  selectedProvider.value = newProvider || '';
  selectedModel.value = newModel || '';
});
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:megaphone-duotone" class="panel-icon"></iconify-icon>
      <h2>Text-to-Speech</h2>
    </div>

    <div class="panel-body">
      <!-- Current Selection -->
      <PanelSection>
        <div class="current-selection">
          <div class="selection-label">Selected</div>
          <div class="selection-value">
            <iconify-icon :icon="getProviderIcon(selectedProvider)"></iconify-icon>
            <span>{{ selectedModel }}</span>
          </div>
        </div>
      </PanelSection>

      <!-- Loading State -->
      <PanelSection v-if="isLoading">
        <div class="loading-state">
          <iconify-icon icon="ph:spinner-duotone" class="spinner"></iconify-icon>
          <span>Loading models...</span>
        </div>
      </PanelSection>

      <!-- Model Selection -->
      <PanelSection v-if="!isLoading" title="Models" icon="ph:list-bullets-duotone">
        <p class="section-description">
          Choose between hosted models (no API key needed) or use your own provider keys.
        </p>
        
        <div class="legend">
          <div class="legend-group">
            <span class="legend-label">Speed</span>
            <div class="legend-items">
              <span class="legend-item"><iconify-icon icon="ph:lightning-duotone"></iconify-icon> Fast</span>
              <span class="legend-item"><iconify-icon icon="ph:gauge-duotone"></iconify-icon> Standard</span>
            </div>
          </div>
          <div class="legend-group">
            <span class="legend-label">Tier</span>
            <div class="legend-items">
              <span class="legend-item tier-flagship">Flagship</span>
              <span class="legend-item tier-budget">Budget</span>
            </div>
          </div>
          <div class="legend-group">
            <span class="legend-label">Features</span>
            <div class="legend-items">
              <span class="legend-item feat-clone"><iconify-icon icon="ph:user-sound-duotone"></iconify-icon> Voice Clone</span>
              <span class="legend-item feat-emotion"><iconify-icon icon="ph:smiley-duotone"></iconify-icon> Emotion</span>
            </div>
          </div>
        </div>

        <div class="tab-selector">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'inference' }"
            @click="activeTab = 'inference'"
            :disabled="!hasInferenceModels"
          >
            <iconify-icon icon="ph:cloud-duotone"></iconify-icon>
            <span>Standard</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'plugins' }"
            @click="activeTab = 'plugins'"
            :disabled="!hasPluginModels"
          >
            <iconify-icon icon="ph:plug-duotone"></iconify-icon>
            <span>Premium</span>
          </button>
        </div>
      </PanelSection>

      <!-- Inference Models (Standard/Hosted) -->
      <template v-if="activeTab === 'inference' && !isLoading">
        <PanelSection
          v-for="(models, provider) in inferenceModelsByProvider"
          :key="provider"
          :title="String(provider).charAt(0).toUpperCase() + String(provider).slice(1)"
          :icon="getProviderIcon(String(provider))"
          collapsible
          :sectionId="'inference-' + String(provider)"
          :collapsed="expandedProvider !== 'inference-' + String(provider)"
          @toggle="handleAccordionToggle"
        >
          <div class="models-grid">
            <TTSModelCard
              v-for="model in models"
              :key="model.model_id"
              :model="model"
              :selected="selectedModel === model.model_id"
              @select="selectModel"
            />
          </div>
        </PanelSection>
        
        <PanelSection v-if="!hasInferenceModels">
          <div class="empty-state">
            <iconify-icon icon="ph:cloud-slash-duotone"></iconify-icon>
            <span>No hosted models available</span>
          </div>
        </PanelSection>
      </template>

      <!-- Plugin Models (Premium/Your API) -->
      <template v-if="activeTab === 'plugins' && !isLoading">
        <PanelSection
          v-for="(models, provider) in pluginModelsByProvider"
          :key="provider"
          :title="String(provider).charAt(0).toUpperCase() + String(provider).slice(1)"
          :icon="getProviderIcon(String(provider))"
          collapsible
          :sectionId="'plugins-' + String(provider)"
          :collapsed="expandedProvider !== 'plugins-' + String(provider)"
          @toggle="handleAccordionToggle"
        >
          <div class="models-grid">
            <TTSModelCard
              v-for="model in models"
              :key="model.model_id"
              :model="model"
              :selected="selectedModel === model.model_id"
              @select="selectModel"
            />
          </div>
        </PanelSection>
        
        <PanelSection v-if="!hasPluginModels">
          <div class="empty-state">
            <iconify-icon icon="ph:plug-duotone"></iconify-icon>
            <span>No plugin models available</span>
          </div>
        </PanelSection>
      </template>
    </div>
  </div>
</template>

<style scoped>
.panel-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--surface-2);
}

.panel-icon {
  font-size: 24px;
  color: var(--accent-primary);
}

.panel-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-description {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 12px;
  background: var(--surface-1);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.legend-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.legend-items {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--text-secondary);
}

.legend-item iconify-icon {
  font-size: 12px;
}

.legend-item.tier-flagship {
  padding-left: 6px;
  border-left: 2px solid #ffd700;
}

.legend-item.tier-budget {
  padding-left: 6px;
  border-left: 2px solid #4ade80;
}

.legend-item.feat-clone iconify-icon {
  color: #a78bfa;
}

.legend-item.feat-emotion iconify-icon {
  color: #fbbf24;
}

.current-selection {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--accent-glow);
  border: 1px solid var(--accent-primary);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 12px var(--accent-glow);
}

.selection-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent-primary);
}

.selection-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

.selection-value iconify-icon {
  font-size: 16px;
  color: var(--accent-primary);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-size: 13px;
}

.spinner {
  font-size: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.tab-selector {
  display: flex;
  background: var(--surface-1);
  padding: 4px;
  border-radius: var(--radius-md);
  gap: 4px;
}

.tab-btn {
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
  transition: all var(--duration-fast) var(--ease-in-out);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
}

.tab-btn iconify-icon {
  font-size: 16px;
}

.tab-btn:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text-primary);
}

.tab-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tab-btn.active {
  background: var(--accent-glow);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--text-muted);
  font-size: 13px;
}

.empty-state iconify-icon {
  font-size: 32px;
}
</style>
