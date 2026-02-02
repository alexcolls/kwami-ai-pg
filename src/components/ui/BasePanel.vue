<script setup lang="ts">
defineProps<{
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
  animation: fadeIn 0.2s var(--ease-out);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--glass-border);
  background: transparent;
  flex-shrink: 0;
}

.panel-icon {
  font-size: 22px;
  color: var(--accent-primary);
}

h2 {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: var(--text-primary);
  margin: 0;
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
  overflow-x: hidden;
  padding: 8px 0;
  margin-bottom: max(4px, calc(var(--radius-xl, 16px) - 16px));
  scrollbar-width: thin;
  scrollbar-color: var(--surface-3) transparent;
  
  /* Multi-column responsive grid layout */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-content: start;
}

.panel-body::-webkit-scrollbar {
  width: 6px;
}

.panel-body::-webkit-scrollbar-track {
  background: transparent;
}

.panel-body::-webkit-scrollbar-thumb {
  background: var(--surface-3);
  border-radius: 3px;
}

.panel-body.no-padding {
  padding: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
