import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import {
  avatarPresets,
  getBlobXyzPresets,
  getOrbitalShardsPresets,
  getStarsGenesisPresets,
  getCrystalBallPresets,
  getBlackHolePresets,
  getPresetById,
  type AvatarPreset,
} from '@/presets/avatar/avatar-presets';
import { useBlobXyzStore } from './avatar.blob-xyz';
import { useOrbitalShardsStore } from './avatar.orbital-shards';
import { useStarsGenesisStore } from './avatar.stars-genesis';
import { useCrystalBallStore } from './avatar.crystal-ball';
import { useBlackHoleStore } from './avatar.black-hole';

// Re-export AvatarPreset for backwards compatibility
export type { AvatarPreset };

// Types
export type SkinSubtype = 'poles' | 'donut' | 'vintage';
export type OrbitalShardsFormation = 'constellation' | 'helix' | 'vortex';
export type StarsGenesisFormationType = 'sphere' | 'disc' | 'ring' | 'cube';
export type StarsGenesisDensity = 'uniform' | 'center-heavy' | 'edge-heavy';
export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';
export type RendererType = 'blob-xyz' | 'orbital-shards' | 'stars-genesis' | 'crystal-ball' | 'black-hole';
export type CrystalBallStyleType = 'mystical' | 'nebula' | 'earth' | 'fire' | 'ocean';

// Interaction Types
export type InteractionAction =
  | 'none'
  | 'toggleListening'
  | 'startListening'
  | 'stopListening'
  | 'randomize'
  | 'switchRenderer'
  | 'cycleState'
  | 'pulse'
  | 'moveToClick';

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

const defaultInteractionConfig: InteractionConfig = {
  click: { action: 'pulse', enabled: true },
  doubleClick: { action: 'toggleListening', enabled: true },
  rightClick: { action: 'randomize', enabled: true },
  doubleRightClick: { action: 'switchRenderer', enabled: true },
  drag: { enabled: true, sensitivity: 1.0, rotateOnDrag: true },
  hover: { enabled: true, highlightOnHover: false, cursorStyle: 'pointer' },
};

export interface SceneConfig {
  camera: {
    fov: number;
    distance: number;
  };
  lighting: {
    top: number;
    bottom: number;
    ambient: number;
  };
}

const defaultSceneConfig: SceneConfig = {
  camera: { fov: 100, distance: 6 },
  lighting: { top: 0.7, bottom: 0.4, ambient: 1.0 },
};

export interface BlobState {
  colors: { x: string; y: string; z: string };
  spikes: { x: number; y: number; z: number };
  amplitude: { x: number; y: number; z: number };
  time: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  /** Starting rotation position in degrees (0-360) */
  startRotation: { x: number; y: number; z: number };
  scale: number;
  opacity: number;
  shininess: number;
  lightIntensity: number;
  wireframe: boolean;
  /** Enable glass effect (stencil-based transparency) */
  glassMode: boolean;
  skin: SkinSubtype;
  resolution: number;
  touchStrength: number;
  touchDuration: number;
  maxTouchPoints: number;
  transitionSpeed: number;
  thinkingDuration: number;
  interaction: InteractionConfig;
  scene: SceneConfig;
  audioEffects: {
    enabled: boolean;
    reactivity: number;
    sensitivity: number;
    breathing: number;
    responseSpeed: number;
    transientBoost: number;
    bassSpike: number;
    midSpike: number;
    highSpike: number;
    timeEnabled: boolean;
    midTime: number;
    highTime: number;
    ultraTime: number;
  };
}

export interface OrbitalShardsState {
  formation: OrbitalShardsFormation;
  colors: { primary: string; secondary: string; accent: string };
  coreColors: { inner: string; outer: string };
  glowIntensity: number;
  shardCount: number;
  scale: number;
  rotation: { x: number; y: number; z: number };
  audioEffects: {
    enabled: boolean;
    reactivity: number;
    bassOrbitBoost: number; // bassSpike in UI
    midRotationBoost: number; // midSpike in UI
    highGlowBoost: number; // highSpike in UI
    smoothing: number; // sensitivity in UI
  };
  transitionSpeed: number;
  thinkingDuration: number;
  interaction: InteractionConfig;
  scene: SceneConfig;
}

