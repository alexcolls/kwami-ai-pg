/**
 * OrbitalShards Sync Composable
 * 
 * Handles synchronization between the OrbitalShards store state and the Kwami instance.
 */

import { watch, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrbitalShardsStore, type OrbitalShardsFormation } from '@/stores/avatar.orbital-shards';

// Local type for Kwami instance (avoid external dependency)
type KwamiInstance = ReturnType<typeof import('@/composables/useKwami').useKwami>['kwami']['value'];

// =====================================================
// TYPES
// =====================================================

export interface UseOrbitalShardsSyncOptions {
    kwami: Ref<KwamiInstance>;
    getOrbitalShards: () => any | undefined;
}

// =====================================================
// COMPOSABLE
// =====================================================

export function useOrbitalShardsSync(options: UseOrbitalShardsSyncOptions) {
    const { getOrbitalShards } = options;
    const orbitalShardsStore = useOrbitalShardsStore();
    const {
        appearance: orbitalShardsAppearance,
        colors: orbitalShardsColors,
        glow: orbitalShardsGlow,
        animation: orbitalShardsAnimation,
        orientation: orbitalShardsOrientation,
        audio: orbitalShardsAudio,
    } = storeToRefs(orbitalShardsStore);

    // =====================================================
    // APPEARANCE WATCHERS
    // =====================================================

    watch(
        () => orbitalShardsAppearance.value.formation,
        (v) => getOrbitalShards()?.setFormation({ formation: v as OrbitalShardsFormation })
    );

    watch(
        () => orbitalShardsAppearance.value.shardCount,
        (v) => getOrbitalShards()?.setShardCount(v)
    );

    watch(
        () => orbitalShardsAppearance.value.scale,
        (v) => getOrbitalShards()?.setScale(v)
    );

    // =====================================================
    // COLORS WATCHERS
    // =====================================================

    watch(
        () => ({
            primary: orbitalShardsColors.value.primary,
            secondary: orbitalShardsColors.value.secondary,
            accent: orbitalShardsColors.value.accent,
        }),
        (v) => getOrbitalShards()?.setOrbitalShardsColors?.(v.primary, v.secondary, v.accent),
        { deep: true }
    );

    watch(
        () => orbitalShardsColors.value.core,
        (v) => getOrbitalShards()?.setCoreColors(v.inner, v.outer),
        { deep: true }
    );

    // =====================================================
    // GLOW WATCHERS
    // =====================================================

    watch(
        () => orbitalShardsGlow.value.intensity,
        (v) => getOrbitalShards()?.setGlowIntensity(v)
    );

    // =====================================================
    // ANIMATION WATCHERS
    // =====================================================

    watch(
        () => orbitalShardsAnimation.value.rotation,
        (v) => getOrbitalShards()?.setRotation(v.x, v.y, v.z),
        { deep: true }
    );

    // =====================================================
    // ORIENTATION WATCHER
    // =====================================================

    watch(
        () => orbitalShardsOrientation.value,
        (v) => {
            const os = getOrbitalShards();
            if (os?.setOrientation) {
                const degToRad = (deg: number) => (deg * Math.PI) / 180;
                os.setOrientation(degToRad(v.x), degToRad(v.y), degToRad(v.z));
            }
        },
        { deep: true }
    );

    // =====================================================
    // AUDIO WATCHERS
    // =====================================================

    watch(
        () => orbitalShardsAudio.value,
        (v) => {
            const c = getOrbitalShards();
            if (c && c.audioEffects) {
                c.audioEffects.enabled = v.enabled;
                c.audioEffects.reactivity = v.reactivity;
                c.audioEffects.smoothing = v.smoothing;
                c.audioEffects.bassOrbitBoost = v.frequencyBoosts.bass;
                c.audioEffects.midRotationBoost = v.frequencyBoosts.mid;
                c.audioEffects.highGlowBoost = v.frequencyBoosts.high;
            }
        },
        { deep: true }
    );

    // =====================================================
    // SYNC FUNCTIONS
    // =====================================================

    function syncFromKwami(): void {
        const orbitalShardsInstance = getOrbitalShards();
        if (orbitalShardsInstance) {
            orbitalShardsStore.syncFromKwami(orbitalShardsInstance);
        }
    }

    function applyToKwami(): void {
        const c = getOrbitalShards();
        if (!c) return;

        c.setFormation({
            formation: orbitalShardsAppearance.value.formation as OrbitalShardsFormation,
        });
        c.setOrbitalShardsColors?.(
            orbitalShardsColors.value.primary,
            orbitalShardsColors.value.secondary,
            orbitalShardsColors.value.accent
        );
        c.setCoreColors(orbitalShardsColors.value.core.inner, orbitalShardsColors.value.core.outer);
        c.setGlowIntensity(orbitalShardsGlow.value.intensity);
        c.setShardCount(orbitalShardsAppearance.value.shardCount);
        c.setScale(orbitalShardsAppearance.value.scale);
        c.setRotation(
            orbitalShardsAnimation.value.rotation.x,
            orbitalShardsAnimation.value.rotation.y,
            orbitalShardsAnimation.value.rotation.z
        );

        // Orientation
        if (c.setOrientation) {
            const degToRad = (deg: number) => (deg * Math.PI) / 180;
            c.setOrientation(
                degToRad(orbitalShardsOrientation.value.x),
                degToRad(orbitalShardsOrientation.value.y),
                degToRad(orbitalShardsOrientation.value.z)
            );
        }

        // Audio
        if (c.audioEffects) {
            c.audioEffects.enabled = orbitalShardsAudio.value.enabled;
            c.audioEffects.reactivity = orbitalShardsAudio.value.reactivity;
            c.audioEffects.smoothing = orbitalShardsAudio.value.smoothing;
            c.audioEffects.bassOrbitBoost = orbitalShardsAudio.value.frequencyBoosts.bass;
            c.audioEffects.midRotationBoost = orbitalShardsAudio.value.frequencyBoosts.mid;
            c.audioEffects.highGlowBoost = orbitalShardsAudio.value.frequencyBoosts.high;
        }
    }

    return {
        syncFromKwami,
        applyToKwami,
    };
}
