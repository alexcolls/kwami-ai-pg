/**
 * Orbital Shards Avatar Store
 * 
 * Dedicated store for orbital shards renderer state with organized sections:
 * - APPEARANCE: Formation type, shard count, scale
 * - COLORS: Primary, secondary, accent colors + core colors
 * - GLOW: Glow intensity settings
 * - ANIMATION: Rotation speeds
 * - CLICK EVENTS: Click interactions
 * - CURSOR & TOUCH: Hover, drag behavior
 * - AUDIO: Audio reactivity settings
 */

import { defineStore } from 'pinia';
import { reactive } from 'vue';

// =====================================================
// TYPES
// =====================================================

export type OrbitalShardsFormation = 'constellation' | 'helix' | 'vortex';

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

export type CursorStyle = 'pointer' | 'grab' | 'crosshair' | 'default';

// =====================================================
// SECTION INTERFACES
// =====================================================

/** APPEARANCE: Formation and structure */
export interface OrbitalShardsAppearance {
  formation: OrbitalShardsFormation;
  shardCount: number;
  scale: number;
}

/** COLORS: Orbital Shards color scheme */
export interface OrbitalShardsColors {
  primary: string;
  secondary: string;
  accent: string;
  core: {
    inner: string;
    outer: string;
  };
}

/** GLOW: Light emission settings */
export interface OrbitalShardsGlow {
  intensity: number;
}