export interface StarsGenesisState {
  starCount: number;
  formation: {
    type: StarsGenesisFormationType;
    radius: number;
    density: StarsGenesisDensity;
    noise: number;
  };
  visual: {
    color: string;
    glowColor: string;
    starSize: number;
    sizeVariation: number;
    opacity: number;
    glowIntensity: number;
    brightnessVariation: number;
    sharpness: number;
  };
  physics: {
    returnForce: number;
    damping: number;
    explosionForce: number;
    explosionRadius: number;
    leaderSpeed: number;
    followDelay: number;
    mouseInfluence: number;
    mouseRepulsion: number;
  };
  animation: {
    enabled: boolean;
    breathing: { enabled: boolean; speed: number; intensity: number };
    floating: { enabled: boolean; speed: number; amplitude: number };
    rotation: { enabled: boolean; speedX: number; speedY: number; speedZ: number };
    wave: { enabled: boolean; speed: number; amplitude: number };
    turbulence: { enabled: boolean; intensity: number; speed: number };
  };
  audioEffects: {
    enabled: boolean;
    reactivity: number;
    bassInfluence: number;
    midInfluence: number;
    highInfluence: number;
    smoothing: number;
    scalePulse: boolean;
    movementIntensity: number;
  };
  scale: number;
  interaction: InteractionConfig;
  scene: SceneConfig;
}

export interface CrystalBallState {
  style: CrystalBallStyleType;
  colors: { primary: string; secondary: string };
  volume: {
    iterations: number;
    depth: number;
    smoothing: number;
    noiseScale: number;
  };
  animation: {
    displacementSpeed: number;
    displacementStrength: number;
    pulseSpeed: number;
    pulseIntensity: number;
    rotation: { x: number; y: number; z: number };
  };
  surface: {
    scale: number;
    roughness: number;
    metalness: number;
    envMapIntensity: number;
  };
  audioEffects: {
    enabled: boolean;
    reactivity: number;
    smoothing: number;
    bassDisplacement: number;
    midColorBoost: number;
    highGlowBoost: number;
  };
  interaction: InteractionConfig;
  scene: SceneConfig;
}

export type BlackHoleColorScheme = 'classic' | 'fire' | 'ice' | 'nebula' | 'void';

export interface BlackHoleState {
  colorScheme: BlackHoleColorScheme;
  colors: {
    hot: string;
    mid1: string;
    mid2: string;
    mid3: string;
    outer: string;
  };
  core: {
    radius: number;
    glowIntensity: number;
    pulseSpeed: number;
  };
  disk: {
    innerRadius: number;
    outerRadius: number;
    tiltAngle: number;
    flowSpeed: number;
    noiseScale: number;
    density: number;
  };
  stars: {
    count: number;
    fieldRadius: number;
    twinkleSpeed: number;
  };
  animation: {
    autoRotate: boolean;
    autoRotateSpeed: number;
    diskRotationSpeed: number;
    starsRotationSpeed: number;
  };
  effects: {
    bloomIntensity: number;
    bloomThreshold: number;
    bloomRadius: number;
    lensingStrength: number;
    lensingRadius: number;
    chromaticAberration: number;
  };
  audioEffects: {
    enabled: boolean;
    reactivity: number;
    smoothing: number;
    bassDiskGlow: number;
    midDiskSpeed: number;
    highStarTwinkle: number;
  };
  scale: number;
  interaction: InteractionConfig;
  scene: SceneConfig;
}

// Default states
export function getDefaultBlobState(): BlobState {
  return {
    colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
    spikes: { x: 0.2, y: 0.2, z: 0.2 },
    amplitude: { x: 0.8, y: 0.8, z: 0.8 },
    time: { x: 1, y: 1, z: 1 },
    rotation: { x: 0.002, y: 0.003, z: 0.001 },
    startRotation: { x: 0, y: 0, z: 0 },
    scale: 3.2,
    opacity: 1,
    shininess: 50,
    lightIntensity: 0,
    wireframe: false,
    glassMode: false,
    skin: 'poles',
    resolution: 180,
    touchStrength: 1,
    touchDuration: 1100,
    maxTouchPoints: 5,
    transitionSpeed: 0.05,
    thinkingDuration: 10000,
    interaction: JSON.parse(JSON.stringify(defaultInteractionConfig)),
    scene: JSON.parse(JSON.stringify(defaultSceneConfig)),
    audioEffects: {
      enabled: true,
      reactivity: 1.9,
      sensitivity: 0.075,
      breathing: 0.035,
      responseSpeed: 0.75,
      transientBoost: 0.5,
      bassSpike: 0.65,
      midSpike: 0.5,
      highSpike: 0.38,
      timeEnabled: false,
      midTime: 0.1,
      highTime: 0.18,
      ultraTime: 0.08,
    }
  };
}

