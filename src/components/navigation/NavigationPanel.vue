<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useNavigationStore } from '@/stores/navigation';

const store = useNavigationStore();
const { isActive, currentUrl, currentTitle, isLoading, iframeUrl, useExtensionMode } = storeToRefs(store);

// Auth/sign-in pages are blocked in iframes by Google, Microsoft, etc. (403)
const AUTH_BLOCKED_HOSTS = [
  'accounts.google.com',
  'accounts.youtube.com',
  'login.live.com',
  'login.microsoftonline.com',
  'appleid.apple.com',
  'www.facebook.com',
  'm.facebook.com',
];
const isAuthBlockedPage = computed(() => {
  const url = currentUrl.value;
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return AUTH_BLOCKED_HOSTS.some((h) => host === h || host.endsWith('.' + h));
  } catch {
    return false;
  }
});

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
  if (e.data?.type === 'scramjet:page_content') {
    sendPageContentToAgent(e.data);
  }
  if (e.data?.type === 'scramjet:command_result') {
    sendCommandResultToAgent(e.data);
  }
}

function sendPageContentToAgent(data: { title?: string; text?: string; elements?: unknown[] }) {
  const msg = { type: 'nav_page_content', title: data.title, text: data.text, elements: data.elements };
  const encoder = new TextEncoder();
  const payload = encoder.encode(JSON.stringify(msg));
  window.dispatchEvent(new CustomEvent('kwami:send_data', { detail: payload }));
}

function sendCommandResultToAgent(data: { id?: string; result?: string }) {
  const msg = { type: 'nav_command_result', id: data.id, result: data.result };
  const encoder = new TextEncoder();
  const payload = encoder.encode(JSON.stringify(msg));
  window.dispatchEvent(new CustomEvent('kwami:send_data', { detail: payload }));
}

function sendCommandToEmbed(action: string, extra: Record<string, string> = {}) {
  if (!iframeRef.value?.contentWindow) return;
  iframeRef.value.contentWindow.postMessage(
    { type: 'scramjet:command', action, ...extra },
    '*'
  );
}

function handleNavCommand(e: Event) {
  const detail = (e as CustomEvent).detail as { action?: string; description?: string; text?: string; url?: string };
  if (!detail?.action) return;
  const { action } = detail;
  if (useExtensionMode.value) return;
  if (['click', 'type', 'press_key', 'scroll', 'read_page'].includes(action)) {
    sendCommandToEmbed(action, {
      description: detail.description || '',
      text: detail.text || '',
    });
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
  window.addEventListener('kwami:nav_command', handleNavCommand);
  if (isActive.value) {
    isVisible.value = true;
  }
});

onUnmounted(() => {
  window.removeEventListener('message', handleMessage);
  window.removeEventListener('kwami:nav_command', handleNavCommand);
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

      <!-- Auth blocked banner: sign-in pages return 403 in iframes -->
      <div v-if="isAuthBlockedPage" class="nav-auth-banner">
        <iconify-icon icon="mdi:lock-alert" width="18" />
        <span>Sign-in doesn't work in this embedded browser. Use <strong>Open in new tab</strong> to sign in.</span>
        <button class="nav-auth-open-btn" @click="handleOpenExternal">
          <iconify-icon icon="mdi:open-in-new" width="16" />
          Open in new tab
        </button>
      </div>

      <!-- Extension mode: real tab (no iframe); otherwise proxy iframe -->
      <div class="nav-content">
        <div v-if="useExtensionMode" class="nav-extension-placeholder">
          <iconify-icon icon="mdi:open-in-new" width="32" />
          <p>Page is open in a separate tab.</p>
          <p class="nav-extension-hint">Kwami can navigate and interact there; sign-in and any site work.</p>
          <button class="nav-auth-open-btn" @click="handleOpenExternal">
            <iconify-icon icon="mdi:open-in-new" width="16" />
            Open in new tab
          </button>
        </div>
        <template v-else>
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
        </template>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.nav-panel {
  flex: 0 0 50%;
  width: 50%;
  min-width: 0;
  height: 100%;
  z-index: 90;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(12, 12, 18, 0.95);
  backdrop-filter: blur(28px);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.4);
  opacity: 0;
  transform: translateX(20px);
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

.nav-auth-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 180, 60, 0.12);
  border-bottom: 1px solid rgba(255, 180, 60, 0.25);
  color: rgba(255, 220, 150, 0.95);
  font-size: 0.8rem;
  flex-shrink: 0;
}
.nav-auth-banner iconify-icon {
  flex-shrink: 0;
  color: rgba(255, 200, 60, 0.9);
}
.nav-auth-open-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  padding: 6px 12px;
  border: 1px solid rgba(255, 200, 60, 0.4);
  border-radius: 8px;
  background: rgba(255, 200, 60, 0.15);
  color: rgba(255, 220, 150, 0.95);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.nav-auth-open-btn:hover {
  background: rgba(255, 200, 60, 0.25);
  border-color: rgba(255, 200, 60, 0.6);
}

.nav-extension-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  text-align: center;
}
.nav-extension-placeholder iconify-icon {
  color: rgba(0, 217, 255, 0.5);
}
.nav-extension-hint {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
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
  transform: translateX(20px);
}
.nav-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
