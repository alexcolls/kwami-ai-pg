<script setup lang="ts">
import { computed } from 'vue';

export type ModelType = 'llm' | 'stt' | 'tts';

const props = defineProps<{
  modelValue: ModelType;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: ModelType): void;
}>();

const selected = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const tabs: { id: ModelType; icon: string; label: string }[] = [
  { id: 'llm', icon: 'ph:brain-duotone', label: 'LLM' },
  { id: 'stt', icon: 'ph:ear-duotone', label: 'STT' },
  { id: 'tts', icon: 'lucide:audio-lines', label: 'TTS' },
];
</script>

<template>
  <div class="model-type-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tab-btn"
      :class="{ active: selected === tab.id }"
      @click="selected = tab.id"
    >
      <iconify-icon :icon="tab.icon"></iconify-icon>
      <span>{{ tab.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.model-type-tabs {
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
  gap: 6px;
  padding: 10px 12px;
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

.tab-btn:hover:not(.active) {
  background: var(--surface-2);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--accent-glow);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}
</style>
