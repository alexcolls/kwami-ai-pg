import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
  const activePanel = ref<string>('avatar');
  const isPanelOpen = ref(true);

  function togglePanel() {
    isPanelOpen.value = !isPanelOpen.value;
  }

  function setPanel(panel: string) {
    activePanel.value = panel;
    if (!isPanelOpen.value) isPanelOpen.value = true;
  }

  return { activePanel, isPanelOpen, togglePanel, setPanel };
});
