<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  useThemeStore,
  accentPresets,
  themePresets,
  type ThemeMode,
  type SidebarPosition
} from '@/stores/theme';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';

const themeStore = useThemeStore();

// Theme mode options
const themeModes: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'dark', label: 'Dark', icon: 'ph:moon-duotone' },
  { value: 'light', label: 'Light', icon: 'ph:sun-duotone' },
  { value: 'system', label: 'System', icon: 'ph:desktop-duotone' },
  { value: 'auto', label: 'Auto', icon: 'ph:clock-duotone' },
];

// Sidebar position options
const sidebarPositions: { value: SidebarPosition; label: string; icon: string }[] = [
  { value: 'left', label: 'Left', icon: 'ph:sidebar-duotone' },
  { value: 'right', label: 'Right', icon: 'ph:sidebar-simple-duotone' },
];

// Current time for Auto mode display
const currentTime = ref('');
let timeInterval: ReturnType<typeof setInterval> | null = null;

function updateCurrentTime() {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

onMounted(() => {
  updateCurrentTime();
  timeInterval = setInterval(updateCurrentTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});

function selectAccent(preset: typeof accentPresets[0]) {
  themeStore.setAccentPreset(preset);
}

// Export/Import
const showImportDialog = ref(false);
const importJson = ref('');
const importError = ref('');

function handleExport() {
  const json = themeStore.exportTheme();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kwami-theme.json';
  a.click();
  URL.revokeObjectURL(url);
}

function handleImport() {
  importError.value = '';
  const success = themeStore.importTheme(importJson.value);
  if (success) {
    showImportDialog.value = false;
    importJson.value = '';
  } else {
    importError.value = 'Invalid theme format';
  }
}

function handleFileImport(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    importJson.value = e.target?.result as string;
  };
  reader.readAsText(file);
}
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <div class="header-left">
        <iconify-icon icon="ph:palette-duotone" class="panel-icon"></iconify-icon>
        <h2>Theme</h2>
      </div>
      <div class="header-actions">
        <button
          class="icon-btn"
          :disabled="!themeStore.canUndo"
          title="Undo (Ctrl+Z)"
          @click="themeStore.undo"
        >
          <iconify-icon icon="ph:arrow-counter-clockwise-duotone"></iconify-icon>
        </button>
        <button
          class="icon-btn"
          :disabled="!themeStore.canRedo"
          title="Redo (Ctrl+Y)"
          @click="themeStore.redo"
        >
          <iconify-icon icon="ph:arrow-clockwise-duotone"></iconify-icon>
        </button>
      </div>
    </div>

    <div class="panel-body">
      <!-- Theme Presets -->
      <PanelSection title="Presets" icon="ph:stack-duotone" collapsible>
        <div class="preset-grid">
          <button
            v-for="preset in themePresets"
            :key="preset.name"
            class="preset-card"
            @click="themeStore.applyPreset(preset)"
          >
            <iconify-icon :icon="preset.icon" class="preset-icon"></iconify-icon>
            <span class="preset-name">{{ preset.name }}</span>
            <span class="preset-desc">{{ preset.description }}</span>
          </button>
        </div>
      </PanelSection>

      <!-- Theme Mode -->
      <PanelSection title="Mode" icon="ph:circles-four-duotone" collapsible>
        <div class="theme-modes">
          <button
            v-for="mode in themeModes"
            :key="mode.value"
            class="theme-mode-btn"
            :class="{ active: themeStore.mode === mode.value }"
            @click="themeStore.setMode(mode.value)"
          >
            <iconify-icon :icon="mode.icon"></iconify-icon>
            <span>{{ mode.label }}</span>
          </button>
        </div>
      </PanelSection>

      <!-- Auto Mode Schedule -->
      <PanelSection v-if="themeStore.mode === 'auto'" title="Auto Schedule" icon="ph:timer-duotone" collapsible>
        <div class="time-row">
          <div class="time-input">
            <label class="time-label">
              <iconify-icon icon="ph:sun-duotone"></iconify-icon>
              Light
            </label>
            <input
              type="time"
              :value="themeStore.autoStartTime"
              @input="themeStore.setAutoStartTime(($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="time-input">
            <label class="time-label">
              <iconify-icon icon="ph:moon-duotone"></iconify-icon>
              Dark
            </label>
            <input
              type="time"
              :value="themeStore.autoEndTime"
              @input="themeStore.setAutoEndTime(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
        <div class="current-time">
          <iconify-icon icon="ph:clock-duotone"></iconify-icon>
          <span class="current-time-label">Current time:</span>
          <span class="current-time-value">{{ currentTime }}</span>
        </div>
      </PanelSection>

      <!-- Accent Color Presets -->
      <PanelSection title="Accent Presets" icon="ph:paint-brush-duotone" collapsible>
        <div class="accent-grid">
          <button
            v-for="preset in accentPresets"
            :key="preset.name"
            class="accent-btn"
            :class="{ active: themeStore.accentPrimary === preset.primary }"
            :title="preset.name"
            @click="selectAccent(preset)"
          >
            <span 
              class="accent-preview" 
              :style="{ background: `linear-gradient(var(--gradient-direction, 135deg), ${preset.primary} 0%, ${preset.secondary} 100%)` }"
            ></span>
          </button>
        </div>
      </PanelSection>

      <!-- Custom Accent Color -->
      <PanelSection title="Custom Colors" icon="ph:eyedropper-duotone" collapsible>
        <div class="color-pickers">
          <div class="color-picker-item">
            <label class="color-label">Primary</label>
            <div class="color-input-wrapper">
              <input
                type="color"
                :value="themeStore.accentPrimary"
                @input="themeStore.setAccentPrimary(($event.target as HTMLInputElement).value)"
              />
              <span class="color-value">{{ themeStore.accentPrimary }}</span>
            </div>
          </div>
          <div class="color-picker-item">
            <label class="color-label">Secondary</label>
            <div class="color-input-wrapper">
              <input
                type="color"
                :value="themeStore.accentSecondary"
                @input="themeStore.setAccentSecondary(($event.target as HTMLInputElement).value)"
              />
              <span class="color-value">{{ themeStore.accentSecondary }}</span>
            </div>
          </div>
        </div>
        <BaseSlider
          label="Gradient Angle"
          :modelValue="themeStore.gradientDirection"
          @update:modelValue="themeStore.setGradientDirection($event)"
          :min="0"
          :max="360"
          :step="15"
          unit="°"
        />
        <BaseSlider
          label="Saturation"
          :modelValue="themeStore.saturation"
          @update:modelValue="themeStore.setSaturation($event)"
          :min="0"
          :max="200"
          :step="10"
          unit="%"
        />
      </PanelSection>

      <!-- Glass Settings -->
      <PanelSection title="Glass Effect" icon="ph:drop-duotone" collapsible>
        <div class="settings-group">
          <BaseSlider
            label="Blur"
            :modelValue="themeStore.glassBlur"
            @update:modelValue="themeStore.setGlassBlur($event)"
            :min="0"
            :max="48"
            :step="4"
            unit="px"
          />
          <BaseSlider
            label="Opacity"
            :modelValue="themeStore.glassOpacity"
            @update:modelValue="themeStore.setGlassOpacity($event)"
            :min="50"
            :max="100"
            :step="2"
            unit="%"
          />
          <BaseSlider
            label="Tint"
            :modelValue="themeStore.glassTint"
            @update:modelValue="themeStore.setGlassTint($event)"
            :min="0"
            :max="100"
            :step="5"
            unit="%"
          />
          <BaseSlider
            label="Noise"
            :modelValue="themeStore.noiseTexture"
            @update:modelValue="themeStore.setNoiseTexture($event)"
            :min="0"
            :max="100"
            :step="5"
            unit="%"
          />
          <BaseSlider
            label="Shadow"
            :modelValue="themeStore.shadowIntensity"
            @update:modelValue="themeStore.setShadowIntensity($event)"
            :min="0"
            :max="100"
            :step="5"
            unit="%"
          />
        </div>
      </PanelSection>

      <!-- Layout -->
      <PanelSection title="Layout" icon="ph:layout-duotone" collapsible>
        <div class="layout-preview">
          <div class="layout-preview-screen">
            <div 
              class="layout-preview-sidebar" 
              :class="{ right: themeStore.sidebarPosition === 'right' }"
            >
              <div class="layout-preview-nav"></div>
              <div class="layout-preview-panel"></div>
            </div>
            <div class="layout-preview-canvas"></div>
          </div>
        </div>
        <div class="option-group">
          <span class="option-label">Sidebar Position</span>
          <div class="option-buttons">
            <button
              v-for="pos in sidebarPositions"
              :key="pos.value"
              class="option-btn"
              :class="{ active: themeStore.sidebarPosition === pos.value }"
              @click="themeStore.setSidebarPosition(pos.value)"
            >
              <iconify-icon :icon="pos.icon"></iconify-icon>
              {{ pos.label }}
            </button>
          </div>
        </div>
        <p class="layout-hint">
          <iconify-icon icon="ph:info-duotone"></iconify-icon>
          Drag the panel edge to resize
        </p>
      </PanelSection>

      <!-- UI Settings -->
      <PanelSection title="Interface" icon="ph:sliders-horizontal-duotone" collapsible>
        <div class="settings-group">
          <BaseSlider
            label="Roundness"
            :modelValue="themeStore.borderRadius"
            @update:modelValue="themeStore.setBorderRadius($event)"
            :min="0"
            :max="20"
            :step="2"
            unit="px"
          />
          <BaseSlider
            label="Contrast"
            :modelValue="themeStore.surfaceContrast"
            @update:modelValue="themeStore.setSurfaceContrast($event)"
            :min="0"
            :max="100"
            :step="5"
            unit="%"
          />
          <BaseSlider
            label="Animation"
            :modelValue="themeStore.animationSpeed"
            @update:modelValue="themeStore.setAnimationSpeed($event)"
            :min="0.5"
            :max="2"
            :step="0.1"
            unit="x"
          />
        </div>
      </PanelSection>

      <!-- Toggles -->
      <PanelSection title="Effects" icon="ph:sparkle-duotone" collapsible>
        <div class="toggle-group">
          <BaseToggle
            label="Panel Borders"
            :modelValue="themeStore.panelBorder"
            @update:modelValue="themeStore.setPanelBorder($event)"
          />
          <BaseToggle
            label="Glow Effects"
            :modelValue="themeStore.glowEffects"
            @update:modelValue="themeStore.setGlowEffects($event)"
          />
          <BaseToggle
            label="Compact Mode"
            :modelValue="themeStore.compactMode"
            @update:modelValue="themeStore.setCompactMode($event)"
          />
        </div>
      </PanelSection>

      <!-- Accessibility -->
      <PanelSection title="Accessibility" icon="ph:eye-duotone" collapsible>
        <div class="toggle-group">
          <BaseToggle
            label="High Contrast"
            :modelValue="themeStore.highContrast"
            @update:modelValue="themeStore.setHighContrast($event)"
          />
          <BaseToggle
            label="Focus Indicators"
            :modelValue="themeStore.focusIndicators"
            @update:modelValue="themeStore.setFocusIndicators($event)"
          />
        </div>
      </PanelSection>

      <!-- Cursor Flashlight -->
      <PanelSection title="Cursor Flashlight" icon="ph:flashlight-duotone" collapsible>
        <div class="toggle-group">
          <BaseToggle
            label="Enable Flashlight"
            :modelValue="themeStore.cursorFlashlight"
            @update:modelValue="themeStore.setCursorFlashlight($event)"
          />
        </div>
        <template v-if="themeStore.cursorFlashlight">
          <div class="settings-group" style="margin-top: 12px;">
            <BaseSlider
              label="Size"
              :modelValue="themeStore.flashlightSize"
              @update:modelValue="themeStore.setFlashlightSize($event)"
              :min="100"
              :max="500"
              :step="25"
              unit="px"
            />
            <BaseSlider
              label="Intensity"
              :modelValue="themeStore.flashlightIntensity"
              @update:modelValue="themeStore.setFlashlightIntensity($event)"
              :min="10"
              :max="80"
              :step="5"
              unit="%"
            />
            <div class="color-picker-item">
              <label class="color-label">Color</label>
              <div class="color-input-wrapper">
                <input
                  type="color"
                  :value="themeStore.flashlightColor"
                  @input="themeStore.setFlashlightColor(($event.target as HTMLInputElement).value)"
                />
                <span class="color-value">{{ themeStore.flashlightColor }}</span>
              </div>
            </div>
          </div>
        </template>
      </PanelSection>

      <!-- Actions -->
      <PanelSection title="Actions" icon="ph:gear-six-duotone" collapsible>
        <div class="action-buttons">
          <BaseButton
            variant="secondary"
            icon="ph:download-duotone"
            @click="handleExport"
          >
            Export
          </BaseButton>
          <BaseButton
            variant="secondary"
            icon="ph:upload-duotone"
            @click="showImportDialog = true"
          >
            Import
          </BaseButton>
        </div>
        <BaseButton
          variant="secondary"
          icon="ph:arrow-counter-clockwise-duotone"
          block
          style="margin-top: 10px;"
          @click="themeStore.resetToDefaults"
        >
          Reset to Default
        </BaseButton>
      </PanelSection>
    </div>

    <!-- Import Dialog -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showImportDialog" class="modal-overlay" @click.self="showImportDialog = false">
          <div class="modal-container">
            <div class="modal-header">
              <h3>Import Theme</h3>
              <button class="close-btn" @click="showImportDialog = false">
                <iconify-icon icon="ph:x-bold"></iconify-icon>
              </button>
            </div>
            <div class="modal-body">
              <div class="import-option">
                <label class="file-input-label">
                  <iconify-icon icon="ph:file-duotone"></iconify-icon>
                  Choose File
                  <input
                    type="file"
                    accept=".json"
                    @change="handleFileImport"
                  />
                </label>
              </div>
              <div class="or-divider">or paste JSON</div>
              <textarea
                v-model="importJson"
                placeholder='{"mode": "dark", ...}'
                class="import-textarea"
              ></textarea>
              <p v-if="importError" class="import-error">{{ importError }}</p>
            </div>
            <div class="modal-footer">
              <BaseButton variant="ghost" @click="showImportDialog = false">Cancel</BaseButton>
              <BaseButton variant="primary" @click="handleImport">Import</BaseButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Header with undo/redo */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.icon-btn:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--accent-primary);
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.icon-btn iconify-icon {
  font-size: 16px;
}

