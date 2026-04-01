/**
 * BlobXyz Avatar Store
 * 
 * Dedicated store for blob renderer state with organized sections:
 * - SKIN: Visual appearance (skin type, colors, material properties)
 * - SHAPE: Geometry (scale, position, spikes, amplitude)
 * - ANIMATION: Motion (time, rotation, breathing)
 * - CLICK EVENTS: Click interactions
 * - CURSOR & TOUCH: Hover, drag, touch behavior
 * - AUDIO: Audio reactivity settings
 */

import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { randomHex, randomInRange } from '@/utils/color';

// =====================================================
// TYPES
// =====================================================

export type SkinType =
  | 'poles' | 'donut' | 'vintage' | 'marble' | 'fresnel' | 'iridescent' | 'spiral' | 'plasma' | 'gradient'
  | 'matte' | 'glossy' | 'metallic' | 'subsurface'
  | 'chrome' | 'clay' | 'jade' | 'toon-matcap' | 'hologram'
  | 'flat' | 'stepped' | 'halftone' | 'outlined';

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

/** SKIN: Visual appearance settings */
export interface BlobXyzSkin {
  type: SkinType;
  colors: {
    x: string;
    y: string;
    z: string;
  };
  opacity: number;
  shininess: number;
  lightIntensity: number;
  wireframe: boolean;
  glassMode: boolean;
  resolution: number;
}

/** SHAPE: Geometry and deformation */
export interface BlobXyzShape {
  scale: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  spikes: {
    x: number;
    y: number;
    z: number;
  };
  amplitude: {
    x: number;
    y: number;
    z: number;
  };
}

/** ANIMATION: Motion and movement */
export interface BlobXyzAnimation {
  time: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  breathing: number;
}

