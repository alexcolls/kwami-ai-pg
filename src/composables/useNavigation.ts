import { storeToRefs } from 'pinia';
import { useNavigationStore } from '@/stores/navigation';

let navigationListenerAttached = false;

export function useNavigation() {
  const store = useNavigationStore();
  const { isActive, currentUrl, currentTitle, isLoading, iframeUrl, hasNavigation } =
    storeToRefs(store);

  if (!navigationListenerAttached) {
    navigationListenerAttached = true;

    window.addEventListener('kwami:nav_command', (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        action?: string;
        url?: string;
      };
      if (!detail?.action) return;

      switch (detail.action) {
        case 'navigate':
          if (detail.url) store.navigateToUrl(detail.url);
          break;
        case 'back':
          store.goBack();
          break;
        case 'forward':
          store.goForward();
          break;
        case 'close':
          store.end();
          break;
      }
    });

    window.addEventListener('kwami:navigation_state', (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        url?: string;
        title?: string;
        isLoading?: boolean;
      };
      if (detail) store.updateState(detail);
    });

    window.addEventListener('kwami:navigation_ended', () => {
      store.end();
    });
  }

  return {
    isActive,
    currentUrl,
    currentTitle,
    isLoading,
    iframeUrl,
    hasNavigation,
    end: store.end,
  };
}
