<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue';
import { useKwami } from '@/composables/useKwami';
import * as THREE from 'three';
import SceneCamera from './SceneCamera.vue';
import SceneLighting from './SceneLighting.vue';
import SceneBackground from './SceneBackground.vue';

const { kwami } = useKwami();

// Types (Must match child components)
type GradientDirection = 'radial' | 'vertical' | 'horizontal' | 'diagonal';
type BackgroundType = 'gradient' | 'solid' | 'transparent' | 'image' | 'video';
type MediaFit = 'cover' | 'contain' | 'stretch';

interface ScenePanelState {
  camera: { fov: number; distance: number };
  lighting: { top: number; bottom: number; ambient: number };
  background: {
    type: BackgroundType;
    gradient: { 
      colors: [string, string, string]; 
      direction: GradientDirection;
      opacity: number;
      angle: number;
    };
    solidColor: string;
    solidOpacity: number;
    image: {
      url: string;
      fit: MediaFit;
      opacity: number;
    };
    video: {
      url: string;
      fit: MediaFit;
      opacity: number;
      loop: boolean;
      muted: boolean;
    };
  };
}

const state = reactive<ScenePanelState>({
  camera: { fov: 100, distance: 6 },
  lighting: { top: 0.7, bottom: 0.4, ambient: 1.0 },
  background: {
    type: 'gradient',
    gradient: { 
      colors: ['#0a0a1a', '#1a1a3a', '#0a0a1a'], 
      direction: 'radial',
      opacity: 1,
      angle: 45,
    },
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

  if (scene.scene.background instanceof THREE.Color) {
    state.background.type = 'solid';
    state.background.solidColor = '#' + scene.scene.background.getHexString();
  } else if (!scene.scene.background) {
    state.background.type = 'transparent';
  }
}

function updateGradientBackground() {
  const scene = getScene();
  if (!scene || state.background.type !== 'gradient') return;

  const { colors, direction, opacity, angle } = state.background.gradient;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let gradient: CanvasGradient;
  if (direction === 'radial') {
    gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 512);
  } else if (direction === 'horizontal') {
    gradient = ctx.createLinearGradient(0, 0, 512, 0);
  } else if (direction === 'diagonal') {
    // Use angle for diagonal gradients
    const rad = (angle * Math.PI) / 180;
    const x1 = 256 - Math.cos(rad) * 256;
    const y1 = 256 - Math.sin(rad) * 256;
    const x2 = 256 + Math.cos(rad) * 256;
    const y2 = 256 + Math.sin(rad) * 256;
    gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  } else {
    gradient = ctx.createLinearGradient(0, 0, 0, 512);
  }

  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.5, colors[1]);
  gradient.addColorStop(1, colors[2]);
  
  ctx.globalAlpha = opacity;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  scene.scene.background = new THREE.CanvasTexture(canvas);
}

function updateImageBackground() {
  const scene = getScene();
  if (!scene || state.background.type !== 'image') return;
  
  const { url, opacity } = state.background.image;
  if (!url) {
    scene.scene.background = null;
    return;
  }

  // Check if it's a blob URL (local file) or external URL
  const isLocalBlob = url.startsWith('blob:');

  const loader = new THREE.TextureLoader();
  
  // Set crossOrigin for external URLs
  if (!isLocalBlob) {
    loader.setCrossOrigin('anonymous');
  }
  
  loader.load(
    url, 
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      // Apply opacity by modifying the canvas
      const canvas = document.createElement('canvas');
      const img = texture.image as HTMLImageElement;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, 0, 0);
        scene.scene.background = new THREE.CanvasTexture(canvas);
      }
    },
    undefined,
    (error) => {
      console.warn('Failed to load background image:', error);
      // For cross-origin images that fail, try without crossOrigin as fallback
      if (!isLocalBlob) {
        console.info('Tip: External images must have CORS headers or use a local file upload.');
      }
    }
  );
}

function updateVideoBackground() {
  const scene = getScene();
  if (!scene || state.background.type !== 'video') return;
  
  const { url, muted, loop } = state.background.video;
  if (!url) {
    scene.scene.background = null;
    // Cleanup existing video
    const existingVideo = document.getElementById('scene-bg-video') as HTMLVideoElement;
    if (existingVideo) {
      existingVideo.pause();
      existingVideo.src = '';
      existingVideo.remove();
    }
    return;
  }

  // Check if it's a blob URL (local file) or external URL
  const isLocalBlob = url.startsWith('blob:');

  // Get or create video element
  let video = document.getElementById('scene-bg-video') as HTMLVideoElement;
  const isNewVideo = !video;
  
  if (isNewVideo) {
    video = document.createElement('video');
    video.id = 'scene-bg-video';
    video.style.display = 'none';
    document.body.appendChild(video);
  }
  
  // Set crossOrigin for external URLs (not needed for blob URLs)
  if (!isLocalBlob) {
    video.crossOrigin = 'anonymous';
  } else {
    video.removeAttribute('crossOrigin');
  }
  
  video.muted = muted;
  video.loop = loop;
  video.playsInline = true;
  video.preload = 'auto';

  // Handle video load success
  const onCanPlay = () => {
    video.removeEventListener('canplay', onCanPlay);
    video.removeEventListener('error', onError);
    
    video.play().catch((err) => {
      console.warn('Video autoplay failed:', err);
    });

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    scene.scene.background = videoTexture;
  };

  // Handle video load error
  const onError = () => {
    video.removeEventListener('canplay', onCanPlay);
    video.removeEventListener('error', onError);
    console.warn('Failed to load video. Check the URL or file format.');
    scene.scene.background = null;
  };

  video.addEventListener('canplay', onCanPlay);
  video.addEventListener('error', onError);
  
  // Set src last to trigger loading
  video.src = url;
  video.load();
}

