import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';

export type InteractionAction =
  | 'none'
  | 'toggleListening'
  | 'startListening'
  | 'stopListening'
  | 'toggleSpeaking'
  | 'randomize'
  | 'switchRenderer'
  | 'cycleState'
  | 'pulse'
  | 'custom';

export interface InteractionConfig {
  click: {
    action: InteractionAction;
    enabled: boolean;
  };
  doubleClick: {
    action: InteractionAction;
    enabled: boolean;
  };
  rightClick: {
    action: InteractionAction;
    enabled: boolean;
  };
  doubleRightClick: {
    action: InteractionAction;
    enabled: boolean;
  };
  drag: {
    enabled: boolean;
    sensitivity: number;
    rotateOnDrag: boolean;
  };
  hover: {
    enabled: boolean;
    highlightOnHover: boolean;
    cursorStyle: string;
  };
}

const defaultConfig: InteractionConfig = {
  click: {
    action: 'pulse',
    enabled: true,
  },
  doubleClick: {
    action: 'toggleListening',
    enabled: true,
  },
  rightClick: {
    action: 'randomize',
    enabled: true,
  },
  doubleRightClick: {
    action: 'switchRenderer',
    enabled: true,
  },
  drag: {
    enabled: true,
    sensitivity: 1.0,
    rotateOnDrag: true,
  },
  hover: {
    enabled: true,
    highlightOnHover: false,
    cursorStyle: 'pointer',
  },
};

export const useInteractionStore = defineStore('interaction', () => {
  const config = reactive<InteractionConfig>({ ...defaultConfig });

  function updateClick(updates: Partial<InteractionConfig['click']>) {
    Object.assign(config.click, updates);
  }

  function updateDoubleClick(updates: Partial<InteractionConfig['doubleClick']>) {
    Object.assign(config.doubleClick, updates);
  }

  function updateRightClick(updates: Partial<InteractionConfig['rightClick']>) {
    Object.assign(config.rightClick, updates);
  }

  function updateDoubleRightClick(updates: Partial<InteractionConfig['doubleRightClick']>) {
    Object.assign(config.doubleRightClick, updates);
  }

  function updateDrag(updates: Partial<InteractionConfig['drag']>) {
    Object.assign(config.drag, updates);
  }

  function updateHover(updates: Partial<InteractionConfig['hover']>) {
    Object.assign(config.hover, updates);
  }

  function reset() {
    Object.assign(config, defaultConfig);
  }

  function getConfig(): InteractionConfig {
    return config;
  }

  return {
    ...toRefs(config),
    config,
    updateClick,
    updateDoubleClick,
    updateRightClick,
    updateDoubleRightClick,
    updateDrag,
    updateHover,
    reset,
    getConfig,
  };
});
