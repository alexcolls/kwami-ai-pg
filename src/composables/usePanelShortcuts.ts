import { onMounted, onUnmounted } from 'vue';
import { useUIStore } from '@/stores/ui';

const PANEL_KEYS: (string | null)[] = [
  'avatar',
  'scene',
  'interaction',
  'audio',
  'voice',
  'enhancements',
  'metrics',
  'transcription',
  'persona',
  'memory',
  'tools',
  'info',
  'account',
];

export function usePanelShortcuts() {
  const uiStore = useUIStore();

  function handleKeydown(e: KeyboardEvent) {
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
    if (e.key >= '1' && e.key <= '9') {
      const idx = parseInt(e.key) - 1;
      const panel = PANEL_KEYS[idx];
      if (panel) uiStore.setPanel(panel);
    } else if (e.key === '0') {
      uiStore.setPanel('memory');
    } else if (e.key === '-') {
      uiStore.setPanel('tools');
    } else if (e.key === '=') {
      uiStore.setPanel('info');
    } else if (e.key.toLowerCase() === 'p') {
      uiStore.togglePanel();
    }
  }

  function handlePanelClick(panel: string) {
    if (uiStore.activePanel === panel && uiStore.isPanelOpen) {
      uiStore.togglePanel();
    } else {
      uiStore.setPanel(panel);
    }
  }

  onMounted(() => document.addEventListener('keydown', handleKeydown));
  onUnmounted(() => document.removeEventListener('keydown', handleKeydown));

  return { handlePanelClick };
}
