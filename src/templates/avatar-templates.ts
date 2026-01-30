/**
 * Avatar Templates for the Kwami AI Playground
 *
 * These templates define different visual presets for the avatar renderers
 * (blob and crystal) that users can select and customize.
 */

import { shallowRef, type ShallowRef } from 'vue';
import type { BlobState, CrystalState, RendererType } from '../stores/avatar';

export interface AvatarPreset {
  id: string;
  name: string;
  icon: string;
  renderer: RendererType;
  blob?: Partial<BlobState>;
  crystal?: Partial<CrystalState>;
}

// Built-in avatar presets data
const _avatarPresetsData: AvatarPreset[] = [
  // ===== BLOB PRESETS =====
  {
    id: 'rgb-pulse',
    name: 'RGB Pulse',
    icon: 'ph:lightning-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
      spikes: { x: 0.8, y: 1.2, z: 0.6 },
      amplitude: { x: 1.5, y: 0.8, z: 1.2 },
      time: { x: 12, y: 9, z: 14 },
      rotation: { x: 0, y: 0, z: 0 },
      startRotation: { x: 56, y: 208, z: 78 },
      scale: 3.2,
      opacity: 1,
      shininess: 80,
      lightIntensity: 1.3,
      wireframe: false,
      skin: 'poles',
      resolution: 200,
      touchStrength: 1.5,
      touchDuration: 800,
      maxTouchPoints: 8,
      transitionSpeed: 0.08,
      thinkingDuration: 8000,
    },
  },
  {
    id: 'ocean-wave',
    name: 'Ocean Wave',
    icon: 'ph:waves-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#0077be', y: '#00d4ff', z: '#001a33' },
      spikes: { x: 0.3, y: 0.8, z: 0.4 },
      amplitude: { x: 0.5, y: 2.0, z: 0.6 },
      time: { x: 5, y: 3, z: 4 },
      rotation: { x: 0.01, y: 0.003, z: 0.002 },
      startRotation: { x: 22, y: 260, z: 260 },
      scale: 3.2,
      opacity: 0.85,
      shininess: 120,
      lightIntensity: 1.1,
      wireframe: false,
      skin: 'donut',
      resolution: 220,
      touchStrength: 0.8,
      touchDuration: 1500,
      maxTouchPoints: 4,
      transitionSpeed: 0.03,
      thinkingDuration: 12000,
    },
  },
  {
    id: 'sunset-glow',
    name: 'Sunset',
    icon: 'ph:sun-horizon-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#ff6b35', y: '#f7c59f', z: '#8b1e3f' },
      spikes: { x: 8, y: 8, z: 8 },
      amplitude: { x: 1.1, y: 0.7, z: 1.0 },
      time: { x: 6, y: 8, z: 7 },
      rotation: { x: 0.001, y: 0.002, z: 0.001 },
      startRotation: { x: 22, y: 260, z: 260 },
      scale: 3.2,
      opacity: 0.33,
      shininess: 200,
      lightIntensity: 10.4,
      wireframe: false,
      skin: 'poles',
      resolution: 160,
      touchStrength: 1.2,
      touchDuration: 1200,
      maxTouchPoints: 6,
      transitionSpeed: 0.04,
      thinkingDuration: 15000,
    },
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora',
    icon: 'ph:star-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#00ff87', y: '#60efff', z: '#7b2cbf' },
      spikes: { x: 0, y: 0, z: 4.6 },
      amplitude: { x: 0, y: 0, z: 2 },
      time: { x: 0, y: 0, z: 10 },
      rotation: { x: 0, y: 0, z: 0.004 },
      startRotation: { x: 306, y: 40, z: 300 },
      scale: 3.2,
      opacity: 0.95,
      shininess: 100,
      lightIntensity: 3.5,
      wireframe: false,
      skin: 'poles',
      resolution: 240,
      touchStrength: 0.6,
      touchDuration: 2000,
      maxTouchPoints: 3,
      transitionSpeed: 0.06,
      thinkingDuration: 9000,
    },
  },
  {
    id: 'lava-flow',
    name: 'Lava',
    icon: 'ph:fire-simple-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#ff4500', y: '#ff8c00', z: '#8b0000' },
      spikes: { x: 1.2, y: 0.9, z: 1.4 },
      amplitude: { x: 1.3, y: 1.1, z: 1.5 },
      time: { x: 10, y: 12, z: 8 },
      rotation: { x: 0.002, y: 0.001, z: 0.003 },
      startRotation: { x: 22, y: 260, z: 260 },
      scale: 3.2,
      opacity: 1,
      shininess: 30,
      lightIntensity: 1.8,
      wireframe: false,
      skin: 'donut',
      resolution: 150,
      touchStrength: 2.0,
      touchDuration: 600,
      maxTouchPoints: 10,
      transitionSpeed: 0.1,
      thinkingDuration: 6000,
    },
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    icon: 'ph:cloud-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#ffb6c1', y: '#87ceeb', z: '#dda0dd' },
      spikes: { x: 2.5, y: 1.5, z: 2.5 },
      amplitude: { x: 3.6, y: 1.3, z: 0.9 },
      time: { x: 7.3, y: 0.1, z: 6.5 },
      rotation: { x: 0.003, y: 0.002, z: 0.004 },
      startRotation: { x: 22, y: 260, z: 260 },
      scale: 3.2,
      opacity: 0.8,
      shininess: 176,
      lightIntensity: 1.6,
      wireframe: true,
      skin: 'donut',
      resolution: 304,
      touchStrength: 0.5,
      touchDuration: 1800,
      maxTouchPoints: 4,
      transitionSpeed: 0.05,
      thinkingDuration: 11000,
    },
  },
  {
    id: 'midnight-void',
    name: 'Midnight',
    icon: 'ph:moon-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#1a1a2e', y: '#16213e', z: '#0f3460' },
      spikes: { x: 0.4, y: 1.6, z: 0.3 },
      amplitude: { x: 0.8, y: 0.5, z: 1.0 },
      time: { x: 4, y: 6, z: 5 },
      rotation: { x: 0.001, y: 0.0015, z: 0.0008 },
      startRotation: { x: 22, y: 260, z: 260 },
      scale: 3.2,
      opacity: 1,
      shininess: 0,
      lightIntensity: 3.5,
      wireframe: false,
      skin: 'poles',
      resolution: 260,
      touchStrength: 2.4,
      touchDuration: 2500,
      maxTouchPoints: 0.2,
      transitionSpeed: 0.02,
      thinkingDuration: 20000,
    },
  },
  {
    id: 'toxic-slime',
    name: 'Toxic',
    icon: 'ph:skull-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#39ff14', y: '#00ff00', z: '#32cd32' },
      spikes: { x: 1.8, y: 1.2, z: 2.0 },
      amplitude: { x: 1.5, y: 1.3, z: 1.7 },
      time: { x: 11, y: 14, z: 9 },
      rotation: { x: 0.005, y: 0.003, z: 0.006 },
      scale: 3.2,
      opacity: 0.7,
      shininess: 60,
      lightIntensity: 1.6,
      wireframe: true,
      skin: 'vintage',
      resolution: 140,
      touchStrength: 2.5,
      touchDuration: 500,
      maxTouchPoints: 12,
      transitionSpeed: 0.12,
      thinkingDuration: 5000,
    },
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    icon: 'ph:crown-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#ffd700', y: '#daa520', z: '#b8860b' },
      spikes: { x: 4, y: 0.35, z: 0.2 },
      amplitude: { x: 0.6, y: 0.7, z: 2.5 },
      time: { x: 3, y: 5, z: 4 },
      rotation: { x: 0.00, y: 0.00, z: 0.0002 },
      scale: 3.2,
      opacity: 1,
      shininess: 200,
      lightIntensity: 1.3,
      wireframe: false,
      skin: 'donut',
      resolution: 180,
      touchStrength: 0.7,
      touchDuration: 1400,
      maxTouchPoints: 5,
      transitionSpeed: 0.04,
      thinkingDuration: 14000,
    },
  },
  {
    id: 'ice-crystal',
    name: 'Ice',
    icon: 'ph:snowflake-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#e0ffff', y: '#add8e6', z: '#87ceeb' },
      spikes: { x: 2.0, y: 1.8, z: 2.2 },
      amplitude: { x: 0.4, y: 2, z: 0.5 },
      time: { x: 12, y: 15, z: 10 },
      rotation: { x: 0.002, y: 0.01, z: 0.002 },
      scale: 3.2,
      opacity: 1.4,
      shininess: 180,
      lightIntensity: 1.7,
      wireframe: false,
      skin: 'poles',
      resolution: 280,
      touchStrength: 0.3,
      touchDuration: 3000,
      maxTouchPoints: 2,
      transitionSpeed: 0.025,
      thinkingDuration: 18000,
    },
  },
  {
    id: 'forest-moss',
    name: 'Forest',
    icon: 'ph:tree-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#228b22', y: '#006400', z: '#8fbc8f' },
      spikes: { x: 4.5, y: 0.1, z: 0.2 },
      amplitude: { x: 1.0, y: 1.4, z: 1.1 },
      time: { x: 9, y: 7, z: 11 },
      rotation: { x: 0.0005, y: 0.001, z: 0.0008 },
      scale: 3.2,
      opacity: 1,
      shininess: 40,
      lightIntensity: 10,
      wireframe: false,
      skin: 'vintage',
      resolution: 170,
      touchStrength: 1.0,
      touchDuration: 1100,
      maxTouchPoints: 5,
      transitionSpeed: 0.05,
      thinkingDuration: 10000,
    },
  },
  {
    id: 'planet-swirl',
    name: 'Planet',
    icon: 'ph:planet-duotone',
    renderer: 'blob',
    blob: {
      colors: { x: '#663399', y: '#ff1493', z: '#00ced1' },
      spikes: { x: 0.1, y: 0.1, z: 0.1 },
      amplitude: { x: 1.4, y: 1.9, z: 0.2 },
      time: { x: 13, y: 5, z: 10 },
      rotation: { x: 0.003, y: 0.005, z: 0.002 },
      scale: 3.2,
      opacity: 0.9,
      shininess: 100,
      lightIntensity: 1.2,
      wireframe: false,
      skin: 'poles',
      resolution: 210,
      touchStrength: 1.3,
      touchDuration: 900,
      maxTouchPoints: 7,
      transitionSpeed: 0.07,
      thinkingDuration: 8500,
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
      glowIntensity: 1.8,
      shardCount: 32,
      scale: 1.2,
      rotation: { x: 0.001, y: 0.003, z: 0.002 },
      audioEffects: {
        enabled: true,
        reactivity: 1.8,
        bassOrbitBoost: 0.5,
        midRotationBoost: 0.7,
        highGlowBoost: 1.0,
      },
      transitionSpeed: 0.06,
      thinkingDuration: 8000,
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
      glowIntensity: 1.5,
      shardCount: 28,
      scale: 1.0,
      rotation: { x: 0.002, y: 0.004, z: 0.001 },
      audioEffects: {
        enabled: true,
        reactivity: 1.4,
        bassOrbitBoost: 0.3,
        midRotationBoost: 0.8,
        highGlowBoost: 0.6,
      },
      transitionSpeed: 0.05,
      thinkingDuration: 10000,
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
      glowIntensity: 2.2,
      shardCount: 36,
      scale: 1.3,
      rotation: { x: 0.003, y: 0.005, z: 0.002 },
      audioEffects: {
        enabled: true,
        reactivity: 2.0,
        bassOrbitBoost: 0.6,
        midRotationBoost: 0.5,
        highGlowBoost: 1.2,
      },
      transitionSpeed: 0.08,
      thinkingDuration: 6000,
    },
  },
];

