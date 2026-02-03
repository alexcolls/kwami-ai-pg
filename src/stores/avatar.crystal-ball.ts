/**
 * Crystal Ball Avatar Store
 * 
 * Dedicated store for crystal ball (magical marble) renderer state with organized sections:
 * - STYLE: Preset visual styles (mystical, nebula, earth, fire, ocean)
 * - COLORS: Primary and secondary gradient colors
 * - VOLUME: Raymarching parameters (iterations, depth, smoothing, noise)
 * - ANIMATION: Displacement, pulse, rotation
 * - SURFACE: Material properties (roughness, metalness)
 * - CLICK EVENTS: Click interactions
 * - CURSOR & TOUCH: Hover, drag behavior
 * - AUDIO: Audio reactivity settings
 */

import { defineStore } from 'pinia';
import { reactive } from 'vue';

// =====================================================
// TYPES
// =====================================================

export type CrystalBallStyle = 'mystical' | 'nebula' | 'earth' | 'fire' | 'ocean';

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

/** STYLE: Visual preset */
export interface CrystalBallStyleSection {
  preset: CrystalBallStyle;
}

/** COLORS: Gradient colors */
export interface CrystalBallColors {
  primary: string;
  secondary: string;
}

/** VOLUME: Raymarching parameters */
export interface CrystalBallVolume {
  iterations: number;
  depth: number;
  smoothing: number;
  noiseScale: number;
  quality: number;  // 1=fast, 2=balanced, 3=detailed, 4=maximum
}

