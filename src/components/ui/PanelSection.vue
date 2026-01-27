<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title?: string;
  icon?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  noPadding?: boolean;
}>();

const isCollapsed = ref(props.defaultCollapsed ?? false);

function toggle() {
  if (props.collapsible) {
    isCollapsed.value = !isCollapsed.value;
  }
}
</script>

<template>
  <section 
    class="panel-section" 
    :class="{ 
      collapsed: isCollapsed, 
      collapsible, 
      'no-padding': noPadding 
    }"
  >
    <header 
      v-if="title" 
      class="section-header"
      :class="{ clickable: collapsible }"
      @click="toggle"
    >
      <div class="section-title">
        <iconify-icon v-if="icon" :icon="icon" class="section-icon"></iconify-icon>
        <h3>{{ title }}</h3>
      </div>
      <div class="section-actions" @click.stop>
        <slot name="actions"></slot>
      </div>
      <iconify-icon
        v-if="collapsible"
        icon="ph:caret-down-bold"
        class="toggle-icon"
      ></iconify-icon>
    </header>
    
    <Transition name="collapse">
      <div v-show="!isCollapsed" class="section-content">
        <slot></slot>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.panel-section {
  padding: 16px 20px;
  border-bottom: 1px solid var(--glass-border);
}

.panel-section:last-child {
  border-bottom: none;
}

.panel-section.no-padding {
  padding: 0;
}

.panel-section.no-padding .section-content {
  padding: 0 20px 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  user-select: none;
  margin-bottom: 14px;
}

.section-header.clickable {
  cursor: pointer;
  transition: color var(--duration-fast) ease;
}

.section-header.clickable:hover {
  color: var(--text-primary);
}

.section-header.clickable:hover .section-icon {
  color: var(--accent-primary);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-icon {
  font-size: 14px;
  color: var(--text-muted);
  transition: color var(--duration-fast) ease;
}

h3 {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-muted);
  margin: 0;
}

.toggle-icon {
  font-size: 12px;
  color: var(--text-muted);
  transition: transform var(--duration-normal) var(--ease-out);
}

.collapsed .toggle-icon {
  transform: rotate(-90deg);
}

.collapsed .section-header {
  margin-bottom: 0;
}

/* Collapse animation */
.collapse-enter-active {
  animation: collapseIn var(--duration-normal) var(--ease-out);
}

.collapse-leave-active {
  animation: collapseOut var(--duration-fast) ease-in;
}

@keyframes collapseIn {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    max-height: 500px;
    transform: translateY(0);
  }
}

@keyframes collapseOut {
  from {
    opacity: 1;
    max-height: 500px;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-8px);
  }
}

.panel-section.hidden {
  display: none;
}
</style>
