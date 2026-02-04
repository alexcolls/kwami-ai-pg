/**
 * BlackHole Sync Composable
 * 
 * Handles synchronization between the BlackHole store state and the Kwami instance.
 */

import { watch, type Ref } from 'vue';
import { useBlackHoleStore } from '@/stores/avatar.black-hole';

// Local type for Kwami instance (avoid external dependency)
type KwamiInstance = ReturnType<typeof import('@/composables/useKwami').useKwami>['kwami']['value'];

// =====================================================
// TYPES
// =====================================================

export interface UseBlackHoleSyncOptions {
    kwami: Ref<KwamiInstance>;
    getBlackHole: () => any | undefined;
}

// =====================================================
// COMPOSABLE
// =====================================================

export function useBlackHoleSync(options: UseBlackHoleSyncOptions) {
    const { getBlackHole } = options;
    const blackHoleStore = useBlackHoleStore();

    // =====================================================
    // COLORS WATCHERS
    // =====================================================

    watch(
        () => blackHoleStore.colors,
        (v) => getBlackHole()?.setColors(v),
        { deep: true }
    );

    // =====================================================
    // CORE WATCHERS
    // =====================================================

    watch(
        () => blackHoleStore.core.radius,
        (v) => getBlackHole()?.setCoreRadius(v),
        { immediate: true }
    );

    watch(
        () => blackHoleStore.core.blackHoleRadius,
        (v) => getBlackHole()?.setBlackHoleRadius(v),
        { immediate: true }
    );

    watch(
        () => blackHoleStore.core.eventHorizonRadius,
        (v) => getBlackHole()?.setEventHorizonRadius(v),
        { immediate: true }
    );

    watch(
        () => blackHoleStore.core.glowIntensity,
        (v) => getBlackHole()?.setGlowIntensity(v),
        { immediate: true }
    );

    watch(
        () => blackHoleStore.core.pulseSpeed,
        (v) => getBlackHole()?.setPulseSpeed(v),
        { immediate: true }
    );

    // =====================================================
    // DISK WATCHERS
    // =====================================================

    watch(
        () => blackHoleStore.disk.innerRadius,
        (v) => getBlackHole()?.setDiskInnerRadius(v),
        { immediate: true }
    );

    watch(
        () => blackHoleStore.disk.outerRadius,
        (v) => getBlackHole()?.setDiskOuterRadius(v),
        { immediate: true }
    );

    watch(
        () => blackHoleStore.disk.flowSpeed,
        (v) => getBlackHole()?.setDiskFlowSpeed(v)
    );

    watch(
        () => blackHoleStore.disk.noiseScale,
        (v) => getBlackHole()?.setDiskNoiseScale(v)
    );

    watch(
        () => blackHoleStore.disk.density,
        (v) => getBlackHole()?.setDiskDensity(v)
    );

    watch(
        () => blackHoleStore.disk.tiltAngle,
        (v) => getBlackHole()?.setDiskTiltAngle(v)
    );

    // =====================================================
    // ANIMATION WATCHERS
    // =====================================================

    watch(
        () => blackHoleStore.animation.diskRotationSpeed,
        (v) => getBlackHole()?.setDiskRotationSpeed(v)
    );

    watch(
        () => blackHoleStore.animation.starsRotationSpeed,
        (v) => getBlackHole()?.setStarsRotationSpeed(v)
    );

    watch(
        () => blackHoleStore.animation.autoRotate,
        (v) => getBlackHole()?.setAutoRotate(v)
    );

    // =====================================================
    // STARS WATCHERS
    // =====================================================

    watch(
        () => blackHoleStore.stars.twinkleSpeed,
        (v) => getBlackHole()?.setTwinkleSpeed(v)
    );

    // =====================================================
    // EFFECTS WATCHERS
    // =====================================================

    watch(
        () => blackHoleStore.effects.bloomIntensity,
        (v) => getBlackHole()?.setBloomIntensity(v)
    );

    watch(
        () => blackHoleStore.effects.bloomThreshold,
        (v) => getBlackHole()?.setBloomThreshold(v)
    );

    watch(
        () => blackHoleStore.effects.bloomRadius,
        (v) => getBlackHole()?.setBloomRadius(v)
    );

    watch(
        () => blackHoleStore.effects.lensingStrength,
        (v) => getBlackHole()?.setLensingStrength(v)
    );

    watch(
        () => blackHoleStore.effects.lensingRadius,
        (v) => getBlackHole()?.setLensingRadius(v)
    );

    watch(
        () => blackHoleStore.effects.chromaticAberration,
        (v) => getBlackHole()?.setChromaticAberration(v)
    );

    // =====================================================
    // SCALE WATCHER
    // =====================================================

    watch(
        () => blackHoleStore.scale.value,
        (v) => getBlackHole()?.setScale(v)
    );

    // =====================================================
    // CAMERA ZOOM WATCHER
    // =====================================================

    watch(
        () => blackHoleStore.cameraZoom.value,
        (v) => getBlackHole()?.setCameraZoom(v),
        { immediate: true }
    );

    // =====================================================
    // AUDIO WATCHERS
    // =====================================================

    watch(
        () => blackHoleStore.audio,
        (v) => {
            const bh = getBlackHole();
            if (bh) {
                bh.setAudioEnabled(v.enabled);
                bh.setAudioReactivity(v.reactivity);
            }
        },
        { deep: true }
    );

    // =====================================================
    // COLOR SCHEME WATCHER
    // =====================================================

    watch(
        () => blackHoleStore.colorScheme.preset,
        (v) => {
            const bh = getBlackHole();
            if (bh && v) {
                bh.setColorScheme(v);
            }
        }
    );

    // =====================================================
    // SYNC FUNCTIONS
    // =====================================================

    function syncFromKwami(): void {
        const blackHoleInstance = getBlackHole();
        if (blackHoleInstance) {
            blackHoleStore.syncFromKwami(blackHoleInstance);
        }
    }

    function applyToKwami(): void {
        const bh = getBlackHole();
        if (!bh) return;

        // Apply colors
        bh.setColors({
            hot: blackHoleStore.colors.hot,
            mid1: blackHoleStore.colors.mid1,
            mid2: blackHoleStore.colors.mid2,
            mid3: blackHoleStore.colors.mid3,
            outer: blackHoleStore.colors.outer,
        });

        // Apply core settings
        bh.setBlackHoleRadius(blackHoleStore.core.blackHoleRadius);
        bh.setEventHorizonRadius(blackHoleStore.core.eventHorizonRadius);
        bh.setGlowIntensity(blackHoleStore.core.glowIntensity);
        bh.setPulseSpeed(blackHoleStore.core.pulseSpeed);

        // Apply disk settings
        bh.setDiskInnerRadius(blackHoleStore.disk.innerRadius);
        bh.setDiskOuterRadius(blackHoleStore.disk.outerRadius);
        bh.setDiskFlowSpeed(blackHoleStore.disk.flowSpeed);
        bh.setDiskNoiseScale(blackHoleStore.disk.noiseScale);
        bh.setDiskDensity(blackHoleStore.disk.density);
        bh.setDiskTiltAngle(blackHoleStore.disk.tiltAngle);

        // Apply animation settings
        bh.setDiskRotationSpeed(blackHoleStore.animation.diskRotationSpeed);
        bh.setStarsRotationSpeed(blackHoleStore.animation.starsRotationSpeed);
        bh.setAutoRotate(blackHoleStore.animation.autoRotate);

        // Apply effects
        bh.setBloomIntensity(blackHoleStore.effects.bloomIntensity);
        bh.setBloomThreshold(blackHoleStore.effects.bloomThreshold);
        bh.setBloomRadius(blackHoleStore.effects.bloomRadius);
        bh.setLensingStrength(blackHoleStore.effects.lensingStrength);
        bh.setLensingRadius(blackHoleStore.effects.lensingRadius);
        bh.setChromaticAberration(blackHoleStore.effects.chromaticAberration);

        // Apply scale
        bh.setScale(blackHoleStore.scale.value);

        // Apply audio settings
        bh.setAudioEnabled(blackHoleStore.audio.enabled);
        bh.setAudioReactivity(blackHoleStore.audio.reactivity);
    }

    return {
        syncFromKwami,
        applyToKwami,
    };
}