/** ANIMATION: Motion and effects */
export interface CrystalBallAnimation {
  displacementSpeed: number;
  displacementStrength: number;
  pulseSpeed: number;
  pulseIntensity: number;
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

/** SURFACE: Material properties */
export interface CrystalBallSurface {
  scale: number;
  roughness: number;
  metalness: number;
  envMapIntensity: number;
}

/** CLICK EVENTS: Click interaction callbacks */
export interface CrystalBallClickEvents {
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
export interface CrystalBallCursorTouch {
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
export interface CrystalBallAudio {
  enabled: boolean;
  reactivity: number;
  smoothing: number;
  frequencyEffects: {
    bassDisplacement: number;
    midColorBoost: number;
    highGlowBoost: number;
  };
}

/** Complete crystal ball state */
export interface CrystalBallState {
  style: CrystalBallStyleSection;
  colors: CrystalBallColors;
  volume: CrystalBallVolume;
  animation: CrystalBallAnimation;
  surface: CrystalBallSurface;
  clickEvents: CrystalBallClickEvents;
  cursorTouch: CrystalBallCursorTouch;
  audio: CrystalBallAudio;
}

// =====================================================
// DEFAULT VALUES
// =====================================================

export function getDefaultStyle(): CrystalBallStyleSection {
  return {
    preset: 'mystical',
  };
}

export function getDefaultColors(): CrystalBallColors {
  return {
    primary: '#6b5b95',
    secondary: '#feb236',
  };
}

// Tutorial defaults: iterations 18, depth 0.6, smoothing 0.3
export function getDefaultVolume(): CrystalBallVolume {
  return {
    iterations: 18,
    depth: 0.6,
    smoothing: 0.3,
    noiseScale: 1.0,
    quality: 2,
  };
}

export function getDefaultAnimation(): CrystalBallAnimation {
  return {
    displacementSpeed: 0.07,      // tutorial ~0.07
    displacementStrength: 0.3,    // tutorial ~0.3
    pulseSpeed: 1.0,
    pulseIntensity: 0.02,
    rotation: {
      x: 0,
      y: 0.001,
      z: 0,
    },
  };
}

export function getDefaultSurface(): CrystalBallSurface {
  return {
    scale: 3.0,
    roughness: 0.1,
    metalness: 0.0,
    envMapIntensity: 0.8,
  };
}

export function getDefaultClickEvents(): CrystalBallClickEvents {
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

export function getDefaultCursorTouch(): CrystalBallCursorTouch {
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

export function getDefaultAudio(): CrystalBallAudio {
  return {
    enabled: true,
    reactivity: 1.0,
    smoothing: 0.85,
    frequencyEffects: {
      bassDisplacement: 0.5,
      midColorBoost: 0.3,
      highGlowBoost: 0.4,
    },
  };
}

export function getDefaultCrystalBallState(): CrystalBallState {
  return {
    style: getDefaultStyle(),
    colors: getDefaultColors(),
    volume: getDefaultVolume(),
    animation: getDefaultAnimation(),
    surface: getDefaultSurface(),
    clickEvents: getDefaultClickEvents(),
    cursorTouch: getDefaultCursorTouch(),
    audio: getDefaultAudio(),
  };
}

// =====================================================
// STORE
// =====================================================

export const useCrystalBallStore = defineStore('crystalBall', () => {
  // State organized by sections
  const style = reactive<CrystalBallStyleSection>(getDefaultStyle());
  const colors = reactive<CrystalBallColors>(getDefaultColors());
  const volume = reactive<CrystalBallVolume>(getDefaultVolume());
  const animation = reactive<CrystalBallAnimation>(getDefaultAnimation());
  const surface = reactive<CrystalBallSurface>(getDefaultSurface());
  const clickEvents = reactive<CrystalBallClickEvents>(getDefaultClickEvents());
  const cursorTouch = reactive<CrystalBallCursorTouch>(getDefaultCursorTouch());
  const audio = reactive<CrystalBallAudio>(getDefaultAudio());

  // =====================================================
  // SECTION RESET ACTIONS
  // =====================================================

  function resetStyle() {
    Object.assign(style, getDefaultStyle());
  }

  function resetColors() {
    Object.assign(colors, getDefaultColors());
  }

  function resetVolume() {
    Object.assign(volume, getDefaultVolume());
  }

  function resetAnimation() {
    Object.assign(animation, getDefaultAnimation());
  }

  function resetSurface() {
    Object.assign(surface, getDefaultSurface());
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
    resetStyle();
    resetColors();
    resetVolume();
    resetAnimation();
    resetSurface();
    resetClickEvents();
    resetCursorTouch();
    resetAudio();
  }

  // =====================================================
  // SECTION UPDATE ACTIONS
  // =====================================================

  function updateStyle(updates: Partial<CrystalBallStyleSection>) {
    Object.assign(style, updates);
  }

  function updateColors(updates: Partial<CrystalBallColors>) {
    Object.assign(colors, updates);
  }

  function updateVolume(updates: Partial<CrystalBallVolume>) {
    Object.assign(volume, updates);
  }

  function updateAnimation(updates: Partial<CrystalBallAnimation>) {
    Object.assign(animation, updates);
  }

  function updateSurface(updates: Partial<CrystalBallSurface>) {
    Object.assign(surface, updates);
  }

  function updateClickEvents(updates: Partial<CrystalBallClickEvents>) {
    Object.assign(clickEvents, updates);
  }

  function updateCursorTouch(updates: Partial<CrystalBallCursorTouch>) {
    Object.assign(cursorTouch, updates);
  }

  function updateAudio(updates: Partial<CrystalBallAudio>) {
    Object.assign(audio, updates);
  }

  // =====================================================
  // CONVENIENCE SETTERS
  // =====================================================

  function setColors(primary: string, secondary: string) {
    colors.primary = primary;
    colors.secondary = secondary;
  }

  function setRotation(x: number, y: number, z: number) {
    animation.rotation.x = x;
    animation.rotation.y = y;
    animation.rotation.z = z;
  }

  function setFrequencyEffects(bass: number, mid: number, high: number) {
    audio.frequencyEffects.bassDisplacement = bass;
    audio.frequencyEffects.midColorBoost = mid;
    audio.frequencyEffects.highGlowBoost = high;
  }

  // =====================================================
  // SYNC FROM EXTERNAL (Kwami instance)
  // =====================================================

  function syncFromKwami(crystalBall: {
    getStyle: () => { style: string };
    getColors: () => { primary: string; secondary: string };
    getScale: () => number;
    getRotation: () => { x: number; y: number; z: number };
    audioEffects?: {
      enabled?: boolean;
      reactivity?: number;
      smoothing?: number;
      bassDisplacement?: number;
      midColorBoost?: number;
      highGlowBoost?: number;
    };
  }) {
    // Sync style
    const styleData = crystalBall.getStyle();
    style.preset = styleData.style as CrystalBallStyle;
    
    // Sync surface
    surface.scale = crystalBall.getScale();

    // Sync colors
    const ballColors = crystalBall.getColors();
    colors.primary = ballColors.primary;
    colors.secondary = ballColors.secondary;

    // Sync animation
    const rotation = crystalBall.getRotation();
    animation.rotation.x = rotation.x;
    animation.rotation.y = rotation.y;
    animation.rotation.z = rotation.z;

    // Sync audio
    if (crystalBall.audioEffects) {
      audio.enabled = crystalBall.audioEffects.enabled ?? audio.enabled;
      audio.reactivity = crystalBall.audioEffects.reactivity ?? audio.reactivity;
      audio.smoothing = crystalBall.audioEffects.smoothing ?? audio.smoothing;
      audio.frequencyEffects.bassDisplacement = crystalBall.audioEffects.bassDisplacement ?? audio.frequencyEffects.bassDisplacement;
      audio.frequencyEffects.midColorBoost = crystalBall.audioEffects.midColorBoost ?? audio.frequencyEffects.midColorBoost;
      audio.frequencyEffects.highGlowBoost = crystalBall.audioEffects.highGlowBoost ?? audio.frequencyEffects.highGlowBoost;
    }
  }

  // =====================================================
  // EXPORT STATE (for presets)
  // =====================================================

  function exportState(): CrystalBallState {
    return {
      style: { ...style },
      colors: { ...colors },
      volume: { ...volume },
      animation: { ...animation, rotation: { ...animation.rotation } },
      surface: { ...surface },
      clickEvents: { ...clickEvents },
      cursorTouch: { ...cursorTouch },
      audio: { ...audio, frequencyEffects: { ...audio.frequencyEffects } },
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

  function importState(state: Partial<CrystalBallState>) {
    if (state.style) deepMerge(style, state.style);
    if (state.colors) deepMerge(colors, state.colors);
    if (state.volume) deepMerge(volume, state.volume);
    if (state.animation) deepMerge(animation, state.animation);
    if (state.surface) deepMerge(surface, state.surface);
    if (state.clickEvents) deepMerge(clickEvents, state.clickEvents);
    if (state.cursorTouch) deepMerge(cursorTouch, state.cursorTouch);
    if (state.audio) deepMerge(audio, state.audio);
  }

  return {
    // State sections
    style,
    colors,
    volume,
    animation,
    surface,
    clickEvents,
    cursorTouch,
    audio,

    // Reset actions
    resetStyle,
    resetColors,
    resetVolume,
    resetAnimation,
    resetSurface,
    resetClickEvents,
    resetCursorTouch,
    resetAudio,
    resetAll,

    // Update actions
    updateStyle,
    updateColors,
    updateVolume,
    updateAnimation,
    updateSurface,
    updateClickEvents,
    updateCursorTouch,
    updateAudio,

    // Convenience setters
    setColors,
    setRotation,
    setFrequencyEffects,

    // Sync
    syncFromKwami,

    // Import/Export
    exportState,
    importState,
  };
});
