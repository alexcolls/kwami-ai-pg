<script setup lang="ts">
import { computed } from 'vue';
import type { InferenceSTTModel, PluginSTTModel } from '@/composables/useModelsApi';
import RangeBar from './RangeBar.vue';

const props = defineProps<{
  model: InferenceSTTModel | PluginSTTModel;
  selected?: boolean;
  disabled?: boolean;
  // Min/max values for range calculations
  minPrice?: number;
  maxPrice?: number;
}>();

const emit = defineEmits<{
  (e: 'select', modelId: string, provider: string): void;
}>();

// Check if model has pricing (InferenceSTTModel)
const hasPricing = computed(() => 'pricing' in props.model && props.model.pricing);

// Provider icon mapping
const providerIcon = computed(() => {
  const icons: Record<string, string> = {
    assemblyai: 'ph:waveform-duotone',
    cartesia: 'ph:speaker-high-duotone',
    deepgram: 'simple-icons:deepgram',
    elevenlabs: 'simple-icons:elevenlabs',
    google: 'simple-icons:googlegemini',
    groq: 'ph:lightning-duotone',
  };
  return icons[props.model.provider.toLowerCase()] || 'ph:microphone-duotone';
});

// Get price per minute
const pricePerMin = computed(() => {
  if (!hasPricing.value) return null;
  return (props.model as InferenceSTTModel).pricing.scale_per_min;
});

// Format price (per minute)
const priceDisplay = computed(() => {
  if (pricePerMin.value === null) return null;
  const price = pricePerMin.value;
  return `$${(price * 1000).toFixed(2)}`;
});

// Price percentage (lower price = higher bar = better, inverted)
const pricePercent = computed(() => {
  if (!props.minPrice || !props.maxPrice || pricePerMin.value === null) return 50;
  const range = props.maxPrice - props.minPrice;
  if (range === 0) return 50;
  return 100 - ((pricePerMin.value - props.minPrice) / range) * 100;
});

// Speed icon
const speedIcon = computed(() => {
  const icons: Record<string, string> = {
    fast: 'ph:lightning-duotone',
    standard: 'ph:gauge-duotone',
    slow: 'ph:hourglass-duotone',
  };
  return icons[props.model.speed] || icons.standard;
});

// Language display and percentage
const isMultilingual = computed(() => {
  return props.model.languages.includes('multilingual');
});

const languageDisplay = computed(() => {
  if (isMultilingual.value) return 'Multi';
  if (props.model.languages.length === 1) return props.model.languages[0]!.toUpperCase();
  return `${props.model.languages.length}`;
});

// Language percent: multilingual = 100%, single language = 30%
const languagePercent = computed(() => {
  return isMultilingual.value ? 100 : 30;
});

// Key features to show
const hasSpecialFeature = computed(() => {
  return props.model.features.includes('diarization') || 
         props.model.features.includes('medical_vocabulary');
});

function handleClick() {
  if (!props.disabled) {
    emit('select', props.model.model_id, props.model.provider);
  }
}
</script>

<template>
  <button
    class="model-card"
    :class="{ selected, disabled }"
    @click="handleClick"
    :disabled="disabled"
  >
    <div class="card-header">
      <iconify-icon :icon="providerIcon" class="provider-icon"></iconify-icon>
      <span class="model-name">{{ model.display_name }}</span>
      <iconify-icon :icon="speedIcon" class="speed-icon" :title="model.speed"></iconify-icon>
    </div>
    
    <!-- Range Bars -->
    <div class="card-ranges">
      <div v-if="priceDisplay" class="range-row">
        <RangeBar 
          :value="pricePercent" 
          icon="ph:currency-dollar-duotone"
          color="purple"
          :title="`Price: ${priceDisplay}/1k min`"
        />
        <span class="range-value">{{ priceDisplay }}</span>
      </div>
      <div class="range-row">
        <RangeBar 
          :value="languagePercent" 
          icon="ph:globe-duotone"
          color="blue"
          :title="`Languages: ${languageDisplay}`"
        />
        <span class="range-value">{{ languageDisplay }}</span>
      </div>
    </div>
    
    <div v-if="hasSpecialFeature" class="card-features">
      <span v-if="model.features.includes('diarization')" class="feature-badge diarization" title="Speaker Diarization">
        <iconify-icon icon="ph:users-duotone"></iconify-icon>
      </span>
      <span v-if="model.features.includes('medical_vocabulary')" class="feature-badge medical" title="Medical">
        <iconify-icon icon="ph:first-aid-kit-duotone"></iconify-icon>
      </span>
    </div>
    
    <div class="selected-indicator">
      <iconify-icon icon="ph:check-circle-duotone"></iconify-icon>
    </div>
  </button>
</template>

<style scoped>
.model-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  text-align: left;
  font-family: inherit;
  min-height: 90px;
}

.model-card:hover:not(.disabled) {
  background: var(--surface-2);
  border-color: var(--surface-3);
  transform: translateY(-1px);
}

.model-card.selected {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  box-shadow: 0 2px 12px var(--accent-glow);
}

.model-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.provider-icon {
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.model-card.selected .provider-icon {
  color: var(--accent-primary);
}

.model-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.speed-icon {
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.model-card:hover .speed-icon {
  color: var(--text-secondary);
}

.card-ranges {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.range-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.range-value {
  font-size: 9px;
  color: var(--text-muted);
  min-width: 32px;
  text-align: right;
}

.card-features {
  display: flex;
  gap: 4px;
  margin-top: auto;
}

.feature-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  font-size: 10px;
}

.feature-badge.diarization {
  background: rgba(147, 51, 234, 0.2);
  color: #a78bfa;
}

.feature-badge.medical {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.model-card.selected .feature-badge {
  background: rgba(0, 217, 255, 0.2);
  color: var(--accent-primary);
}

.selected-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 16px;
  color: var(--accent-primary);
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--duration-fast) var(--ease-out);
}

.model-card.selected .selected-indicator {
  opacity: 1;
  transform: scale(1);
}
</style>
