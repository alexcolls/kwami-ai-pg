import { watch, type Ref } from 'vue';
import { useEyeIrisStore } from '@/stores/avatar.eye-iris';

type KwamiInstance = ReturnType<typeof import('@/composables/useKwami').useKwami>['kwami']['value'];

export interface UseEyeIrisSyncOptions {
  kwami: Ref<KwamiInstance>;
  getEyeIris: () => any | undefined;
}

export function useEyeIrisSync(options: UseEyeIrisSyncOptions) {
  const { getEyeIris } = options;
  const eyeIrisStore = useEyeIrisStore();

  watch(() => eyeIrisStore.state.palettePreset, (v) => getEyeIris()?.setPalettePreset(v));
  watch(() => eyeIrisStore.state.geometry.irisRadius, (v) => getEyeIris()?.setIrisRadius(v));
  watch(() => eyeIrisStore.state.geometry.pupilRadius, (v) => getEyeIris()?.setPupilRadius(v));
  watch(() => eyeIrisStore.state.geometry.limbalRingWidth, (v) => getEyeIris()?.setLimbalRingWidth(v));
  watch(() => eyeIrisStore.state.detail.fiberDensity, (v) => getEyeIris()?.setFiberDensity(v));
  watch(() => eyeIrisStore.state.detail.radialStreakStrength, (v) => getEyeIris()?.setRadialStreakStrength(v));
  watch(() => eyeIrisStore.state.detail.collaretteStrength, (v) => getEyeIris()?.setCollaretteStrength(v));
  watch(() => eyeIrisStore.state.detail.limbalIntensity, (v) => getEyeIris()?.setLimbalIntensity(v));
  watch(() => eyeIrisStore.state.detail.noiseStrength, (v) => getEyeIris()?.setNoiseStrength(v));
  watch(() => eyeIrisStore.state.detail.cryptStrength, (v) => getEyeIris()?.setCryptStrength(v));
  watch(() => eyeIrisStore.state.detail.furrowStrength, (v) => getEyeIris()?.setFurrowStrength(v));
  watch(() => eyeIrisStore.state.detail.ringContrast, (v) => getEyeIris()?.setRingContrast(v));
  watch(() => eyeIrisStore.state.detail.sectorMix, (v) => getEyeIris()?.setSectorMix(v));
  watch(() => eyeIrisStore.state.animation.shimmerSpeed, (v) => getEyeIris()?.setShimmerSpeed(v));
  watch(() => eyeIrisStore.state.animation.shimmerStrength, (v) => getEyeIris()?.setShimmerStrength(v));
  watch(() => eyeIrisStore.state.animation.patternFlow, (v) => getEyeIris()?.setPatternFlow(v));
  watch(() => eyeIrisStore.state.animation.patternRotation, (v) => getEyeIris()?.setPatternRotation(v));
  watch(() => eyeIrisStore.state.scale, (v) => getEyeIris()?.setScale(v));

  watch(
    () => eyeIrisStore.state.color,
    (v) => getEyeIris()?.setColors(v),
    { deep: true },
  );

  watch(
    () => eyeIrisStore.state.audio,
    (v) => {
      const iris = getEyeIris();
      if (!iris) return;
      iris.setAudioEnabled(v.enabled);
      iris.setAudioReactivity(v.reactivity);
    },
    { deep: true },
  );

  function syncFromKwami(): void {
    const renderer = getEyeIris();
    if (!renderer) return;
    eyeIrisStore.syncFromKwami(renderer);
  }

  function applyToKwami(): void {
    const renderer = getEyeIris();
    if (!renderer) return;
    const state = eyeIrisStore.state;
    renderer.setPalettePreset(state.palettePreset);
    renderer.setIrisRadius(state.geometry.irisRadius);
    renderer.setPupilRadius(state.geometry.pupilRadius);
    renderer.setLimbalRingWidth(state.geometry.limbalRingWidth);
    renderer.setFiberDensity(state.detail.fiberDensity);
    renderer.setRadialStreakStrength(state.detail.radialStreakStrength);
    renderer.setCollaretteStrength(state.detail.collaretteStrength);
    renderer.setLimbalIntensity(state.detail.limbalIntensity);
    renderer.setNoiseStrength(state.detail.noiseStrength);
    renderer.setCryptStrength(state.detail.cryptStrength);
    renderer.setFurrowStrength(state.detail.furrowStrength);
    renderer.setRingContrast(state.detail.ringContrast);
    renderer.setSectorMix(state.detail.sectorMix);
    renderer.setColors(state.color);
    renderer.setShimmerSpeed(state.animation.shimmerSpeed);
    renderer.setShimmerStrength(state.animation.shimmerStrength);
    renderer.setPatternFlow(state.animation.patternFlow);
    renderer.setPatternRotation(state.animation.patternRotation);
    renderer.setScale(state.scale);
    renderer.setAudioEnabled(state.audio.enabled);
    renderer.setAudioReactivity(state.audio.reactivity);
  }

  return { syncFromKwami, applyToKwami };
}
