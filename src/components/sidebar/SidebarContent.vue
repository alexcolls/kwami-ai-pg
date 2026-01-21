<script setup lang="ts">
// Slot wrapper for panel content
</script>

<template>
  <div class="panel-column glass-panel">
    <div class="panel-content-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.panel-column {
  width: 300px;
  max-height: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-panel {
  height: 100%;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  position: relative;
  pointer-events: auto;
}

/* Subtle gradient overlay for depth */
.glass-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.03) 0%,
    transparent 100%
  );
  pointer-events: none;
  border-radius: 20px 20px 0 0;
}

.panel-content-wrapper {
  position: relative;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--surface-3) transparent;
}

.panel-content-wrapper::-webkit-scrollbar {
  width: 6px;
}

.panel-content-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content-wrapper::-webkit-scrollbar-thumb {
  background: var(--surface-3);
  border-radius: 3px;
}
</style>