/** CLICK EVENTS: Click interaction callbacks */
export interface BlobXyzClickEvents {
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
export interface BlobXyzCursorTouch {
  hover: {
    enabled: boolean;
    highlightOnHover: boolean;
    cursorStyle: CursorStyle;
  };
  drag: {
    enabled: boolean;
    sensitivity: number;
  };
  touch: {
    strength: number;
    duration: number;
    maxPoints: number;
  };
}

/** AUDIO: Audio reactivity settings */
export interface BlobXyzAudio {
  enabled: boolean;
  reactivity: number;
  sensitivity: number;
  responseSpeed: number;
  transientBoost: number;
  spikeDensity: number;
  rotateWhilePlaying: boolean;
  frequencySpikes: {
    bass: number;
    mid: number;
    high: number;
  };
}

/** Complete blob state */
export interface BlobXyzState {
  skin: BlobXyzSkin;
  shape: BlobXyzShape;
  animation: BlobXyzAnimation;
  clickEvents: BlobXyzClickEvents;
  cursorTouch: BlobXyzCursorTouch;
  audio: BlobXyzAudio;
}

// =====================================================
// DEFAULT VALUES
// =====================================================

export function getDefaultSkin(): BlobXyzSkin {
  return {
    type: 'poles',
    colors: {
      x: '#ff0066',
      y: '#00ff66',
      z: '#6600ff',
    },
    opacity: 1,
    shininess: 50,
    lightIntensity: 0,
    wireframe: false,
    glassMode: false,
    resolution: 180,
  };
}

export function getDefaultShape(): BlobXyzShape {
  return {
    scale: 3.2,
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    spikes: {
      x: 0.2,
      y: 0.2,
      z: 0.2,
    },
    amplitude: {
      x: 0.8,
      y: 0.8,
      z: 0.8,
    },
  };
}

export function getDefaultAnimation(): BlobXyzAnimation {
  return {
    time: {
      x: 1,
      y: 1,
      z: 1,
    },
    rotation: {
      x: 0.002,
      y: 0.003,
      z: 0.001,
    },
    breathing: 0.035,
  };
}

export function getDefaultClickEvents(): BlobXyzClickEvents {
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

export function getDefaultCursorTouch(): BlobXyzCursorTouch {
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
    touch: {
      strength: 1.0,
      duration: 1100,
      maxPoints: 5,
    },
  };
}

export function getDefaultAudio(): BlobXyzAudio {
  return {
    enabled: true,
    reactivity: 1.8,
    sensitivity: 0.075,
    responseSpeed: 0.65,
    transientBoost: 0.35,
    spikeDensity: 1.5,
    rotateWhilePlaying: true,
    frequencySpikes: {
      bass: 0.55,
      mid: 0.65,
      high: 0.35,
    },
  };
}

export function getDefaultBlobXyzState(): BlobXyzState {
  return {
    skin: getDefaultSkin(),
    shape: getDefaultShape(),
    animation: getDefaultAnimation(),
    clickEvents: getDefaultClickEvents(),
    cursorTouch: getDefaultCursorTouch(),
    audio: getDefaultAudio(),
  };
}

// =====================================================
// STORE
// =====================================================

export const useBlobXyzStore = defineStore('blob-xyz', () => {
  // State organized by sections
  const skin = reactive<BlobXyzSkin>(getDefaultSkin());
  const shape = reactive<BlobXyzShape>(getDefaultShape());
  const animation = reactive<BlobXyzAnimation>(getDefaultAnimation());
  const clickEvents = reactive<BlobXyzClickEvents>(getDefaultClickEvents());
  const cursorTouch = reactive<BlobXyzCursorTouch>(getDefaultCursorTouch());
  const audio = reactive<BlobXyzAudio>(getDefaultAudio());

  // =====================================================
  // SECTION RESET ACTIONS
  // =====================================================

  function resetSkin() {
    Object.assign(skin, getDefaultSkin());
  }

  function resetShape() {
    Object.assign(shape, getDefaultShape());
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
    resetSkin();
    resetShape();
    resetAnimation();
    resetClickEvents();
    resetCursorTouch();
    resetAudio();
  }

  // =====================================================
  // SECTION UPDATE ACTIONS
  // =====================================================

  function updateSkin(updates: Partial<BlobXyzSkin>) {
    Object.assign(skin, updates);
  }

  function updateShape(updates: Partial<BlobXyzShape>) {
    Object.assign(shape, updates);
  }

  function updateAnimation(updates: Partial<BlobXyzAnimation>) {
    Object.assign(animation, updates);
  }

  function updateClickEvents(updates: Partial<BlobXyzClickEvents>) {
    Object.assign(clickEvents, updates);
  }

  function updateCursorTouch(updates: Partial<BlobXyzCursorTouch>) {
    Object.assign(cursorTouch, updates);
  }

  function updateAudio(updates: Partial<BlobXyzAudio>) {
    Object.assign(audio, updates);
  }

  // =====================================================
  // CONVENIENCE SETTERS
  // =====================================================

  function setColors(x: string, y: string, z: string) {
    skin.colors.x = x;
    skin.colors.y = y;
    skin.colors.z = z;
  }

  function setSpikes(x: number, y: number, z: number) {
    shape.spikes.x = x;
    shape.spikes.y = y;
    shape.spikes.z = z;
  }

  function setAmplitude(x: number, y: number, z: number) {
    shape.amplitude.x = x;
    shape.amplitude.y = y;
    shape.amplitude.z = z;
  }

  function setTime(x: number, y: number, z: number) {
    animation.time.x = x;
    animation.time.y = y;
    animation.time.z = z;
  }

  function setRotation(x: number, y: number, z: number) {
    animation.rotation.x = x;
    animation.rotation.y = y;
    animation.rotation.z = z;
  }

  function setPosition(x: number, y: number, z: number) {
    shape.position.x = x;
    shape.position.y = y;
    shape.position.z = z;
  }

  // =====================================================
  // SYNC FROM EXTERNAL (Kwami instance)
  // =====================================================

  function syncFromKwami(blob: {
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
    audioEffects?: {
      enabled?: boolean;
      reactivity?: number;
      sensitivity?: number;
      breathing?: number;
      responseSpeed?: number;
      transientBoost?: number;
      bassSpike?: number;
      midSpike?: number;
      highSpike?: number;
      spikeDensity?: number;
      rotateWhilePlaying?: boolean;
    };
  }) {
    // Sync skin
    const colors = blob.getColors();
    skin.colors.x = colors.x;
    skin.colors.y = colors.y;
    skin.colors.z = colors.z;
    skin.type = blob.getCurrentSkinSubtype() as SkinType;
    skin.opacity = blob.getOpacity();
    skin.shininess = blob.getShininess();
    skin.lightIntensity = blob.lightIntensity;
    skin.wireframe = blob.getWireframe();

    // Sync shape
    shape.scale = blob.getScale();
    const spikes = blob.getSpikes();
    shape.spikes.x = spikes.x;
    shape.spikes.y = spikes.y;
    shape.spikes.z = spikes.z;
    const amplitude = blob.getAmplitude();
    shape.amplitude.x = amplitude.x;
    shape.amplitude.y = amplitude.y;
    shape.amplitude.z = amplitude.z;

    // Sync animation
    const time = blob.getTime();
    animation.time.x = time.x;
    animation.time.y = time.y;
    animation.time.z = time.z;
    const rotation = blob.getRotation();
    animation.rotation.x = rotation.x;
    animation.rotation.y = rotation.y;
    animation.rotation.z = rotation.z;

    // Sync audio (use nullish coalescing for optional values)
    if (blob.audioEffects) {
      audio.enabled = blob.audioEffects.enabled ?? audio.enabled;
      audio.reactivity = blob.audioEffects.reactivity ?? audio.reactivity;
      audio.sensitivity = blob.audioEffects.sensitivity ?? audio.sensitivity;
      animation.breathing = blob.audioEffects.breathing ?? animation.breathing;
      audio.responseSpeed = blob.audioEffects.responseSpeed ?? audio.responseSpeed;
      audio.transientBoost = blob.audioEffects.transientBoost ?? audio.transientBoost;
      audio.spikeDensity = blob.audioEffects.spikeDensity ?? audio.spikeDensity;
      audio.rotateWhilePlaying = blob.audioEffects.rotateWhilePlaying ?? audio.rotateWhilePlaying;
      audio.frequencySpikes.bass = blob.audioEffects.bassSpike ?? audio.frequencySpikes.bass;
      audio.frequencySpikes.mid = blob.audioEffects.midSpike ?? audio.frequencySpikes.mid;
      audio.frequencySpikes.high = blob.audioEffects.highSpike ?? audio.frequencySpikes.high;
    }
  }

  // =====================================================
  // EXPORT STATE (for presets)
  // =====================================================

  function exportState(): BlobXyzState {
    return {
      skin: { ...skin },
      shape: { ...shape },
      animation: { ...animation },
      clickEvents: { ...clickEvents },
      cursorTouch: { ...cursorTouch },
      audio: { ...audio },
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

  function importState(state: Partial<BlobXyzState>) {
    if (state.skin) deepMerge(skin, state.skin);
    if (state.shape) deepMerge(shape, state.shape);
    if (state.animation) deepMerge(animation, state.animation);
    if (state.clickEvents) deepMerge(clickEvents, state.clickEvents);
    if (state.cursorTouch) deepMerge(cursorTouch, state.cursorTouch);
    if (state.audio) deepMerge(audio, state.audio);
  }

  const INTERACTION_ACTIONS: InteractionAction[] = [
    'none',
    'toggleListening',
    'startListening',
    'stopListening',
    'randomize',
    'switchRenderer',
    'cycleState',
    'pulse',
    'moveToClick',
  ];

  const CURSOR_STYLES: CursorStyle[] = ['pointer', 'grab', 'crosshair', 'default'];

  function pickAction(): InteractionAction {
    return INTERACTION_ACTIONS[Math.floor(Math.random() * INTERACTION_ACTIONS.length)]!;
  }

  function pickCursor(): CursorStyle {
    return CURSOR_STYLES[Math.floor(Math.random() * CURSOR_STYLES.length)]!;
  }

  function randomizeAll() {
    const allSkins: SkinType[] = [
      'poles', 'donut', 'vintage', 'marble', 'fresnel', 'iridescent', 'spiral', 'plasma', 'gradient',
      'matte', 'glossy', 'metallic', 'subsurface',
      'chrome', 'clay', 'jade', 'toon-matcap', 'hologram',
      'flat', 'stepped', 'halftone', 'outlined',
    ];
    skin.type = allSkins[Math.floor(Math.random() * allSkins.length)]!;
    skin.colors.x = randomHex();
    skin.colors.y = randomHex();
    skin.colors.z = randomHex();
    skin.opacity = randomInRange(0.7, 1, 0.01);
    skin.shininess = randomInRange(1, 200, 1);
    skin.lightIntensity = randomInRange(0, 5, 0.1);
    skin.wireframe = Math.random() > 0.8;
    skin.glassMode = Math.random() > 0.85;

    shape.position = {
      x: randomInRange(0, 360, 1),
      y: randomInRange(0, 360, 1),
      z: randomInRange(0, 360, 1),
    };
    shape.spikes = {
      x: randomInRange(0, 8, 0.05),
      y: randomInRange(0, 8, 0.05),
      z: randomInRange(0, 8, 0.05),
    };
    shape.amplitude = {
      x: randomInRange(0.1, 2, 0.05),
      y: randomInRange(0.1, 2, 0.05),
      z: randomInRange(0.1, 2, 0.05),
    };

    animation.time = {
      x: randomInRange(0.1, 10, 0.1),
      y: randomInRange(0.1, 10, 0.1),
      z: randomInRange(0.1, 10, 0.1),
    };
    animation.rotation = {
      x: randomInRange(0, 0.02, 0.001),
      y: randomInRange(0, 0.02, 0.001),
      z: randomInRange(0, 0.02, 0.001),
    };
    animation.breathing = randomInRange(0, 0.2, 0.005);

    clickEvents.click = { enabled: Math.random() > 0.2, action: pickAction() };
    clickEvents.doubleClick = { enabled: Math.random() > 0.2, action: pickAction() };
    clickEvents.rightClick = { enabled: Math.random() > 0.2, action: pickAction() };
    clickEvents.doubleRightClick = { enabled: Math.random() > 0.2, action: pickAction() };

    cursorTouch.hover = {
      enabled: Math.random() > 0.15,
      highlightOnHover: Math.random() > 0.5,
      cursorStyle: pickCursor(),
    };
    cursorTouch.drag = {
      enabled: Math.random() > 0.15,
      sensitivity: randomInRange(0.1, 3, 0.1),
    };
    cursorTouch.touch = {
      strength: randomInRange(0.1, 3, 0.1),
      duration: randomInRange(100, 3000, 100),
      maxPoints: Math.floor(randomInRange(1, 20, 1)),
    };

    audio.enabled = Math.random() > 0.1;
    audio.reactivity = randomInRange(1.0, 2.5, 0.1);
    audio.sensitivity = randomInRange(0.03, 0.12, 0.005);
    audio.responseSpeed = randomInRange(0.4, 0.85, 0.05);
    audio.transientBoost = randomInRange(0.2, 0.7, 0.05);
    audio.spikeDensity = randomInRange(0.5, 2.5, 0.1);
    audio.frequencySpikes.bass = randomInRange(0.3, 1.0, 0.05);
    audio.frequencySpikes.mid = randomInRange(0.3, 1.0, 0.05);
    audio.frequencySpikes.high = randomInRange(0.15, 0.7, 0.05);
  }

  return {
    // State sections
    skin,
    shape,
    animation,
    clickEvents,
    cursorTouch,
    audio,

    // Reset actions
    resetSkin,
    resetShape,
    resetAnimation,
    resetClickEvents,
    resetCursorTouch,
    resetAudio,
    resetAll,

    // Update actions
    updateSkin,
    updateShape,
    updateAnimation,
    updateClickEvents,
    updateCursorTouch,
    updateAudio,

    // Convenience setters
    setColors,
    setSpikes,
    setAmplitude,
    setTime,
    setRotation,
    setPosition,

    // Sync
    syncFromKwami,

    // Import/Export
    exportState,
    importState,

    randomizeAll,
  };
});