export function getDefaultOrbitalShardsState(): OrbitalShardsState {
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
      smoothing: 0.075,
    },
    transitionSpeed: 0.05,
    thinkingDuration: 10000,
    interaction: JSON.parse(JSON.stringify(defaultInteractionConfig)),
    scene: JSON.parse(JSON.stringify(defaultSceneConfig)),
  };
}

export function getDefaultStarsGenesisState(): StarsGenesisState {
  return {
    starCount: 6000,
    formation: {
      type: 'sphere',
      radius: 2,
      density: 'uniform',
      noise: 0.03,
    },
    visual: {
      color: '#ffffff',
      glowColor: '#88ccff',
      starSize: 0.6,
      sizeVariation: 0.5,
      opacity: 0.95,
      glowIntensity: 0.3,
      brightnessVariation: 0.25,
      sharpness: 0.7,
    },
    physics: {
      returnForce: 0.04,
      damping: 0.92,
      explosionForce: 10,
      explosionRadius: 2.5,
      leaderSpeed: 0.015,
      followDelay: 0.012,
      mouseInfluence: 1.5,
      mouseRepulsion: 0.4,
    },
    animation: {
      enabled: true,
      breathing: { enabled: true, speed: 1.0, intensity: 0.15 },
      floating: { enabled: true, speed: 0.5, amplitude: 0.08 },
      rotation: { enabled: true, speedX: 0, speedY: 0.1, speedZ: 0 },
      wave: { enabled: false, speed: 1.5, amplitude: 0.1 },
      turbulence: { enabled: true, intensity: 0.02, speed: 1.0 },
    },
    audioEffects: {
      enabled: true,
      reactivity: 1.5,
      bassInfluence: 1.0,
      midInfluence: 0.6,
      highInfluence: 0.8,
      smoothing: 0.7,
      scalePulse: true,
      movementIntensity: 0.5,
    },
    scale: 1,
    interaction: JSON.parse(JSON.stringify(defaultInteractionConfig)),
    scene: JSON.parse(JSON.stringify(defaultSceneConfig)),
  };
}

// Ultra-optimized for smooth 60fps
export function getDefaultCrystalBallState(): CrystalBallState {
  return {
    style: 'mystical',
    colors: { primary: '#6b5b95', secondary: '#feb236' },
    volume: {
      iterations: 16,
      depth: 0.6,
      smoothing: 0.25,
      noiseScale: 2.0,
    },
    animation: {
      displacementSpeed: 0.071,
      displacementStrength: 0.1,
      pulseSpeed: 1.0,
      pulseIntensity: 0.02,
      rotation: { x: 0, y: 0.001, z: 0 },
    },
    surface: {
      scale: 3.0,
      roughness: 0.1,
      metalness: 0.0,
      envMapIntensity: 0.8,
    },
    audioEffects: {
      enabled: true,
      reactivity: 1.0,
      smoothing: 0.85,
      bassDisplacement: 0.5,
      midColorBoost: 0.3,
      highGlowBoost: 0.4,
    },
    interaction: JSON.parse(JSON.stringify(defaultInteractionConfig)),
    scene: JSON.parse(JSON.stringify(defaultSceneConfig)),
  };
}

