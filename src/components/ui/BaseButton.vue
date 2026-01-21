<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
}>();

const emit = defineEmits(['click']);

const classes = computed(() => {
  return [
    'base-btn',
    `variant-${props.variant || 'secondary'}`,
    `size-${props.size || 'md'}`,
    { block: props.block },
    { loading: props.loading },
  ];
});
</script>

<template>
  <button :class="classes" :disabled="disabled || loading" @click="emit('click', $event)">
    <iconify-icon v-if="loading" icon="ph:spinner-gap-bold" class="spin"></iconify-icon>
    <iconify-icon v-else-if="icon" :icon="icon"></iconify-icon>
    <slot></slot>
  </button>
</template>

<style scoped>
.base-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 10px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--glass-border);
  width: auto;
}

.base-btn.block {
  width: 100%;
}

/* Sizes */
.size-sm {
  padding: 8px 12px;
  font-size: 11px;
}

.size-md {
  padding: 12px 16px;
  font-size: 12px;
}

.size-lg {
  padding: 14px 20px;
  font-size: 14px;
}

.base-btn iconify-icon {
  font-size: 16px;
}

/* Variants */
.variant-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 16px var(--accent-glow);
}
.variant-primary:hover:not(:disabled) {
  box-shadow: 0 6px 24px var(--accent-glow);
  transform: translateY(-2px);
}

.variant-secondary {
  background: var(--surface-2);
  color: var(--text-secondary);
  border-color: var(--glass-border);
}
.variant-secondary:hover:not(:disabled) {
  background: var(--surface-3);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.variant-danger {
  background: var(--surface-2);
  color: var(--error);
  border-color: var(--glass-border);
}
.variant-danger:hover:not(:disabled) {
  background: rgba(248, 113, 113, 0.15);
}

.variant-ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}
.variant-ghost:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text-primary);
}

/* States */
.base-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
