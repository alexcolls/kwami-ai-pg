/**
 * StarsGenesis Avatar Store
 * 
 * Dedicated store for starsGenesis renderer state with organized sections:
 * - FORMATION: Shape and distribution
 * - VISUAL: Colors and appearance
 * - TRANSFORM: Scale and count
 * - PHYSICS: Movement and interaction forces
 * - ANIMATION: Various animation effects
 * - CLICK EVENTS: Click interactions
 * - CURSOR & TOUCH: Hover, drag behavior
 * - AUDIO: Audio reactivity settings
 */

import { defineStore } from 'pinia';
import { reactive } from 'vue';

// =====================================================
// TYPES
// =====================================================

export type StarsGenesisFormationType = 'sphere' | 'disc' | 'ring' | 'cube';
export type StarsGenesisDensity = 'uniform' | 'center-heavy' | 'edge-heavy';

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

/** FORMATION: Shape and distribution */
export interface StarsGenesisFormation {
  type: StarsGenesisFormationType;
  radius: number;
  density: StarsGenesisDensity;
  noise: number;
}

/** VISUAL: Colors and appearance */
export interface StarsGenesisVisual {
  color: string;
  glowColor: string;
  starSize: number;
  sizeVariation: number;
  opacity: number;
  glowIntensity: number;
  brightnessVariation: number;
  sharpness: number;
}

/** TRANSFORM: Scale and count */
export interface StarsGenesisTransform {
  scale: number;
  starCount: number;
}

/** PHYSICS: Movement forces */
export interface StarsGenesisPhysics {
  returnForce: number;
  damping: number;
  explosionForce: number;
  explosionRadius: number;
  leaderSpeed: number;
  followDelay: number;
  mouseInfluence: number;
  mouseRepulsion: number;
}

/** ANIMATION: Various animation effects */
export interface StarsGenesisAnimation {
  enabled: boolean;
  breathing: {
    enabled: boolean;
    speed: number;
    intensity: number;
  };
  floating: {
    enabled: boolean;
    speed: number;
    amplitude: number;
  };
  rotation: {
    enabled: boolean;
    speedX: number;
    speedY: number;
    speedZ: number;
  };
  wave: {
    enabled: boolean;
    speed: number;
    amplitude: number;
  };
  turbulence: {
    enabled: boolean;
    intensity: number;
    speed: number;
  };
}