export function getDefaultBlackHoleState(): BlackHoleState {
  return {
    colorScheme: 'classic',
    colors: {
      hot: '#ffffff',
      mid1: '#ff7733',
      mid2: '#ff4477',
      mid3: '#7744ff',
      outer: '#4477ff',
    },
    core: {
      radius: 1.3,
      glowIntensity: 1.0,
      pulseSpeed: 2.5,
    },
    disk: {
      innerRadius: 0.2,
      outerRadius: 8.0,
      tiltAngle: Math.PI / 3.0,
      flowSpeed: 0.22,
      noiseScale: 2.5,
      density: 1.3,
    },
    stars: {
      count: 150000,
      fieldRadius: 2000,
      twinkleSpeed: 2.5,
    },
    animation: {
      autoRotate: false,
      autoRotateSpeed: 0.1,
      diskRotationSpeed: 0.005,
      starsRotationSpeed: 0.003,
    },
    effects: {
      bloomIntensity: 0.8,
      bloomThreshold: 0.8,
      bloomRadius: 0.7,
      lensingStrength: 0.12,
      lensingRadius: 0.3,
      chromaticAberration: 0.005,
    },
    audioEffects: {
      enabled: true,
      reactivity: 1.0,
      smoothing: 0.8,
      bassDiskGlow: 0.5,
      midDiskSpeed: 0.3,
      highStarTwinkle: 0.4,
    },
    scale: 1.0,
    interaction: JSON.parse(JSON.stringify(defaultInteractionConfig)),
    scene: JSON.parse(JSON.stringify(defaultSceneConfig)),
  };
}

// Re-export for backwards compatibility
export const AVATAR_PRESETS = avatarPresets;

const STORAGE_KEY = 'kwami-avatar';