/* Theme Presets */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.preset-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.preset-card:hover {
  background: var(--surface-2);
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.preset-icon {
  font-size: 24px;
  color: var(--accent-primary);
}

.preset-name {
  font-size: 12px;
  font-weight: 600;
}

.preset-desc {
  font-size: 10px;
  color: var(--text-muted);
}

/* Theme Mode Buttons */
.theme-modes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.theme-mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.theme-mode-btn iconify-icon {
  font-size: 20px;
}

.theme-mode-btn span {
  font-size: 10px;
  font-weight: 500;
}

.theme-mode-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.theme-mode-btn.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* Accent Color Grid */
.accent-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.accent-btn {
  aspect-ratio: 1;
  padding: 3px;
  background: var(--surface-1);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.accent-btn:hover {
  transform: scale(1.12);
  z-index: 1;
}

.accent-btn.active {
  border-color: var(--text-primary);
  box-shadow: 0 0 12px var(--accent-glow);
}

.accent-preview {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: calc(var(--radius-sm) - 2px);
}

/* Color Pickers */
.color-pickers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}

.color-picker-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.color-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--surface-1);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.color-input-wrapper input[type="color"] {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: none;
  cursor: pointer;
}

.color-input-wrapper input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input-wrapper input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: var(--radius-sm);
}

