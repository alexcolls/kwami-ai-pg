/**
 * Crystal Presets for the Kwami AI Playground
 *
 * Visual presets for the crystal avatar renderer.
 */

import type { CrystalState } from '../stores/avatar';

export interface CrystalPreset {
  id: string;
  name: string;
  icon: string;
  crystal: Partial<CrystalState>;
}

export const crystalPresetsData: CrystalPreset[] = [
  {
    id: 'cyber-crystal',
    name: 'Cyber',
    icon: 'ph:diamond-duotone',
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
        smoothing: 0.1,
      },
      transitionSpeed: 0.06,
      thinkingDuration: 8000,
    },
  },
  {
    id: 'emerald-helix',
    name: 'Emerald',
    icon: 'ph:dna-duotone',
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
        smoothing: 0.1,
      },
      transitionSpeed: 0.05,
      thinkingDuration: 10000,
    },
  },
  {
    id: 'fire-vortex',
    name: 'Fire',
    icon: 'ph:fire-duotone',
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
        smoothing: 0.1,
      },
      transitionSpeed: 0.08,
      thinkingDuration: 6000,
    },
  },
  {
    id: 'ice-shard',
    name: 'Ice Shard',
    icon: 'ph:snowflake-duotone',
    crystal: {
      formation: 'constellation',
      colors: { primary: '#e0ffff', secondary: '#add8e6', accent: '#87ceeb' },
      coreColors: { inner: '#ffffff', outer: '#b0e0e6' },
      glowIntensity: 1.4,
      shardCount: 24,
      scale: 1.1,
      rotation: { x: 0.0005, y: 0.001, z: 0.0008 },
      audioEffects: {
        enabled: true,
        reactivity: 1.2,
        bassOrbitBoost: 0.2,
        midRotationBoost: 0.4,
        highGlowBoost: 0.8,
        smoothing: 0.15,
      },
      transitionSpeed: 0.03,
      thinkingDuration: 12000,
    },
  },
  {
    id: 'amethyst-dream',
    name: 'Amethyst',
    icon: 'ph:sparkle-duotone',
    crystal: {
      formation: 'helix',
      colors: { primary: '#9966cc', secondary: '#7b68ee', accent: '#da70d6' },
      coreColors: { inner: '#e6e6fa', outer: '#9370db' },
      glowIntensity: 1.6,
      shardCount: 30,
      scale: 1.15,
      rotation: { x: 0.001, y: 0.002, z: 0.0015 },
      audioEffects: {
        enabled: true,
        reactivity: 1.5,
        bassOrbitBoost: 0.4,
        midRotationBoost: 0.6,
        highGlowBoost: 0.9,
        smoothing: 0.12,
      },
      transitionSpeed: 0.05,
      thinkingDuration: 9000,
    },
  },
  {
    id: 'golden-crown',
    name: 'Golden',
    icon: 'ph:crown-duotone',
    crystal: {
      formation: 'vortex',
      colors: { primary: '#ffd700', secondary: '#ffb347', accent: '#f0e68c' },
      coreColors: { inner: '#fffacd', outer: '#daa520' },
      glowIntensity: 2.0,
      shardCount: 20,
      scale: 1.25,
      rotation: { x: 0.002, y: 0.003, z: 0.001 },
      audioEffects: {
        enabled: true,
        reactivity: 1.6,
        bassOrbitBoost: 0.5,
        midRotationBoost: 0.5,
        highGlowBoost: 1.1,
        smoothing: 0.08,
      },
      transitionSpeed: 0.07,
      thinkingDuration: 7000,
    },
  },
];
