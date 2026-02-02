import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const MIN_PANEL_WIDTH = 280;
const MAX_PANEL_WIDTH = 1800;

// Size preset types
export type PanelSizePreset = 'small' | 'medium' | 'large';

export interface SizePresetConfig {
  width: number;
  shortcut: string;
}

// Default size preset configurations
const DEFAULT_SIZE_PRESETS: Record<PanelSizePreset, SizePresetConfig> = {
  small: { width: 320, shortcut: 'Alt+1' },
  medium: { width: 680, shortcut: 'Alt+2' },
  large: { width: 1300, shortcut: 'Alt+3' },
};

export const useUIStore = defineStore('ui', () => {
  const activePanel = ref<string>('avatar');
  const isPanelOpen = ref(true);
  const panelWidth = ref(DEFAULT_SIZE_PRESETS.small.width);
  
  // Size presets configuration
  const sizePresets = ref<Record<PanelSizePreset, SizePresetConfig>>({ ...DEFAULT_SIZE_PRESETS });
  const activeSizePreset = ref<PanelSizePreset>('small');
  const allowCustomResize = ref(true);

  // Load settings from localStorage
  function loadSettings() {
    // Load panel width
    const savedWidth = localStorage.getItem('kwami-panel-width');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (!isNaN(width) && width >= MIN_PANEL_WIDTH && width <= MAX_PANEL_WIDTH) {
        panelWidth.value = width;
      }
    }

    // Load size presets
    const savedPresets = localStorage.getItem('kwami-size-presets');
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets);
        sizePresets.value = { ...DEFAULT_SIZE_PRESETS, ...parsed };
      } catch {
        // Use defaults if parsing fails
      }
    }

    // Load active preset
    const savedActivePreset = localStorage.getItem('kwami-active-preset');
    if (savedActivePreset && ['small', 'medium', 'large'].includes(savedActivePreset)) {
      activeSizePreset.value = savedActivePreset as PanelSizePreset;
    }

    // Load allow custom resize
    const savedAllowResize = localStorage.getItem('kwami-allow-custom-resize');
    if (savedAllowResize !== null) {
      allowCustomResize.value = savedAllowResize === 'true';
    }
  }

  // Save settings to localStorage
  function saveSettings() {
    localStorage.setItem('kwami-panel-width', String(panelWidth.value));
    localStorage.setItem('kwami-size-presets', JSON.stringify(sizePresets.value));
    localStorage.setItem('kwami-active-preset', activeSizePreset.value);
    localStorage.setItem('kwami-allow-custom-resize', String(allowCustomResize.value));
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
    saveSettings();
  }

  function resetPanelWidth() {
    panelWidth.value = sizePresets.value[activeSizePreset.value].width;
    saveSettings();
  }

  // Set size preset and apply its width
  function setSizePreset(preset: PanelSizePreset) {
    activeSizePreset.value = preset;
    panelWidth.value = sizePresets.value[preset].width;
    saveSettings();
  }

  // Update a specific preset's width
  function setPresetWidth(preset: PanelSizePreset, width: number) {
    const clampedWidth = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, width));
    sizePresets.value[preset].width = clampedWidth;
    // If this is the active preset, also update the panel width
    if (activeSizePreset.value === preset) {
      panelWidth.value = clampedWidth;
    }
    saveSettings();
  }

  // Update a specific preset's shortcut
  function setPresetShortcut(preset: PanelSizePreset, shortcut: string) {
    sizePresets.value[preset].shortcut = shortcut;
    saveSettings();
  }

  // Toggle allow custom resize
  function setAllowCustomResize(value: boolean) {
    allowCustomResize.value = value;
    saveSettings();
  }

  // Get the default width for the current preset
  const defaultPanelWidth = computed(() => sizePresets.value[activeSizePreset.value].width);

  // Load on init
  loadSettings();

  return {
    activePanel,
    isPanelOpen,
    panelWidth,
    sizePresets,
    activeSizePreset,
    allowCustomResize,
    defaultPanelWidth,
    togglePanel,
    setPanel,
    setPanelWidth,
    resetPanelWidth,
    setSizePreset,
    setPresetWidth,
    setPresetShortcut,
    setAllowCustomResize,
    MIN_PANEL_WIDTH,
    MAX_PANEL_WIDTH,
  };
});
