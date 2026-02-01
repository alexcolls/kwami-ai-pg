import { ref, onUnmounted } from 'vue';

export interface WelcomeAnimationOptions {
  /** Starting scale ratio (default 0.4 = 40% of final) */
  initialScaleRatio?: number;
  /** Final scale value */
  finalScale?: number;
  /** Duration for scaling animation in ms */
  scaleDurationMs?: number;
  /** Target spikes values */
  targetSpikes?: { x: number; y: number; z: number };
  /** Duration for spikes animation in ms */
  spikesDurationMs?: number;
  /** Rotation speeds (radians per frame at ~60fps) */
  rotation?: { x: number; y: number; z?: number };
  /** Whether to auto-rotate */
  autoRotate?: boolean;
}

export interface BlobLike {
  setScale: (value: number) => void;
  getScale: () => number;
  setSpikes: (x: number, y: number, z: number) => void;
  getMesh: () => { rotation: { x: number; y: number; z: number } };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function useWelcomeAnimation(options: WelcomeAnimationOptions = {}) {
  const {
    initialScaleRatio = 0.4,
    finalScale = window.innerWidth <= 768 ? 7.5 : 7.8,
    scaleDurationMs = 2500,
    targetSpikes = { x: 0.05, y: 5.2, z: 0.05 },
    spikesDurationMs = 1250,
    rotation = { x: 0.003, y: 0.012, z: 0 },
    autoRotate = true,
  } = options;

  const isPlaying = ref(false);
  const isComplete = ref(false);
  
  let blob: BlobLike | null = null;
  let rafScale: number | null = null;
  let rafRotate: number | null = null;
  let destroyed = false;

  const resolvedInitialScale = finalScale * initialScaleRatio;

  function animateScaleAndSpikes() {
    if (!blob) return;
    
    const start = performance.now();

    // Start fully spherical and small
    blob.setSpikes(0, 0, 0);
    blob.setScale(resolvedInitialScale);

    const tick = (now: number) => {
      if (destroyed || !isPlaying.value || !blob) return;

      const tScale = Math.min(1, (now - start) / scaleDurationMs);
      const tSpikes = Math.min(1, (now - start) / spikesDurationMs);

      const s = lerp(resolvedInitialScale, finalScale, easeOutCubic(tScale));
      blob.setScale(s);

      const k = easeInOutQuad(tSpikes);
      blob.setSpikes(targetSpikes.x * k, targetSpikes.y * k, targetSpikes.z * k);

      if (tScale < 1 || tSpikes < 1) {
        rafScale = requestAnimationFrame(tick);
      } else {
        rafScale = null;
        isComplete.value = true;
      }
    };

    rafScale = requestAnimationFrame(tick);
  }

  function animateRotation() {
    if (!autoRotate || !blob) return;

    const mesh = blob.getMesh();
    const tick = () => {
      if (destroyed || !isPlaying.value || !blob) return;
      mesh.rotation.y += rotation.y;
      mesh.rotation.x += rotation.x;
      if (rotation.z) mesh.rotation.z += rotation.z;
      rafRotate = requestAnimationFrame(tick);
    };

    rafRotate = requestAnimationFrame(tick);
  }

  function start(blobInstance: BlobLike) {
    if (destroyed || isPlaying.value) return;
    
    blob = blobInstance;
    isPlaying.value = true;
    isComplete.value = false;
    
    animateScaleAndSpikes();
    animateRotation();
  }

  function stop() {
    isPlaying.value = false;
    
    if (rafScale != null) {
      cancelAnimationFrame(rafScale);
      rafScale = null;
    }
    if (rafRotate != null) {
      cancelAnimationFrame(rafRotate);
      rafRotate = null;
    }
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    stop();
    blob = null;
  }

  onUnmounted(() => {
    destroy();
  });

  return {
    isPlaying,
    isComplete,
    start,
    stop,
    destroy,
  };
}
