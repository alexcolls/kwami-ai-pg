<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useKwami } from '@/composables/useKwami';
import { hexToRgb } from '@/utils/color';

const { kwami } = useKwami();

const fileInput = ref<HTMLInputElement | null>(null);
const visualizerCanvas = ref<HTMLCanvasElement | null>(null);

const isExpanded = ref(true);
const isLoaded = ref(false);
const isPlaying = ref(false);
const isDraggingSeek = ref(false);
const trackName = ref('Drop in a track');
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.8);
const bass = ref(0);
const mid = ref(0);
const high = ref(0);
const errorMessage = ref('');

let audioElement: HTMLAudioElement | null = null;
let animationFrameId: number | null = null;

const progress = computed(() => {
  if (!duration.value) return 0;
  return Math.min(100, (currentTime.value / duration.value) * 100);
});

const volumePercent = computed(() => Math.round(volume.value * 100));

const energy = computed(() => {
  return Math.min(1, bass.value * 0.5 + mid.value * 0.35 + high.value * 0.15);
});

const playbackLabel = computed(() => {
  if (errorMessage.value) return 'Error';
  if (!isLoaded.value) return 'Ready';
  if (isPlaying.value) return 'Playing';
  if (currentTime.value > 0) return 'Paused';
  return 'Loaded';
});

const helperText = computed(() => {
  if (errorMessage.value) return errorMessage.value;
  if (!isLoaded.value) return 'Load a local song and the avatar will ride the beat.';
  if (isPlaying.value) return 'Your avatar is syncing to the live spectrum in real time.';
  return 'Track loaded. Press play to drive the avatar with the beat.';
});

const bandLevels = computed(() => [
  { key: 'bass', label: 'Bass', value: Math.round(bass.value * 100) },
  { key: 'mid', label: 'Mid', value: Math.round(mid.value * 100) },
  { key: 'high', label: 'High', value: Math.round(high.value * 100) },
]);

const seekTrackStyle = computed(() => ({
  '--range-fill': `${progress.value}%`,
}));

const volumeTrackStyle = computed(() => ({
  '--range-fill': `${volume.value * 100}%`,
}));

type ThemePalette = {
  accentPrimary: string;
  accentSecondary: string;
  accentGlow: string;
};

const themePalette: ThemePalette = {
  accentPrimary: '#00d9ff',
  accentSecondary: '#a855f7',
  accentGlow: 'rgba(0, 217, 255, 0.3)',
};

let themeObserver: MutationObserver | null = null;

