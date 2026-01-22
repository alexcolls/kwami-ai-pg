<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  label?: string;
  modelValue: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isHovered = ref(false);

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
};

// Generate a lighter version for the glow effect
const glowColor = computed(() => {
  return props.modelValue + '40'; // Add 25% opacity
});
</script>

<template>
  <div 
    class="color-picker-wrapper" 
    :class="{ disabled, hovered: isHovered }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <label v-if="label" class="color-label">{{ label }}</label>
    <div class="color-input-wrapper">
      <input
        type="color"
        :value="modelValue"
        @input="handleInput"
        :disabled="disabled"
      />
      <div 
        class="color-preview" 
        :style="{ 
          background: modelValue,
          boxShadow: isHovered ? `0 4px 20px ${glowColor}` : `0 2px 8px rgba(0,0,0,0.3)` 
        }"
      ></div>
      <div class="color-value">{{ modelValue.toUpperCase() }}</div>
    </div>
  </div>
</template>

<style scoped>
.color-picker-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.color-picker-wrapper.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.color-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  transition: color var(--duration-fast) ease;
}

.color-picker-wrapper.hovered .color-label {
  color: var(--text-secondary);
}

.color-input-wrapper {
  position: relative;
  width: 100%;
}

input[type='color'] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.color-preview {
  width: 100%;
  height: 44px;
  border-radius: var(--radius-md);
  transition: all var(--duration-normal) var(--ease-out);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.color-picker-wrapper.hovered .color-preview {
  transform: translateY(-2px);
}

.color-value {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 6px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity var(--duration-fast) ease;
  pointer-events: none;
  backdrop-filter: blur(4px);
}

.color-picker-wrapper.hovered .color-value {
  opacity: 1;
}
</style>