export const useAvatarStore = defineStore('avatar', () => {
  // State
  const blob = reactive<BlobState>(getDefaultBlobState());
  const orbitalShards = reactive<OrbitalShardsState>(getDefaultOrbitalShardsState());
  const starsGenesis = reactive<StarsGenesisState>(getDefaultStarsGenesisState());
  const crystalBall = reactive<CrystalBallState>(getDefaultCrystalBallState());
  const blackHole = reactive<BlackHoleState>(getDefaultBlackHoleState());
  const activeState = ref<AvatarState>('idle');
  const rendererType = ref<RendererType>('blob-xyz');
  const isInitialized = ref(false);
  const isLoading = ref(false);

  // Computed
  const currentState = computed(() => {
    if (rendererType.value === 'blob-xyz') return blob;
    if (rendererType.value === 'orbital-shards') return orbitalShards;
    if (rendererType.value === 'crystal-ball') return crystalBall;
    if (rendererType.value === 'black-hole') return blackHole;
    return starsGenesis;
  });



  const blobXyzPresets = computed(() => getBlobXyzPresets());

  const orbitalShardsPresets = computed(() => getOrbitalShardsPresets());

  const starsGenesisPresets = computed(() => getStarsGenesisPresets());

  const crystalBallPresets = computed(() => getCrystalBallPresets());

  const blackHolePresets = computed(() => getBlackHolePresets());

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

  function updateOrbitalShards(updates: Partial<OrbitalShardsState>) {
    Object.assign(orbitalShards, updates);
  }

  function updateStarsGenesis(updates: Partial<StarsGenesisState>) {
    Object.assign(starsGenesis, updates);
  }

  function updateCrystalBall(updates: Partial<CrystalBallState>) {
    Object.assign(crystalBall, updates);
  }

  function updateBlackHole(updates: Partial<BlackHoleState>) {
    Object.assign(blackHole, updates);
  }

  function resetBlob() {
    Object.assign(blob, getDefaultBlobState());
  }

  function resetOrbitalShards() {
    Object.assign(orbitalShards, getDefaultOrbitalShardsState());
  }

  function resetStarsGenesis() {
    Object.assign(starsGenesis, getDefaultStarsGenesisState());
  }

  function resetCrystalBall() {
    Object.assign(crystalBall, getDefaultCrystalBallState());
  }

  function resetBlackHole() {
    Object.assign(blackHole, getDefaultBlackHoleState());
  }

  function reset() {
    if (rendererType.value === 'blob-xyz') {
      resetBlob();
    } else if (rendererType.value === 'orbital-shards') {
      resetOrbitalShards();
    } else if (rendererType.value === 'crystal-ball') {
      resetCrystalBall();
    } else if (rendererType.value === 'black-hole') {
      resetBlackHole();
    } else {
      resetStarsGenesis();
    }
  }

  function applyPreset(presetId: string) {
    const preset = getPresetById(presetId);
    if (!preset) return false;

    rendererType.value = preset.renderer;

    if (preset.renderer === 'blob-xyz' && preset.blobXyz) {
      // Use the new blob store for presets
      const blobStore = useBlobXyzStore();
      blobStore.importState(preset.blobXyz as Parameters<typeof blobStore.importState>[0]);
    } else if (preset.renderer === 'orbital-shards' && preset.orbitalShards) {
      // Use the new orbital shards store for presets
      const orbitalShardsStore = useOrbitalShardsStore();
      orbitalShardsStore.importState(preset.orbitalShards as Parameters<typeof orbitalShardsStore.importState>[0]);
    } else if (preset.renderer === 'stars-genesis' && preset.starsGenesis) {
      // Use the new stars genesis store for presets
      const starsGenesisStore = useStarsGenesisStore();
      starsGenesisStore.importState(preset.starsGenesis as Parameters<typeof starsGenesisStore.importState>[0]);
    } else if (preset.renderer === 'crystal-ball' && preset.crystalBall) {
      // Use the new crystal ball store for presets
      const crystalBallStore = useCrystalBallStore();
      crystalBallStore.importState(preset.crystalBall as Parameters<typeof crystalBallStore.importState>[0]);
    } else if (preset.renderer === 'black-hole' && preset.blackHole) {
      // Use the new black hole store for presets
      const blackHoleStore = useBlackHoleStore();
      blackHoleStore.importState(preset.blackHole as Parameters<typeof blackHoleStore.importState>[0]);
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
    audioEffects?: any;
    interaction?: any;
    scene?: any;
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

    // Sync audio effects if available
    if (externalBlob.audioEffects) {
      Object.assign(blob.audioEffects, externalBlob.audioEffects);
    }
    // Sync scene if available
    if (externalBlob.scene) {
      Object.assign(blob.scene, externalBlob.scene);
    }
  }

  function syncOrbitalShardsFromExternal(externalOrbitalShards: {
    getFormation: () => { formation: string };
    getColors: () => { primary: string; secondary: string; accent: string };
    getScale: () => number;
    getRotation: () => { x: number; y: number; z: number };
    getCoreColors?: () => { inner: string; outer: string } | null;
    getGlowIntensity?: () => number;
    getShardCount?: () => number;
    audioEffects?: any;
    scene?: any;
  }) {
    try {
      orbitalShards.formation = externalOrbitalShards.getFormation().formation as OrbitalShardsFormation;
      orbitalShards.colors = externalOrbitalShards.getColors();
      orbitalShards.scale = externalOrbitalShards.getScale();
      orbitalShards.rotation = externalOrbitalShards.getRotation();

      if (typeof externalOrbitalShards.getCoreColors === 'function') {
        const coreColors = externalOrbitalShards.getCoreColors();
        if (coreColors) {
          orbitalShards.coreColors = { inner: coreColors.inner, outer: coreColors.outer };
        }
      }

      if (typeof externalOrbitalShards.getGlowIntensity === 'function') {
        const glowIntensity = externalOrbitalShards.getGlowIntensity();
        if (typeof glowIntensity === 'number') {
          orbitalShards.glowIntensity = glowIntensity;
        }
      }

      if (typeof externalOrbitalShards.getShardCount === 'function') {
        const shardCount = externalOrbitalShards.getShardCount();
        if (typeof shardCount === 'number') {
          orbitalShards.shardCount = shardCount;
        }
      }

      // Sync audio effects if available
      if (externalOrbitalShards.audioEffects) {
        // Map external format to internal state if needed, or direct assign
      }

      // Sync scene if available
      if (externalOrbitalShards.scene) {
        Object.assign(orbitalShards.scene, externalOrbitalShards.scene);
      }

    } catch (e) {
      console.warn('Error syncing orbital shards state:', e);
    }
  }

  // Particles don't have getters yet, so we just sync basic state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function syncStarsGenesisFromExternal(_externalParticles: unknown) {
    // Currently stars don't expose getters, so we keep the store state as source of truth
    // This could be enhanced when the Particles class exposes getter methods
  }

  // Sync from external source (kwami instance) - Crystal Ball
  function syncCrystalBallFromExternal(externalCrystalBall: {
    getStyle: () => { style: string };
    getColors: () => { primary: string; secondary: string };
    getScale: () => number;
    getRotation: () => { x: number; y: number; z: number };
    audioEffects?: any;
  }) {
    try {
      crystalBall.style = externalCrystalBall.getStyle().style as CrystalBallStyleType;
      crystalBall.colors = externalCrystalBall.getColors();
      crystalBall.surface.scale = externalCrystalBall.getScale();
      crystalBall.animation.rotation = externalCrystalBall.getRotation();

      if (externalCrystalBall.audioEffects) {
        Object.assign(crystalBall.audioEffects, externalCrystalBall.audioEffects);
      }
    } catch (e) {
      console.warn('Error syncing crystal ball state:', e);
    }
  }

  // Sync from external source (kwami instance) - Black Hole
  function syncBlackHoleFromExternal(externalBlackHole: {
    getColorScheme: () => { scheme: string };
    getColors: () => { hot: string; mid1: string; mid2: string; mid3: string; outer: string };
    getScale: () => number;
    getConfig: () => any;
    audioEffects?: any;
  }) {
    try {
      blackHole.colorScheme = externalBlackHole.getColorScheme().scheme as BlackHoleColorScheme;
      const bhColors = externalBlackHole.getColors();
      blackHole.colors.hot = bhColors.hot;
      blackHole.colors.mid1 = bhColors.mid1;
      blackHole.colors.mid2 = bhColors.mid2;
      blackHole.colors.mid3 = bhColors.mid3;
      blackHole.colors.outer = bhColors.outer;
      blackHole.scale = externalBlackHole.getScale();

      if (externalBlackHole.audioEffects) {
        Object.assign(blackHole.audioEffects, externalBlackHole.audioEffects);
      }
    } catch (e) {
      console.warn('Error syncing black hole state:', e);
    }
  }

  // =====================================================
  // PERSISTENCE
  // =====================================================

  function saveSettings() {
    // Don't save during the initial load phase
    if (isLoading.value) return;

    const blobStore = useBlobXyzStore();
    const orbitalShardsStore = useOrbitalShardsStore();
    const starsGenesisStore = useStarsGenesisStore();
    const crystalBallStore = useCrystalBallStore();
    const blackHoleStore = useBlackHoleStore();

    const settings = {
      rendererType: rendererType.value,
      blobXyz: blobStore.exportState(),
      orbitalShards: orbitalShardsStore.exportState(),
      starsGenesis: starsGenesisStore.exportState(),
      crystalBall: crystalBallStore.exportState(),
      blackHole: blackHoleStore.exportState(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save avatar settings:', e);
    }
  }

  function loadSettings() {
    isLoading.value = true;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      isInitialized.value = true;
      isLoading.value = false;
      return;
    }

    try {
      const settings = JSON.parse(saved);

      // Restore renderer type
      if (settings.rendererType) {
        rendererType.value = settings.rendererType;
      }

      // Restore individual avatar states
      const blobStore = useBlobXyzStore();
      const orbitalShardsStore = useOrbitalShardsStore();
      const starsGenesisStore = useStarsGenesisStore();
      const crystalBallStore = useCrystalBallStore();
      const blackHoleStore = useBlackHoleStore();

      if (settings.blobXyz) {
        blobStore.importState(settings.blobXyz);
      }
      if (settings.orbitalShards) {
        orbitalShardsStore.importState(settings.orbitalShards);
      }
      if (settings.starsGenesis) {
        starsGenesisStore.importState(settings.starsGenesis);
      }
      if (settings.crystalBall) {
        crystalBallStore.importState(settings.crystalBall);
      }
      if (settings.blackHole) {
        blackHoleStore.importState(settings.blackHole);
      }
    } catch (e) {
      console.warn('Failed to load avatar settings:', e);
    }

    isInitialized.value = true;
    isLoading.value = false;
  }

  return {
    // State
    blob,
    orbitalShards,
    starsGenesis,
    crystalBall,
    blackHole,
    activeState,
    rendererType,
    isInitialized,
    isLoading,
    // Computed
    currentState,
    avatarPresets,
    blobXyzPresets,
    orbitalShardsPresets,
    starsGenesisPresets,
    crystalBallPresets,
    blackHolePresets,
    // Actions
    setRendererType,
    setActiveState,
    updateBlob,
    updateOrbitalShards,
    updateStarsGenesis,
    updateCrystalBall,
    updateBlackHole,
    resetBlob,
    resetOrbitalShards,
    resetStarsGenesis,
    resetCrystalBall,
    resetBlackHole,
    reset,
    applyPreset,
    syncBlobFromExternal,
    syncOrbitalShardsFromExternal,
    syncStarsGenesisFromExternal,
    syncCrystalBallFromExternal,
    syncBlackHoleFromExternal,
    // Persistence
    loadSettings,
    saveSettings,
  };
});
