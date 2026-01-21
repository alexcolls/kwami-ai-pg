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
type BackgroundType = 'gradient' | 'solid' | 'transparent';

interface ScenePanelState {
  camera: { fov: number; distance: number };
  lighting: { top: number; bottom: number; ambient: number };
  background: {
    type: BackgroundType;
    gradient: { colors: [string, string, string]; direction: GradientDirection };
    solidColor: string;
  };
}

const state = reactive<ScenePanelState>({
  camera: { fov: 100, distance: 6 },
  lighting: { top: 0.7, bottom: 0.4, ambient: 1.0 },
  background: {
    type: 'gradient',
    gradient: { colors: ['#0a0a1a', '#1a1a3a', '#0a0a1a'], direction: 'radial' },
    solidColor: '#0a0a1a',
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

  const { colors, direction } = state.background.gradient;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let gradient: CanvasGradient;
  if (direction === 'radial') gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 512);
  else if (direction === 'horizontal') gradient = ctx.createLinearGradient(0, 0, 512, 0);
  else if (direction === 'diagonal') gradient = ctx.createLinearGradient(0, 0, 512, 512);
  else gradient = ctx.createLinearGradient(0, 0, 0, 512);

  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.5, colors[1]);
  gradient.addColorStop(1, colors[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  scene.scene.background = new THREE.CanvasTexture(canvas);
}

function updateSolidBackground() {
  const scene = getScene();
  if (!scene || state.background.type !== 'solid') return;
  scene.scene.background = new THREE.Color(state.background.solidColor);
}

function updateBackground() {
  const scene = getScene();
  if (!scene) return;
  if (state.background.type === 'transparent') scene.scene.background = null;
  else if (state.background.type === 'solid') updateSolidBackground();
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
watch(() => state.background.gradient, updateGradientBackground, { deep: true });

const presets: Record<string, { colors: [string, string, string] }> = {
  midnight: { colors: ['#0a0a1a', '#1a1a3a', '#0a0a1a'] },
  sunset: { colors: ['#1a0a1a', '#3a1a2a', '#1a0a1a'] },
  ocean: { colors: ['#0a1a2a', '#1a2a3a', '#0a1a2a'] },
  forest: { colors: ['#0a1a0a', '#1a2a1a', '#0a1a0a'] },
  cyber: { colors: ['#1a0a2a', '#0a1a3a', '#1a0a2a'] },
  warm: { colors: ['#2a1a0a', '#3a2a1a', '#2a1a0a'] },
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
