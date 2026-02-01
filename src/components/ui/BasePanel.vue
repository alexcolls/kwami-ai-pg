<script setup lang="ts">
const props = defineProps<{
  title: string;
  icon: string;
  noPadding?: boolean;
}>();
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon :icon="icon" class="panel-icon"></iconify-icon>
      <h2>{{ title }}</h2>
      <div class="header-actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="panel-body" :class="{ 'no-padding': noPadding }">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.panel-inner {
  animation: fadeIn 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.panel-icon {
  font-size: 24px;
  color: var(--accent-primary);
  filter: drop-shadow(0 0 8px var(--accent-glow));
}

h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.panel-body:not(.no-padding) {
  padding: 0; /* Individual sections handle their own padding usually via PanelSection */
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