function getAudio() {
  return kwami.value?.avatar.getAudio();
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function readCssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;

  const value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function withAlpha(color: string, alpha: number) {
  const normalized = color.trim();
  const hexColor = normalized.startsWith('#') ? normalized : `#${normalized}`;
  const rgb = hexToRgb(hexColor);

  if (rgb) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  const rgbMatch = normalized.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const [r = '255', g = '255', b = '255'] = rgbMatch[1]!.split(',').map((part) => part.trim());
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return normalized;
}

function syncThemePalette() {
  themePalette.accentPrimary = readCssVar('--accent-primary', '#00d9ff');
  themePalette.accentSecondary = readCssVar('--accent-secondary', '#a855f7');
  themePalette.accentGlow = withAlpha(themePalette.accentPrimary, 0.28);
}

function getBandLevels(frequencyData: Uint8Array) {
  if (!frequencyData.length) {
    return { bass: 0, mid: 0, high: 0 };
  }

  const length = frequencyData.length;
  const bassEnd = Math.max(1, Math.floor(length * 0.1));
  const midEnd = Math.max(bassEnd + 1, Math.floor(length * 0.4));

  let bassSum = 0;
  let midSum = 0;
  let highSum = 0;

  for (let i = 0; i < bassEnd; i += 1) bassSum += frequencyData[i] ?? 0;
  for (let i = bassEnd; i < midEnd; i += 1) midSum += frequencyData[i] ?? 0;
  for (let i = midEnd; i < length; i += 1) highSum += frequencyData[i] ?? 0;

  return {
    bass: (bassSum / bassEnd) / 255,
    mid: (midSum / Math.max(1, midEnd - bassEnd)) / 255,
    high: (highSum / Math.max(1, length - midEnd)) / 255,
  };
}

function syncFromAudioElement() {
  const audio = getAudio();
  const element = audio?.getAudioElement();

  if (!audio || !element) {
    isLoaded.value = false;
    isPlaying.value = false;
    currentTime.value = 0;
    duration.value = 0;
    return;
  }

  isLoaded.value = Boolean(element.src);
  isPlaying.value = audio.isPlaying();
  duration.value = Number.isFinite(audio.getDuration()) ? audio.getDuration() : 0;

  if (!isDraggingSeek.value) {
    currentTime.value = audio.getCurrentTime();
  }
}

function setAvatarState(state: 'idle' | 'speaking') {
  if (!kwami.value) return;
  if (kwami.value.getState() === state) return;

  kwami.value.setState(state);
  window.dispatchEvent(new CustomEvent('kwami:stateChanged', { detail: state }));
}

function syncAvatarMusicState(active: boolean) {
  if (active) {
    setAvatarState('speaking');
    return;
  }

  if (kwami.value?.getState() === 'speaking') {
    setAvatarState('idle');
  }
}

function handlePlay() {
  isPlaying.value = true;
  errorMessage.value = '';
  syncFromAudioElement();
  syncAvatarMusicState(true);
}

function handlePause() {
  isPlaying.value = false;
  syncFromAudioElement();
  syncAvatarMusicState(false);
}

function handleEnded() {
  isPlaying.value = false;
  currentTime.value = 0;
  syncAvatarMusicState(false);
}

function handleLoadedMetadata() {
  syncFromAudioElement();
}

function handleTimeUpdate() {
  if (!isDraggingSeek.value) {
    syncFromAudioElement();
  }
}

function handleAudioError() {
  errorMessage.value = 'Could not play this file.';
  isPlaying.value = false;
}

function removeAudioListeners() {
  if (!audioElement) return;

  audioElement.removeEventListener('play', handlePlay);
  audioElement.removeEventListener('pause', handlePause);
  audioElement.removeEventListener('ended', handleEnded);
  audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
  audioElement.removeEventListener('timeupdate', handleTimeUpdate);
  audioElement.removeEventListener('error', handleAudioError);
}

function bindAudioElement() {
  const nextAudioElement = getAudio()?.getAudioElement() ?? null;
  if (nextAudioElement === audioElement) return;

  removeAudioListeners();
  audioElement = nextAudioElement;

  if (!audioElement) return;

  audioElement.addEventListener('play', handlePlay);
  audioElement.addEventListener('pause', handlePause);
  audioElement.addEventListener('ended', handleEnded);
  audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
  audioElement.addEventListener('timeupdate', handleTimeUpdate);
  audioElement.addEventListener('error', handleAudioError);

  syncFromAudioElement();
}

function openFilePicker() {
  fileInput.value?.click();
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  const audio = getAudio();

  if (!file || !audio) return;

  errorMessage.value = '';
  trackName.value = file.name.replace(/\.[^.]+$/, '');

  try {
    await audio.loadAudioFile(file);
    audio.setVolume(volume.value);
    bindAudioElement();
    await audio.play();
  } catch (error) {
    console.error('Failed to load music file:', error);
    errorMessage.value = 'This audio file could not be loaded.';
  } finally {
    input.value = '';
  }
}

async function togglePlayback() {
  const audio = getAudio();
  if (!audio || !isLoaded.value) return;

  try {
    await audio.togglePlayPause();
  } catch (error) {
    console.error('Failed to toggle music playback:', error);
    errorMessage.value = 'Playback was blocked by the browser.';
  }
}

async function handlePrimaryAction() {
  if (isLoaded.value) {
    await togglePlayback();
    return;
  }

  openFilePicker();
}

function stopPlayback() {
  const audio = getAudio();
  if (!audio) return;

  audio.stop();
  currentTime.value = 0;
  bass.value = 0;
  mid.value = 0;
  high.value = 0;
  syncAvatarMusicState(false);
}

function onSeekStart() {
  isDraggingSeek.value = true;
}

function onSeek(event: Event) {
  const audio = getAudio();
  if (!audio) return;

  const value = Number((event.target as HTMLInputElement).value);
  currentTime.value = value;
  audio.setCurrentTime(value);
}

function onSeekEnd() {
  isDraggingSeek.value = false;
}

watch(volume, (nextVolume) => {
  getAudio()?.setVolume(nextVolume);
});

watch(kwami, () => {
  bindAudioElement();
}, { immediate: true });

function drawVisualizerFrame() {
  const canvas = visualizerCanvas.value;
  const ctx = canvas?.getContext('2d');

  if (!canvas || !ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const audio = getAudio();
  const frequencyData = audio?.getFrequencyData() ?? new Uint8Array();
  const hasSignal = isPlaying.value && frequencyData.length > 0;
  const levels = hasSignal ? getBandLevels(frequencyData) : { bass: 0, mid: 0, high: 0 };

  bass.value = levels.bass;
  mid.value = levels.mid;
  high.value = levels.high;

  const avatar = kwami.value?.avatar;
  avatar?.getBlackHole()?.setAudioLevels(levels.bass, levels.mid, levels.high);
  avatar?.getParticlesFace()?.setAudioLevels(levels.bass, levels.mid, levels.high);

  const gradient = ctx.createLinearGradient(0, height, width, 0);
  gradient.addColorStop(0, withAlpha(themePalette.accentPrimary, 0.95));
  gradient.addColorStop(0.5, withAlpha(themePalette.accentSecondary, 0.92));
  gradient.addColorStop(1, withAlpha(themePalette.accentPrimary, 0.6));

  const barCount = 34;
  const barGap = 3;
  const barWidth = (width - barGap * (barCount - 1)) / barCount;
  const step = Math.max(1, Math.floor(frequencyData.length / barCount));

  for (let i = 0; i < barCount; i += 1) {
    const sourceValue = frequencyData[i * step] ?? 0;
    const normalized = hasSignal ? sourceValue / 255 : 0;
    const barHeight = Math.max(4, normalized * height * 0.92);
    const x = i * (barWidth + barGap);
    const y = height - barHeight;

    ctx.fillStyle = gradient;
    ctx.shadowBlur = hasSignal ? 16 : 0;
    ctx.shadowColor = themePalette.accentGlow;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 3);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
}

function animate() {
  drawVisualizerFrame();
  animationFrameId = requestAnimationFrame(animate);
}

onMounted(() => {
  syncThemePalette();
  bindAudioElement();
  animationFrameId = requestAnimationFrame(animate);

  themeObserver = new MutationObserver(() => {
    syncThemePalette();
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style', 'data-theme'],
  });
});

onUnmounted(() => {
  removeAudioListeners();

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }

  themeObserver?.disconnect();
  themeObserver = null;
});
</script>

<template>
  <div
    class="music-player"
    :class="{ expanded: isExpanded, loaded: isLoaded, playing: isPlaying }"
    :style="{ '--player-energy': energy.toFixed(3) }"
  >
    <div class="player-chrome"></div>

    <input
      ref="fileInput"
      type="file"
      accept="audio/*"
      class="hidden-input"
      @change="onFileSelected"
    />

    <div class="player-content">
      <div class="player-header">
        <div class="player-title-wrap">
          <div class="player-badge">
            <span class="status-dot"></span>
            <span>{{ playbackLabel }}</span>
          </div>
          <span class="player-kicker">Avatar Audio Drive</span>
          <strong class="player-title">{{ trackName }}</strong>
          <span class="player-subtitle">
            {{ isLoaded ? 'Theme-aware audio controls for live avatar motion.' : 'Choose a local file to animate the avatar with your music.' }}
          </span>
        </div>

        <div class="header-actions">
          <button class="icon-btn" title="Load music" @click="openFilePicker">
            <iconify-icon icon="ph:upload-simple-bold"></iconify-icon>
          </button>
          <button
            class="icon-btn"
            :title="isExpanded ? 'Collapse player' : 'Expand player'"
            @click="isExpanded = !isExpanded"
          >
            <iconify-icon :icon="isExpanded ? 'ph:caret-down-bold' : 'ph:music-notes-bold'"></iconify-icon>
          </button>
        </div>
      </div>

      <div class="visualizer-card">
        <canvas ref="visualizerCanvas" class="visualizer" width="320" height="88"></canvas>

        <div class="visualizer-footer">
          <div class="time-readout">
            <span>{{ formatTime(currentTime) }}</span>
            <span>/</span>
            <span>{{ formatTime(duration) }}</span>
          </div>

          <div class="band-pills">
            <span
              v-for="band in bandLevels"
              :key="band.key"
              class="band-pill"
              :class="band.key"
            >
              <span>{{ band.label }}</span>
              <strong>{{ band.value }}%</strong>
            </span>
          </div>
        </div>
      </div>

      <div class="transport-row">
        <button
          class="transport-btn primary"
          :disabled="!isLoaded"
          :title="isPlaying ? 'Pause track' : 'Play track'"
          @click="togglePlayback"
        >
          <iconify-icon :icon="isPlaying ? 'ph:pause-fill' : 'ph:play-fill'"></iconify-icon>
        </button>

        <button class="transport-btn" title="Load music" @click="openFilePicker">
          <iconify-icon icon="ph:plus-bold"></iconify-icon>
        </button>

        <button
          class="transport-btn"
          :disabled="!isLoaded"
          title="Stop track"
          @click="stopPlayback"
        >
          <iconify-icon icon="ph:stop-fill"></iconify-icon>
        </button>
      </div>

      <div class="slider-block">
        <div class="slider-label">
          <span>Progress</span>
          <span>{{ Math.round(progress) }}%</span>
        </div>
        <input
          class="range-input"
          :style="seekTrackStyle"
          type="range"
          min="0"
          :max="duration || 0"
          :value="currentTime"
          :disabled="!isLoaded"
          @mousedown="onSeekStart"
          @touchstart="onSeekStart"
          @input="onSeek"
          @change="onSeekEnd"
        />
      </div>

      <div class="slider-block volume-block">
        <div class="slider-label">
          <span>Volume</span>
          <span>{{ volumePercent }}%</span>
        </div>
        <input
          v-model.number="volume"
          class="range-input"
          :style="volumeTrackStyle"
          type="range"
          min="0"
          max="1"
          step="0.01"
        />
      </div>

      <p :class="errorMessage ? 'error-text' : 'helper-text'">{{ helperText }}</p>
    </div>

    <div class="collapsed-content">
      <div class="collapsed-topbar">
        <span class="collapsed-indicator" :class="{ active: isPlaying }"></span>
        <button
          class="icon-btn collapse-toggle"
          :title="isExpanded ? 'Collapse player' : 'Expand player'"
          @click="isExpanded = !isExpanded"
        >
          <iconify-icon :icon="isExpanded ? 'ph:caret-down-bold' : 'ph:music-notes-bold'"></iconify-icon>
        </button>
      </div>

      <button
        class="transport-btn primary collapsed-action"
        :title="isLoaded ? (isPlaying ? 'Pause track' : 'Play track') : 'Load music'"
        @click="handlePrimaryAction"
      >
        <iconify-icon :icon="isLoaded ? (isPlaying ? 'ph:pause-fill' : 'ph:play-fill') : 'ph:upload-simple-bold'"></iconify-icon>
      </button>

      <div class="collapsed-copy">
        <strong>{{ isLoaded ? trackName : 'Load track' }}</strong>
        <span>{{ isLoaded ? playbackLabel : 'Avatar audio drive' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.music-player {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 92px;
  height: 92px;
  padding: 12px;
  border-radius: calc(var(--radius-xl) + 6px);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur, 24px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 24px));
  box-shadow:
    var(--glass-shadow),
    0 0 34px color-mix(in srgb, var(--accent-primary) calc(6% + var(--player-energy) * 20%), transparent);
  overflow: hidden;
  z-index: 120;
  contain: layout paint;
  will-change: width, height, transform;
  transition:
    width 180ms var(--ease-out),
    height 220ms var(--ease-out),
    transform 180ms var(--ease-out),
    border-color var(--duration-fast) var(--ease-in-out);
}

.music-player.expanded {
  width: min(388px, calc(100vw - 32px));
  height: 414px;
}

.music-player:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--accent-primary) 26%, var(--glass-border));
}

