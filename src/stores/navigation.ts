import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const PROXY_BASE_URL = import.meta.env.VITE_NAV_PROXY_URL || '';

function buildProxyUrl(targetUrl: string): string {
  if (!PROXY_BASE_URL) return targetUrl;
  return `${PROXY_BASE_URL}/embed.html?url=${encodeURIComponent(targetUrl)}`;
}

export const useNavigationStore = defineStore('navigation', () => {
  const isActive = ref(false);
  const currentUrl = ref('');
  const currentTitle = ref('');
  const isLoading = ref(false);
  const iframeUrl = ref<string | null>(null);
  const navigationHistory = ref<string[]>([]);
  const historyIndex = ref(-1);

  const hasNavigation = computed(() => isActive.value);

  function navigateToUrl(url: string) {
    currentUrl.value = url;
    currentTitle.value = '';
    isLoading.value = true;
    isActive.value = true;
    iframeUrl.value = buildProxyUrl(url);

    if (historyIndex.value < navigationHistory.value.length - 1) {
      navigationHistory.value = navigationHistory.value.slice(0, historyIndex.value + 1);
    }
    navigationHistory.value.push(url);
    historyIndex.value = navigationHistory.value.length - 1;
  }

  function onIframeLoaded(title: string) {
    isLoading.value = false;
    if (title) currentTitle.value = title;
  }

  function goBack() {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      const url = navigationHistory.value[historyIndex.value] ?? '';
      currentUrl.value = url;
      isLoading.value = true;
      iframeUrl.value = url ? buildProxyUrl(url) : null;
    }
  }

  function goForward() {
    if (historyIndex.value < navigationHistory.value.length - 1) {
      historyIndex.value++;
      const url = navigationHistory.value[historyIndex.value] ?? '';
      currentUrl.value = url;
      isLoading.value = true;
      iframeUrl.value = url ? buildProxyUrl(url) : null;
    }
  }

  function updateState(state: { url?: string; title?: string; isLoading?: boolean }) {
    if (state.url !== undefined) currentUrl.value = state.url;
    if (state.title !== undefined) currentTitle.value = state.title;
    if (state.isLoading !== undefined) isLoading.value = state.isLoading;
  }

  function end() {
    isActive.value = false;
    currentUrl.value = '';
    currentTitle.value = '';
    isLoading.value = false;
    iframeUrl.value = null;
    navigationHistory.value = [];
    historyIndex.value = -1;
  }

  return {
    isActive,
    currentUrl,
    currentTitle,
    isLoading,
    iframeUrl,
    hasNavigation,
    navigateToUrl,
    onIframeLoaded,
    goBack,
    goForward,
    updateState,
    end,
  };
});
