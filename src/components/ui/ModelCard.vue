<script setup lang="ts">
import { ref, computed } from 'vue';
import type { InferenceModel, PluginModel } from '@/composables/useModelsApi';
import RangeBar from './RangeBar.vue';

// Language name mapping
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', 'en-US': 'English (US)', 'en-GB': 'English (UK)', 'en-AU': 'English (AU)',
  es: 'Spanish', 'es-419': 'Spanish (LATAM)', 'es-ES': 'Spanish (Spain)',
  fr: 'French', 'fr-CA': 'French (CA)', de: 'German', it: 'Italian',
  pt: 'Portuguese', 'pt-BR': 'Portuguese (BR)', nl: 'Dutch', pl: 'Polish',
  ru: 'Russian', zh: 'Chinese', 'zh-CN': 'Chinese (Simplified)', 'zh-TW': 'Chinese (Traditional)',
  ja: 'Japanese', ko: 'Korean', ar: 'Arabic', hi: 'Hindi', tr: 'Turkish',
  vi: 'Vietnamese', th: 'Thai', id: 'Indonesian', sv: 'Swedish', da: 'Danish',
  no: 'Norwegian', fi: 'Finnish', cs: 'Czech', el: 'Greek', he: 'Hebrew',
  hu: 'Hungarian', ro: 'Romanian', uk: 'Ukrainian', multi: 'Multi-language',
  multilingual: 'Multilingual',
};

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

// Speed percentage (fast = 100%, standard = 60%, slow = 30%)
const speedPercent = computed(() => {
  const speedValues: Record<string, number> = {
    fast: 100,
    standard: 60,
    slow: 30,
  };
  return speedValues[props.model.speed] || 60;
});

const speedDisplay = computed(() => {
  const labels: Record<string, string> = {
    fast: 'Fast',
    standard: 'Medium',
    slow: 'Slow',
  };
  return labels[props.model.speed] || 'Medium';
});

// Language display and percentage
const isMultilingual = computed(() => {
  return props.model.languages?.includes('multilingual') ?? false;
});

const languageDisplay = computed(() => {
  if (!props.model.languages || props.model.languages.length === 0) return null;
  if (isMultilingual.value) return 'Multi';
  if (props.model.languages.length === 1) return props.model.languages[0]!.toUpperCase();
  return `${props.model.languages.length}`;
});

// Language percent: multilingual = 100%, single language = 30%
const languagePercent = computed(() => {
  return isMultilingual.value ? 100 : 30;
});

// Formatted languages for tooltip
const formattedLanguages = computed(() => {
  if (!props.model.languages) return [];
  return props.model.languages.map(code => ({
    code,
    name: LANGUAGE_NAMES[code] || code.toUpperCase(),
  }));
});

// Show languages popover
const showLanguages = ref(false);

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
    </div>
    
    <!-- Range Bars -->
    <div class="card-ranges">
      <div class="range-row">
        <RangeBar 
          :value="contextPercent" 
          icon="ph:stack-duotone"
          label="Context"
          :title="`Context: ${contextDisplay}`"
        />
        <span class="range-value">{{ contextDisplay }}</span>
      </div>
      <div v-if="priceDisplay" class="range-row">
        <RangeBar 
          :value="pricePercent" 
          icon="ph:currency-dollar-duotone"
          label="Price"
          :title="`Price: ${priceDisplay}/1M`"
        />
        <span class="range-value">{{ priceDisplay }}</span>
      </div>
      <div 
        v-if="languageDisplay" 
        class="range-row lang-row"
        @mouseenter="showLanguages = true"
        @mouseleave="showLanguages = false"
      >
        <RangeBar 
          :value="languagePercent" 
          icon="ph:globe-duotone"
          label="Lang"
          :title="`Languages: ${languageDisplay}`"
        />
        <span class="range-value">{{ languageDisplay }}</span>
        
        <!-- Languages Popover -->
        <Transition name="fade">
          <div v-if="showLanguages && model.languages && model.languages.length > 1" class="languages-popover">
            <div class="popover-header">
              <iconify-icon icon="ph:globe-duotone"></iconify-icon>
              <span>{{ model.languages.length }} Languages</span>
            </div>
            <div class="languages-grid">
              <span 
                v-for="lang in formattedLanguages" 
                :key="lang.code" 
                class="lang-badge"
                :title="lang.name"
              >
                {{ lang.code }}
              </span>
            </div>
          </div>
        </Transition>
      </div>
      <div class="range-row">
        <RangeBar 
          :value="speedPercent" 
          icon="ph:lightning-duotone"
          label="Speed"
          :title="`Speed: ${speedDisplay}`"
        />
        <span class="range-value">{{ speedDisplay }}</span>
      </div>
    </div>
    
    <div v-if="keyCapabilities.length" class="card-capabilities">
      <span v-if="keyCapabilities.includes('vision')" class="cap-badge vision" title="Vision">
        <iconify-icon icon="ph:eye-duotone"></iconify-icon>
        <span class="cap-label">Vision</span>
      </span>
      <span v-if="keyCapabilities.includes('function_calling')" class="cap-badge tools" title="Function calling">
        <iconify-icon icon="ph:wrench-duotone"></iconify-icon>
        <span class="cap-label">Tools</span>
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

.model-card:hover:not(.disabled):not(.selected) {
  background: var(--surface-2);
  border-color: var(--accent-primary);
  box-shadow: 0 2px 12px var(--accent-glow);
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

.lang-row {
  position: relative;
  cursor: pointer;
}

/* Languages Popover */
.languages-popover {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  padding: 8px;
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
  min-width: 180px;
}

.popover-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--glass-border);
}

.popover-header iconify-icon {
  font-size: 12px;
  color: var(--accent-primary);
}

.languages-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.lang-badge {
  padding: 2px 6px;
  font-size: 9px;
  font-weight: 500;
  background: var(--surface-3);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-transform: uppercase;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.range-value {
  font-size: 9px;
  color: var(--text-muted);
  min-width: 38px;
  text-align: right;
}

.card-capabilities {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: auto;
}

.cap-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: var(--radius-lg);
  font-size: 9px;
}

.cap-badge iconify-icon {
  font-size: 10px;
}

.cap-label {
  font-weight: 500;
}

.cap-badge.vision {
  background: rgba(147, 51, 234, 0.15);
  color: #a78bfa;
}

.cap-badge.tools {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.model-card.selected .cap-badge {
  background: var(--accent-glow);
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
