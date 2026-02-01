/**
 * Crystal Avatar Store
 * 
 * Dedicated store for crystal renderer state with organized sections:
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

export type CrystalFormation = 'constellation' | 'helix' | 'vortex';

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
export interface CrystalAppearance {
  formation: CrystalFormation;
  shardCount: number;
  scale: number;
}

/** COLORS: Crystal color scheme */
export interface CrystalColors {
  primary: string;
  secondary: string;
  accent: string;
  core: {
    inner: string;
    outer: string;
  };
}

/** GLOW: Light emission settings */
export interface CrystalGlow {
  intensity: number;
}

/** ANIMATION: Motion and rotation */
export interface CrystalAnimation {
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

/** CLICK EVENTS: Click interaction callbacks */
export interface CrystalClickEvents {
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
export interface CrystalCursorTouch {
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
export interface CrystalAudio {
  enabled: boolean;
  reactivity: number;
  smoothing: number;
  frequencyBoosts: {
    bass: number;    // bassOrbitBoost
    mid: number;     // midRotationBoost
    high: number;    // highGlowBoost
  };
}

/** Complete crystal state */
export interface CrystalState {
  appearance: CrystalAppearance;
  colors: CrystalColors;
  glow: CrystalGlow;
  animation: CrystalAnimation;
  clickEvents: CrystalClickEvents;
  cursorTouch: CrystalCursorTouch;
  audio: CrystalAudio;
}

// =====================================================
// DEFAULT VALUES
// =====================================================

export function getDefaultAppearance(): CrystalAppearance {
  return {
    formation: 'constellation',
    shardCount: 24,
    scale: 1,
  };
}

export function getDefaultColors(): CrystalColors {
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

export function getDefaultGlow(): CrystalGlow {
  return {
    intensity: 1.2,
  };
}

export function getDefaultAnimation(): CrystalAnimation {
  return {
    rotation: {
      x: 0,
      y: 0.002,
      z: 0,
    },
  };
}

export function getDefaultClickEvents(): CrystalClickEvents {
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

export function getDefaultCursorTouch(): CrystalCursorTouch {
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

export function getDefaultAudio(): CrystalAudio {
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

export function getDefaultCrystalState(): CrystalState {
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

export const useCrystalStore = defineStore('crystal', () => {
  // State organized by sections
  const appearance = reactive<CrystalAppearance>(getDefaultAppearance());
  const colors = reactive<CrystalColors>(getDefaultColors());
  const glow = reactive<CrystalGlow>(getDefaultGlow());
  const animation = reactive<CrystalAnimation>(getDefaultAnimation());
  const clickEvents = reactive<CrystalClickEvents>(getDefaultClickEvents());
  const cursorTouch = reactive<CrystalCursorTouch>(getDefaultCursorTouch());
  const audio = reactive<CrystalAudio>(getDefaultAudio());

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
    resetClickEvents();
    resetCursorTouch();
    resetAudio();
  }

  // =====================================================
  // SECTION UPDATE ACTIONS
  // =====================================================

  function updateAppearance(updates: Partial<CrystalAppearance>) {
    Object.assign(appearance, updates);
  }

  function updateColors(updates: Partial<CrystalColors>) {
    Object.assign(colors, updates);
  }

  function updateGlow(updates: Partial<CrystalGlow>) {
    Object.assign(glow, updates);
  }

  function updateAnimation(updates: Partial<CrystalAnimation>) {
    Object.assign(animation, updates);
  }

  function updateClickEvents(updates: Partial<CrystalClickEvents>) {
    Object.assign(clickEvents, updates);
  }

  function updateCursorTouch(updates: Partial<CrystalCursorTouch>) {
    Object.assign(cursorTouch, updates);
  }

  function updateAudio(updates: Partial<CrystalAudio>) {
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

  function setFrequencyBoosts(bass: number, mid: number, high: number) {
    audio.frequencyBoosts.bass = bass;
    audio.frequencyBoosts.mid = mid;
    audio.frequencyBoosts.high = high;
  }

  // =====================================================
  // SYNC FROM EXTERNAL (Kwami instance)
  // =====================================================

  function syncFromKwami(crystal: {
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
    const formation = crystal.getFormation();
    appearance.formation = formation.formation as CrystalFormation;
    appearance.scale = crystal.getScale();
    if (crystal.shardCount !== undefined) {
      appearance.shardCount = crystal.shardCount;
    }

    // Sync colors
    const crystalColors = crystal.getColors();
    colors.primary = crystalColors.primary;
    colors.secondary = crystalColors.secondary;
    colors.accent = crystalColors.accent;
    if (crystal.coreColors) {
      colors.core.inner = crystal.coreColors.inner;
      colors.core.outer = crystal.coreColors.outer;
    }

    // Sync glow
    if (crystal.glowIntensity !== undefined) {
      glow.intensity = crystal.glowIntensity;
    }

    // Sync animation
    const rotation = crystal.getRotation();
    animation.rotation.x = rotation.x;
    animation.rotation.y = rotation.y;
    animation.rotation.z = rotation.z;

    // Sync audio
    if (crystal.audioEffects) {
      audio.enabled = crystal.audioEffects.enabled ?? audio.enabled;
      audio.reactivity = crystal.audioEffects.reactivity ?? audio.reactivity;
      audio.smoothing = crystal.audioEffects.smoothing ?? audio.smoothing;
      audio.frequencyBoosts.bass = crystal.audioEffects.bassOrbitBoost ?? audio.frequencyBoosts.bass;
      audio.frequencyBoosts.mid = crystal.audioEffects.midRotationBoost ?? audio.frequencyBoosts.mid;
      audio.frequencyBoosts.high = crystal.audioEffects.highGlowBoost ?? audio.frequencyBoosts.high;
    }
  }

  // =====================================================
  // EXPORT STATE (for presets)
  // =====================================================

  function exportState(): CrystalState {
    return {
      appearance: { ...appearance },
      colors: { ...colors, core: { ...colors.core } },
      glow: { ...glow },
      animation: { ...animation, rotation: { ...animation.rotation } },
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

  function importState(state: Partial<CrystalState>) {
    if (state.appearance) deepMerge(appearance, state.appearance);
    if (state.colors) deepMerge(colors, state.colors);
    if (state.glow) deepMerge(glow, state.glow);
    if (state.animation) deepMerge(animation, state.animation);
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
    clickEvents,
    cursorTouch,
    audio,

    // Reset actions
    resetAppearance,
    resetColors,
    resetGlow,
    resetAnimation,
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
    setFrequencyBoosts,

    // Sync
    syncFromKwami,

    // Import/Export
    exportState,
    importState,
  };
});
