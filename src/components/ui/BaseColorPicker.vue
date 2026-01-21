<script setup lang="ts">
const props = defineProps<{
  label?: string;
  modelValue: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
};
</script>

<template>
  <div class="control-group">
    <label v-if="props.label">{{ props.label }}</label>
    <input
      type="color"
      :value="props.modelValue"
      @input="handleInput"
      :disabled="props.disabled"
    />
  </div>
</template>

<style scoped>
.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.control-group label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
}

input[type='color'] {
  width: 100%;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: transparent;
}

input[type='color']::-webkit-color-swatch-wrapper {
  padding: 3px;
}

input[type='color']::-webkit-color-swatch {
  border: none;
  border-radius: 7px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
