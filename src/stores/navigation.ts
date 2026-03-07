import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useNavigationStore = defineStore('navigation', () => {
  const isActive = ref(false);
  const currentUrl = ref('');
  const currentTitle = ref('');
  const isLoading = ref(false);

  const hasNavigation = computed(() => isActive.value);

  function updateState(state: { url?: string; title?: string; isLoading?: boolean }) {
    if (state.url !== undefined) {
      currentUrl.value = state.url;
      if (state.url) isActive.value = true;
    }
    if (state.title !== undefined) currentTitle.value = state.title;
    if (state.isLoading !== undefined) isLoading.value = state.isLoading;
  }

  function end() {
    isActive.value = false;
    currentUrl.value = '';
    currentTitle.value = '';
    isLoading.value = false;
  }

  return {
    isActive,
    currentUrl,
    currentTitle,
    isLoading,
    hasNavigation,
    updateState,
    end,
  };
});
