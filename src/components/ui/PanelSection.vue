<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title?: string;
  icon?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}>();

const isCollapsed = ref(props.defaultCollapsed ?? false);

function toggle() {
  if (props.collapsible) {
    isCollapsed.value = !isCollapsed.value;
  }
}
</script>

<template>
  <section class="panel-section" :class="{ collapsed: isCollapsed, collapsible: collapsible }">
    <h3 v-if="title" @click="toggle" :class="{ 'section-toggle': collapsible }">
      <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
        <iconify-icon v-if="icon" :icon="icon"></iconify-icon>
        <span>{{ title }}</span>
      </div>
      <iconify-icon
        v-if="collapsible"
        icon="ph:caret-down-bold"
        class="toggle-icon"
      ></iconify-icon>
    </h3>
    <div v-show="!isCollapsed" class="section-content">
      <slot></slot>
    </div>
  </section>
</template>

<style scoped>
.panel-section {
  padding: 14px 20px;
  border-bottom: 1px solid var(--glass-border);
}

.panel-section:last-child {
  border-bottom: none;
}

h3 {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-muted);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.section-toggle {
  cursor: pointer;
  transition: color 0.2s ease;
}

.section-toggle:hover {
  color: var(--text-primary);
}

h3 iconify-icon {
  font-size: 14px;
  color: var(--text-muted);
}

.toggle-icon {
  font-size: 14px;
  color: var(--text-muted);
  transition: transform 0.25s ease;
}

.collapsed .toggle-icon {
  transform: rotate(-90deg);
}

.collapsed h3 {
  margin-bottom: 0;
}

.panel-section.hidden {
  display: none;
}

/* Section content transition for collapsible */
.panel-section.collapsible .section-content {
  max-height: 500px;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.2s ease, margin 0.2s ease;
  opacity: 1;
}

.panel-section.collapsible.collapsed .section-content {
  max-height: 0;
  opacity: 0;
}
</style>
