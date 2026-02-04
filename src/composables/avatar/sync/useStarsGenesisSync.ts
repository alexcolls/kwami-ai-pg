/**
 * StarsGenesis Sync Composable
 * 
 * Handles synchronization between the StarsGenesis store state and the Kwami instance.
 */

import { watch, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useStarsGenesisStore } from '@/stores/avatar.stars-genesis';

// Local type for Kwami instance (avoid external dependency)
type KwamiInstance = ReturnType<typeof import('@/composables/useKwami').useKwami>['kwami']['value'];

// =====================================================
// TYPES
// =====================================================

export interface UseStarsGenesisSyncOptions {
    kwami: Ref<KwamiInstance>;
    getStarsGenesis: () => any | undefined;
}

// =====================================================
// COMPOSABLE
// =====================================================

export function useStarsGenesisSync(options: UseStarsGenesisSyncOptions) {
    const { getStarsGenesis } = options;
    const starsGenesisStore = useStarsGenesisStore();
    const {
        formation: starsGenesisFormation,
        visual: starsGenesisVisual,
        transform: starsGenesisTransform,
        physics: starsGenesisPhysics,
        animation: starsGenesisAnimation,
        audio: starsGenesisAudio,
    } = storeToRefs(starsGenesisStore);

    // =====================================================
    // FORMATION WATCHERS
    // =====================================================

    watch(
        () => starsGenesisFormation.value.type,
        (v) => getStarsGenesis()?.setFormation(v, true)
    );

    // =====================================================
    // VISUAL WATCHERS
    // =====================================================

    watch(
        () => starsGenesisVisual.value,
        (v) => {
            const p = getStarsGenesis();
            if (p) {
                p.setColors(v.color, v.glowColor);
                p.setOpacity(v.opacity);
                p.setStarSize(v.starSize);
                p.setGlowIntensity(v.glowIntensity);
                p.setSharpness(v.sharpness);
            }
        },
        { deep: true }
    );

    // =====================================================
    // TRANSFORM WATCHERS
    // =====================================================

    watch(
        () => starsGenesisTransform.value.scale,
        (v) => getStarsGenesis()?.setScale(v)
    );

    // =====================================================
    // PHYSICS WATCHERS
    // =====================================================

    watch(
        () => starsGenesisPhysics.value,
        (v) => getStarsGenesis()?.setPhysics(v),
        { deep: true }
    );

    // =====================================================
    // ANIMATION WATCHERS
    // =====================================================

    watch(
        () => starsGenesisAnimation.value,
        (v) => getStarsGenesis()?.setAnimation(v),
        { deep: true }
    );

    // =====================================================
    // AUDIO WATCHERS
    // =====================================================

    watch(
        () => starsGenesisAudio.value,
        (v) => {
            const p = getStarsGenesis();
            if (p) {
                p.setAudioEffects({
                    enabled: v.enabled,
                    reactivity: v.reactivity,
                    smoothing: v.smoothing,
                    scalePulse: v.scalePulse,
                    movementIntensity: v.movementIntensity,
                    bassInfluence: v.frequencyInfluence.bass,
                    midInfluence: v.frequencyInfluence.mid,
                    highInfluence: v.frequencyInfluence.high,
                });
            }
        },
        { deep: true }
    );

    // =====================================================
    // SYNC FUNCTIONS
    // =====================================================

    function syncFromKwami(): void {
        const starsGenesisInstance = getStarsGenesis();
        if (starsGenesisInstance) {
            starsGenesisStore.syncFromKwami(starsGenesisInstance);
        }
    }

    function applyToKwami(): void {
        const p = getStarsGenesis();
        if (!p) return;

        p.setFormation(starsGenesisFormation.value.type, false);
        p.setColors(starsGenesisVisual.value.color, starsGenesisVisual.value.glowColor);
        p.setOpacity(starsGenesisVisual.value.opacity);
        p.setStarSize(starsGenesisVisual.value.starSize);
        p.setGlowIntensity(starsGenesisVisual.value.glowIntensity);
        p.setSharpness(starsGenesisVisual.value.sharpness);
        p.setScale(starsGenesisTransform.value.scale);
        p.setPhysics(starsGenesisPhysics.value);
        p.setAnimation(starsGenesisAnimation.value);
        p.setAudioEffects({
            enabled: starsGenesisAudio.value.enabled,
            reactivity: starsGenesisAudio.value.reactivity,
            smoothing: starsGenesisAudio.value.smoothing,
            scalePulse: starsGenesisAudio.value.scalePulse,
            movementIntensity: starsGenesisAudio.value.movementIntensity,
            bassInfluence: starsGenesisAudio.value.frequencyInfluence.bass,
            midInfluence: starsGenesisAudio.value.frequencyInfluence.mid,
            highInfluence: starsGenesisAudio.value.frequencyInfluence.high,
        });
    }

    return {
        syncFromKwami,
        applyToKwami,
    };
}
