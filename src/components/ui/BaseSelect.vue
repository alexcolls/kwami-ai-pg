<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: string | number;
  options: Array<{ label: string; value: string | number; icon?: string }>;
  label?: string;
  icon?: string;
  placeholder?: string;
  disabled?: boolean;
  block?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selectRef = ref<HTMLElement | null>(null);
const highlightedIndex = ref(-1);

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue);
});

function toggle() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    highlightedIndex.value = props.options.findIndex(opt => opt.value === props.modelValue);
  }
}

function select(opt: { label: string; value: string | number }) {
  emit('update:modelValue', opt.value);
  isOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!isOpen.value) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      isOpen.value = true;
      highlightedIndex.value = Math.max(0, props.options.findIndex(opt => opt.value === props.modelValue));
    }
    return;
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, props.options.length - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (highlightedIndex.value >= 0) {
        select(props.options[highlightedIndex.value]);
      }
      break;
    case 'Escape':
      isOpen.value = false;
      break;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div 
    ref="selectRef" 
    class="base-select" 
    :class="{ disabled, open: isOpen, block }"
    @keydown="handleKeydown"
  >
    <label v-if="label" class="label">
      <iconify-icon v-if="icon" :icon="icon"></iconify-icon>
      {{ label }}
    </label>
    
    <button 
      type="button" 
      class="select-trigger" 
      :disabled="disabled"
      @click="toggle"
      :tabindex="disabled ? -1 : 0"
    >
      <span class="select-value" :class="{ placeholder: !selectedOption }">
        <iconify-icon v-if="selectedOption?.icon" :icon="selectedOption.icon" class="option-icon"></iconify-icon>
        {{ selectedOption?.label || placeholder || 'Select...' }}
      </span>
      <iconify-icon icon="ph:caret-up-down-bold" class="caret"></iconify-icon>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="dropdown">
        <div class="dropdown-scroll">
          <button
            v-for="(opt, idx) in options"
            :key="opt.value"
            type="button"
            class="dropdown-option"
            :class="{ 
              selected: opt.value === modelValue,
              highlighted: idx === highlightedIndex 
            }"
            @click="select(opt)"
            @mouseenter="highlightedIndex = idx"
          >
            <iconify-icon v-if="opt.icon" :icon="opt.icon" class="option-icon"></iconify-icon>
            <span class="option-label">{{ opt.label }}</span>
            <iconify-icon 
              v-if="opt.value === modelValue" 
              icon="ph:check-bold" 
              class="check-icon"
            ></iconify-icon>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.base-select {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.base-select.block {
  width: 100%;
}

.base-select.disabled {
  opacity: 0.5;
  pointer-events: none;
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

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.select-trigger:hover:not(:disabled) {
  background: var(--surface-2);
  border-color: var(--surface-3);
}

.select-trigger:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.base-select.open .select-trigger {
  border-color: var(--accent-primary);
  background: var(--surface-2);
}

.select-value {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-value.placeholder {
  color: var(--text-muted);
}

.caret {
  font-size: 12px;
  color: var(--text-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.base-select.open .caret {
  color: var(--accent-primary);
}

/* Dropdown */
.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-scroll {
  max-height: 240px;
  overflow-y: auto;
  padding: 6px;
  scrollbar-width: thin;
  scrollbar-color: var(--surface-3) transparent;
}

.dropdown-scroll::-webkit-scrollbar {
  width: 4px;
}

.dropdown-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-scroll::-webkit-scrollbar-thumb {
  background: var(--surface-3);
  border-radius: 2px;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.dropdown-option:hover,
.dropdown-option.highlighted {
  background: var(--surface-2);
  color: var(--text-primary);
}

.dropdown-option.selected {
  color: var(--accent-primary);
  background: var(--accent-glow);
}

.dropdown-option.selected:hover,
.dropdown-option.selected.highlighted {
  background: var(--accent-glow);
}

.option-icon {
  font-size: 16px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.dropdown-option.selected .option-icon {
  color: var(--accent-primary);
}

.option-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-icon {
  font-size: 14px;
  color: var(--accent-primary);
  flex-shrink: 0;
}

/* Dropdown animation */
.dropdown-enter-active {
  animation: dropdownIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-leave-active {
  animation: dropdownOut 0.15s ease-in;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdownOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
}
</style>
