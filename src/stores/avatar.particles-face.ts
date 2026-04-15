import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { randomInRange } from '@/utils/color';

export interface ParticlesFaceState {
  color: string;
  secondaryColor: string;
  particleSize: number;
  faceScale: number;
  opacity: number;
  mouthAmplitude: number;
  breathingSpeed: number;
  breathingAmplitude: number;
  driftSpeed: number;
  driftAmplitude: number;
  speakingReactivity: number;
  listeningPulse: number;
  thinkingSpeed: number;
  ambientParticles: number;
  ambientRadius: number;
  depthSpread: number;
  scale: number;
}

export function getDefaultParticlesFaceState(): ParticlesFaceState {
  return {
    color: '#aaccff',
    secondaryColor: '#7744dd',
    particleSize: 0.1,
    faceScale: 2.8,
    opacity: 0.9,
    mouthAmplitude: 0.7,
    breathingSpeed: 1.0,
    breathingAmplitude: 0.006,
    driftSpeed: 0.18,
    driftAmplitude: 0.002,
    speakingReactivity: 1.6,
    listeningPulse: 0.35,
    thinkingSpeed: 1.8,
    ambientParticles: 40,
    ambientRadius: 4.2,
    depthSpread: 1.1,
    scale: 1.0,
  };
}

export const useParticlesFaceStore = defineStore('particlesFace', () => {
  const state = reactive<ParticlesFaceState>(getDefaultParticlesFaceState());

  function clampState(input: ParticlesFaceState): ParticlesFaceState {
    return {
      ...input,
      particleSize: Math.max(0.02, Math.min(0.3, input.particleSize)),
      faceScale: Math.max(1.5, Math.min(4.5, input.faceScale)),
      opacity: Math.max(0.1, Math.min(1, input.opacity)),
      mouthAmplitude: Math.max(0, Math.min(1.5, input.mouthAmplitude)),
      breathingAmplitude: Math.max(0, Math.min(0.03, input.breathingAmplitude)),
      driftAmplitude: Math.max(0, Math.min(0.02, input.driftAmplitude)),
      listeningPulse: Math.max(0, Math.min(2, input.listeningPulse)),
      thinkingSpeed: Math.max(0.5, Math.min(6, input.thinkingSpeed)),
      ambientParticles: Math.max(0, Math.min(200, input.ambientParticles)),
      ambientRadius: Math.max(1, Math.min(10, input.ambientRadius)),
      depthSpread: Math.max(0.2, Math.min(1.8, input.depthSpread)),
      scale: Math.max(0.2, Math.min(3, input.scale)),
    };
  }

  function resetAll() {
    Object.assign(state, clampState(getDefaultParticlesFaceState()));
  }

  function update(updates: Partial<ParticlesFaceState>) {
    Object.assign(state, updates);
  }

  function exportState(): ParticlesFaceState {
    return { ...state };
  }

  function importState(imported: Partial<ParticlesFaceState>) {
    if (imported) {
      Object.assign(state, clampState({ ...getDefaultParticlesFaceState(), ...imported }));
    }
  }

  function randomizeAll() {
    const h1 = Math.floor(Math.random() * 360);
    const h2 = (h1 + 60 + Math.floor(Math.random() * 120)) % 360;
    Object.assign(
      state,
      clampState({
        ...getDefaultParticlesFaceState(),
        color: `hsl(${h1}, 80%, 75%)`,
        secondaryColor: `hsl(${h2}, 70%, 60%)`,
        particleSize: randomInRange(0.02, 0.3, 0.01),
        faceScale: randomInRange(1.5, 4.5, 0.1),
        opacity: randomInRange(0.1, 1, 0.05),
        mouthAmplitude: randomInRange(0, 1.5, 0.05),
        breathingSpeed: randomInRange(0.1, 4, 0.1),
        breathingAmplitude: randomInRange(0, 0.03, 0.001),
        driftSpeed: randomInRange(0, 2, 0.05),
        driftAmplitude: randomInRange(0, 0.02, 0.001),
        speakingReactivity: randomInRange(0, 3, 0.1),
        listeningPulse: randomInRange(0, 2, 0.05),
        thinkingSpeed: randomInRange(0.5, 6, 0.1),
        ambientParticles: Math.floor(randomInRange(0, 200, 5)),
        ambientRadius: randomInRange(1, 10, 0.5),
        depthSpread: randomInRange(0.2, 1.8, 0.05),
        scale: randomInRange(0.2, 3, 0.05),
      }),
    );
  }

  function syncFromKwami(pf: {
    getConfig: () => {
      color: string;
      secondaryColor: string;
      particleSize: number;
      faceScale: number;
      opacity: number;
      mouthAmplitude: number;
      breathingSpeed: number;
      breathingAmplitude: number;
      driftSpeed: number;
      driftAmplitude: number;
      speakingReactivity: number;
      listeningPulse: number;
      thinkingSpeed: number;
      ambientParticles: number;
      ambientRadius: number;
      depthSpread: number;
    };
    getScale: () => number;
  }) {
    const config = pf.getConfig();
    state.color = config.color;
    state.secondaryColor = config.secondaryColor;
    state.particleSize = config.particleSize;
    state.faceScale = config.faceScale;
    state.opacity = config.opacity;
    state.mouthAmplitude = config.mouthAmplitude;
    state.breathingSpeed = config.breathingSpeed;
    state.breathingAmplitude = config.breathingAmplitude;
    state.driftSpeed = config.driftSpeed;
    state.driftAmplitude = config.driftAmplitude;
    state.speakingReactivity = config.speakingReactivity;
    state.listeningPulse = config.listeningPulse;
    state.thinkingSpeed = config.thinkingSpeed;
    state.ambientParticles = config.ambientParticles;
    state.ambientRadius = config.ambientRadius;
    state.depthSpread = config.depthSpread;
    state.scale = pf.getScale();
  }

  return {
    state,
    resetAll,
    update,
    exportState,
    importState,
    syncFromKwami,
    randomizeAll,
  };
});
