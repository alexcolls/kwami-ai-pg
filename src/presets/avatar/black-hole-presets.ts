/**
 * Black Hole Presets
 * 
 * Preset configurations for the black hole avatar renderer.
 */

import type { BlackHoleState } from '../../stores/avatar.black-hole';

export interface BlackHolePreset {
  id: string;
  name: string;
  icon: string;
  blackHole: Partial<BlackHoleState>;
}

export const blackHolePresetsData: BlackHolePreset[] = [
  {
    id: 'black-hole-classic',
    name: 'Classic',
    icon: 'ph:circle-duotone',
    blackHole: {
      colorScheme: { preset: 'classic' },
      colors: {
        hot: '#ffffff',
        mid1: '#ff7733',
        mid2: '#ff4477',
        mid3: '#7744ff',
        outer: '#4477ff',
      },
      core: { radius: 1.3, glowIntensity: 1.0, pulseSpeed: 2.5 },
      disk: { innerRadius: 0.2, outerRadius: 8.0, tiltAngle: Math.PI / 3.0, flowSpeed: 0.22, noiseScale: 2.5, density: 1.3 },
      effects: { bloomIntensity: 0.8, bloomThreshold: 0.8, bloomRadius: 0.7, lensingStrength: 0.12, lensingRadius: 0.3, chromaticAberration: 0.005 },
      animation: { autoRotate: false, autoRotateSpeed: 0.1, diskRotationSpeed: 0.005, starsRotationSpeed: 0.003 },
    },
  },
  {
    id: 'black-hole-inferno',
    name: 'Inferno',
    icon: 'ph:fire-duotone',
    blackHole: {
      colorScheme: { preset: 'fire' },
      colors: {
        hot: '#ffffff',
        mid1: '#ffcc00',
        mid2: '#ff6600',
        mid3: '#ff3300',
        outer: '#990000',
      },
      core: { radius: 1.3, glowIntensity: 1.3, pulseSpeed: 3.0 },
      disk: { innerRadius: 0.15, outerRadius: 9.0, tiltAngle: Math.PI / 2.5, flowSpeed: 0.3, noiseScale: 3.0, density: 1.5 },
      effects: { bloomIntensity: 1.0, bloomThreshold: 0.7, bloomRadius: 0.8, lensingStrength: 0.14, lensingRadius: 0.35, chromaticAberration: 0.008 },
      animation: { autoRotate: false, autoRotateSpeed: 0.1, diskRotationSpeed: 0.008, starsRotationSpeed: 0.002 },
    },
  },
  {
    id: 'black-hole-frozen',
    name: 'Frozen',
    icon: 'ph:snowflake-duotone',
    blackHole: {
      colorScheme: { preset: 'ice' },
      colors: {
        hot: '#ffffff',
        mid1: '#aaffff',
        mid2: '#66ccff',
        mid3: '#3399ff',
        outer: '#0066cc',
      },
      core: { radius: 1.3, glowIntensity: 0.8, pulseSpeed: 1.8 },
      disk: { innerRadius: 0.25, outerRadius: 7.0, tiltAngle: Math.PI / 4.0, flowSpeed: 0.15, noiseScale: 2.0, density: 1.1 },
      effects: { bloomIntensity: 0.9, bloomThreshold: 0.85, bloomRadius: 0.6, lensingStrength: 0.1, lensingRadius: 0.28, chromaticAberration: 0.006 },
      animation: { autoRotate: false, autoRotateSpeed: 0.08, diskRotationSpeed: 0.003, starsRotationSpeed: 0.004 },
    },
  },
  {
    id: 'black-hole-nebula',
    name: 'Nebula',
    icon: 'ph:planet-duotone',
    blackHole: {
      colorScheme: { preset: 'nebula' },
      colors: {
        hot: '#ffccff',
        mid1: '#ff66ff',
        mid2: '#cc33ff',
        mid3: '#6633cc',
        outer: '#330066',
      },
      core: { radius: 1.4, glowIntensity: 1.1, pulseSpeed: 2.2 },
      disk: { innerRadius: 0.2, outerRadius: 10.0, tiltAngle: Math.PI / 3.5, flowSpeed: 0.18, noiseScale: 3.5, density: 1.4 },
      effects: { bloomIntensity: 1.0, bloomThreshold: 0.75, bloomRadius: 0.9, lensingStrength: 0.15, lensingRadius: 0.32, chromaticAberration: 0.01 },
      animation: { autoRotate: false, autoRotateSpeed: 0.12, diskRotationSpeed: 0.004, starsRotationSpeed: 0.003 },
    },
  },
  {
    id: 'black-hole-void',
    name: 'Void',
    icon: 'ph:moon-duotone',
    blackHole: {
      colorScheme: { preset: 'void' },
      colors: {
        hot: '#666666',
        mid1: '#444444',
        mid2: '#333333',
        mid3: '#222222',
        outer: '#111111',
      },
      core: { radius: 1.5, glowIntensity: 0.5, pulseSpeed: 1.5 },
      disk: { innerRadius: 0.3, outerRadius: 6.0, tiltAngle: Math.PI / 2.8, flowSpeed: 0.1, noiseScale: 1.8, density: 0.8 },
      effects: { bloomIntensity: 0.4, bloomThreshold: 0.9, bloomRadius: 0.5, lensingStrength: 0.18, lensingRadius: 0.4, chromaticAberration: 0.003 },
      animation: { autoRotate: false, autoRotateSpeed: 0.05, diskRotationSpeed: 0.002, starsRotationSpeed: 0.001 },
    },
  },
  {
    id: 'black-hole-interstellar',
    name: 'Interstellar',
    icon: 'ph:star-duotone',
    blackHole: {
      colorScheme: { preset: 'classic' },
      colors: {
        hot: '#ffffff',
        mid1: '#ffdd88',
        mid2: '#ffaa44',
        mid3: '#ff6622',
        outer: '#cc3300',
      },
      core: { radius: 1.2, glowIntensity: 0.9, pulseSpeed: 2.0 },
      disk: { innerRadius: 0.18, outerRadius: 12.0, tiltAngle: Math.PI / 2.0, flowSpeed: 0.25, noiseScale: 2.8, density: 1.2 },
      effects: { bloomIntensity: 0.85, bloomThreshold: 0.82, bloomRadius: 0.75, lensingStrength: 0.16, lensingRadius: 0.38, chromaticAberration: 0.007 },
      animation: { autoRotate: true, autoRotateSpeed: 0.08, diskRotationSpeed: 0.006, starsRotationSpeed: 0.002 },
    },
  },
  {
    id: 'black-hole-quasar',
    name: 'Quasar',
    icon: 'ph:sun-duotone',
    blackHole: {
      colorScheme: { preset: 'classic' },
      colors: {
        hot: '#ffffff',
        mid1: '#88ffff',
        mid2: '#44aaff',
        mid3: '#2266ff',
        outer: '#0033cc',
      },
      core: { radius: 1.1, glowIntensity: 1.5, pulseSpeed: 3.5 },
      disk: { innerRadius: 0.12, outerRadius: 15.0, tiltAngle: Math.PI / 6.0, flowSpeed: 0.35, noiseScale: 4.0, density: 1.8 },
      effects: { bloomIntensity: 1.2, bloomThreshold: 0.65, bloomRadius: 1.0, lensingStrength: 0.08, lensingRadius: 0.25, chromaticAberration: 0.012 },
      animation: { autoRotate: false, autoRotateSpeed: 0.15, diskRotationSpeed: 0.01, starsRotationSpeed: 0.004 },
    },
  },
  {
    id: 'black-hole-aurora',
    name: 'Aurora',
    icon: 'ph:rainbow-duotone',
    blackHole: {
      colorScheme: { preset: 'classic' },
      colors: {
        hot: '#aaffaa',
        mid1: '#44ff88',
        mid2: '#00ffcc',
        mid3: '#00aaff',
        outer: '#4488ff',
      },
      core: { radius: 1.3, glowIntensity: 1.0, pulseSpeed: 2.8 },
      disk: { innerRadius: 0.22, outerRadius: 8.5, tiltAngle: Math.PI / 3.2, flowSpeed: 0.2, noiseScale: 2.2, density: 1.3 },
      effects: { bloomIntensity: 0.9, bloomThreshold: 0.78, bloomRadius: 0.72, lensingStrength: 0.11, lensingRadius: 0.3, chromaticAberration: 0.006 },
      animation: { autoRotate: false, autoRotateSpeed: 0.1, diskRotationSpeed: 0.005, starsRotationSpeed: 0.003 },
    },
  },
];