function updateSolidBackground() {
  const scene = getScene();
  if (!scene || state.background.type !== 'solid') return;
  
  const color = new THREE.Color(state.background.solidColor);
  // For solid colors with opacity, we use a canvas
  if (state.background.solidOpacity < 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.globalAlpha = state.background.solidOpacity;
      ctx.fillStyle = state.background.solidColor;
      ctx.fillRect(0, 0, 8, 8);
      scene.scene.background = new THREE.CanvasTexture(canvas);
    }
  } else {
    scene.scene.background = color;
  }
}

function updateBackground() {
  const scene = getScene();
  if (!scene) return;
  
  // Cleanup video element if switching away from video
  if (state.background.type !== 'video') {
    const video = document.getElementById('scene-bg-video') as HTMLVideoElement;
    if (video) {
      video.pause();
      video.remove();
    }
  }
  
  if (state.background.type === 'transparent') scene.scene.background = null;
  else if (state.background.type === 'solid') updateSolidBackground();
  else if (state.background.type === 'image') updateImageBackground();
  else if (state.background.type === 'video') updateVideoBackground();
  else updateGradientBackground();
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
watch(
  () => state.lighting.top,
  (v) => {
    const s = getScene();
    if (s) s.lights.top.intensity = v;
  },
);
watch(
  () => state.lighting.bottom,
  (v) => {
    const s = getScene();
    if (s) s.lights.bottom.intensity = v;
  },
);
watch(
  () => state.lighting.ambient,
  (v) => {
    const s = getScene();
    if (s) s.lights.ambient.intensity = v;
  },
);
watch(() => state.background.type, updateBackground);
watch(() => state.background.solidColor, updateSolidBackground);
watch(() => state.background.solidOpacity, updateSolidBackground);
watch(() => state.background.gradient, updateGradientBackground, { deep: true });
watch(() => state.background.image, updateImageBackground, { deep: true });

// Video watchers - separate URL changes from property changes
watch(() => state.background.video.url, updateVideoBackground);
watch(() => state.background.video.muted, (muted) => {
  const video = document.getElementById('scene-bg-video') as HTMLVideoElement;
  if (video) video.muted = muted;
});
watch(() => state.background.video.loop, (loop) => {
  const video = document.getElementById('scene-bg-video') as HTMLVideoElement;
  if (video) video.loop = loop;
});
watch(() => state.background.video.opacity, () => {
  // Video opacity would require shader modification - for now just log
  console.info('Video opacity changes require page reload to take effect');
});

const presets: Record<string, { colors: [string, string, string] }> = {
  midnight: { colors: ['#0a0a1a', '#1a1a3a', '#0a0a1a'] },
  sunset: { colors: ['#1a0a1a', '#3a1a2a', '#1a0a1a'] },
  ocean: { colors: ['#0a1a2a', '#1a2a3a', '#0a1a2a'] },
  forest: { colors: ['#0a1a0a', '#1a2a1a', '#0a1a0a'] },
  cyber: { colors: ['#1a0a2a', '#0a1a3a', '#1a0a2a'] },
  warm: { colors: ['#2a1a0a', '#3a2a1a', '#2a1a0a'] },
  aurora: { colors: ['#0a2a1a', '#1a1a3a', '#2a0a2a'] },
  dusk: { colors: ['#2a1a2a', '#1a1a2a', '#0a1a2a'] },
};

function applyPreset(name: string) {
  const preset = presets[name];
  if (preset) {
    state.background.gradient.colors = [...preset.colors];
    state.background.type = 'gradient';
  }
}

onMounted(() => {
  if (kwami.value) syncFromKwami();
  else
    watch(
      kwami,
      (k) => {
        if (k) syncFromKwami();
      },
      { once: true },
    );
});
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:mountains-duotone" class="panel-icon"></iconify-icon>
      <h2>Scene</h2>
    </div>

    <div class="panel-body">
      <SceneCamera :camera="state.camera" />
      <SceneLighting :lighting="state.lighting" />
      <SceneBackground :background="state.background" @preset="applyPreset" />
    </div>
  </div>
</template>
