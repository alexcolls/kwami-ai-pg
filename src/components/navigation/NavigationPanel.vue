<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useNavigationStore } from '@/stores/navigation';

const store = useNavigationStore();
const { isActive, currentUrl, currentTitle, isLoading, iframeUrl } = storeToRefs(store);

const iframeRef = ref<HTMLIFrameElement | null>(null);
const isVisible = ref(false);

watch(isActive, async (active) => {
  if (active) {
    await nextTick();
    isVisible.value = true;
  } else {
    isVisible.value = false;
  }
});

function onIframeLoad() {
  store.onIframeLoaded(currentUrl.value);
}

function handleMessage(e: MessageEvent) {
  if (e.data?.type === 'scramjet:urlchange' && e.data.url) {
    store.updateState({ url: e.data.url });
  }
}

function handleClose() {
  store.end();
}

function handleOpenExternal() {
  if (currentUrl.value) {
    window.open(currentUrl.value, '_blank', 'noopener');
  }
}

function truncateUrl(url: string, max = 60): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    const display = u.hostname + u.pathname;
    return display.length > max ? display.slice(0, max) + '...' : display;
  } catch {
    return url.length > max ? url.slice(0, max) + '...' : url;
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage);
  if (isActive.value) {
    isVisible.value = true;
  }
});

onUnmounted(() => {
  window.removeEventListener('message', handleMessage);
  isVisible.value = false;
});
</script>

<template>
  <Transition name="nav-slide">
    <div v-if="isActive" class="nav-panel" :class="{ visible: isVisible }">
      <!-- Header bar -->
      <div class="nav-header">
        <div class="nav-header-left">
          <div class="nav-status" :class="{ loading: isLoading }">
            <iconify-icon
              :icon="isLoading ? 'svg-spinners:ring-resize' : 'mdi:earth'"
              width="16"
            />
          </div>
          <div class="nav-url-info">
            <span v-if="currentTitle" class="nav-title">{{ currentTitle }}</span>
            <span v-if="currentUrl" class="nav-url">{{ truncateUrl(currentUrl) }}</span>
          </div>
        </div>
        <div class="nav-header-actions">
          <button
            class="nav-action-btn"
            title="Open in new tab"
            @click="handleOpenExternal"
          >
            <iconify-icon icon="mdi:open-in-new" width="16" />
          </button>
          <button class="nav-close-btn" title="Close navigation" @click="handleClose">
            <iconify-icon icon="mdi:close" width="18" />
          </button>
        </div>
      </div>

      <!-- Proxied iframe -->
      <div class="nav-content">
        <iframe
          v-if="iframeUrl"
          ref="iframeRef"
          :src="iframeUrl"
          class="nav-iframe"
          allow="autoplay; encrypted-media; fullscreen"
          @load="onIframeLoad"
        />
        <div v-else class="nav-placeholder">
          <iconify-icon icon="svg-spinners:pulse-3" width="40" />
          <span>Loading page...</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.nav-panel {
  position: fixed;
  top: 16px;
  right: 16px;
  bottom: 16px;
  width: min(62vw, 900px);
  z-index: 90;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(12, 12, 18, 0.82);
  backdrop-filter: blur(28px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  opacity: 0;
  transform: translateX(30px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.nav-panel.visible {
  opacity: 1;
  transform: translateX(0);
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  min-height: 44px;
}

.nav-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  flex: 1;
}

.nav-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.nav-status {
  display: flex;
  align-items: center;
  color: rgba(0, 217, 255, 0.8);
  flex-shrink: 0;
}
.nav-status.loading {
  color: rgba(255, 200, 60, 0.9);
}

.nav-url-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 1px;
}

.nav-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-url {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.nav-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.nav-action-btn:hover {
  background: rgba(0, 217, 255, 0.15);
  color: rgba(200, 240, 255, 0.95);
}

.nav-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.nav-close-btn:hover {
  background: rgba(255, 80, 80, 0.2);
  color: rgba(255, 180, 180, 0.95);
}

.nav-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.nav-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0 0 12px 12px;
  background: #fff;
}

.nav-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.8rem;
  background: #0a0a0e;
}

/* Transition */
.nav-slide-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.nav-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.nav-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.nav-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
