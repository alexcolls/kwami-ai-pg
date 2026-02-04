/**
 * CrystalBall Sync Composable
 * 
 * Handles synchronization between the CrystalBall store state and the Kwami instance.
 */

import { watch, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useCrystalBallStore, type CrystalBallStyle } from '@/stores/avatar.crystal-ball';

// Local type for Kwami instance (avoid external dependency)
type KwamiInstance = ReturnType<typeof import('@/composables/useKwami').useKwami>['kwami']['value'];

// =====================================================
// TYPES
// =====================================================

export interface UseCrystalBallSyncOptions {
    kwami: Ref<KwamiInstance>;
    getCrystalBall: () => any | undefined;
}

// =====================================================
// COMPOSABLE
// =====================================================

export function useCrystalBallSync(options: UseCrystalBallSyncOptions) {
    const { getCrystalBall } = options;
    const crystalBallStore = useCrystalBallStore();
    const {
        style: crystalBallStyle,
        colors: crystalBallColors,
        volume: crystalBallVolume,
        animation: crystalBallAnimation,
        surface: crystalBallSurface,
        audio: crystalBallAudio,
    } = storeToRefs(crystalBallStore);

    // =====================================================
    // STYLE WATCHERS
    // =====================================================

    watch(
        () => crystalBallStyle.value.preset,
        (v) => getCrystalBall()?.setStyle({ style: v as CrystalBallStyle })
    );

    // =====================================================
    // COLORS WATCHERS
    // =====================================================

    watch(
        () => crystalBallColors.value,
        (v) => getCrystalBall()?.setColors(v.primary, v.secondary),
        { deep: true }
    );

    // =====================================================
    // VOLUME WATCHERS
    // =====================================================

    watch(
        () => crystalBallVolume.value.iterations,
        (v) => getCrystalBall()?.setIterations(v)
    );

    watch(
        () => crystalBallVolume.value.depth,
        (v) => getCrystalBall()?.setDepth(v)
    );

    watch(
        () => crystalBallVolume.value.smoothing,
        (v) => getCrystalBall()?.setSmoothing(v)
    );

    watch(
        () => crystalBallVolume.value.noiseScale,
        (v) => getCrystalBall()?.setNoiseScale(v)
    );

    watch(
        () => crystalBallVolume.value.quality,
        (v) => getCrystalBall()?.setQuality(v)
    );

    // =====================================================
    // ANIMATION WATCHERS
    // =====================================================

    watch(
        () => crystalBallAnimation.value.displacementSpeed,
        (v) => getCrystalBall()?.setDisplacementSpeed(v)
    );

    watch(
        () => crystalBallAnimation.value.displacementStrength,
        (v) => getCrystalBall()?.setDisplacementStrength(v)
    );

    watch(
        () => crystalBallAnimation.value.pulseSpeed,
        (v) => getCrystalBall()?.setPulseSpeed(v)
    );

    watch(
        () => crystalBallAnimation.value.pulseIntensity,
        (v) => getCrystalBall()?.setPulseIntensity(v)
    );

    watch(
        () => crystalBallAnimation.value.rotation,
        (v) => getCrystalBall()?.setRotation(v.x, v.y, v.z),
        { deep: true }
    );

    // =====================================================
    // SURFACE WATCHERS
    // =====================================================

    watch(
        () => crystalBallSurface.value.scale,
        (v) => getCrystalBall()?.setScale(v)
    );

    // =====================================================
    // AUDIO WATCHERS
    // =====================================================

    watch(
        () => crystalBallAudio.value,
        (v) => {
            const cb = getCrystalBall();
            if (cb) {
                cb.setAudioEnabled(v.enabled);
                cb.setAudioReactivity(v.reactivity);
            }
        },
        { deep: true }
    );

    // =====================================================
    // SYNC FUNCTIONS
    // =====================================================

    function syncFromKwami(): void {
        const crystalBallInstance = getCrystalBall();
        if (crystalBallInstance) {
            crystalBallStore.syncFromKwami(crystalBallInstance);
        }
    }

    function applyToKwami(): void {
        const cb = getCrystalBall();
        if (!cb) return;

        cb.setStyle({ style: crystalBallStyle.value.preset });
        cb.setColors(crystalBallColors.value.primary, crystalBallColors.value.secondary);
        cb.setScale(crystalBallSurface.value.scale);
        cb.setRotation(
            crystalBallAnimation.value.rotation.x,
            crystalBallAnimation.value.rotation.y,
            crystalBallAnimation.value.rotation.z
        );

        if (cb.audioEffects) {
            cb.audioEffects.enabled = crystalBallAudio.value.enabled;
            cb.audioEffects.reactivity = crystalBallAudio.value.reactivity;
            cb.audioEffects.smoothing = crystalBallAudio.value.smoothing;
        }
    }

    return {
        syncFromKwami,
        applyToKwami,
    };
}
