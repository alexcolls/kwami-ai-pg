<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <label class="checkbox-label" :class="{ disabled }">
    <input 
      type="checkbox" 
      :checked="modelValue" 
      :disabled="disabled"
      @change="emit('update:modelValue', !modelValue)"
    />
    <span class="checkbox-custom"></span>
    <span v-if="label">{{ label }}</span>
  </label>
</template>

<style scoped>
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.checkbox-label:hover {
  color: var(--text-primary);
}

.checkbox-label.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-label input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--surface-3);
  border-radius: 6px;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-label input:checked + .checkbox-custom {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-color: var(--accent-primary);
  box-shadow: 0 2px 12px var(--accent-glow);
}

.checkbox-label input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: bold;
  color: white;
}
</style>
