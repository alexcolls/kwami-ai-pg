<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useModelsApi, type InferenceTTSModel } from '@/composables/useModelsApi';
import { useVoiceStore } from '@/stores/voice';
import { useKwami } from '@/composables/useKwami';
import { storeToRefs } from 'pinia';
import PanelSection from '@/components/ui/PanelSection.vue';
import TTSModelCard from '@/components/ui/TTSModelCard.vue';

const { fetchTTSInferenceModels, ttsInferenceModels, isLoading } = useModelsApi();
const voiceStore = useVoiceStore();
const { tts } = storeToRefs(voiceStore);
const { kwami, isConnected } = useKwami();

// Local state
const selectedProvider = ref<string>(tts.value.provider);
const selectedModel = ref<string>(tts.value.model);
const expandedProvider = ref<string | null>(null);

function handleAccordionToggle(sectionId: string | undefined, wasCollapsed: boolean) {
  if (wasCollapsed) {
    expandedProvider.value = sectionId || null;
  } else {
    expandedProvider.value = null;
  }
}

onMounted(async () => {
  await fetchTTSInferenceModels();
});

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

const hasInferenceModels = computed(() => {
  return ttsInferenceModels.value?.models && ttsInferenceModels.value.models.length > 0;
});

// Sorting
const sortBy = ref<'provider' | 'price' | 'features'>('provider');

// Min/max calculations
const minPrice = computed(() => {
  const models = ttsInferenceModels.value?.models || [];
  const prices = models.map(m => m.pricing?.scale_per_1m_chars).filter(p => p !== undefined) as number[];
  return prices.length ? Math.min(...prices) : 0;
});

const maxPrice = computed(() => {
  const models = ttsInferenceModels.value?.models || [];
  const prices = models.map(m => m.pricing?.scale_per_1m_chars).filter(p => p !== undefined) as number[];
  return prices.length ? Math.max(...prices) : 1;
});

// Count advanced features
function countAdvancedFeatures(features: string[]): number {
  const advanced = ['voice_cloning', 'emotion_control', 'ultra_low_latency'];
  return features.filter(f => advanced.includes(f)).length;
}

// Models grouped by provider (for accordion view)
const modelsByProvider = computed(() => {
  const models = ttsInferenceModels.value?.models || [];
  if (!models.length) return {};
  
  const grouped: Record<string, InferenceTTSModel[]> = {};
  for (const model of models) {
    const provider = model.provider;
    if (!grouped[provider]) grouped[provider] = [];
    grouped[provider].push(model);
  }
  return grouped;
});

// Flat sorted list (for price/features view)
const sortedModelsFlat = computed(() => {
  const models = ttsInferenceModels.value?.models || [];
  if (!models.length) return [];
  
  let sorted = [...models];
  
  if (sortBy.value === 'price') {
    // Highest price first
    sorted.sort((a, b) => (b.pricing?.scale_per_1m_chars || 0) - (a.pricing?.scale_per_1m_chars || 0));
  } else if (sortBy.value === 'features') {
    // Most features first
    sorted.sort((a, b) => countAdvancedFeatures(b.features) - countAdvancedFeatures(a.features));
  }
  
  return sorted;
});

function getProviderIcon(provider: string): string {
  const icons: Record<string, string> = {
    cartesia: 'ph:speaker-high-duotone',
    deepgram: 'simple-icons:deepgram',
    elevenlabs: 'simple-icons:elevenlabs',
    inworld: 'ph:robot-duotone',
    rime: 'ph:speaker-simple-high-duotone',
    openai: 'simple-icons:openai',
    google: 'simple-icons:googlegemini',
  };
  return icons[provider.toLowerCase()] || 'ph:speaker-high-duotone';
}

function selectModel(modelId: string, provider: string) {
  selectedProvider.value = provider;
  selectedModel.value = modelId;
  
  voiceStore.updateTTS({
    provider: provider as any,
    model: modelId,
  });
  
  if (isConnected.value && kwami.value) {
    kwami.value.agent.updateTtsLive({
      provider,
      model: modelId,
    });
  }
}

watch(() => [tts.value.provider, tts.value.model], ([newProvider, newModel]) => {
  selectedProvider.value = newProvider;
  selectedModel.value = newModel;
});
</script>

