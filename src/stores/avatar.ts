import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';

// Types
export type SkinSubtype = 'poles' | 'donut' | 'vintage';
export type CrystalFormation = 'constellation' | 'helix' | 'vortex';
export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';
export type RendererType = 'blob' | 'crystal';

export interface BlobState {
  colors: { x: string; y: string; z: string };
  spikes: { x: number; y: number; z: number };
  amplitude: { x: number; y: number; z: number };
  time: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  opacity: number;
  shininess: number;
  lightIntensity: number;
  wireframe: boolean;
  skin: SkinSubtype;
  resolution: number;
  touchStrength: number;
  touchDuration: number;
  maxTouchPoints: number;
  transitionSpeed: number;
  thinkingDuration: number;
}

export interface CrystalState {
  formation: CrystalFormation;
  colors: { primary: string; secondary: string; accent: string };
  coreColors: { inner: string; outer: string };
  glowIntensity: number;
  shardCount: number;
  scale: number;
  rotation: { x: number; y: number; z: number };
  audioEffects: {
    enabled: boolean;
    reactivity: number;
    bassOrbitBoost: number;
    midRotationBoost: number;
    highGlowBoost: number;
  };
  transitionSpeed: number;
  thinkingDuration: number;
}

export interface AvatarPreset {
  id: string;
  name: string;
  icon: string;
  renderer: RendererType;
  blob?: Partial<BlobState>;
  crystal?: Partial<CrystalState>;
}

// Default states
export function getDefaultBlobState(): BlobState {
  return {
    colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
    spikes: { x: 0.2, y: 0.2, z: 0.2 },
    amplitude: { x: 0.8, y: 0.8, z: 0.8 },
    time: { x: 1, y: 1, z: 1 },
    rotation: { x: 0.002, y: 0.003, z: 0.001 },
    scale: 3.2,
    opacity: 1,
    shininess: 50,
    lightIntensity: 0,
    wireframe: false,
    skin: 'poles',
    resolution: 180,
    touchStrength: 1,
    touchDuration: 1100,
    maxTouchPoints: 5,
    transitionSpeed: 0.05,
    thinkingDuration: 10000,
  };
}

export function getDefaultCrystalState(): CrystalState {
  return {
    formation: 'constellation',
    colors: { primary: '#00e5ff', secondary: '#7c4dff', accent: '#ff4081' },
    coreColors: { inner: '#ffffff', outer: '#00ffff' },
    glowIntensity: 1.2,
    shardCount: 24,
    scale: 1,
    rotation: { x: 0, y: 0.002, z: 0 },
    audioEffects: {
      enabled: true,
      reactivity: 1.5,
      bassOrbitBoost: 0.4,
      midRotationBoost: 0.6,
      highGlowBoost: 0.8,
    },
    transitionSpeed: 0.05,
    thinkingDuration: 10000,
  };
}

