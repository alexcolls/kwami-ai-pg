<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  label?: string;
  modelValue: string[];
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const newValue = ref('');

function addTag() {
  if (props.disabled || !newValue.value.trim()) return;
  const current = [...props.modelValue];
  if (!current.includes(newValue.value.trim())) {
    current.push(newValue.value.trim());
    emit('update:modelValue', current);
  }
  newValue.value = '';
}

function removeTag(tag: string) {
  if (props.disabled) return;
  emit(
    'update:modelValue',
    props.modelValue.filter((t) => t !== tag),
  );
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTag();
  }
}
</script>

<template>
  <div class="base-tag-input">
    <div v-if="label" class="label">{{ label }}</div>

    <div class="tags-container" v-if="modelValue.length > 0">
      <span v-for="tag in modelValue" :key="tag" class="tag">
        {{ tag }}
        <button class="remove-btn" @click="removeTag(tag)" :disabled="disabled">×</button>
      </span>
    </div>

    <div class="input-row" :class="{ disabled }">
      <input
        type="text"
        v-model="newValue"
        :placeholder="placeholder || 'Add item...'"
        :disabled="disabled"
        @keydown="handleKeydown"
      />
      <button class="add-btn" @click="addTag" :disabled="disabled || !newValue.trim()">
        <iconify-icon icon="ph:plus-duotone"></iconify-icon>
      </button>
    </div>
  </div>
</template>

<style scoped>
.base-tag-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 11px;
  color: var(--text-tertiary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  font-size: 12px;
  color: var(--text-primary);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  display: flex;
  align-items: center;
  line-height: 1;
}

.remove-btn:hover:not(:disabled) {
  color: var(--accent-error);
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

input {
  flex: 1;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
}

input:focus {
  border-color: var(--text-secondary);
  background: var(--surface-2);
}

.add-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover:not(:disabled) {
  background: var(--surface-3);
  border-color: var(--text-secondary);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
