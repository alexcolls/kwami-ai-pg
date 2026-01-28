import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface AccentColor {
  name: string;
  primary: string;
  secondary: string;
}

export const accentPresets: AccentColor[] = [
  // Cool tones
  { name: 'Cyan', primary: '#00d9ff', secondary: '#a855f7' },
  { name: 'Azure', primary: '#0ea5e9', secondary: '#06b6d4' },
  { name: 'Blue', primary: '#3b82f6', secondary: '#8b5cf6' },
  { name: 'Indigo', primary: '#6366f1', secondary: '#a855f7' },
  // Warm tones
  { name: 'Purple', primary: '#a855f7', secondary: '#ec4899' },
  { name: 'Violet', primary: '#8b5cf6', secondary: '#d946ef' },
  { name: 'Fuchsia', primary: '#d946ef', secondary: '#f43f5e' },
  { name: 'Pink', primary: '#ec4899', secondary: '#f43f5e' },
  { name: 'Rose', primary: '#f43f5e', secondary: '#fb7185' },
  // Earth tones
  { name: 'Red', primary: '#ef4444', secondary: '#f97316' },
  { name: 'Orange', primary: '#f97316', secondary: '#eab308' },
  { name: 'Amber', primary: '#f59e0b', secondary: '#fbbf24' },
  { name: 'Yellow', primary: '#eab308', secondary: '#84cc16' },
  // Nature tones
  { name: 'Lime', primary: '#84cc16', secondary: '#22c55e' },
  { name: 'Green', primary: '#22c55e', secondary: '#14b8a6' },
  { name: 'Teal', primary: '#14b8a6', secondary: '#06b6d4' },
  // Neutrals
  { name: 'Slate', primary: '#64748b', secondary: '#94a3b8' },
  { name: 'Zinc', primary: '#71717a', secondary: '#a1a1aa' },
];