/** CLICK EVENTS: Click interaction callbacks */
export interface StarsGenesisClickEvents {
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
export interface StarsGenesisCursorTouch {
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
export interface StarsGenesisAudio {
  enabled: boolean;
  reactivity: number;
  smoothing: number;
  scalePulse: boolean;
  movementIntensity: number;
  frequencyInfluence: {
    bass: number;
    mid: number;
    high: number;
  };
}

/** ORIENTATION: Mesh position/rotation in 3D space */
export interface StarsGenesisOrientation {
  x: number;
  y: number;
  z: number;
}

/** Complete starsGenesis state */
export interface StarsGenesisState {
  formation: StarsGenesisFormation;
  visual: StarsGenesisVisual;
  transform: StarsGenesisTransform;
  physics: StarsGenesisPhysics;
  animation: StarsGenesisAnimation;
  orientation: StarsGenesisOrientation;
  clickEvents: StarsGenesisClickEvents;
  cursorTouch: StarsGenesisCursorTouch;
  audio: StarsGenesisAudio;
}

// =====================================================
// DEFAULT VALUES
// =====================================================

export function getDefaultFormation(): StarsGenesisFormation {
  return {
    type: 'sphere',
    radius: 2,
    density: 'uniform',
    noise: 0.03,
  };
}

export function getDefaultVisual(): StarsGenesisVisual {
  return {
    color: '#ffffff',
    glowColor: '#88ccff',
    starSize: 0.6,
    sizeVariation: 0.5,
    opacity: 0.95,
    glowIntensity: 0.3,
    brightnessVariation: 0.25,
    sharpness: 0.7,
  };
}

export function getDefaultTransform(): StarsGenesisTransform {
  return {
    scale: 1,
    starCount: 6000,
  };
}

export function getDefaultPhysics(): StarsGenesisPhysics {
  return {
    returnForce: 0.04,
    damping: 0.92,
    explosionForce: 10,
    explosionRadius: 2.5,
    leaderSpeed: 0.015,
    followDelay: 0.012,
    mouseInfluence: 1.5,
    mouseRepulsion: 0.4,
  };
}

export function getDefaultAnimation(): StarsGenesisAnimation {
  return {
    enabled: true,
    breathing: { enabled: true, speed: 1.0, intensity: 0.15 },
    floating: { enabled: true, speed: 0.5, amplitude: 0.08 },
    rotation: { enabled: true, speedX: 0, speedY: 0.1, speedZ: 0 },
    wave: { enabled: false, speed: 1.5, amplitude: 0.1 },
    turbulence: { enabled: true, intensity: 0.02, speed: 1.0 },
  };
}

export function getDefaultClickEvents(): StarsGenesisClickEvents {
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

export function getDefaultCursorTouch(): StarsGenesisCursorTouch {
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

export function getDefaultAudio(): StarsGenesisAudio {
  return {
    enabled: true,
    reactivity: 1.5,
    smoothing: 0.7,
    scalePulse: true,
    movementIntensity: 0.5,
    frequencyInfluence: {
      bass: 1.0,
      mid: 0.6,
      high: 0.8,
    },
  };
}

export function getDefaultOrientation(): StarsGenesisOrientation {
  return {
    x: 0,
    y: 0,
    z: 0,
  };
}

export function getDefaultStarsGenesisState(): StarsGenesisState {
  return {
    formation: getDefaultFormation(),
    visual: getDefaultVisual(),
    transform: getDefaultTransform(),
    physics: getDefaultPhysics(),
    animation: getDefaultAnimation(),
    orientation: getDefaultOrientation(),
    clickEvents: getDefaultClickEvents(),
    cursorTouch: getDefaultCursorTouch(),
    audio: getDefaultAudio(),
  };
}

// =====================================================
// STORE
// =====================================================

export const useStarsGenesisStore = defineStore('starsGenesis', () => {
  // State organized by sections
  const formation = reactive<StarsGenesisFormation>(getDefaultFormation());
  const visual = reactive<StarsGenesisVisual>(getDefaultVisual());
  const transform = reactive<StarsGenesisTransform>(getDefaultTransform());
  const physics = reactive<StarsGenesisPhysics>(getDefaultPhysics());
  const animation = reactive<StarsGenesisAnimation>(getDefaultAnimation());
  const orientation = reactive<StarsGenesisOrientation>(getDefaultOrientation());
  const clickEvents = reactive<StarsGenesisClickEvents>(getDefaultClickEvents());
  const cursorTouch = reactive<StarsGenesisCursorTouch>(getDefaultCursorTouch());
  const audio = reactive<StarsGenesisAudio>(getDefaultAudio());

  // =====================================================
  // SECTION RESET ACTIONS
  // =====================================================

  function resetFormation() {
    Object.assign(formation, getDefaultFormation());
  }

  function resetVisual() {
    Object.assign(visual, getDefaultVisual());
  }

  function resetTransform() {
    Object.assign(transform, getDefaultTransform());
  }

  function resetPhysics() {
    Object.assign(physics, getDefaultPhysics());
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
    resetFormation();
    resetVisual();
    resetTransform();
    resetPhysics();
    resetAnimation();
    resetOrientation();
    resetClickEvents();
    resetCursorTouch();
    resetAudio();
  }

  // =====================================================
  // SECTION UPDATE ACTIONS
  // =====================================================

  function updateFormation(updates: Partial<StarsGenesisFormation>) {
    Object.assign(formation, updates);
  }

  function updateVisual(updates: Partial<StarsGenesisVisual>) {
    Object.assign(visual, updates);
  }

  function updateTransform(updates: Partial<StarsGenesisTransform>) {
    Object.assign(transform, updates);
  }

  function updatePhysics(updates: Partial<StarsGenesisPhysics>) {
    Object.assign(physics, updates);
  }

  function updateAnimation(updates: Partial<StarsGenesisAnimation>) {
    Object.assign(animation, updates);
  }

  function updateClickEvents(updates: Partial<StarsGenesisClickEvents>) {
    Object.assign(clickEvents, updates);
  }

  function updateCursorTouch(updates: Partial<StarsGenesisCursorTouch>) {
    Object.assign(cursorTouch, updates);
  }

  function updateAudio(updates: Partial<StarsGenesisAudio>) {
    Object.assign(audio, updates);
  }

  // =====================================================
  // CONVENIENCE SETTERS
  // =====================================================

  function setColors(color: string, glowColor: string) {
    visual.color = color;
    visual.glowColor = glowColor;
  }

  function setFrequencyInfluence(bass: number, mid: number, high: number) {
    audio.frequencyInfluence.bass = bass;
    audio.frequencyInfluence.mid = mid;
    audio.frequencyInfluence.high = high;
  }

  function setOrientation(x: number, y: number, z: number) {
    orientation.x = x;
    orientation.y = y;
    orientation.z = z;
  }

  // =====================================================
  // SYNC FROM EXTERNAL (Kwami instance)
  // =====================================================

  function syncFromKwami(starsGenesis: {
    getFormation?: () => { type: string };
    getVisual?: () => {
      color: string;
      glowColor: string;
      starSize: number;
      sizeVariation: number;
      opacity: number;
      glowIntensity: number;
      brightnessVariation: number;
      sharpness: number;
    };
    getPhysics?: () => {
      returnForce: number;
      damping: number;
      explosionForce: number;
      explosionRadius: number;
      leaderSpeed: number;
      followDelay: number;
      mouseInfluence: number;
      mouseRepulsion: number;
    };
    getAnimation?: () => {
      enabled: boolean;
      breathing: { enabled: boolean; speed: number; intensity: number };
      floating: { enabled: boolean; speed: number; amplitude: number };
      rotation: { enabled: boolean; speedX: number; speedY: number; speedZ: number };
      wave: { enabled: boolean; speed: number; amplitude: number };
      turbulence: { enabled: boolean; intensity: number; speed: number };
    };
    getAudioEffects?: () => {
      enabled: boolean;
      reactivity: number;
      smoothing: number;
      scalePulse: boolean;
      movementIntensity: number;
      bassInfluence: number;
      midInfluence: number;
      highInfluence: number;
    };
    starCount?: number;
    formationRadius?: number;
    formationDensity?: string;
    formationNoise?: number;
    scale?: number;
  }) {
    // Sync formation
    if (starsGenesis.getFormation) {
      const formationType = starsGenesis.getFormation();
      formation.type = formationType.type as StarsGenesisFormationType;
    }
    if (starsGenesis.formationRadius !== undefined) formation.radius = starsGenesis.formationRadius;
    if (starsGenesis.formationDensity !== undefined) formation.density = starsGenesis.formationDensity as StarsGenesisDensity;
    if (starsGenesis.formationNoise !== undefined) formation.noise = starsGenesis.formationNoise;

    // Sync visual
    if (starsGenesis.getVisual) {
      const v = starsGenesis.getVisual();
      visual.color = v.color;
      visual.glowColor = v.glowColor;
      visual.starSize = v.starSize;
      visual.sizeVariation = v.sizeVariation;
      visual.opacity = v.opacity;
      visual.glowIntensity = v.glowIntensity;
      visual.brightnessVariation = v.brightnessVariation;
      visual.sharpness = v.sharpness;
    }

    // Sync transform
    if (starsGenesis.scale !== undefined) transform.scale = starsGenesis.scale;
    if (starsGenesis.starCount !== undefined) transform.starCount = starsGenesis.starCount;

    // Sync physics
    if (starsGenesis.getPhysics) {
      const p = starsGenesis.getPhysics();
      physics.returnForce = p.returnForce;
      physics.damping = p.damping;
      physics.explosionForce = p.explosionForce;
      physics.explosionRadius = p.explosionRadius;
      physics.leaderSpeed = p.leaderSpeed;
      physics.followDelay = p.followDelay;
      physics.mouseInfluence = p.mouseInfluence;
      physics.mouseRepulsion = p.mouseRepulsion;
    }

    // Sync animation
    if (starsGenesis.getAnimation) {
      const anim = starsGenesis.getAnimation();
      animation.enabled = anim.enabled;
      animation.breathing = { ...anim.breathing };
      animation.floating = { ...anim.floating };
      animation.rotation = { ...anim.rotation };
      animation.wave = { ...anim.wave };
      animation.turbulence = { ...anim.turbulence };
    }

    // Sync audio
    if (starsGenesis.getAudioEffects) {
      const aud = starsGenesis.getAudioEffects();
      audio.enabled = aud.enabled;
      audio.reactivity = aud.reactivity;
      audio.smoothing = aud.smoothing;
      audio.scalePulse = aud.scalePulse;
      audio.movementIntensity = aud.movementIntensity;
      audio.frequencyInfluence.bass = aud.bassInfluence;
      audio.frequencyInfluence.mid = aud.midInfluence;
      audio.frequencyInfluence.high = aud.highInfluence;
    }
  }

  // =====================================================
  // EXPORT STATE (for presets)
  // =====================================================

  function exportState(): StarsGenesisState {
    return {
      formation: { ...formation },
      visual: { ...visual },
      transform: { ...transform },
      physics: { ...physics },
      animation: {
        ...animation,
        breathing: { ...animation.breathing },
        floating: { ...animation.floating },
        rotation: { ...animation.rotation },
        wave: { ...animation.wave },
        turbulence: { ...animation.turbulence },
      },
      orientation: { ...orientation },
      clickEvents: { ...clickEvents },
      cursorTouch: { ...cursorTouch },
      audio: { ...audio, frequencyInfluence: { ...audio.frequencyInfluence } },
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

  function importState(state: Partial<StarsGenesisState>) {
    if (state.formation) deepMerge(formation, state.formation);
    if (state.visual) deepMerge(visual, state.visual);
    if (state.transform) deepMerge(transform, state.transform);
    if (state.physics) deepMerge(physics, state.physics);
    if (state.animation) deepMerge(animation, state.animation);
    if (state.orientation) deepMerge(orientation, state.orientation);
    if (state.clickEvents) deepMerge(clickEvents, state.clickEvents);
    if (state.cursorTouch) deepMerge(cursorTouch, state.cursorTouch);
    if (state.audio) deepMerge(audio, state.audio);
  }

  return {
    // State sections
    formation,
    visual,
    transform,
    physics,
    animation,
    orientation,
    clickEvents,
    cursorTouch,
    audio,

    // Reset actions
    resetFormation,
    resetVisual,
    resetTransform,
    resetPhysics,
    resetAnimation,
    resetOrientation,
    resetClickEvents,
    resetCursorTouch,
    resetAudio,
    resetAll,

    // Update actions
    updateFormation,
    updateVisual,
    updateTransform,
    updatePhysics,
    updateAnimation,
    updateClickEvents,
    updateCursorTouch,
    updateAudio,

    // Convenience setters
    setColors,
    setFrequencyInfluence,
    setOrientation,

    // Sync
    syncFromKwami,

    // Import/Export
    exportState,
    importState,
  };
});