// Built-in presets
export const AVATAR_PRESETS: AvatarPreset[] = [
  // ===== BLOB PRESETS =====
  {
    id: 'neon-pulse',
    name: 'Neon Pulse',
    icon: 'ph:lightning-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
      spikes: { x: 0.3, y: 0.3, z: 0.3 },
      skin: 'poles',
      shininess: 80,
    },
  },
  {
    id: 'ocean-wave',
    name: 'Ocean Wave',
    icon: 'ph:waves-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#0077be', y: '#00d4ff', z: '#001a33' },
      spikes: { x: 0.15, y: 0.2, z: 0.15 },
      skin: 'donut',
      shininess: 120,
    },
  },
  {
    id: 'sunset-glow',
    name: 'Sunset',
    icon: 'ph:sun-horizon-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#ff6b35', y: '#f7c59f', z: '#8b1e3f' },
      spikes: { x: 0.1, y: 0.1, z: 0.1 },
      skin: 'vintage',
      shininess: 40,
    },
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora',
    icon: 'ph:star-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#00ff87', y: '#60efff', z: '#7b2cbf' },
      spikes: { x: 0.25, y: 0.35, z: 0.2 },
      skin: 'poles',
      shininess: 100,
      amplitude: { x: 1.0, y: 1.2, z: 0.9 },
    },
  },
  {
    id: 'lava-flow',
    name: 'Lava',
    icon: 'ph:fire-simple-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#ff4500', y: '#ff8c00', z: '#8b0000' },
      spikes: { x: 0.5, y: 0.6, z: 0.4 },
      skin: 'vintage',
      shininess: 30,
      lightIntensity: 1.5,
    },
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    icon: 'ph:cloud-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#ffb6c1', y: '#87ceeb', z: '#dda0dd' },
      spikes: { x: 0.08, y: 0.08, z: 0.08 },
      skin: 'donut',
      shininess: 150,
      amplitude: { x: 0.6, y: 0.6, z: 0.6 },
    },
  },
  {
    id: 'midnight-void',
    name: 'Midnight',
    icon: 'ph:moon-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#1a1a2e', y: '#16213e', z: '#0f3460' },
      spikes: { x: 0.2, y: 0.2, z: 0.2 },
      skin: 'poles',
      shininess: 180,
      lightIntensity: 0.5,
    },
  },
  {
    id: 'toxic-slime',
    name: 'Toxic',
    icon: 'ph:skull-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#39ff14', y: '#00ff00', z: '#32cd32' },
      spikes: { x: 0.7, y: 0.5, z: 0.6 },
      skin: 'vintage',
      shininess: 60,
      amplitude: { x: 1.2, y: 1.0, z: 1.1 },
    },
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    icon: 'ph:crown-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#ffd700', y: '#daa520', z: '#b8860b' },
      spikes: { x: 0.15, y: 0.15, z: 0.15 },
      skin: 'donut',
      shininess: 200,
      lightIntensity: 1.0,
    },
  },
  {
    id: 'ice-crystal',
    name: 'Ice',
    icon: 'ph:snowflake-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#e0ffff', y: '#add8e6', z: '#87ceeb' },
      spikes: { x: 0.4, y: 0.45, z: 0.35 },
      skin: 'poles',
      shininess: 180,
      opacity: 0.9,
    },
  },
  {
    id: 'forest-moss',
    name: 'Forest',
    icon: 'ph:tree-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#228b22', y: '#006400', z: '#8fbc8f' },
      spikes: { x: 0.12, y: 0.18, z: 0.15 },
      skin: 'vintage',
      shininess: 40,
      amplitude: { x: 0.7, y: 0.8, z: 0.75 },
    },
  },
  {
    id: 'galaxy-swirl',
    name: 'Galaxy',
    icon: 'ph:planet-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#663399', y: '#ff1493', z: '#00ced1' },
      spikes: { x: 0.35, y: 0.4, z: 0.3 },
      skin: 'poles',
      shininess: 100,
      rotation: { x: 0.003, y: 0.005, z: 0.002 },
    },
  },
  // ===== CRYSTAL PRESETS =====
  {
    id: 'cyber-crystal',
    name: 'Cyber',
    icon: 'ph:diamond-duotone',
    renderer: 'crystal',
    crystal: {
      formation: 'constellation',
      colors: { primary: '#00e5ff', secondary: '#7c4dff', accent: '#ff4081' },
      coreColors: { inner: '#ffffff', outer: '#00ffff' },
      glowIntensity: 1.4,
    },
  },
  {
    id: 'emerald-helix',
    name: 'Emerald',
    icon: 'ph:dna-duotone',
    renderer: 'crystal',
    crystal: {
      formation: 'helix',
      colors: { primary: '#00ff88', secondary: '#00cc6a', accent: '#00ffaa' },
      coreColors: { inner: '#ccffee', outer: '#00ff88' },
      glowIntensity: 1.2,
    },
  },
  {
    id: 'fire-vortex',
    name: 'Fire',
    icon: 'ph:fire-duotone',
    renderer: 'crystal',
    crystal: {
      formation: 'vortex',
      colors: { primary: '#ff4500', secondary: '#ff8c00', accent: '#ffd700' },
      coreColors: { inner: '#ffffff', outer: '#ff6347' },
      glowIntensity: 1.6,
    },
  },
];

