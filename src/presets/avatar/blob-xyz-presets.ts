/**
 * Blob Presets for the Kwami AI Playground
 *
 * Visual presets for the blob avatar renderer.
 * Uses the new 6-section blob state structure.
 */

import type { BlobXyzState } from '../../stores/avatar.blob-xyz';

export interface BlobXyzPreset {
  id: string;
  name: string;
  icon: string;
  blob: Partial<BlobXyzState>;
}

export const blobPresetsData: BlobXyzPreset[] = [
  {
    id: 'rgb-pulse',
    name: 'RGB Pulse',
    icon: 'ph:lightning-duotone',
    blob: {
      skin: {
        type: 'poles',
        colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
        opacity: 1,
        shininess: 80,
        lightIntensity: 1.3,
        wireframe: false,
        glassMode: false,
        resolution: 200,
      },
      shape: {
        scale: 3.2,
        position: { x: 56, y: 208, z: 78 },
        spikes: { x: 0.8, y: 1.2, z: 0.6 },
        amplitude: { x: 1.5, y: 0.8, z: 1.2 },
      },
      animation: {
        time: { x: 12, y: 9, z: 14 },
        rotation: { x: 0.02, y: 0, z: 0 },
        breathing: 0.02,
      },
      cursorTouch: {
        hover: { enabled: true, highlightOnHover: true, cursorStyle: 'pointer' },
        drag: { enabled: true, sensitivity: 1.0 },
        touch: { strength: 1.5, duration: 800, maxPoints: 8 },
      },
    },
  },
  {
    id: 'ocean-wave',
    name: 'Ocean Wave',
    icon: 'ph:waves-duotone',
    blob: {
      skin: {
        type: 'donut',
        colors: { x: '#0077be', y: '#00d4ff', z: '#001a33' },
        opacity: 0.85,
        shininess: 120,
        lightIntensity: 1,
        wireframe: false,
        glassMode: false,
        resolution: 220,
      },
      shape: {
        scale: 3.2,
        position: { x: 22, y: 260, z: 260 },
        spikes: { x: 2.65, y: 2.4, z: 0.35 },
        amplitude: { x: 0.5, y: 2.0, z: 0.6 },
      },
      animation: {
        time: { x: 5, y: 3, z: 4 },
        rotation: { x: 0.01, y: 0.003, z: 0.002 },
        breathing: 0.03,
      },
      cursorTouch: {
        hover: { enabled: true, highlightOnHover: true, cursorStyle: 'pointer' },
        drag: { enabled: true, sensitivity: 1.0 },
        touch: { strength: 0.8, duration: 1500, maxPoints: 4 },
      },
    },
  },
  {
    id: 'sunset-glow',
    name: 'Sunset',
    icon: 'ph:sun-horizon-duotone',
    blob: {
      skin: {
        type: 'poles',
        colors: { x: '#ff6b35', y: '#f7c59f', z: '#8b1e3f' },
        opacity: 0.33,
        shininess: 200,
        lightIntensity: 10.4,
        wireframe: false,
        glassMode: false,
        resolution: 160,
      },
      shape: {
        scale: 3.2,
        position: { x: 22, y: 260, z: 260 },
        spikes: { x: 8, y: 8, z: 8 },
        amplitude: { x: 1.1, y: 0.7, z: 1.0 },
      },
      animation: {
        time: { x: 6, y: 8, z: 7 },
        rotation: { x: 0.001, y: 0.002, z: 0.001 },
        breathing: 0.015,
      },
      cursorTouch: {
        hover: { enabled: true, highlightOnHover: true, cursorStyle: 'pointer' },
        drag: { enabled: true, sensitivity: 1.0 },
        touch: { strength: 1.2, duration: 1200, maxPoints: 6 },
      },
    },
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora',
    icon: 'ph:star-duotone',
    blob: {
      skin: {
        type: 'poles',
        colors: { x: '#00ff87', y: '#60efff', z: '#7b2cbf' },
        opacity: 0.95,
        shininess: 100,
        lightIntensity: 3.5,
        wireframe: false,
        glassMode: false,
        resolution: 240,
      },
      shape: {
        scale: 3.2,
        position: { x: 306, y: 40, z: 300 },
        spikes: { x: 0, y: 0, z: 4.6 },
        amplitude: { x: 0, y: 0, z: 2 },
      },
      animation: {
        time: { x: 0, y: 0, z: 10 },
        rotation: { x: 0, y: 0, z: 0.004 },
        breathing: 0.04,
      },
      cursorTouch: {
        hover: { enabled: true, highlightOnHover: true, cursorStyle: 'pointer' },
        drag: { enabled: true, sensitivity: 1.0 },
        touch: { strength: 0.6, duration: 2000, maxPoints: 3 },
      },
    },
  },
  {
    id: 'lava-flow',
    name: 'Lava',
    icon: 'ph:fire-simple-duotone',
    blob: {
      skin: {
        type: 'donut',
        colors: { x: '#ff4500', y: '#ff8c00', z: '#8b0000' },
        opacity: 1,
        shininess: 30,
        lightIntensity: 1.8,
        wireframe: false,
        glassMode: false,
        resolution: 150,
      },
      shape: {
        scale: 3.2,
        position: { x: 22, y: 260, z: 260 },
        spikes: { x: 1.2, y: 0.9, z: 1.4 },
        amplitude: { x: 1.3, y: 1.1, z: 1.5 },
      },
      animation: {
        time: { x: 10, y: 12, z: 8 },
        rotation: { x: 0.002, y: 0.001, z: 0.003 },
        breathing: 0.05,
      },
      cursorTouch: {
        hover: { enabled: true, highlightOnHover: true, cursorStyle: 'pointer' },
        drag: { enabled: true, sensitivity: 1.2 },
        touch: { strength: 2.0, duration: 600, maxPoints: 10 },
      },
    },
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    icon: 'ph:cloud-duotone',
    blob: {
      skin: {
        type: 'donut',
        colors: { x: '#ffb6c1', y: '#87ceeb', z: '#dda0dd' },
        opacity: 0.8,
        shininess: 176,
        lightIntensity: 1.6,
        wireframe: true,
        glassMode: false,
        resolution: 204,
      },
      shape: {
        scale: 3.2,
        position: { x: 22, y: 260, z: 260 },
        spikes: { x: 1.2, y: 1, z: 0.95 },
        amplitude: { x: 3.6, y: 1.3, z: 0.9 },
      },
      animation: {
        time: { x: 7.3, y: 0.1, z: 6.5 },
        rotation: { x: 0.003, y: 0.002, z: 0.004 },
        breathing: 0.025,
      },
      cursorTouch: {
        hover: { enabled: true, highlightOnHover: true, cursorStyle: 'pointer' },
        drag: { enabled: true, sensitivity: 0.8 },
        touch: { strength: 0.5, duration: 1800, maxPoints: 4 },
      },
    },
  },
  {
    id: 'midnight-void',
    name: 'Midnight',
    icon: 'ph:moon-duotone',
    blob: {
      skin: {
        type: 'poles',
        colors: { x: '#1a1a2e', y: '#16213e', z: '#0f3460' },
        opacity: 1,
        shininess: 0,
        lightIntensity: 200.5,
        wireframe: false,
        glassMode: false,
        resolution: 260,
      },
      shape: {
        scale: 3.2,
        position: { x: 22, y: 260, z: 260 },
        spikes: { x: 0.4, y: 1.6, z: 0.3 },
        amplitude: { x: 0.8, y: 0.5, z: 1.0 },
      },
      animation: {
        time: { x: 4, y: 6, z: 5 },
        rotation: { x: 0.001, y: 0.0015, z: 0.0008 },
        breathing: 0.01,
      },
      cursorTouch: {
        hover: { enabled: true, highlightOnHover: false, cursorStyle: 'pointer' },
        drag: { enabled: true, sensitivity: 0.5 },
        touch: { strength: 2.4, duration: 2500, maxPoints: 2 },
      },
    },
  },
  {
    id: 'toxic-slime',
    name: 'Toxic',
    icon: 'ph:skull-duotone',
    blob: {
      skin: {
        type: 'vintage',
        colors: { x: '#39ff14', y: '#16bb16', z: '#32cd32' },
        opacity: 0.7,
        shininess: 60,
        lightIntensity: 1.6,
        wireframe: true,
        glassMode: false,
        resolution: 140,
      },
      shape: {
        scale: 3.2,
        position: { x: 22, y: 260, z: 260 },
        spikes: { x: 1.8, y: 1.2, z: 2.0 },
        amplitude: { x: 1.5, y: 1.3, z: 1.7 },
      },
      animation: {
        time: { x: 11, y: 14, z: 9 },
        rotation: { x: 0.005, y: 0.003, z: 0.006 },
        breathing: 0.06,
      },
      cursorTouch: {
        hover: { enabled: true, highlightOnHover: true, cursorStyle: 'crosshair' },
        drag: { enabled: true, sensitivity: 1.5 },
        touch: { strength: 2.5, duration: 500, maxPoints: 12 },
      },
    },
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    icon: 'ph:crown-duotone',
    blob: {
      skin: {
        type: 'donut',
        colors: { x: '#ffd700', y: '#daa520', z: '#b8860b' },
        opacity: 1,
        shininess: 200,
        lightIntensity: 1.3,
        wireframe: false,
        glassMode: false,
        resolution: 200,
      },
      shape: {
        scale: 3.2,
        position: { x: 17, y: 277, z: 18 },
        spikes: { x: 2.2, y: 0.35, z: 0.2 },
        amplitude: { x: 0.6, y: 0.7, z: 2.5 },
      },
      animation: {
        time: { x: 3, y: 5, z: 4 },
        rotation: { x: 0.00, y: 0.00, z: 0.0002 },
        breathing: 0.015,
      },
      cursorTouch: {
        hover: { enabled: true, highlightOnHover: true, cursorStyle: 'pointer' },
        drag: { enabled: true, sensitivity: 0.7 },
        touch: { strength: 0.7, duration: 1400, maxPoints: 5 },
      },
    },
  },
  {
    id: 'ice-crystal',
    name: 'Ice',
    icon: 'ph:snowflake-duotone',
    blob: {
      skin: {
        type: 'poles',
        colors: { x: '#e0ffff', y: '#add8e6', z: '#87ceeb' },
        opacity: 1,
        shininess: 180,
        lightIntensity: 1.7,
        wireframe: false,
        glassMode: true,
        resolution: 280,
      },
      shape: {
        scale: 3.2,
        position: { x: 70, y: 305, z: 294 },
        spikes: { x: 1.0, y: 1.8, z: 0.2 },
        amplitude: { x: 0.4, y: 2, z: 0.5 },
      },
      animation: {
        time: { x: 0, y: 0, z: 1 },
        rotation: { x: 0.001, y: 0.001, z: 0.001 },
        breathing: 0.008,
      },
      cursorTouch: {
        hover: { enabled: true, highlightOnHover: true, cursorStyle: 'pointer' },
        drag: { enabled: true, sensitivity: 0.5 },
        touch: { strength: 0.3, duration: 3000, maxPoints: 2 },
      },
    },
  },
  {
    id: 'forest-moss',
    name: 'Forest',
    icon: 'ph:tree-duotone',
    blob: {
      skin: {
        type: 'donut',
        colors: { x: '#228b22', y: '#006400', z: '#8fbc8f' },
        opacity: 1,
        shininess: 40,
        lightIntensity: 10,
        wireframe: false,
        glassMode: false,
        resolution: 170,
      },
      shape: {
        scale: 3.2,
        position: { x: 22, y: 260, z: 260 },
        spikes: { x: 0, y: 5, z: 1.6 },
        amplitude: { x: 0, y: 2, z: 3 },
      },
      animation: {
        time: { x: 5, y: 5, z: 5 },
        rotation: { x: 0, y: 0.001, z: 0 },
        breathing: 0.02,
      },
      cursorTouch: {
        hover: { enabled: true, highlightOnHover: true, cursorStyle: 'pointer' },
        drag: { enabled: true, sensitivity: 1.0 },
        touch: { strength: 1.0, duration: 1100, maxPoints: 5 },
      },
    },
  },
  {
    id: 'planet-swirl',
    name: 'Planet',
    icon: 'ph:planet-duotone',
    blob: {
      skin: {
        type: 'poles',
        colors: { x: '#663399', y: '#ff1493', z: '#00ced1' },
        opacity: 0.9,
        shininess: 100,
        lightIntensity: 1.2,
        wireframe: false,
        glassMode: false,
        resolution: 210,
      },
      shape: {
        scale: 3.2,
        position: { x: 0, y: 0, z: 0 },
        spikes: { x: 0.1, y: 0.1, z: 0.1 },
        amplitude: { x: 1.4, y: 1.9, z: 0.2 },
      },
      animation: {
        time: { x: 13, y: 5, z: 10 },
        rotation: { x: 0.003, y: 0.005, z: 0.002 },
        breathing: 0.025,
      },
      cursorTouch: {
        hover: { enabled: true, highlightOnHover: true, cursorStyle: 'pointer' },
        drag: { enabled: true, sensitivity: 1.0 },
        touch: { strength: 1.3, duration: 900, maxPoints: 7 },
      },
    },
  },
];
