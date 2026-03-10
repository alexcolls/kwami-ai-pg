/**
 * Avatar Templates for the Kwami App
 *
 * Central export for all avatar renderer presets (blob, crystal, stars-genesis, crystal-ball).
 */

import { shallowRef, type ShallowRef } from 'vue';
import type { RendererType } from '../../stores/avatar';
import type { BlobXyzState } from '../../stores/avatar.blob-xyz';
import type { OrbitalShardsState } from '../../stores/avatar.orbital-shards';
import type { StarsGenesisState } from '../../stores/avatar.stars-genesis';
import type { CrystalBallState } from '../../stores/avatar.crystal-ball';
import type { BlackHoleState } from '../../stores/avatar.black-hole';
import { blobPresetsData, type BlobXyzPreset } from './blob-xyz-presets';
import { orbitalShardsPresetsData, type OrbitalShardsPreset } from './orbital-shards-presets';
import { starsGenesisPresetsData, type StarsGenesisPreset } from './stars-genesis-presets';
import { crystalBallPresetsData, type CrystalBallPreset } from './crystal-ball-presets';
import { blackHolePresetsData, type BlackHolePreset } from './black-hole-presets';

// Re-export preset types
export type { BlobXyzPreset } from './blob-xyz-presets';
export type { OrbitalShardsPreset } from './orbital-shards-presets';
export type { StarsGenesisPreset } from './stars-genesis-presets';
export type { CrystalBallPreset } from './crystal-ball-presets';
export type { BlackHolePreset } from './black-hole-presets';

// Direct access to typed preset data
export { blobPresetsData } from './blob-xyz-presets';
export { crystalBallPresetsData } from './crystal-ball-presets';
export { starsGenesisPresetsData } from './stars-genesis-presets';
export { blackHolePresetsData } from './black-hole-presets';
export { orbitalShardsPresetsData } from './orbital-shards-presets';

// Unified preset interface for backwards compatibility
export interface AvatarPreset {
  id: string;
  name: string;
  icon: string;
  renderer: RendererType;
  blobXyz?: Partial<BlobXyzState>;
  orbitalShards?: Partial<OrbitalShardsState>;
  starsGenesis?: Partial<StarsGenesisState>;
  crystalBall?: Partial<CrystalBallState>;
  blackHole?: Partial<BlackHoleState>;
}

// Convert specific presets to unified format
function toBlobAvatarPreset(preset: BlobXyzPreset): AvatarPreset {
  return {
    id: preset.id,
    name: preset.name,
    icon: preset.icon,
    renderer: 'blob-xyz',
    blobXyz: preset.blob,
  };
}

function toOrbitalShardsAvatarPreset(preset: OrbitalShardsPreset): AvatarPreset {
  return {
    id: preset.id,
    name: preset.name,
    icon: preset.icon,
    renderer: 'orbital-shards',
    orbitalShards: preset.orbitalShards,
  };
}

function toStarsGenesisAvatarPreset(preset: StarsGenesisPreset): AvatarPreset {
  return {
    id: preset.id,
    name: preset.name,
    icon: preset.icon,
    renderer: 'stars-genesis',
    starsGenesis: preset.starsGenesis,
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

function toBlackHoleAvatarPreset(preset: BlackHolePreset): AvatarPreset {
  return {
    id: preset.id,
    name: preset.name,
    icon: preset.icon,
    renderer: 'black-hole',
    blackHole: preset.blackHole,
  };
}

// Combine all presets into a unified array
const _avatarPresetsData: AvatarPreset[] = [
  ...blobPresetsData.map(toBlobAvatarPreset),
  ...orbitalShardsPresetsData.map(toOrbitalShardsAvatarPreset),
  ...starsGenesisPresetsData.map(toStarsGenesisAvatarPreset),
  ...crystalBallPresetsData.map(toCrystalBallAvatarPreset),
  ...blackHolePresetsData.map(toBlackHoleAvatarPreset),
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

export function getBlobXyzPresets(): AvatarPreset[] {
  return avatarPresetsRef.value.filter((p) => p.renderer === 'blob-xyz');
}

export function getOrbitalShardsPresets(): AvatarPreset[] {
  return avatarPresetsRef.value.filter((p) => p.renderer === 'orbital-shards');
}

export function getStarsGenesisPresets(): AvatarPreset[] {
  return avatarPresetsRef.value.filter((p) => p.renderer === 'stars-genesis');
}

export function getCrystalBallPresets(): AvatarPreset[] {
  return avatarPresetsRef.value.filter((p) => p.renderer === 'crystal-ball');
}

export function getBlackHolePresets(): AvatarPreset[] {
  return avatarPresetsRef.value.filter((p) => p.renderer === 'black-hole');
}

