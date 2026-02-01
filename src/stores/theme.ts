import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ThemeMode = 'dark' | 'light' | 'system' | 'auto';
export type SidebarPosition = 'left' | 'right';

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
  const autoStartTime = ref('06:00');
  const autoEndTime = ref('18:00');
  
  // Accent color
  const accentPrimary = ref('#00d9ff');
  const accentSecondary = ref('#a855f7');
  
  // Glass settings
  const glassBlur = ref(24);
  const glassOpacity = ref(88);
  const glassTint = ref(0); // 0-100, tint with accent color
  const noiseTexture = ref(0); // 0-100, grain intensity
  
  // UI settings
  const borderRadius = ref(10);
  const animationSpeed = ref(1);
  const surfaceContrast = ref(50);
  const panelBorder = ref(true);
  const glowEffects = ref(true);
  const compactMode = ref(false);
  const saturation = ref(100); // 0-200, color saturation
  const sidebarPosition = ref<SidebarPosition>('left');
  const gradientDirection = ref(135); // 0-360 degrees
  const shadowIntensity = ref(50); // 0-100
  
  // Accessibility
  const highContrast = ref(false);
  const focusIndicators = ref(true);
  
  // Cursor flashlight
  const cursorFlashlight = ref(false);
  const flashlightSize = ref(200); // pixels
  const flashlightIntensity = ref(30); // 0-100
  const flashlightColor = ref('#ffffff');
  
  // Load from localStorage
  function loadSettings() {
    const saved = localStorage.getItem('kwami-theme');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        mode.value = settings.mode || 'dark';
        autoStartTime.value = settings.autoStartTime || '06:00';
        autoEndTime.value = settings.autoEndTime || '18:00';
        accentPrimary.value = settings.accentPrimary || '#00d9ff';
        accentSecondary.value = settings.accentSecondary || '#a855f7';
        glassBlur.value = settings.glassBlur ?? 24;
        glassOpacity.value = settings.glassOpacity ?? 88;
        glassTint.value = settings.glassTint ?? 0;
        noiseTexture.value = settings.noiseTexture ?? 0;
        borderRadius.value = settings.borderRadius ?? 10;
        animationSpeed.value = settings.animationSpeed ?? 1;
        surfaceContrast.value = settings.surfaceContrast ?? 50;
        panelBorder.value = settings.panelBorder ?? true;
        glowEffects.value = settings.glowEffects ?? true;
        compactMode.value = settings.compactMode ?? false;
        saturation.value = settings.saturation ?? 100;
        sidebarPosition.value = settings.sidebarPosition || 'left';
        gradientDirection.value = settings.gradientDirection ?? 135;
        shadowIntensity.value = settings.shadowIntensity ?? 50;
        highContrast.value = settings.highContrast ?? false;
        focusIndicators.value = settings.focusIndicators ?? true;
        cursorFlashlight.value = settings.cursorFlashlight ?? false;
        flashlightSize.value = settings.flashlightSize ?? 200;
        flashlightIntensity.value = settings.flashlightIntensity ?? 30;
        flashlightColor.value = settings.flashlightColor || '#ffffff';
      } catch (e) {
        console.warn('Failed to load theme settings:', e);
      }
    }
    applyTheme();
    setupFlashlight();
  }
  
  // Save to localStorage
  function saveSettings() {
    localStorage.setItem('kwami-theme', JSON.stringify({
      mode: mode.value,
      autoStartTime: autoStartTime.value,
      autoEndTime: autoEndTime.value,
      accentPrimary: accentPrimary.value,
      accentSecondary: accentSecondary.value,
      glassBlur: glassBlur.value,
      glassOpacity: glassOpacity.value,
      glassTint: glassTint.value,
      noiseTexture: noiseTexture.value,
      borderRadius: borderRadius.value,
      animationSpeed: animationSpeed.value,
      surfaceContrast: surfaceContrast.value,
      panelBorder: panelBorder.value,
      glowEffects: glowEffects.value,
      compactMode: compactMode.value,
      saturation: saturation.value,
      sidebarPosition: sidebarPosition.value,
      gradientDirection: gradientDirection.value,
      shadowIntensity: shadowIntensity.value,
      highContrast: highContrast.value,
      focusIndicators: focusIndicators.value,
      cursorFlashlight: cursorFlashlight.value,
      flashlightSize: flashlightSize.value,
      flashlightIntensity: flashlightIntensity.value,
      flashlightColor: flashlightColor.value,
    }));
  }
  
  // Apply theme to CSS variables
  function applyTheme() {
    const root = document.documentElement;
    
    // Apply saturation filter
    root.style.setProperty('--saturation', `${saturation.value}%`);
    
    // Apply accent colors
    root.style.setProperty('--accent-primary', accentPrimary.value);
    root.style.setProperty('--accent-secondary', accentSecondary.value);
    root.style.setProperty('--accent-glow', glowEffects.value ? `${accentPrimary.value}26` : 'transparent');
    root.style.setProperty('--accent-hover', adjustBrightness(accentPrimary.value, 20));
    
    // Gradient direction
    root.style.setProperty('--gradient-direction', `${gradientDirection.value}deg`);
    
    // Apply glass settings
    root.style.setProperty('--glass-blur', `${glassBlur.value}px`);
    
    // Noise texture
    root.style.setProperty('--noise-opacity', `${noiseTexture.value / 100}`);
    
    // Shadow intensity
    const shadowBase = shadowIntensity.value / 100;
    root.style.setProperty('--shadow-intensity', `${shadowBase}`);
    
    // Apply UI settings
    root.style.setProperty('--radius-sm', `${Math.max(2, borderRadius.value - 4)}px`);
    root.style.setProperty('--radius-md', `${borderRadius.value}px`);
    root.style.setProperty('--radius-lg', `${borderRadius.value + 4}px`);
    root.style.setProperty('--radius-xl', `${borderRadius.value + 10}px`);
    
    root.style.setProperty('--duration-fast', `${0.15 * animationSpeed.value}s`);
    root.style.setProperty('--duration-normal', `${0.25 * animationSpeed.value}s`);
    root.style.setProperty('--duration-slow', `${0.4 * animationSpeed.value}s`);
    
    root.style.setProperty('--glass-border', panelBorder.value ? 'rgba(255, 255, 255, 0.06)' : 'transparent');
    
    // Compact mode
    if (compactMode.value) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
    
    // High contrast mode
    if (highContrast.value) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Focus indicators
    if (focusIndicators.value) {
      document.body.classList.add('focus-visible');
    } else {
      document.body.classList.remove('focus-visible');
    }
    
    // Sidebar position
    if (sidebarPosition.value === 'right') {
      document.body.classList.add('sidebar-right');
    } else {
      document.body.classList.remove('sidebar-right');
    }
    
    // Surface contrast
    const contrast = surfaceContrast.value / 100;
    
    // Apply glow effects with shadow intensity
    const shadowMult = shadowIntensity.value / 50;
    if (glowEffects.value) {
      root.style.setProperty('--glass-shadow', `0 ${8 * shadowMult}px ${32 * shadowMult}px rgba(0, 0, 0, ${0.5 * shadowMult}), 0 0 0 1px rgba(255, 255, 255, 0.03) inset`);
    } else {
      root.style.setProperty('--glass-shadow', `0 ${4 * shadowMult}px ${16 * shadowMult}px rgba(0, 0, 0, ${0.3 * shadowMult})`);
    }
    
    // Apply theme mode
    let effectiveMode = mode.value;

    if (mode.value === 'system') {
      effectiveMode = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } else if (mode.value === 'auto') {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const [startHour, startMinute] = autoStartTime.value.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      
      const [endHour, endMinute] = autoEndTime.value.split(':').map(Number);
      const endMinutes = endHour * 60 + endMinute;
      
      let isLight = false;
      if (endMinutes > startMinutes) {
        isLight = currentMinutes >= startMinutes && currentMinutes < endMinutes;
      } else {
        isLight = currentMinutes >= startMinutes || currentMinutes < endMinutes;
      }
      
      effectiveMode = isLight ? 'light' : 'dark';
    }
    
    root.setAttribute('data-theme', effectiveMode);
    
    // Glass tint calculation
    const tintAmount = glassTint.value / 100;
    const accentRgb = hexToRgb(accentPrimary.value);
    
    if (effectiveMode === 'light') {
      const baseBg = `rgba(255, 255, 255, ${glassOpacity.value / 100})`;
      const tintedBg = tintAmount > 0 && accentRgb
        ? `rgba(${Math.round(255 * (1 - tintAmount * 0.1) + accentRgb.r * tintAmount * 0.1)}, ${Math.round(255 * (1 - tintAmount * 0.1) + accentRgb.g * tintAmount * 0.1)}, ${Math.round(255 * (1 - tintAmount * 0.1) + accentRgb.b * tintAmount * 0.1)}, ${glassOpacity.value / 100})`
        : baseBg;
      root.style.setProperty('--glass-bg', tintedBg);
      root.style.setProperty('--glass-border', panelBorder.value ? 'rgba(0, 0, 0, 0.08)' : 'transparent');
      root.style.setProperty('--glass-highlight', 'rgba(0, 0, 0, 0.02)');
      
      // High contrast adjustments
      if (highContrast.value) {
        root.style.setProperty('--text-primary', '#000000');
        root.style.setProperty('--text-secondary', '#1a1a1a');
        root.style.setProperty('--text-muted', '#404040');
      } else {
        root.style.setProperty('--text-primary', '#1a1a2e');
        root.style.setProperty('--text-secondary', '#4a4a6a');
        root.style.setProperty('--text-muted', '#8a8aa0');
      }
      
      root.style.setProperty('--surface-1', `rgba(0, 0, 0, ${0.03 * contrast * 2})`);
      root.style.setProperty('--surface-2', `rgba(0, 0, 0, ${0.05 * contrast * 2})`);
      root.style.setProperty('--surface-3', `rgba(0, 0, 0, ${0.08 * contrast * 2})`);
      root.style.setProperty('--surface-4', `rgba(0, 0, 0, ${0.12 * contrast * 2})`);
      
      if (glowEffects.value) {
        root.style.setProperty('--glass-shadow', `0 ${8 * shadowMult}px ${32 * shadowMult}px rgba(0, 0, 0, ${0.1 * shadowMult}), 0 0 0 1px rgba(0, 0, 0, 0.03) inset`);
      } else {
        root.style.setProperty('--glass-shadow', `0 ${4 * shadowMult}px ${16 * shadowMult}px rgba(0, 0, 0, ${0.08 * shadowMult})`);
      }
    } else {
      const baseBg = `rgba(8, 10, 18, ${glassOpacity.value / 100})`;
      const tintedBg = tintAmount > 0 && accentRgb
        ? `rgba(${Math.round(8 * (1 - tintAmount * 0.15) + accentRgb.r * tintAmount * 0.15)}, ${Math.round(10 * (1 - tintAmount * 0.15) + accentRgb.g * tintAmount * 0.15)}, ${Math.round(18 * (1 - tintAmount * 0.15) + accentRgb.b * tintAmount * 0.15)}, ${glassOpacity.value / 100})`
        : baseBg;
      root.style.setProperty('--glass-bg', tintedBg);
      root.style.setProperty('--glass-border', panelBorder.value ? 'rgba(255, 255, 255, 0.06)' : 'transparent');
      root.style.setProperty('--glass-highlight', 'rgba(255, 255, 255, 0.03)');
      
      // High contrast adjustments
      if (highContrast.value) {
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#e0e0e0');
        root.style.setProperty('--text-muted', '#b0b0b0');
      } else {
        root.style.setProperty('--text-primary', '#f4f5f9');
        root.style.setProperty('--text-secondary', '#a0a4b8');
        root.style.setProperty('--text-muted', '#5c6178');
      }
      
      root.style.setProperty('--surface-1', `rgba(255, 255, 255, ${0.025 * contrast * 2})`);
      root.style.setProperty('--surface-2', `rgba(255, 255, 255, ${0.05 * contrast * 2})`);
      root.style.setProperty('--surface-3', `rgba(255, 255, 255, ${0.08 * contrast * 2})`);
      root.style.setProperty('--surface-4', `rgba(255, 255, 255, ${0.12 * contrast * 2})`);
    }
    
    // Flashlight settings
    root.style.setProperty('--flashlight-size', `${flashlightSize.value}px`);
    root.style.setProperty('--flashlight-intensity', `${flashlightIntensity.value / 100}`);
    root.style.setProperty('--flashlight-color', flashlightColor.value);
    
    saveSettings();
  }
  
  // Flashlight effect
  let flashlightElement: HTMLDivElement | null = null;
  
  function setupFlashlight() {
    if (typeof window === 'undefined') return;
    
    // Remove existing flashlight
    if (flashlightElement) {
      flashlightElement.remove();
      flashlightElement = null;
    }
    
    if (!cursorFlashlight.value) return;
    
    // Create flashlight element
    flashlightElement = document.createElement('div');
    flashlightElement.id = 'cursor-flashlight';
    flashlightElement.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      width: var(--flashlight-size);
      height: var(--flashlight-size);
      border-radius: 50%;
      background: radial-gradient(circle, var(--flashlight-color) 0%, transparent 70%);
      opacity: var(--flashlight-intensity);
      transform: translate(-50%, -50%);
      mix-blend-mode: soft-light;
      transition: opacity 0.15s ease;
    `;
    document.body.appendChild(flashlightElement);
    
    document.addEventListener('mousemove', updateFlashlightPosition);
    document.addEventListener('mouseleave', hideFlashlight);
    document.addEventListener('mouseenter', showFlashlight);
  }
  
  function updateFlashlightPosition(e: MouseEvent) {
    if (flashlightElement) {
      flashlightElement.style.left = `${e.clientX}px`;
      flashlightElement.style.top = `${e.clientY}px`;
    }
  }
  
  function hideFlashlight() {
    if (flashlightElement) {
      flashlightElement.style.opacity = '0';
    }
  }
  
  function showFlashlight() {
    if (flashlightElement) {
      flashlightElement.style.opacity = `var(--flashlight-intensity)`;
    }
  }
  
  // Helper functions
  function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
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

  function setAutoStartTime(time: string) {
    autoStartTime.value = time;
    if (mode.value === 'auto') applyTheme();
  }

  function setAutoEndTime(time: string) {
    autoEndTime.value = time;
    if (mode.value === 'auto') applyTheme();
  }
  
  function setAccent(primary: string, secondary: string) {
    accentPrimary.value = primary;
    accentSecondary.value = secondary;
    applyTheme();
  }
  
  function setAccentPrimary(color: string) {
    accentPrimary.value = color;
    applyTheme();
  }
  
  function setAccentSecondary(color: string) {
    accentSecondary.value = color;
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
  
  function setGlassTint(value: number) {
    glassTint.value = value;
    applyTheme();
  }
  
  function setNoiseTexture(value: number) {
    noiseTexture.value = value;
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
  
  function setSaturation(value: number) {
    saturation.value = value;
    applyTheme();
  }
  
  function setSidebarPosition(value: SidebarPosition) {
    sidebarPosition.value = value;
    applyTheme();
  }
  
  function setGradientDirection(value: number) {
    gradientDirection.value = value;
    applyTheme();
  }
  
  function setShadowIntensity(value: number) {
    shadowIntensity.value = value;
    applyTheme();
  }
  
  function setHighContrast(value: boolean) {
    highContrast.value = value;
    applyTheme();
  }
  
  function setFocusIndicators(value: boolean) {
    focusIndicators.value = value;
    applyTheme();
  }
  
  function setCursorFlashlight(value: boolean) {
    cursorFlashlight.value = value;
    applyTheme();
    setupFlashlight();
  }
  
  function setFlashlightSize(value: number) {
    flashlightSize.value = value;
    applyTheme();
  }
  
  function setFlashlightIntensity(value: number) {
    flashlightIntensity.value = value;
    applyTheme();
  }
  
  function setFlashlightColor(value: string) {
    flashlightColor.value = value;
    applyTheme();
  }
  
  function resetToDefaults() {
    mode.value = 'dark';
    autoStartTime.value = '06:00';
    autoEndTime.value = '18:00';
    accentPrimary.value = '#00d9ff';
    accentSecondary.value = '#a855f7';
    glassBlur.value = 24;
    glassOpacity.value = 88;
    glassTint.value = 0;
    noiseTexture.value = 0;
    borderRadius.value = 10;
    animationSpeed.value = 1;
    surfaceContrast.value = 50;
    panelBorder.value = true;
    glowEffects.value = true;
    compactMode.value = false;
    saturation.value = 100;
    sidebarPosition.value = 'left';
    gradientDirection.value = 135;
    shadowIntensity.value = 50;
    highContrast.value = false;
    focusIndicators.value = true;
    cursorFlashlight.value = false;
    flashlightSize.value = 200;
    flashlightIntensity.value = 30;
    flashlightColor.value = '#ffffff';
    applyTheme();
    setupFlashlight();
  }
  
  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (mode.value === 'system') {
        applyTheme();
      }
    });

    // Check auto mode every minute
    setInterval(() => {
      if (mode.value === 'auto') {
        applyTheme();
      }
    }, 60000);
  }
  
  return {
    // State
    mode,
    autoStartTime,
    autoEndTime,
    accentPrimary,
    accentSecondary,
    glassBlur,
    glassOpacity,
    glassTint,
    noiseTexture,
    borderRadius,
    animationSpeed,
    surfaceContrast,
    panelBorder,
    glowEffects,
    compactMode,
    saturation,
    sidebarPosition,
    gradientDirection,
    shadowIntensity,
    highContrast,
    focusIndicators,
    cursorFlashlight,
    flashlightSize,
    flashlightIntensity,
    flashlightColor,
    // Actions
    loadSettings,
    setMode,
    setAutoStartTime,
    setAutoEndTime,
    setAccent,
    setAccentPrimary,
    setAccentSecondary,
    setAccentPreset,
    setGlassBlur,
    setGlassOpacity,
    setGlassTint,
    setNoiseTexture,
    setBorderRadius,
    setAnimationSpeed,
    setSurfaceContrast,
    setPanelBorder,
    setGlowEffects,
    setCompactMode,
    setSaturation,
    setSidebarPosition,
    setGradientDirection,
    setShadowIntensity,
    setHighContrast,
    setFocusIndicators,
    setCursorFlashlight,
    setFlashlightSize,
    setFlashlightIntensity,
    setFlashlightColor,
    resetToDefaults,
    applyTheme,
  };
});
