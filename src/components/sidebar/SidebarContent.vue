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
  width: 320px;
  max-height: 100%;
  transition: all var(--duration-slow) var(--ease-out);
}

.glass-panel {
  height: 100%;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
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
  height: 120px;
  background: linear-gradient(
    180deg,
    rgba(0, 217, 255, 0.02) 0%,
    transparent 100%
  );
  pointer-events: none;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
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
