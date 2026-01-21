<script setup lang="ts">
defineProps<{
  modelValue: string | number;
  label?: string;
  icon?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  block?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}
</script>

<template>
  <div class="base-input" :class="{ block: block, 'has-error': !!error }">
    <label v-if="label" class="label">
      <iconify-icon v-if="icon" :icon="icon"></iconify-icon>
      {{ label }}
    </label>
    <input
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
    />
    <span v-if="error" class="error-msg">{{ error }}</span>
  </div>
</template>

<style scoped>
.base-input {
  margin-bottom: 12px;
}

.base-input:last-child {
  margin-bottom: 0;
}

.label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.label iconify-icon {
  font-size: 14px;
  color: var(--text-muted);
}

input {
  width: 100%;
  padding: 10px 12px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 12px;
  font-family: inherit;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: var(--surface-2);
}

input::placeholder {
  color: var(--text-muted);
}

input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.has-error input {
  border-color: var(--error);
}

.error-msg {
  font-size: 11px;
  color: var(--error);
  margin-top: 4px;
}
</style>
