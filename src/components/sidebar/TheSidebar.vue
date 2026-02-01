<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useUIStore } from '@/stores/ui';
import { useThemeStore } from '@/stores/theme';
import SidebarNavigation from './SidebarNavigation.vue';
import SidebarContent from './SidebarContent.vue';

const uiStore = useUIStore();
const themeStore = useThemeStore();

const sidebarRef = ref<HTMLElement | null>(null);
const sidebarWidth = ref(0);
const windowWidth = ref(window.innerWidth);

// Update measurements
function updateMeasurements() {
  windowWidth.value = window.innerWidth;
  if (sidebarRef.value) {
    sidebarWidth.value = sidebarRef.value.offsetWidth;
  }
}

// Computed class for sidebar position
const isRight = computed(() => themeStore.sidebarPosition === 'right');

// Computed style for smooth transform-based animation
const sidebarStyle = computed(() => {
  if (isRight.value) {
    // Calculate how much to move right: viewport width - sidebar width - (left padding + right padding)
    const translateX = windowWidth.value - sidebarWidth.value - 40; // 20px padding on each side
    return {
      transform: `translateX(${translateX}px)`
    };
  }
  return {
    transform: 'translateX(0)'
  };
});

// Watch for panel state changes to update measurements
watch([() => uiStore.isPanelOpen, () => uiStore.panelWidth], () => {
  // Wait for DOM update then measure
  nextTick(() => {
    // Small delay for CSS transitions to complete
    setTimeout(updateMeasurements, 400);
  });
});

onMounted(() => {
  updateMeasurements();
  window.addEventListener('resize', updateMeasurements);
  // Update width after initial render
  requestAnimationFrame(updateMeasurements);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateMeasurements);
});
</script>

<template>
  <div 
    ref="sidebarRef"
    class="sidebar" 
    :class="{ 
      collapsed: !uiStore.isPanelOpen,
      'sidebar-right': isRight
    }"
    :style="sidebarStyle"
  >
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
  pointer-events: none;
  /* Smooth transform animation */
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Right sidebar - reverse the flex direction for proper ordering */
.sidebar.sidebar-right {
  flex-direction: row-reverse;
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

.sidebar.sidebar-right.collapsed :deep(.panel-column) {
  transform: translateX(20px);
}
</style>


