<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  inline?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const displayValue = computed(() => {
  const step = props.step ?? 1;
  if (step < 0.01) return props.modelValue.toFixed(3);
  if (step < 1) return props.modelValue.toFixed(2);
  return props.modelValue;
});

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', parseFloat(target.value));
}
</script>

<template>
  <div class="control-row" :class="{ stacked: !inline }">
    <label v-if="label">{{ label }}</label>
    <input
      type="range"
      :min="min ?? 0"
      :max="max ?? 100"
      :step="step ?? 1"
      :value="modelValue"
      @input="onInput"
    />
    <span class="value">{{ displayValue }}{{ unit }}</span>
  </div>
</template>

<style scoped>
.control-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-row label {
  width: 65px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.control-row input[type='range'] {
  flex: 1;
  height: 6px;
  background: var(--surface-2);
  border-radius: 3px;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.control-row input[type='range']::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 2px 8px rgba(124, 92, 255, 0.4);
}

.control-row input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 16px var(--accent-glow);
}

.control-row input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.control-row .value {
  width: 42px;
  font-size: 11px;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  color: var(--text-muted);
  text-align: right;
  flex-shrink: 0;
}
</style>
