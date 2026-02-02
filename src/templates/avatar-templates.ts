/**
 * Avatar Templates for the Kwami AI Playground
 *
 * Central export for all avatar renderer presets (blob, crystal, particles, crystal-ball).
 */

import { shallowRef, type ShallowRef } from 'vue';
import type { RendererType } from '../stores/avatar';
import type { BlobXyzState } from '../stores/avatar.blob-xyz';
import type { CrystalState } from '../stores/avatar.crystal';
import type { ParticlesState } from '../stores/avatar.particles';
import type { CrystalBallState } from '../stores/avatar.crystal-ball';
import { blobPresetsData, type BlobXyzPreset } from './blob-xyz-presets';
import { crystalPresetsData, type CrystalPreset } from './crystal-presets';
import { particlesPresetsData, type ParticlesPreset } from './particles-presets';
import { crystalBallPresetsData, type CrystalBallPreset } from './crystal-ball-presets';

// Re-export preset types
export type { BlobXyzPreset } from './blob-xyz-presets';
export type { CrystalPreset } from './crystal-presets';
export type { ParticlesPreset } from './particles-presets';
export type { CrystalBallPreset } from './crystal-ball-presets';

// Unified preset interface for backwards compatibility
export interface AvatarPreset {
  id: string;
  name: string;
  icon: string;
  renderer: RendererType;
  blob?: Partial<BlobXyzState>;
  crystal?: Partial<CrystalState>;
  particles?: Partial<ParticlesState>;
  crystalBall?: Partial<CrystalBallState>;
}

// Convert specific presets to unified format
function toBlobAvatarPreset(preset: BlobXyzPreset): AvatarPreset {
  return {
    id: preset.id,
    name: preset.name,
    icon: preset.icon,
    renderer: 'blob',
    blob: preset.blob,
  };
}

function toCrystalAvatarPreset(preset: CrystalPreset): AvatarPreset {
  return {
    id: preset.id,
    name: preset.name,
    icon: preset.icon,
    renderer: 'crystal',
    crystal: preset.crystal,
  };
}

function toParticlesAvatarPreset(preset: ParticlesPreset): AvatarPreset {
  return {
    id: preset.id,
    name: preset.name,
    icon: preset.icon,
    renderer: 'particles',
    particles: preset.particles,
  };
}

function toCrystalBallAvatarPreset(preset: CrystalBallPreset): AvatarPreset {
  return {
    id: preset.id,
    name: preset.name,
    icon: preset.icon,
    renderer: 'crystal-ball',
    crystalBall: preset.crystalBall,
  };
}

// Combine all presets into a unified array
const _avatarPresetsData: AvatarPreset[] = [
  ...blobPresetsData.map(toBlobAvatarPreset),
  ...crystalPresetsData.map(toCrystalAvatarPreset),
  ...particlesPresetsData.map(toParticlesAvatarPreset),
  ...crystalBallPresetsData.map(toCrystalBallAvatarPreset),
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

export function getParticlesPresets(): AvatarPreset[] {
  return avatarPresetsRef.value.filter((p) => p.renderer === 'particles');
}

export function getCrystalBallPresets(): AvatarPreset[] {
  return avatarPresetsRef.value.filter((p) => p.renderer === 'crystal-ball');
}

// Direct access to typed preset data
export { blobPresetsData } from './blob-xyz-presets';
export { crystalPresetsData } from './crystal-presets';
export { particlesPresetsData } from './particles-presets';
