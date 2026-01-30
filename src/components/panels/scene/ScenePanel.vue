<script setup lang="ts">
import { reactive, onMounted, onUnmounted, watch } from 'vue';
import { useKwami } from '@/composables/useKwami';
import * as THREE from 'three';
import SceneCamera from './SceneCamera.vue';
import SceneLighting from './SceneLighting.vue';
import SceneBackground, { type BackgroundConfig, type GradientStop } from './SceneBackground.vue';

const { kwami } = useKwami();

// Types (Must match child components)
type MediaType = 'none' | 'solid' | 'image' | 'video';
type MediaFit = 'cover' | 'contain' | 'stretch';
type GradientType = 'radial' | 'linear';
type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';

interface ScenePanelState {
  camera: { fov: number; distance: number };
  lighting: { top: number; bottom: number; ambient: number };
  background: BackgroundConfig;
}

const state = reactive<ScenePanelState>({
  camera: { fov: 100, distance: 6 },
  lighting: { top: 0.7, bottom: 0.4, ambient: 1.0 },
  background: {
    media: {
      type: 'none',
      solidColor: '#0a0a1a',
      solidOpacity: 1,
      image: {
        url: '',
        fit: 'cover',
        opacity: 1,
      },
      video: {
        url: '',
        fit: 'cover',
        opacity: 1,
        loop: true,
        muted: true,
      },
    },
    gradient: {
      enabled: true,
      type: 'radial',
      angle: 180,
      radialCenter: { x: 50, y: 50 },
      radialSize: 100,
      stops: [
        { color: '#0a0a1a', position: 0, opacity: 1 },
        { color: '#1a1a3a', position: 50, opacity: 1 },
        { color: '#0a0a1a', position: 100, opacity: 1 },
      ],
      opacity: 1,
      blendMode: 'normal',
    },
  },
});

// Logic
function getScene() {
  return kwami.value?.avatar.getScene();
}

function syncFromKwami() {
  const scene = getScene();
  if (!scene) return;
  state.camera.fov = scene.camera.fov;
  state.camera.distance = scene.camera.position.z;
  state.lighting.top = scene.lights.top.intensity;
  state.lighting.bottom = scene.lights.bottom.intensity;
  state.lighting.ambient = scene.lights.ambient.intensity;
}

// Helper to convert hex color + opacity to rgba string
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Canvas blend mode mapping
function getCanvasBlendMode(blendMode: BlendMode): GlobalCompositeOperation {
  const mapping: Record<BlendMode, GlobalCompositeOperation> = {
    'normal': 'source-over',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'soft-light': 'soft-light',
  };
  return mapping[blendMode] || 'source-over';
}