.music-player::before,
.music-player::after {
  content: '';
  position: absolute;
  inset: auto;
  border-radius: 999px;
  filter: blur(36px);
  pointer-events: none;
  opacity: calc(0.18 + var(--player-energy) * 0.26);
}

.music-player::before {
  width: 140px;
  height: 140px;
  top: -56px;
  left: -32px;
  background: color-mix(in srgb, var(--accent-primary) 42%, transparent);
}

.music-player::after {
  width: 180px;
  height: 180px;
  right: -72px;
  bottom: -84px;
  background: color-mix(in srgb, var(--accent-secondary) 34%, transparent);
}

.player-chrome {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--glass-highlight) 100%, transparent), transparent 38%),
    linear-gradient(315deg, color-mix(in srgb, var(--surface-2) 100%, transparent), transparent 34%);
  pointer-events: none;
}

.player-content,
.collapsed-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition:
    opacity 160ms ease,
    transform 220ms var(--ease-out),
    max-height 220ms var(--ease-out);
  will-change: opacity, transform;
}

.player-content {
  overflow: hidden;
  opacity: 1;
  transform: translateY(0) scale(1);
  max-height: 360px;
}

.collapsed-content {
  min-height: 68px;
  justify-content: center;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  opacity: 0;
  transform: translateY(6px) scale(0.98);
  max-height: 0;
  pointer-events: none;
}