export const useAvatarStore = defineStore('avatar', () => {
  // State
  const blob = reactive<BlobState>(getDefaultBlobState());
  const crystal = reactive<CrystalState>(getDefaultCrystalState());
  const activeState = ref<AvatarState>('idle');
  const rendererType = ref<RendererType>('blob');

  // Computed
  const currentState = computed(() => {
    return rendererType.value === 'blob' ? blob : crystal;
  });

  const presets = computed(() => AVATAR_PRESETS);

  const blobPresets = computed(() => 
    AVATAR_PRESETS.filter(p => p.renderer === 'blob')
  );

  const crystalPresets = computed(() => 
    AVATAR_PRESETS.filter(p => p.renderer === 'crystal')
  );

  // Actions
  function setRendererType(type: RendererType) {
    rendererType.value = type;
  }

  function setActiveState(state: AvatarState) {
    activeState.value = state;
  }

  function updateBlob(updates: Partial<BlobState>) {
    Object.assign(blob, updates);
  }

  function updateCrystal(updates: Partial<CrystalState>) {
    Object.assign(crystal, updates);
  }

  function resetBlob() {
    Object.assign(blob, getDefaultBlobState());
  }

  function resetCrystal() {
    Object.assign(crystal, getDefaultCrystalState());
  }

  function reset() {
    if (rendererType.value === 'blob') {
      resetBlob();
    } else {
      resetCrystal();
    }
  }

  function applyPreset(presetId: string) {
    const preset = AVATAR_PRESETS.find(p => p.id === presetId);
    if (!preset) return false;

    rendererType.value = preset.renderer;

    if (preset.renderer === 'blob' && preset.blob) {
      Object.assign(blob, preset.blob);
    } else if (preset.renderer === 'crystal' && preset.crystal) {
      Object.assign(crystal, preset.crystal);
    }

    return true;
  }

  // Sync from external source (kwami instance)
  function syncBlobFromExternal(externalBlob: {
    getColors: () => { x: string; y: string; z: string };
    getSpikes: () => { x: number; y: number; z: number };
    getAmplitude: () => { x: number; y: number; z: number };
    getTime: () => { x: number; y: number; z: number };
    getRotation: () => { x: number; y: number; z: number };
    getScale: () => number;
    getOpacity: () => number;
    getShininess: () => number;
    lightIntensity: number;
    getWireframe: () => boolean;
    getCurrentSkinSubtype: () => string;
  }) {
    const c = externalBlob.getColors();
    blob.colors = { x: c.x, y: c.y, z: c.z };
    blob.spikes = externalBlob.getSpikes();
    blob.amplitude = externalBlob.getAmplitude();
    blob.time = externalBlob.getTime();
    blob.rotation = externalBlob.getRotation();
    blob.scale = externalBlob.getScale();
    blob.opacity = externalBlob.getOpacity();
    blob.shininess = externalBlob.getShininess();
    blob.lightIntensity = externalBlob.lightIntensity;
    blob.wireframe = externalBlob.getWireframe();
    blob.skin = externalBlob.getCurrentSkinSubtype() as SkinSubtype;
  }

  function syncCrystalFromExternal(externalCrystal: {
    getFormation: () => { formation: string };
    getColors: () => { primary: string; secondary: string; accent: string };
    getScale: () => number;
    getRotation: () => { x: number; y: number; z: number };
    getCoreColors?: () => { inner: string; outer: string } | null;
    getGlowIntensity?: () => number;
    getShardCount?: () => number;
  }) {
    try {
      crystal.formation = externalCrystal.getFormation().formation as CrystalFormation;
      crystal.colors = externalCrystal.getColors();
      crystal.scale = externalCrystal.getScale();
      crystal.rotation = externalCrystal.getRotation();

      if (typeof externalCrystal.getCoreColors === 'function') {
        const coreColors = externalCrystal.getCoreColors();
        if (coreColors) {
          crystal.coreColors = { inner: coreColors.inner, outer: coreColors.outer };
        }
      }

      if (typeof externalCrystal.getGlowIntensity === 'function') {
        const glowIntensity = externalCrystal.getGlowIntensity();
        if (typeof glowIntensity === 'number') {
          crystal.glowIntensity = glowIntensity;
        }
      }

      if (typeof externalCrystal.getShardCount === 'function') {
        const shardCount = externalCrystal.getShardCount();
        if (typeof shardCount === 'number') {
          crystal.shardCount = shardCount;
        }
      }
    } catch (e) {
      console.warn('Error syncing crystal state:', e);
    }
  }

  return {
    // State
    blob,
    crystal,
    activeState,
    rendererType,
    // Computed
    currentState,
    presets,
    blobPresets,
    crystalPresets,
    // Actions
    setRendererType,
    setActiveState,
    updateBlob,
    updateCrystal,
    resetBlob,
    resetCrystal,
    reset,
    applyPreset,
    syncBlobFromExternal,
    syncCrystalFromExternal,
  };
});