<template>
  <div class="tab-content">
    <!-- Current Selection -->
    <div class="current-selection">
      <div class="selection-label">Selected</div>
      <div class="selection-value">
        <iconify-icon :icon="getProviderIcon(selectedProvider)"></iconify-icon>
        <span>{{ selectedModel }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <iconify-icon icon="ph:spinner-duotone" class="spinner"></iconify-icon>
      <span>Loading models...</span>
    </div>

    <template v-if="!isLoading">
      <!-- Legend & Sort -->
      <div class="legend-sort-row">
        <div class="legend">
          <div class="legend-group">
            <span class="legend-label">Features</span>
            <div class="legend-items">
              <span class="legend-item feat-clone"><iconify-icon icon="ph:user-sound-duotone"></iconify-icon> Voice Clone</span>
              <span class="legend-item feat-emotion"><iconify-icon icon="ph:smiley-duotone"></iconify-icon> Emotion</span>
              <span class="legend-item feat-multi"><iconify-icon icon="ph:globe-duotone"></iconify-icon> Multi</span>
            </div>
          </div>
        </div>
        <div class="sort-controls">
          <span class="sort-label">Sort:</span>
          <button 
            class="sort-btn" 
            :class="{ active: sortBy === 'provider' }"
            @click="sortBy = 'provider'"
          >Provider</button>
          <button 
            class="sort-btn" 
            :class="{ active: sortBy === 'price' }"
            @click="sortBy = 'price'"
          >Price</button>
          <button 
            class="sort-btn" 
            :class="{ active: sortBy === 'features' }"
            @click="sortBy = 'features'"
          >Features</button>
        </div>
      </div>

      <!-- Models by Provider (accordion view) -->
      <template v-if="sortBy === 'provider'">
        <PanelSection
          v-for="(models, provider) in modelsByProvider"
          :key="provider"
          :title="String(provider).charAt(0).toUpperCase() + String(provider).slice(1)"
          :icon="getProviderIcon(String(provider))"
          collapsible
          noPaddingX
          :sectionId="'tts-' + String(provider)"
          :collapsed="expandedProvider !== 'tts-' + String(provider)"
          @toggle="handleAccordionToggle"
        >
          <div class="models-grid">
            <TTSModelCard
              v-for="model in models"
              :key="model.model_id"
              :model="model"
              :selected="selectedModel === model.model_id"
              :minPrice="minPrice"
              :maxPrice="maxPrice"
              @select="selectModel"
            />
          </div>
        </PanelSection>
      </template>

      <!-- Flat sorted view (for price/features) -->
      <template v-else>
        <div class="models-grid">
          <TTSModelCard
            v-for="model in sortedModelsFlat"
            :key="model.model_id"
            :model="model"
            :selected="selectedModel === model.model_id"
            :minPrice="minPrice"
            :maxPrice="maxPrice"
            @select="selectModel"
          />
        </div>
      </template>

      <div v-if="!hasInferenceModels" class="empty-state">
        <iconify-icon icon="lucide:audio-lines"></iconify-icon>
        <span>No models available</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.current-selection {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--accent-glow);
  border: 1px solid var(--accent-primary);
  border-radius: var(--radius-md);
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
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

.selection-value iconify-icon {
  font-size: 14px;
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

.legend-sort-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 10px;
  background: var(--surface-1);
  border-radius: var(--radius-sm);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-label {
  font-size: 9px;
  color: var(--text-muted);
  margin-right: 4px;
}

.sort-btn {
  padding: 4px 8px;
  font-size: 9px;
  font-weight: 500;
  font-family: inherit;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.sort-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.sort-btn.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.legend-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.legend-label {
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.legend-items {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 9px;
  color: var(--text-secondary);
}

.legend-item iconify-icon {
  font-size: 10px;
}


.legend-item.feat-clone iconify-icon {
  color: #a78bfa;
}

.legend-item.feat-emotion iconify-icon {
  color: #fbbf24;
}

.source-tabs {
  display: flex;
  background: var(--surface-1);
  padding: 3px;
  border-radius: var(--radius-sm);
  gap: 3px;
}

.source-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  transition: all var(--duration-fast) var(--ease-in-out);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
}

.source-btn iconify-icon {
  font-size: 12px;
}

.source-btn:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text-primary);
}

.source-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.source-btn.active {
  background: var(--surface-2);
  color: var(--accent-primary);
}

.models-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

</style>