// Create gradient canvas
function createGradientCanvas(width: number, height: number): HTMLCanvasElement | null {
  const { gradient } = state.background;
  if (!gradient.enabled) return null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const { type, angle, radialCenter, radialSize, stops, opacity } = gradient;
  
  // Sort stops by position
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  
  let canvasGradient: CanvasGradient;
  
  if (type === 'radial') {
    // Radial gradient from center
    const cx = (radialCenter.x / 100) * width;
    const cy = (radialCenter.y / 100) * height;
    const radius = (radialSize / 100) * Math.max(width, height);
    canvasGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  } else {
    // Linear gradient with angle
    const rad = (angle * Math.PI) / 180;
    const centerX = width / 2;
    const centerY = height / 2;
    const length = Math.max(width, height);
    const x1 = centerX - Math.cos(rad) * length;
    const y1 = centerY - Math.sin(rad) * length;
    const x2 = centerX + Math.cos(rad) * length;
    const y2 = centerY + Math.sin(rad) * length;
    canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
  }

  // Add color stops
  for (const stop of sortedStops) {
    canvasGradient.addColorStop(stop.position / 100, hexToRgba(stop.color, stop.opacity));
  }

  ctx.globalAlpha = opacity;
  ctx.fillStyle = canvasGradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

// Render media layer to canvas
function renderMediaToCanvas(
  canvas: HTMLCanvasElement, 
  mediaImage: HTMLImageElement | HTMLVideoElement | null,
  mediaOpacity: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { media } = state.background;
  
  if (media.type === 'solid') {
    ctx.globalAlpha = media.solidOpacity;
    ctx.fillStyle = media.solidColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (mediaImage && (media.type === 'image' || media.type === 'video')) {
    ctx.globalAlpha = mediaOpacity;
    // Draw with cover fit
    const imgWidth = mediaImage instanceof HTMLVideoElement ? mediaImage.videoWidth : mediaImage.width;
    const imgHeight = mediaImage instanceof HTMLVideoElement ? mediaImage.videoHeight : mediaImage.height;
    
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = imgWidth / imgHeight;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgRatio > canvasRatio) {
      // Image is wider - fit by height
      drawHeight = canvas.height;
      drawWidth = imgWidth * (canvas.height / imgHeight);
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Image is taller - fit by width
      drawWidth = canvas.width;
      drawHeight = imgHeight * (canvas.width / imgWidth);
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    }
    
    ctx.drawImage(mediaImage, offsetX, offsetY, drawWidth, drawHeight);
  }
}

// Composite both layers together
function compositeBackground(
  mediaImage: HTMLImageElement | HTMLVideoElement | null = null,
  mediaOpacity: number = 1
) {
  const scene = getScene();
  if (!scene) return;

  const { media, gradient } = state.background;
  
  // If both are disabled, clear background
  if (media.type === 'none' && !gradient.enabled) {
    scene.scene.background = null;
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Layer 1: Media background (back)
  if (media.type !== 'none') {
    renderMediaToCanvas(canvas, mediaImage, mediaOpacity);
  }

  // Layer 2: Gradient overlay (front)
  if (gradient.enabled) {
    const gradientCanvas = createGradientCanvas(canvas.width, canvas.height);
    if (gradientCanvas) {
      ctx.globalCompositeOperation = getCanvasBlendMode(gradient.blendMode);
      ctx.drawImage(gradientCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  scene.scene.background = texture;
}

// Video element reference for continuous updates
let videoElement: HTMLVideoElement | null = null;
let videoAnimationFrame: number | null = null;

function updateVideoLoop() {
  if (videoElement && state.background.media.type === 'video') {
    compositeBackground(videoElement, state.background.media.video.opacity);
    videoAnimationFrame = requestAnimationFrame(updateVideoLoop);
  }
}

function stopVideoLoop() {
  if (videoAnimationFrame) {
    cancelAnimationFrame(videoAnimationFrame);
    videoAnimationFrame = null;
  }
}

// Update media layer
function updateMediaBackground() {
  const scene = getScene();
  if (!scene) return;

  const { media } = state.background;
  
  // Cleanup video if not using it
  if (media.type !== 'video') {
    stopVideoLoop();
    const existingVideo = document.getElementById('scene-bg-video') as HTMLVideoElement;
    if (existingVideo) {
      existingVideo.pause();
      existingVideo.src = '';
      existingVideo.remove();
    }
    videoElement = null;
  }

  if (media.type === 'none') {
    compositeBackground();
  } else if (media.type === 'solid') {
    compositeBackground();
  } else if (media.type === 'image') {
    const { url, opacity } = media.image;
    if (!url) {
      compositeBackground();
      return;
    }

    const isLocalBlob = url.startsWith('blob:');
    const loader = new THREE.TextureLoader();
    
    if (!isLocalBlob) {
      loader.setCrossOrigin('anonymous');
    }
    
    loader.load(
      url,
      (texture) => {
        const img = texture.image as HTMLImageElement;
        compositeBackground(img, opacity);
      },
      undefined,
      (error) => {
        console.warn('Failed to load background image:', error);
        compositeBackground();
      }
    );
  } else if (media.type === 'video') {
    const { url, muted, loop, opacity } = media.video;
    if (!url) {
      compositeBackground();
      return;
    }

    const isLocalBlob = url.startsWith('blob:');
    
    let video = document.getElementById('scene-bg-video') as HTMLVideoElement;
    const isNewVideo = !video;
    
    if (isNewVideo) {
      video = document.createElement('video');
      video.id = 'scene-bg-video';
      video.style.display = 'none';
      document.body.appendChild(video);
    }
    
    if (!isLocalBlob) {
      video.crossOrigin = 'anonymous';
    } else {
      video.removeAttribute('crossOrigin');
    }
    
    video.muted = muted;
    video.loop = loop;
    video.playsInline = true;
    video.preload = 'auto';

    const onCanPlay = () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
      
      video.play().catch((err) => {
        console.warn('Video autoplay failed:', err);
      });

      videoElement = video;
      updateVideoLoop();
    };

    const onError = () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
      console.warn('Failed to load video. Check the URL or file format.');
      compositeBackground();
    };

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);
    
    video.src = url;
    video.load();
  }
}

// Update gradient layer
function updateGradientOverlay() {
  // If video is playing, the video loop will handle compositing
  if (state.background.media.type === 'video' && videoElement) {
    return; // Video loop will handle it
  }
  
  // For image, we need to reload the image to recomposite
  if (state.background.media.type === 'image' && state.background.media.image.url) {
    updateMediaBackground();
    return;
  }
  
  // For solid or none, just recomposite
  compositeBackground();
}

// Main update function
function updateBackground() {
  updateMediaBackground();
}

// Watchers
watch(
  () => state.camera.fov,
  (v) => {
    const s = getScene();
    if (s) {
      s.camera.fov = v;
      s.camera.updateProjectionMatrix();
    }
  },
);
watch(
  () => state.camera.distance,
  (v) => {
    const s = getScene();
    if (s) {
      s.camera.position.z = v;
      s.camera.lookAt(0, 0, 0);
    }
  },
);
// Helper to get the current renderer (blob or crystal)
function getRenderer() {
  const avatar = kwami.value?.avatar;
  if (!avatar) return null;
  const blob = avatar.getBlob();
  if (blob) return { type: 'blob' as const, renderer: blob };
  const crystal = avatar.getCrystal();
  if (crystal) return { type: 'crystal' as const, renderer: crystal };
  return null;
}

// Update avatar light position based on scene light intensities
function updateAvatarLighting() {
  const r = getRenderer();
  if (!r) return;
  
  // Check if the method exists (library may need to be rebuilt)
  if (typeof r.renderer.setLightPosition !== 'function') {
    return;
  }
  
  const { top, bottom, ambient } = state.lighting;
  
  // Combine light intensities to create a weighted light position
  // Top light is at (0, 500, 2000), bottom is at (0, -500, 400)
  const topWeight = top;
  const bottomWeight = bottom;
  const totalWeight = topWeight + bottomWeight + 0.01; // avoid division by zero
  
  // Interpolate Y position based on top/bottom balance
  const y = ((topWeight * 500) - (bottomWeight * 500)) / totalWeight;
  // Z is further when top is stronger
  const z = ((topWeight * 2000) + (bottomWeight * 400)) / totalWeight;
  // X stays centered
  const x = 0;
  
  r.renderer.setLightPosition(x, y, z);
}

watch(
  () => state.lighting.top,
  (v) => {
    const s = getScene();
    if (s) s.lights.top.intensity = v;
    updateAvatarLighting();
  },
);
watch(
  () => state.lighting.bottom,
  (v) => {
    const s = getScene();
    if (s) s.lights.bottom.intensity = v;
    updateAvatarLighting();
  },
);
watch(
  () => state.lighting.ambient,
  (v) => {
    const s = getScene();
    if (s) s.lights.ambient.intensity = v;
    // Ambient doesn't affect directional light position, but we could 
    // potentially use it for overall intensity
  },
);

// Media watchers
watch(() => state.background.media.type, updateMediaBackground);
watch(() => state.background.media.solidColor, updateGradientOverlay);
watch(() => state.background.media.solidOpacity, updateGradientOverlay);
watch(() => state.background.media.image, updateMediaBackground, { deep: true });
watch(() => state.background.media.video.url, updateMediaBackground);
watch(() => state.background.media.video.muted, (muted) => {
  const video = document.getElementById('scene-bg-video') as HTMLVideoElement;
  if (video) video.muted = muted;
});
watch(() => state.background.media.video.loop, (loop) => {
  const video = document.getElementById('scene-bg-video') as HTMLVideoElement;
  if (video) video.loop = loop;
});
watch(() => state.background.media.video.opacity, () => {
  // Video opacity is handled in the composite loop
});

// Gradient watchers
watch(() => state.background.gradient.enabled, updateGradientOverlay);
watch(() => state.background.gradient.type, updateGradientOverlay);
watch(() => state.background.gradient.angle, updateGradientOverlay);
watch(() => state.background.gradient.radialCenter, updateGradientOverlay, { deep: true });
watch(() => state.background.gradient.radialSize, updateGradientOverlay);
watch(() => state.background.gradient.stops, updateGradientOverlay, { deep: true });
watch(() => state.background.gradient.opacity, updateGradientOverlay);
watch(() => state.background.gradient.blendMode, updateGradientOverlay);

onMounted(() => {
  if (kwami.value) {
    syncFromKwami();
    updateBackground();
    updateAvatarLighting();
  } else {
    watch(
      kwami,
      (k) => {
        if (k) {
          syncFromKwami();
          updateBackground();
          updateAvatarLighting();
        }
      },
      { once: true },
    );
  }
});

onUnmounted(() => {
  stopVideoLoop();
  const video = document.getElementById('scene-bg-video') as HTMLVideoElement;
  if (video) {
    video.pause();
    video.src = '';
    video.remove();
  }
});
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:mountains-duotone" class="panel-icon"></iconify-icon>
      <h2>Scene</h2>
    </div>

    <div class="panel-body">
      <SceneCamera v-model:camera="state.camera" />
      <SceneLighting v-model:lighting="state.lighting" />
      <SceneBackground v-model:background="state.background" />
    </div>
  </div>
</template>
