import { defineStore } from 'pinia';
import { ref } from 'vue';

const DEFAULT_PANEL_WIDTH = 320;
const MIN_PANEL_WIDTH = 280;
const MAX_PANEL_WIDTH = 1200;

export const useUIStore = defineStore('ui', () => {
  const activePanel = ref<string>('avatar');
  const isPanelOpen = ref(true);
  const panelWidth = ref(DEFAULT_PANEL_WIDTH);

  // Load panel width from localStorage
  function loadPanelWidth() {
    const saved = localStorage.getItem('kwami-panel-width');
    if (saved) {
      const width = parseInt(saved, 10);
      if (!isNaN(width) && width >= MIN_PANEL_WIDTH && width <= MAX_PANEL_WIDTH) {
        panelWidth.value = width;
      }
    }
  }

  // Save panel width to localStorage
  function savePanelWidth() {
    localStorage.setItem('kwami-panel-width', String(panelWidth.value));
  }

  function togglePanel() {
    isPanelOpen.value = !isPanelOpen.value;
  }

  function setPanel(panel: string) {
    activePanel.value = panel;
    if (!isPanelOpen.value) isPanelOpen.value = true;
  }

  function setPanelWidth(width: number) {
    panelWidth.value = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, width));
    savePanelWidth();
  }

  function resetPanelWidth() {
    panelWidth.value = DEFAULT_PANEL_WIDTH;
    savePanelWidth();
  }

  // Load on init
  loadPanelWidth();

  return {
    activePanel,
    isPanelOpen,
    panelWidth,
    togglePanel,
    setPanel,
    setPanelWidth,
    resetPanelWidth,
    MIN_PANEL_WIDTH,
    MAX_PANEL_WIDTH,
    DEFAULT_PANEL_WIDTH,
  };
});
