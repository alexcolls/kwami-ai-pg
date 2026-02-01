<script setup lang="ts">
import { ref, computed } from 'vue';

type VideoFormat = 'fullscreen' | 'mobile' | 'square';

interface FormatOption {
  id: VideoFormat;
  label: string;
  icon: string;
  aspectRatio: string;
}

const isOpen = ref(false);
const selectedFormat = ref<VideoFormat>('fullscreen');
const isRecording = ref(false);

const formatOptions: FormatOption[] = [
  { id: 'fullscreen', label: 'Full Screen', icon: 'ph:monitor-bold', aspectRatio: '16:9' },
  { id: 'mobile', label: 'Mobile', icon: 'ph:device-mobile-bold', aspectRatio: '9:16' },
  { id: 'square', label: 'Square', icon: 'ph:square-bold', aspectRatio: '1:1' },
];

const selectedOption = computed(() => 
  formatOptions.find(opt => opt.id === selectedFormat.value)
);

function togglePopover() {
  isOpen.value = !isOpen.value;
}

function closePopover() {
  isOpen.value = false;
}

function selectFormat(format: VideoFormat) {
  selectedFormat.value = format;
}

function startRecording() {
  isRecording.value = true;
  // Emit event for parent to handle actual recording logic
  window.dispatchEvent(new CustomEvent('kwami:startRecording', { 
    detail: { 
      format: selectedFormat.value,
      aspectRatio: selectedOption.value?.aspectRatio 
    } 
  }));
  closePopover();
}

function stopRecording() {
  isRecording.value = false;
  window.dispatchEvent(new CustomEvent('kwami:stopRecording'));
}

// Close popover when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.record-control')) {
    closePopover();
  }
}

// Add/remove click listener based on popover state
import { watch, onUnmounted } from 'vue';

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('click', handleClickOutside);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="record-control">
    <!-- Main record button -->
    <button
      class="record-btn"
      :class="{ active: isOpen, recording: isRecording }"
      :title="isRecording ? 'Stop Recording' : 'Record'"
      @click="isRecording ? stopRecording() : togglePopover()"
    >
      <iconify-icon 
        :icon="isRecording ? 'ph:stop-fill' : 'ph:record-fill'" 
        :class="{ pulse: isRecording }"
      ></iconify-icon>
    </button>

    <!-- Popover -->
    <transition name="popover">
      <div v-if="isOpen && !isRecording" class="popover">
        <div class="popover-arrow"></div>
        
        <!-- Header -->
        <div class="popover-header">
          <iconify-icon icon="ph:video-camera-bold"></iconify-icon>
          <span>Record Video</span>
        </div>

        <!-- Format tabs -->
        <div class="format-tabs">
          <button
            v-for="option in formatOptions"
            :key="option.id"
            class="format-tab"
            :class="{ active: selectedFormat === option.id }"
            @click="selectFormat(option.id)"
          >
            <iconify-icon :icon="option.icon"></iconify-icon>
            <span class="format-label">{{ option.label }}</span>
            <span class="format-ratio">{{ option.aspectRatio }}</span>
          </button>
        </div>

        <!-- Preview indicator -->
        <div class="format-preview">
          <div 
            class="preview-box" 
            :class="selectedFormat"
          >
            <iconify-icon icon="ph:camera-bold"></iconify-icon>
          </div>
        </div>

        <!-- Start recording button -->
        <button class="start-btn" @click="startRecording">
          <iconify-icon icon="ph:record-fill"></iconify-icon>
          <span>Start Recording</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.record-control {
  position: relative;
}

/* Main Button */
.record-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}

.record-btn iconify-icon {
  font-size: 18px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.record-btn:hover:not(:disabled) {
  transform: scale(1.05);
  border-color: var(--surface-4);
  background: var(--surface-2);
}

.record-btn:hover:not(:disabled) iconify-icon {
  color: var(--text-primary);
}

.record-btn.active {
  border-color: var(--accent-primary);
  background: var(--accent-glow);
}

.record-btn.active iconify-icon {
  color: var(--accent-primary);
}

/* Recording state */
.record-btn.recording {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: transparent;
  box-shadow: 
    0 4px 20px rgba(239, 68, 68, 0.4),
    0 0 0 0 rgba(239, 68, 68, 0);
}

.record-btn.recording iconify-icon {
  color: white;
}

.record-btn.recording:hover {
  box-shadow: 
    0 6px 28px rgba(239, 68, 68, 0.5),
    0 0 0 4px rgba(239, 68, 68, 0.15);
}

.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Popover */
.popover {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 200px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  z-index: 1000;
}

.popover-arrow {
  position: absolute;
  top: -6px;
  right: 14px;
  width: 12px;
  height: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-bottom: none;
  border-right: none;
  transform: rotate(45deg);
}

/* Popover header */
.popover-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--glass-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.popover-header iconify-icon {
  font-size: 16px;
  color: var(--accent-primary);
}

/* Format tabs */
.format-tabs {
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 4px;
}

.format-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.format-tab iconify-icon {
  font-size: 16px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.format-label {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.format-ratio {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}

.format-tab:hover {
  background: var(--surface-2);
}

.format-tab:hover iconify-icon,
.format-tab:hover .format-label {
  color: var(--text-primary);
}

.format-tab.active {
  background: var(--accent-glow);
  border-color: rgba(0, 217, 255, 0.2);
}

.format-tab.active iconify-icon {
  color: var(--accent-primary);
}

.format-tab.active .format-label {
  color: var(--text-primary);
}

.format-tab.active .format-ratio {
  color: var(--accent-primary);
}

/* Format preview */
.format-preview {
  display: flex;
  justify-content: center;
  padding: 12px 14px;
}

.preview-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-box iconify-icon {
  font-size: 20px;
  color: var(--text-muted);
}

.preview-box.fullscreen {
  width: 80px;
  height: 45px;
}

.preview-box.mobile {
  width: 36px;
  height: 64px;
}

.preview-box.square {
  width: 56px;
  height: 56px;
}

/* Start button */
.start-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 16px);
  margin: 8px;
  margin-top: 4px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
}

.start-btn iconify-icon {
  font-size: 16px;
  color: white;
}

.start-btn span {
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(239, 68, 68, 0.4);
}

.start-btn:active {
  transform: translateY(0);
}

/* Popover transition */
.popover-enter-active,
.popover-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