.color-value {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
  text-transform: uppercase;
}

/* Option Buttons */
.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
}

.option-buttons {
  display: flex;
  gap: 6px;
}

.option-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.option-btn iconify-icon {
  font-size: 14px;
}

.option-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.option-btn.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* Settings Groups */
.settings-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Time Row for Auto Schedule */
.time-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.time-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.time-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
}

.time-label iconify-icon {
  font-size: 14px;
  color: var(--text-muted);
}

.time-input input[type="time"] {
  width: 100%;
  padding: 10px 12px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  transition: all var(--duration-fast) ease;
}

.time-input input[type="time"]:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: var(--surface-2);
}

.time-input input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(0.7);
  cursor: pointer;
}

/* Current Time Display */
.current-time {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-top: 12px;
  background: var(--surface-1);
  border-radius: var(--radius-md);
}

.current-time iconify-icon {
  font-size: 16px;
  color: var(--accent-primary);
}

.current-time-label {
  font-size: 12px;
  color: var(--text-muted);
}

.current-time-value {
  font-size: 14px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-primary);
  margin-left: auto;
}

/* Layout Preview */
.layout-preview {
  margin-bottom: 14px;
}

.layout-preview-screen {
  position: relative;
  width: 100%;
  height: 64px;
  background: var(--surface-1);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  overflow: hidden;
}