/** ANIMATION: Motion and rotation */
export interface OrbitalShardsAnimation {
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

/** ORIENTATION: Mesh position/rotation in 3D space */
export interface OrbitalShardsOrientation {
  x: number;
  y: number;
  z: number;
}

/** CLICK EVENTS: Click interaction callbacks */
export interface OrbitalShardsClickEvents {
  click: {
    enabled: boolean;
    action: InteractionAction;
  };
  doubleClick: {
    enabled: boolean;
    action: InteractionAction;
  };
  rightClick: {
    enabled: boolean;
    action: InteractionAction;
  };
  doubleRightClick: {
    enabled: boolean;
    action: InteractionAction;
  };
}

/** CURSOR & TOUCH: Input behavior */
export interface OrbitalShardsCursorTouch {
  hover: {
    enabled: boolean;
    highlightOnHover: boolean;
    cursorStyle: CursorStyle;
  };
  drag: {
    enabled: boolean;
    sensitivity: number;
  };
}

/** AUDIO: Audio reactivity settings */
export interface OrbitalShardsAudio {
  enabled: boolean;
  reactivity: number;
  smoothing: number;
  frequencyBoosts: {
    bass: number;    // bassOrbitBoost
    mid: number;     // midRotationBoost
    high: number;    // highGlowBoost
  };
}

/** Complete orbital shards state */
export interface OrbitalShardsState {
  appearance: OrbitalShardsAppearance;
  colors: OrbitalShardsColors;
  glow: OrbitalShardsGlow;
  animation: OrbitalShardsAnimation;
  orientation: OrbitalShardsOrientation;
  clickEvents: OrbitalShardsClickEvents;
  cursorTouch: OrbitalShardsCursorTouch;
  audio: OrbitalShardsAudio;
}

// =====================================================
// DEFAULT VALUES
// =====================================================

export function getDefaultAppearance(): OrbitalShardsAppearance {
  return {
    formation: 'constellation',
    shardCount: 24,
    scale: 1,
  };
}

export function getDefaultColors(): OrbitalShardsColors {
  return {
    primary: '#00e5ff',
    secondary: '#7c4dff',
    accent: '#ff4081',
    core: {
      inner: '#ffffff',
      outer: '#00ffff',
    },
  };
}

export function getDefaultGlow(): OrbitalShardsGlow {
  return {
    intensity: 1.2,
  };
}

export function getDefaultAnimation(): OrbitalShardsAnimation {
  return {
    rotation: {
      x: 0,
      y: 0.002,
      z: 0,
    },
  };
}

export function getDefaultOrientation(): OrbitalShardsOrientation {
  return {
    x: 0,
    y: 0,
    z: 0,
  };
}

export function getDefaultClickEvents(): OrbitalShardsClickEvents {
  return {
    click: {
      enabled: true,
      action: 'pulse',
    },
    doubleClick: {
      enabled: true,
      action: 'toggleListening',
    },
    rightClick: {
      enabled: true,
      action: 'randomize',
    },
    doubleRightClick: {
      enabled: true,
      action: 'switchRenderer',
    },
  };
}

export function getDefaultCursorTouch(): OrbitalShardsCursorTouch {
  return {
    hover: {
      enabled: true,
      highlightOnHover: false,
      cursorStyle: 'pointer',
    },
    drag: {
      enabled: true,
      sensitivity: 1.0,
    },
  };
}

export function getDefaultAudio(): OrbitalShardsAudio {
  return {
    enabled: true,
    reactivity: 1.5,
    smoothing: 0.1,
    frequencyBoosts: {
      bass: 0.4,
      mid: 0.6,
      high: 0.8,
    },
  };
}

export function getDefaultOrbitalShardsState(): OrbitalShardsState {
  return {
    appearance: getDefaultAppearance(),
    colors: getDefaultColors(),
    glow: getDefaultGlow(),
    animation: getDefaultAnimation(),
    clickEvents: getDefaultClickEvents(),
    cursorTouch: getDefaultCursorTouch(),
    audio: getDefaultAudio(),
  };
}

// =====================================================
// STORE
// =====================================================

export const useOrbitalShardsStore = defineStore('orbital-shards', () => {
  // State organized by sections
  const appearance = reactive<OrbitalShardsAppearance>(getDefaultAppearance());
  const colors = reactive<OrbitalShardsColors>(getDefaultColors());
  const glow = reactive<OrbitalShardsGlow>(getDefaultGlow());
  const animation = reactive<OrbitalShardsAnimation>(getDefaultAnimation());
  const orientation = reactive<OrbitalShardsOrientation>(getDefaultOrientation());
  const clickEvents = reactive<OrbitalShardsClickEvents>(getDefaultClickEvents());
  const cursorTouch = reactive<OrbitalShardsCursorTouch>(getDefaultCursorTouch());
  const audio = reactive<OrbitalShardsAudio>(getDefaultAudio());

  // =====================================================
  // SECTION RESET ACTIONS
  // =====================================================

  function resetAppearance() {
    Object.assign(appearance, getDefaultAppearance());
  }

  function resetColors() {
    Object.assign(colors, getDefaultColors());
  }

  function resetGlow() {
    Object.assign(glow, getDefaultGlow());
  }

  function resetAnimation() {
    Object.assign(animation, getDefaultAnimation());
  }

  function resetOrientation() {
    Object.assign(orientation, getDefaultOrientation());
  }

  function resetClickEvents() {
    Object.assign(clickEvents, getDefaultClickEvents());
  }

  function resetCursorTouch() {
    Object.assign(cursorTouch, getDefaultCursorTouch());
  }

  function resetAudio() {
    Object.assign(audio, getDefaultAudio());
  }

  function resetAll() {
    resetAppearance();
    resetColors();
    resetGlow();
    resetAnimation();
    resetOrientation();
    resetClickEvents();
    resetCursorTouch();
    resetAudio();
  }

  // =====================================================
  // SECTION UPDATE ACTIONS
  // =====================================================

  function updateAppearance(updates: Partial<OrbitalShardsAppearance>) {
    Object.assign(appearance, updates);
  }

  function updateColors(updates: Partial<OrbitalShardsColors>) {
    Object.assign(colors, updates);
  }

  function updateGlow(updates: Partial<OrbitalShardsGlow>) {
    Object.assign(glow, updates);
  }

  function updateAnimation(updates: Partial<OrbitalShardsAnimation>) {
    Object.assign(animation, updates);
  }

  function updateClickEvents(updates: Partial<OrbitalShardsClickEvents>) {
    Object.assign(clickEvents, updates);
  }

  function updateCursorTouch(updates: Partial<OrbitalShardsCursorTouch>) {
    Object.assign(cursorTouch, updates);
  }

  function updateAudio(updates: Partial<OrbitalShardsAudio>) {
    Object.assign(audio, updates);
  }

  // =====================================================
  // CONVENIENCE SETTERS
  // =====================================================

  function setColors(primary: string, secondary: string, accent: string) {
    colors.primary = primary;
    colors.secondary = secondary;
    colors.accent = accent;
  }

  function setCoreColors(inner: string, outer: string) {
    colors.core.inner = inner;
    colors.core.outer = outer;
  }

  function setRotation(x: number, y: number, z: number) {
    animation.rotation.x = x;
    animation.rotation.y = y;
    animation.rotation.z = z;
  }

  function setOrientation(x: number, y: number, z: number) {
    orientation.x = x;
    orientation.y = y;
    orientation.z = z;
  }

  function setFrequencyBoosts(bass: number, mid: number, high: number) {
    audio.frequencyBoosts.bass = bass;
    audio.frequencyBoosts.mid = mid;
    audio.frequencyBoosts.high = high;
  }

  // =====================================================
  // SYNC FROM EXTERNAL (Kwami instance)
  // =====================================================

  function syncFromKwami(orbitalShards: {
    getFormation: () => { formation: string };
    getColors: () => { primary: string; secondary: string; accent: string };
    getScale: () => number;
    getRotation: () => { x: number; y: number; z: number };
    shardCount?: number;
    glowIntensity?: number;
    coreColors?: { inner: string; outer: string };
    audioEffects?: {
      enabled?: boolean;
      reactivity?: number;
      smoothing?: number;
      bassOrbitBoost?: number;
      midRotationBoost?: number;
      highGlowBoost?: number;
    };
  }) {
    // Sync appearance
    const formation = orbitalShards.getFormation();
    appearance.formation = formation.formation as OrbitalShardsFormation;
    appearance.scale = orbitalShards.getScale();
    if (orbitalShards.shardCount !== undefined) {
      appearance.shardCount = orbitalShards.shardCount;
    }

    // Sync colors
    const shardColors = orbitalShards.getColors();
    colors.primary = shardColors.primary;
    colors.secondary = shardColors.secondary;
    colors.accent = shardColors.accent;
    if (orbitalShards.coreColors) {
      colors.core.inner = orbitalShards.coreColors.inner;
      colors.core.outer = orbitalShards.coreColors.outer;
    }

    // Sync glow
    if (orbitalShards.glowIntensity !== undefined) {
      glow.intensity = orbitalShards.glowIntensity;
    }

    // Sync animation
    const rotation = orbitalShards.getRotation();
    animation.rotation.x = rotation.x;
    animation.rotation.y = rotation.y;
    animation.rotation.z = rotation.z;

    // Sync audio
    if (orbitalShards.audioEffects) {
      audio.enabled = orbitalShards.audioEffects.enabled ?? audio.enabled;
      audio.reactivity = orbitalShards.audioEffects.reactivity ?? audio.reactivity;
      audio.smoothing = orbitalShards.audioEffects.smoothing ?? audio.smoothing;
      audio.frequencyBoosts.bass = orbitalShards.audioEffects.bassOrbitBoost ?? audio.frequencyBoosts.bass;
      audio.frequencyBoosts.mid = orbitalShards.audioEffects.midRotationBoost ?? audio.frequencyBoosts.mid;
      audio.frequencyBoosts.high = orbitalShards.audioEffects.highGlowBoost ?? audio.frequencyBoosts.high;
    }
  }

  // =====================================================
  // EXPORT STATE (for presets)
  // =====================================================

  function exportState(): OrbitalShardsState {
    return {
      appearance: { ...appearance },
      colors: { ...colors, core: { ...colors.core } },
      glow: { ...glow },
      animation: { ...animation, rotation: { ...animation.rotation } },
      orientation: { ...orientation },
      clickEvents: { ...clickEvents },
      cursorTouch: { ...cursorTouch },
      audio: { ...audio, frequencyBoosts: { ...audio.frequencyBoosts } },
    };
  }

  /**
   * Deep merge helper that preserves reactive references
   */
  function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): void {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = target[key];

        if (
          sourceValue !== null &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue !== null &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          // Recursively merge nested objects
          deepMerge(targetValue as Record<string, unknown>, sourceValue as Record<string, unknown>);
        } else if (sourceValue !== undefined) {
          // Assign primitive values or replace arrays
          (target as Record<string, unknown>)[key] = sourceValue;
        }
      }
    }
  }

  function importState(state: Partial<OrbitalShardsState>) {
    if (state.appearance) deepMerge(appearance, state.appearance);
    if (state.colors) deepMerge(colors, state.colors);
    if (state.glow) deepMerge(glow, state.glow);
    if (state.animation) deepMerge(animation, state.animation);
    if (state.orientation) deepMerge(orientation, state.orientation);
    if (state.clickEvents) deepMerge(clickEvents, state.clickEvents);
    if (state.cursorTouch) deepMerge(cursorTouch, state.cursorTouch);
    if (state.audio) deepMerge(audio, state.audio);
  }

  return {
    // State sections
    appearance,
    colors,
    glow,
    animation,
    orientation,
    clickEvents,
    cursorTouch,
    audio,

    // Reset actions
    resetAppearance,
    resetColors,
    resetGlow,
    resetAnimation,
    resetOrientation,
    resetClickEvents,
    resetCursorTouch,
    resetAudio,
    resetAll,

    // Update actions
    updateAppearance,
    updateColors,
    updateGlow,
    updateAnimation,
    updateClickEvents,
    updateCursorTouch,
    updateAudio,

    // Convenience setters
    setColors,
    setCoreColors,
    setRotation,
    setOrientation,
    setFrequencyBoosts,

    // Sync
    syncFromKwami,

    // Import/Export
    exportState,
    importState,
  };
});