.music-player:not(.expanded) .player-content {
  opacity: 0;
  transform: translateY(8px) scale(0.985);
  max-height: 0;
  pointer-events: none;
}

.music-player.expanded .collapsed-content {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
  max-height: 0;
  pointer-events: none;
}

.music-player:not(.expanded) .collapsed-content {
  opacity: 1;
  transform: translateY(0) scale(1);
  max-height: 120px;
  pointer-events: auto;
}

.icon-btn,
.transport-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--glass-border);
  background: var(--surface-2);
  color: var(--text-primary);
  cursor: pointer;
  transition:
    transform var(--duration-fast) var(--ease-in-out),
    background var(--duration-fast) var(--ease-in-out),
    border-color var(--duration-fast) var(--ease-in-out),
    box-shadow var(--duration-fast) var(--ease-in-out);
}

.icon-btn:hover,
.transport-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  background: var(--surface-3);
  border-color: color-mix(in srgb, var(--accent-primary) 18%, var(--glass-border));
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
}

.icon-btn iconify-icon,
.transport-btn iconify-icon {
  font-size: 18px;
}

.player-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.player-title-wrap {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.player-badge {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent-primary) 10%, var(--surface-2));
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--text-muted);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--text-muted) 14%, transparent);
}

.music-player.loaded .status-dot {
  background: var(--accent-secondary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-secondary) 18%, transparent);
}

