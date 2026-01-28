<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore, accentPresets, type ThemeMode } from '@/stores/theme';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';

const authStore = useAuthStore();
const themeStore = useThemeStore();

// Computed properties
const userEmail = computed(() => authStore.userEmail || 'Unknown');
const userId = computed(() => authStore.userId || 'Unknown');
const userInitials = computed(() => {
  const email = authStore.userEmail;
  if (!email) return '??';
  return email.slice(0, 2).toUpperCase();
});

// Theme mode options
const themeModes: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'dark', label: 'Dark', icon: 'ph:moon-duotone' },
  { value: 'light', label: 'Light', icon: 'ph:sun-duotone' },
  { value: 'system', label: 'Auto', icon: 'ph:desktop-duotone' },
];

// Actions
async function handleLogout() {
  await authStore.signOut();
}

function selectAccent(preset: typeof accentPresets[0]) {
  themeStore.setAccentPreset(preset);
}
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:user-circle-duotone" class="panel-icon"></iconify-icon>
      <h2>Account</h2>
    </div>

    <div class="panel-body">
      <!-- User Profile Card -->
      <PanelSection title="Profile">
        <div class="profile-card">
          <div class="avatar">
            <span class="avatar-initials">{{ userInitials }}</span>
          </div>
          <div class="profile-info">
            <span class="profile-email">{{ userEmail }}</span>
            <span class="profile-status">
              <span class="status-dot"></span>
              Signed in
            </span>
          </div>
        </div>
        <div class="user-id">
          <span class="user-id-label">ID</span>
          <span class="user-id-value" :title="userId">{{ userId }}</span>
        </div>
      </PanelSection>

      <!-- Theme Mode -->
      <PanelSection title="Theme" icon="ph:palette-duotone">
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

      <!-- Accent Color -->
      <PanelSection title="Accent Color" icon="ph:paint-brush-duotone">
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
              :style="{ background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)` }"
            ></span>
          </button>
        </div>
      </PanelSection>

      <!-- Glass Settings -->
      <PanelSection title="Glass Effect" icon="ph:drop-duotone">
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
        </div>
      </PanelSection>

      <!-- UI Settings -->
      <PanelSection title="Interface" icon="ph:sliders-horizontal-duotone">
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
      <PanelSection title="Effects" icon="ph:sparkle-duotone">
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

      <!-- Reset & Sign Out -->
      <PanelSection title="Actions">
        <div class="action-buttons">
          <BaseButton
            variant="secondary"
            icon="ph:arrow-counter-clockwise-duotone"
            block
            @click="themeStore.resetToDefaults"
          >
            Reset Theme
          </BaseButton>
          <BaseButton
            variant="danger"
            icon="ph:sign-out-duotone"
            block
            @click="handleLogout"
          >
            Sign Out
          </BaseButton>
        </div>
      </PanelSection>
    </div>
  </div>
</template>

<style scoped>
/* Profile Card */
.profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--surface-1);
  border-radius: var(--radius-lg);
}

.avatar {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.avatar-initials {
  font-size: 18px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.profile-email {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

/* User ID */
.user-id {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  margin-top: 10px;
  background: var(--surface-1);
  border-radius: var(--radius-md);
  min-height: 36px;
}

.user-id-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  flex-shrink: 0;
  line-height: 1;
}

.user-id-value {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent-primary);
  flex: 1;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: opacity 0.2s ease;
  line-height: 1;
}

.user-id-value:hover {
  opacity: 0.8;
}

/* Theme Mode Buttons */
.theme-modes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