// Persist reactive ref across HMR updates using import.meta.hot.data
function getOrCreatePresetsRef(): ShallowRef<AvatarPreset[]> {
  if (import.meta.hot) {
    // Reuse existing ref from previous HMR update, or create new one
    if (!import.meta.hot.data.avatarPresetsRef) {
      import.meta.hot.data.avatarPresetsRef = shallowRef<AvatarPreset[]>(_avatarPresetsData);
    }
    return import.meta.hot.data.avatarPresetsRef;
  }
  // Production: just create the ref
  return shallowRef<AvatarPreset[]>(_avatarPresetsData);
}

// Reactive ref for HMR support (persisted across HMR updates)
export const avatarPresetsRef = getOrCreatePresetsRef();

// Update the ref with new data on HMR
if (import.meta.hot) {
  // Update the persisted ref with the new data from this module
  avatarPresetsRef.value = _avatarPresetsData;
}

// Static export for backwards compatibility
export const avatarPresets = _avatarPresetsData;

// Helper functions (use ref for reactivity)
export function getPresetById(id: string): AvatarPreset | undefined {
  return avatarPresetsRef.value.find((p) => p.id === id);
}

export function getBlobPresets(): AvatarPreset[] {
  return avatarPresetsRef.value.filter((p) => p.renderer === 'blob');
}

export function getCrystalPresets(): AvatarPreset[] {
  return avatarPresetsRef.value.filter((p) => p.renderer === 'crystal');
}