export const useThemeStore = defineStore('theme', () => {
  // Theme mode
  const mode = ref<ThemeMode>('dark');
  
  // Accent color
  const accentPrimary = ref('#00d9ff');
  const accentSecondary = ref('#a855f7');
  
  // Glass settings
  const glassBlur = ref(24);
  const glassOpacity = ref(88);
  
  // UI settings
  const borderRadius = ref(10); // 0-20
  const animationSpeed = ref(1); // 0.5-2 multiplier
  const surfaceContrast = ref(50); // 0-100, controls surface layer visibility
  const panelBorder = ref(true);
  const glowEffects = ref(true);
  const compactMode = ref(false); // reduces spacing
  
  // Load from localStorage
  function loadSettings() {
    const saved = localStorage.getItem('kwami-theme');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        mode.value = settings.mode || 'dark';
        accentPrimary.value = settings.accentPrimary || '#00d9ff';
        accentSecondary.value = settings.accentSecondary || '#a855f7';
        glassBlur.value = settings.glassBlur ?? 24;
        glassOpacity.value = settings.glassOpacity ?? 88;
        borderRadius.value = settings.borderRadius ?? 10;
        animationSpeed.value = settings.animationSpeed ?? 1;
        surfaceContrast.value = settings.surfaceContrast ?? 50;
        panelBorder.value = settings.panelBorder ?? true;
        glowEffects.value = settings.glowEffects ?? true;
        compactMode.value = settings.compactMode ?? false;
      } catch (e) {
        console.warn('Failed to load theme settings:', e);
      }
    }
    applyTheme();
  }
  
  // Save to localStorage
  function saveSettings() {
    localStorage.setItem('kwami-theme', JSON.stringify({
      mode: mode.value,
      accentPrimary: accentPrimary.value,
      accentSecondary: accentSecondary.value,
      glassBlur: glassBlur.value,
      glassOpacity: glassOpacity.value,
      borderRadius: borderRadius.value,
      animationSpeed: animationSpeed.value,
      surfaceContrast: surfaceContrast.value,
      panelBorder: panelBorder.value,
      glowEffects: glowEffects.value,
      compactMode: compactMode.value,
    }));
  }
  
  // Apply theme to CSS variables
  function applyTheme() {
    const root = document.documentElement;
    
    // Apply accent colors
    root.style.setProperty('--accent-primary', accentPrimary.value);
    root.style.setProperty('--accent-secondary', accentSecondary.value);
    root.style.setProperty('--accent-glow', glowEffects.value ? `${accentPrimary.value}26` : 'transparent');
    root.style.setProperty('--accent-hover', adjustBrightness(accentPrimary.value, 20));
    
    // Apply glass settings
    root.style.setProperty('--glass-blur', `${glassBlur.value}px`);
    
    // Apply UI settings
    root.style.setProperty('--radius-sm', `${Math.max(2, borderRadius.value - 4)}px`);
    root.style.setProperty('--radius-md', `${borderRadius.value}px`);
    root.style.setProperty('--radius-lg', `${borderRadius.value + 4}px`);
    root.style.setProperty('--radius-xl', `${borderRadius.value + 10}px`);
    
    root.style.setProperty('--duration-fast', `${0.15 * animationSpeed.value}s`);
    root.style.setProperty('--duration-normal', `${0.25 * animationSpeed.value}s`);
    root.style.setProperty('--duration-slow', `${0.4 * animationSpeed.value}s`);
    
    root.style.setProperty('--glass-border', panelBorder.value ? 'rgba(255, 255, 255, 0.06)' : 'transparent');
    
    // Compact mode - add/remove class on body
    if (compactMode.value) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
    
    // Surface contrast
    const contrast = surfaceContrast.value / 100;
    
    // Apply glow effects
    if (glowEffects.value) {
      root.style.setProperty('--glass-shadow', '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03) inset');
    } else {
      root.style.setProperty('--glass-shadow', '0 4px 16px rgba(0, 0, 0, 0.3)');
    }
    
    // Apply theme mode
    const effectiveMode = mode.value === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : mode.value;
    
    root.setAttribute('data-theme', effectiveMode);
    
    if (effectiveMode === 'light') {
      root.style.setProperty('--glass-bg', `rgba(255, 255, 255, ${glassOpacity.value / 100})`);
      root.style.setProperty('--glass-border', panelBorder.value ? 'rgba(0, 0, 0, 0.08)' : 'transparent');
      root.style.setProperty('--glass-highlight', 'rgba(0, 0, 0, 0.02)');
      root.style.setProperty('--text-primary', '#1a1a2e');
      root.style.setProperty('--text-secondary', '#4a4a6a');
      root.style.setProperty('--text-muted', '#8a8aa0');
      root.style.setProperty('--surface-1', `rgba(0, 0, 0, ${0.03 * contrast * 2})`);
      root.style.setProperty('--surface-2', `rgba(0, 0, 0, ${0.05 * contrast * 2})`);
      root.style.setProperty('--surface-3', `rgba(0, 0, 0, ${0.08 * contrast * 2})`);
      root.style.setProperty('--surface-4', `rgba(0, 0, 0, ${0.12 * contrast * 2})`);
      if (glowEffects.value) {
        root.style.setProperty('--glass-shadow', '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.03) inset');
      } else {
        root.style.setProperty('--glass-shadow', '0 4px 16px rgba(0, 0, 0, 0.08)');
      }
    } else {
      root.style.setProperty('--glass-bg', `rgba(8, 10, 18, ${glassOpacity.value / 100})`);
      root.style.setProperty('--glass-border', panelBorder.value ? 'rgba(255, 255, 255, 0.06)' : 'transparent');
      root.style.setProperty('--glass-highlight', 'rgba(255, 255, 255, 0.03)');
      root.style.setProperty('--text-primary', '#f4f5f9');
      root.style.setProperty('--text-secondary', '#a0a4b8');
      root.style.setProperty('--text-muted', '#5c6178');
      root.style.setProperty('--surface-1', `rgba(255, 255, 255, ${0.025 * contrast * 2})`);
      root.style.setProperty('--surface-2', `rgba(255, 255, 255, ${0.05 * contrast * 2})`);
      root.style.setProperty('--surface-3', `rgba(255, 255, 255, ${0.08 * contrast * 2})`);
      root.style.setProperty('--surface-4', `rgba(255, 255, 255, ${0.12 * contrast * 2})`);
    }
    
    saveSettings();
  }
  
  // Helper to adjust color brightness
  function adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }
  
  // Actions
  function setMode(newMode: ThemeMode) {
    mode.value = newMode;
    applyTheme();
  }
  
  function setAccent(primary: string, secondary: string) {
    accentPrimary.value = primary;
    accentSecondary.value = secondary;
    applyTheme();
  }
  
  function setAccentPreset(preset: AccentColor) {
    setAccent(preset.primary, preset.secondary);
  }
  
  function setGlassBlur(value: number) {
    glassBlur.value = value;
    applyTheme();
  }
  
  function setGlassOpacity(value: number) {
    glassOpacity.value = value;
    applyTheme();
  }
  
  function setBorderRadius(value: number) {
    borderRadius.value = value;
    applyTheme();
  }
  
  function setAnimationSpeed(value: number) {
    animationSpeed.value = value;
    applyTheme();
  }
  
  function setSurfaceContrast(value: number) {
    surfaceContrast.value = value;
    applyTheme();
  }
  
  function setCompactMode(value: boolean) {
    compactMode.value = value;
    applyTheme();
  }
  
  function setPanelBorder(value: boolean) {
    panelBorder.value = value;
    applyTheme();
  }
  
  function setGlowEffects(value: boolean) {
    glowEffects.value = value;
    applyTheme();
  }
  
  function resetToDefaults() {
    mode.value = 'dark';
    accentPrimary.value = '#00d9ff';
    accentSecondary.value = '#a855f7';
    glassBlur.value = 24;
    glassOpacity.value = 88;
    borderRadius.value = 10;
    animationSpeed.value = 1;
    surfaceContrast.value = 50;
    panelBorder.value = true;
    glowEffects.value = true;
    compactMode.value = false;
    applyTheme();
  }
  
  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (mode.value === 'system') {
        applyTheme();
      }
    });
  }
  
  return {
    // State
    mode,
    accentPrimary,
    accentSecondary,
    glassBlur,
    glassOpacity,
    borderRadius,
    animationSpeed,
    surfaceContrast,
    panelBorder,
    glowEffects,
    compactMode,
    // Actions
    loadSettings,
    setMode,
    setAccent,
    setAccentPreset,
    setGlassBlur,
    setGlassOpacity,
    setBorderRadius,
    setAnimationSpeed,
    setSurfaceContrast,
    setPanelBorder,
    setGlowEffects,
    setCompactMode,
    resetToDefaults,
    applyTheme,
  };
});
