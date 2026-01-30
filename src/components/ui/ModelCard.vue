<script setup lang="ts">
import { computed } from 'vue';
import type { InferenceModel, PluginModel } from '@/composables/useModelsApi';
import RangeBar from './RangeBar.vue';

const props = defineProps<{
  model: InferenceModel | PluginModel;
  selected?: boolean;
  disabled?: boolean;
  // Min/max values for range calculations
  minContext?: number;
  maxContext?: number;
  minPrice?: number;
  maxPrice?: number;
}>();

const emit = defineEmits<{
  (e: 'select', modelId: string, provider: string): void;
}>();

// Check if model has providers (InferenceModel)
const hasProviders = computed(() => 'providers' in props.model && props.model.providers);

// Provider icon mapping
const providerIcon = computed(() => {
  const icons: Record<string, string> = {
    openai: 'simple-icons:openai',
    anthropic: 'simple-icons:anthropic',
    google: 'simple-icons:googlegemini',
    groq: 'ph:lightning-duotone',
    mistralai: 'ph:wind-duotone',
    deepseek: 'game-icons:whale-tail',
    cerebras: 'ph:cpu-duotone',
    together: 'ph:circles-three-duotone',
    perplexity: 'ph:compass-duotone',
    xai: 'ph:x-circle-duotone',
    moonshot: 'ph:moon-duotone',
  };
  return icons[props.model.provider.toLowerCase()] || 'ph:cube-duotone';
});

// Format context window
const contextDisplay = computed(() => {
  const ctx = props.model.context_window;
  if (ctx >= 1000000) return `${(ctx / 1000000).toFixed(0)}M`;
  if (ctx >= 1000) return `${(ctx / 1000).toFixed(0)}K`;
  return ctx.toString();
});

// Context percentage (higher context = higher bar = better)
const contextPercent = computed(() => {
  if (!props.minContext || !props.maxContext) return 50;
  const range = props.maxContext - props.minContext;
  if (range === 0) return 50;
  return ((props.model.context_window - props.minContext) / range) * 100;
});

// Get the cheapest input price from providers
const inputPrice = computed(() => {
  if (!hasProviders.value) return null;
  
  const providers = (props.model as InferenceModel).providers;
  if (!providers || Object.keys(providers).length === 0) return null;
  
  const prices = Object.values(providers).map(p => p.input_per_1m);
  return Math.min(...prices);
});

const priceDisplay = computed(() => {
  if (inputPrice.value === null) return null;
  const price = inputPrice.value;
  if (price < 0.1) return `$${price.toFixed(3)}`;
  if (price < 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(1)}`;
});

// Price percentage (lower price = higher bar = better, so we invert)
const pricePercent = computed(() => {
  if (!props.minPrice || !props.maxPrice || inputPrice.value === null) return 50;
  const range = props.maxPrice - props.minPrice;
  if (range === 0) return 50;
  // Invert: lowest price = 100%, highest price = 0%
  return 100 - ((inputPrice.value - props.minPrice) / range) * 100;
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

// Key capabilities to show (max 2)
const keyCapabilities = computed(() => {
  const priority = ['vision', 'function_calling', 'json_mode'];
  return props.model.capabilities
    .filter(c => priority.includes(c))
    .slice(0, 2);
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
      <div class="range-row">
        <RangeBar 
          :value="contextPercent" 
          icon="ph:stack-duotone" 
          color="cyan"
          :title="`Context: ${contextDisplay}`"
        />
        <span class="range-value">{{ contextDisplay }}</span>
      </div>
      <div v-if="priceDisplay" class="range-row">
        <RangeBar 
          :value="pricePercent" 
          icon="ph:currency-dollar-duotone"
          color="purple"
          :title="`Price: ${priceDisplay}/1M`"
        />
        <span class="range-value">{{ priceDisplay }}</span>
      </div>
    </div>
    
    <div v-if="keyCapabilities.length" class="card-capabilities">
      <span v-if="keyCapabilities.includes('vision')" class="cap-badge vision" title="Vision">
        <iconify-icon icon="ph:eye-duotone"></iconify-icon>
      </span>
      <span v-if="keyCapabilities.includes('function_calling')" class="cap-badge tools" title="Function calling">
        <iconify-icon icon="ph:wrench-duotone"></iconify-icon>
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
  min-width: 28px;
  text-align: right;
}

.card-capabilities {
  display: flex;
  gap: 4px;
  margin-top: auto;
}

.cap-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  font-size: 10px;
}

.cap-badge.vision {
  background: rgba(147, 51, 234, 0.2);
  color: #a78bfa;
}

.cap-badge.tools {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.model-card.selected .cap-badge {
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