.music-player.playing .status-dot {
  background: var(--accent-primary);
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--accent-primary) 18%, transparent),
    0 0 18px color-mix(in srgb, var(--accent-primary) 32%, transparent);
}

.player-kicker {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.player-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-subtitle {
  font-size: 12px;
  line-height: 1.45;
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.hidden-input {
  display: none;
}

.visualizer-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: calc(var(--radius-xl) + 2px);
  background: color-mix(in srgb, var(--surface-1) 100%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent-primary) 12%, var(--glass-border));
}

.visualizer {
  width: 100%;
  height: 88px;
  display: block;
  border-radius: calc(var(--radius-lg) + 2px);
  background:
    linear-gradient(180deg, var(--surface-2), transparent),
    color-mix(in srgb, var(--surface-1) 100%, transparent);
  border: 1px solid var(--glass-border);
}

.visualizer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.transport-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.transport-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
}

.transport-btn.primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-color: transparent;
  color: white;
  box-shadow: 0 10px 26px var(--accent-glow);
}

.transport-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.time-readout {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-primary);
}

.band-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.band-pill {
  min-width: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-primary);
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.band-pill strong {
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0;
}

.band-pill.bass {
  border-color: color-mix(in srgb, var(--accent-primary) 20%, var(--glass-border));
  background: color-mix(in srgb, var(--accent-primary) 10%, var(--surface-2));
}

