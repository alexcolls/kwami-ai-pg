/**
 * Crystal Presets for the Kwami AI Playground
 *
 * Visual presets for the crystal avatar renderer.
 * Uses the new section-based crystal state structure.
 */

import type { CrystalState } from '../stores/avatar.crystal';

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
      appearance: {
        formation: 'constellation',
        shardCount: 32,
        scale: 1.2,
      },
      colors: {
        primary: '#00e5ff',
        secondary: '#7c4dff',
        accent: '#ff4081',
        core: { inner: '#ffffff', outer: '#00ffff' },
      },
      glow: { intensity: 1.8 },
      animation: {
        rotation: { x: 0.001, y: 0.003, z: 0.002 },
      },
      audio: {
        enabled: true,
        reactivity: 1.8,
        smoothing: 0.1,
        frequencyBoosts: { bass: 0.5, mid: 0.7, high: 1.0 },
      },
    },
  },
  {
    id: 'emerald-helix',
    name: 'Emerald',
    icon: 'ph:dna-duotone',
    crystal: {
      appearance: {
        formation: 'helix',
        shardCount: 28,
        scale: 1.0,
      },
      colors: {
        primary: '#00ff88',
        secondary: '#00cc6a',
        accent: '#00ffaa',
        core: { inner: '#ccffee', outer: '#00ff88' },
      },
      glow: { intensity: 1.5 },
      animation: {
        rotation: { x: 0.002, y: 0.004, z: 0.001 },
      },
      audio: {
        enabled: true,
        reactivity: 1.4,
        smoothing: 0.1,
        frequencyBoosts: { bass: 0.3, mid: 0.8, high: 0.6 },
      },
    },
  },
  {
    id: 'fire-vortex',
    name: 'Fire',
    icon: 'ph:fire-duotone',
    crystal: {
      appearance: {
        formation: 'vortex',
        shardCount: 36,
        scale: 1.3,
      },
      colors: {
        primary: '#ff4500',
        secondary: '#ff8c00',
        accent: '#ffd700',
        core: { inner: '#ffffff', outer: '#ff6347' },
      },
      glow: { intensity: 2.2 },
      animation: {
        rotation: { x: 0.003, y: 0.005, z: 0.002 },
      },
      audio: {
        enabled: true,
        reactivity: 2.0,
        smoothing: 0.1,
        frequencyBoosts: { bass: 0.6, mid: 0.5, high: 1.2 },
      },
    },
  },
  {
    id: 'ice-shard',
    name: 'Ice Shard',
    icon: 'ph:snowflake-duotone',
    crystal: {
      appearance: {
        formation: 'constellation',
        shardCount: 24,
        scale: 1.1,
      },
      colors: {
        primary: '#e0ffff',
        secondary: '#add8e6',
        accent: '#87ceeb',
        core: { inner: '#ffffff', outer: '#b0e0e6' },
      },
      glow: { intensity: 1.4 },
      animation: {
        rotation: { x: 0.0005, y: 0.001, z: 0.0008 },
      },
      audio: {
        enabled: true,
        reactivity: 1.2,
        smoothing: 0.15,
        frequencyBoosts: { bass: 0.2, mid: 0.4, high: 0.8 },
      },
    },
  },
  {
    id: 'amethyst-dream',
    name: 'Amethyst',
    icon: 'ph:sparkle-duotone',
    crystal: {
      appearance: {
        formation: 'helix',
        shardCount: 30,
        scale: 1.15,
      },
      colors: {
        primary: '#9966cc',
        secondary: '#7b68ee',
        accent: '#da70d6',
        core: { inner: '#e6e6fa', outer: '#9370db' },
      },
      glow: { intensity: 1.6 },
      animation: {
        rotation: { x: 0.001, y: 0.002, z: 0.0015 },
      },
      audio: {
        enabled: true,
        reactivity: 1.5,
        smoothing: 0.12,
        frequencyBoosts: { bass: 0.4, mid: 0.6, high: 0.9 },
      },
    },
  },
  {
    id: 'golden-crown',
    name: 'Golden',
    icon: 'ph:crown-duotone',
    crystal: {
      appearance: {
        formation: 'vortex',
        shardCount: 20,
        scale: 1.25,
      },
      colors: {
        primary: '#ffd700',
        secondary: '#ffb347',
        accent: '#f0e68c',
        core: { inner: '#fffacd', outer: '#daa520' },
      },
      glow: { intensity: 2.0 },
      animation: {
        rotation: { x: 0.002, y: 0.003, z: 0.001 },
      },
      audio: {
        enabled: true,
        reactivity: 1.6,
        smoothing: 0.08,
        frequencyBoosts: { bass: 0.5, mid: 0.5, high: 1.1 },
      },
    },
  },
];
