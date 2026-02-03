/**
 * Crystal Ball Presets
 * 
 * Preset configurations for the crystal ball (magical marble) avatar renderer.
 */

import type { CrystalBallState } from '../../stores/avatar.crystal-ball';

export interface CrystalBallPreset {
  id: string;
  name: string;
  icon: string;
  crystalBall: Partial<CrystalBallState>;
}

// Quality: 1=fast, 2=balanced, 3=detailed, 4=maximum beauty
// Higher quality = more FBM octaves = better visuals but slower

export const crystalBallPresetsData: CrystalBallPreset[] = [
  {
    id: 'crystal-ball-mystical',
    name: 'Mystical',
    icon: 'ph:sparkle-duotone',
    crystalBall: {
      style: { preset: 'mystical' },
      colors: { primary: '#6b5b95', secondary: '#feb236' },
      volume: { iterations: 32, depth: 0.6, smoothing: 0.2, noiseScale: 2.5, quality: 2 },
      animation: {
        displacementSpeed: 0.071,
        displacementStrength: 0.1,
        pulseSpeed: 1.0,
        pulseIntensity: 0.02,
        rotation: { x: 0, y: 0.001, z: 0 },
      },
      surface: { scale: 3.0, roughness: 0.1, metalness: 0.0, envMapIntensity: 0.8 },
    },
  },
  {
    id: 'crystal-ball-nebula',
    name: 'Nebula',
    icon: 'ph:planet-duotone',
    crystalBall: {
      style: { preset: 'nebula' },
      colors: { primary: '#0d47a1', secondary: '#e040fb' },
      volume: { iterations: 36, depth: 0.7, smoothing: 0.25, noiseScale: 3.0, quality: 3 },
      animation: {
        displacementSpeed: 0.05,
        displacementStrength: 0.15,
        pulseSpeed: 0.8,
        pulseIntensity: 0.03,
        rotation: { x: 0, y: 0.0015, z: 0.0005 },
      },
      surface: { scale: 3.0, roughness: 0.05, metalness: 0.1, envMapIntensity: 0.6 },
    },
  },
  {
    id: 'crystal-ball-earth',
    name: 'Earth',
    icon: 'ph:globe-duotone',
    crystalBall: {
      style: { preset: 'earth' },
      colors: { primary: '#1b5e20', secondary: '#4fc3f7' },
      volume: { iterations: 32, depth: 0.55, smoothing: 0.2, noiseScale: 2.0, quality: 2 },
      animation: {
        displacementSpeed: 0.06,
        displacementStrength: 0.08,
        pulseSpeed: 0.6,
        pulseIntensity: 0.02,
        rotation: { x: 0, y: 0.0008, z: 0 },
      },
      surface: { scale: 3.0, roughness: 0.15, metalness: 0.0, envMapIntensity: 0.7 },
    },
  },
  {
    id: 'crystal-ball-fire',
    name: 'Fire',
    icon: 'ph:fire-duotone',
    crystalBall: {
      style: { preset: 'fire' },
      colors: { primary: '#ff5722', secondary: '#ffeb3b' },
      volume: { iterations: 36, depth: 0.7, smoothing: 0.15, noiseScale: 3.5, quality: 3 },
      animation: {
        displacementSpeed: 0.12,
        displacementStrength: 0.2,
        pulseSpeed: 1.5,
        pulseIntensity: 0.04,
        rotation: { x: 0.0003, y: 0.002, z: 0 },
      },
      surface: { scale: 3.0, roughness: 0.08, metalness: 0.2, envMapIntensity: 0.5 },
    },
  },
  {
    id: 'crystal-ball-ocean',
    name: 'Ocean',
    icon: 'ph:wave-duotone',
    crystalBall: {
      style: { preset: 'ocean' },
      colors: { primary: '#006064', secondary: '#80deea' },
      volume: { iterations: 32, depth: 0.6, smoothing: 0.25, noiseScale: 2.2, quality: 2 },
      animation: {
        displacementSpeed: 0.04,
        displacementStrength: 0.12,
        pulseSpeed: 0.5,
        pulseIntensity: 0.02,
        rotation: { x: 0, y: 0.0006, z: 0 },
      },
      surface: { scale: 3.0, roughness: 0.05, metalness: 0.0, envMapIntensity: 0.9 },
    },
  },
  {
    id: 'crystal-ball-aurora',
    name: 'Aurora',
    icon: 'ph:rainbow-duotone',
    crystalBall: {
      style: { preset: 'mystical' },
      colors: { primary: '#00e676', secondary: '#aa00ff' },
      volume: { iterations: 36, depth: 0.65, smoothing: 0.2, noiseScale: 2.8, quality: 3 },
      animation: {
        displacementSpeed: 0.08,
        displacementStrength: 0.12,
        pulseSpeed: 1.2,
        pulseIntensity: 0.03,
        rotation: { x: 0.0002, y: 0.0012, z: 0.0001 },
      },
      surface: { scale: 3.0, roughness: 0.08, metalness: 0.05, envMapIntensity: 0.75 },
    },
  },
  {
    id: 'crystal-ball-void',
    name: 'Void',
    icon: 'ph:moon-duotone',
    crystalBall: {
      style: { preset: 'nebula' },
      colors: { primary: '#1a1a2e', secondary: '#4a148c' },
      volume: { iterations: 40, depth: 0.8, smoothing: 0.3, noiseScale: 4.0, quality: 4 },
      animation: {
        displacementSpeed: 0.03,
        displacementStrength: 0.08,
        pulseSpeed: 0.4,
        pulseIntensity: 0.01,
        rotation: { x: 0, y: 0.0005, z: 0 },
      },
      surface: { scale: 3.0, roughness: 0.02, metalness: 0.15, envMapIntensity: 0.4 },
    },
  },
  {
    id: 'crystal-ball-sunrise',
    name: 'Sunrise',
    icon: 'ph:sun-horizon-duotone',
    crystalBall: {
      style: { preset: 'fire' },
      colors: { primary: '#ff9800', secondary: '#ffccbc' },
      volume: { iterations: 32, depth: 0.6, smoothing: 0.2, noiseScale: 2.0, quality: 2 },
      animation: {
        displacementSpeed: 0.06,
        displacementStrength: 0.1,
        pulseSpeed: 0.8,
        pulseIntensity: 0.02,
        rotation: { x: 0, y: 0.001, z: 0 },
      },
      surface: { scale: 3.0, roughness: 0.12, metalness: 0.0, envMapIntensity: 0.85 },
    },
  },
];
