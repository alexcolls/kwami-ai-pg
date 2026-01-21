<script setup lang="ts">
import { useUIStore } from '@/stores/ui';
import SidebarNavigation from './SidebarNavigation.vue';
import SidebarContent from './SidebarContent.vue';

const uiStore = useUIStore();
</script>

<template>
  <div class="sidebar" :class="{ collapsed: !uiStore.isPanelOpen }">
    <SidebarNavigation />
    <SidebarContent>
      <slot></slot>
    </SidebarContent>
  </div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 20px;
  left: 20px;
  bottom: 20px;
  display: flex;
  gap: 12px;
  z-index: 1000;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

/* Handle collapsed state for content via deep selector */
.sidebar.collapsed :deep(.panel-column) {
  transform: translateX(-20px);
  opacity: 0;
  pointer-events: none;
  width: 0;
  padding: 0;
  overflow: hidden;
}
</style>