.layout-preview-sidebar {
  position: absolute;
  left: 6px;
  top: 6px;
  bottom: 6px;
  display: flex;
  gap: 4px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.layout-preview-sidebar.right {
  left: auto;
  right: 6px;
  flex-direction: row-reverse;
}

.layout-preview-nav {
  width: 8px;
  height: 100%;
  background: var(--accent-primary);
  border-radius: 4px;
  opacity: 0.8;
}

.layout-preview-panel {
  width: 32px;
  height: 100%;
  background: var(--surface-3);
  border-radius: 4px;
}

.layout-preview-canvas {
  position: absolute;
  inset: 6px;
  left: 52px;
  right: 6px;
  background: radial-gradient(circle at center, var(--accent-glow), transparent 70%);
  border-radius: 4px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.layout-preview-sidebar.right ~ .layout-preview-canvas {
  left: 6px;
  right: 52px;
}

/* Layout hint */
.layout-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 10px;
  background: var(--surface-1);
  border-radius: var(--radius-md);
  font-size: 11px;
  color: var(--text-muted);
}

.layout-hint iconify-icon {
  font-size: 14px;
  color: var(--accent-primary);
}

/* Action Buttons */
.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 100%;
  max-width: 400px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  backdrop-filter: blur(var(--glass-blur));
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.close-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
}

.import-option {
  display: flex;
  justify-content: center;
}

.file-input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--surface-1);
  border: 1px dashed var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.file-input-label:hover {
  background: var(--surface-2);
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.file-input-label input {
  display: none;
}

.or-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.or-divider::before,
.or-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--glass-border);
}

.import-textarea {
  width: 100%;
  height: 120px;
  padding: 12px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  resize: vertical;
}

.import-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.import-error {
  margin-top: 8px;
  font-size: 12px;
  color: #ef4444;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--glass-border);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