.band-pill.mid {
  border-color: color-mix(in srgb, var(--accent-secondary) 20%, var(--glass-border));
  background: color-mix(in srgb, var(--accent-secondary) 10%, var(--surface-2));
}

.band-pill.high {
  border-color: color-mix(in srgb, var(--text-secondary) 16%, var(--glass-border));
  background: color-mix(in srgb, var(--surface-3) 80%, transparent);
}

.slider-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: calc(var(--radius-lg) + 2px);
  background: color-mix(in srgb, var(--surface-1) 100%, transparent);
  border: 1px solid var(--glass-border);
}

.slider-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.range-input {
  width: 100%;
  height: 22px;
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  cursor: pointer;
}

.range-input:focus {
  outline: none;
}

.range-input::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 999px;
  background:
    linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) var(--range-fill), var(--surface-2) var(--range-fill), var(--surface-2) 100%);
}

.range-input::-moz-range-track {
  height: 6px;
  border-radius: 999px;
  background: var(--surface-2);
}

.range-input::-moz-range-progress {
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
}

.range-input::-webkit-slider-thumb {
  width: 18px;
  height: 18px;
  margin-top: -6px;
  border: none;
  border-radius: 50%;
  background: #ffffff;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.24),
    0 0 0 4px color-mix(in srgb, var(--accent-primary) 18%, transparent);
  appearance: none;
  -webkit-appearance: none;
}

.range-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: #ffffff;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.24),
    0 0 0 4px color-mix(in srgb, var(--accent-primary) 18%, transparent);
}

.range-input:hover::-webkit-slider-thumb,
.range-input:active::-webkit-slider-thumb {
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.3),
    0 0 0 5px color-mix(in srgb, var(--accent-primary) 20%, transparent),
    0 0 20px color-mix(in srgb, var(--accent-primary) 24%, transparent);
}

.helper-text,
.error-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
}

.helper-text {
  color: var(--text-secondary);
}

.error-text {
  color: var(--error);
}

.collapsed-topbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.collapsed-indicator {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--surface-4);
}

.collapsed-indicator.active {
  background: var(--accent-primary);
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--accent-primary) 18%, transparent),
    0 0 18px color-mix(in srgb, var(--accent-primary) 24%, transparent);
}

.collapse-toggle {
  width: 34px;
  height: 34px;
}

.collapsed-action {
  width: 52px;
  height: 52px;
  border-radius: calc(var(--radius-lg) + 4px);
}

.collapsed-copy {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: center;
}

.collapsed-copy strong,
.collapsed-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collapsed-copy strong {
  font-size: 12px;
  color: var(--text-primary);
}

.collapsed-copy span {
  font-size: 11px;
  color: var(--text-secondary);
}

:global(body.compact-mode) .music-player {
  right: 12px;
  bottom: 12px;
  padding: 10px;
}

:global(body.compact-mode) .music-player.expanded {
  width: min(352px, calc(100vw - 24px));
  height: 384px;
}

:global(body.compact-mode) .player-content,
:global(body.compact-mode) .collapsed-content {
  gap: 10px;
}

:global(body.compact-mode) .slider-block,
:global(body.compact-mode) .visualizer-card {
  padding: 10px;
}

:global(body.sidebar-right) .music-player {
  right: auto;
  left: 20px;
}

:global(body.sidebar-right.compact-mode) .music-player {
  left: 12px;
}

@media (max-width: 768px) {
  .music-player {
    right: 12px;
    bottom: 12px;
  }

  .music-player.expanded {
    width: min(340px, calc(100vw - 24px));
    height: 388px;
  }

  .visualizer-footer {
    align-items: flex-start;
  }

  .band-pill {
    min-width: 64px;
  }

  :global(body.sidebar-right) .music-player {
    left: 12px;
  }
}
</style>
