<script setup lang="ts">
defineProps<{
  modelValue: string | number;
  options: Array<{ label: string; value: string | number }>;
  label?: string;
  icon?: string;
  placeholder?: string;
  disabled?: boolean;
  block?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

function onChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
}
</script>

<template>
  <div class="base-select" :class="{ disabled }">
    <label v-if="label" class="label">
      <iconify-icon v-if="icon" :icon="icon"></iconify-icon>
      {{ label }}
    </label>
    <div class="select-wrapper">
      <select :value="modelValue" :disabled="disabled" @change="onChange">
        <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <iconify-icon icon="ph:caret-down-bold" class="caret"></iconify-icon>
    </div>
  </div>
</template>

<style scoped>
.base-select {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.base-select.disabled {
  opacity: 0.5;
}

.label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
}

.label iconify-icon {
  font-size: 14px;
  color: var(--text-muted);
}

.select-wrapper {
  position: relative;
  width: 100%;
}

select {
  flex: 1;
  width: 100%;
  padding: 8px 12px;
  padding-right: 32px;
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  appearance: none;
}

select:focus {
  outline: none;
  border-color: var(--accent-primary);
}

select:disabled {
  cursor: not-allowed;
}

.caret {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
  font-size: 10px;
}
</style>
