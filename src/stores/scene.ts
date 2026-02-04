import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';

const STORAGE_KEY = 'kwami-scene';

// Types
export type MediaType = 'none' | 'image' | 'video' | 'hdri';
export type MediaFit = 'cover' | 'contain' | 'stretch';
export type GradientType = 'solid' | 'radial' | 'linear' | 'orbs';
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';

export interface GradientStop {
  color: string;
  position: number; // 0-100
  opacity: number;  // 0-1
}

export interface GradientOrb {
  id: string;
  x: number; // 0-100 position
  y: number; // 0-100 position
  size: number; // 10-100 radius percentage
  color: string;
  opacity: number; // 0-1
  softness: number; // 0-100 edge softness
}

export interface MediaConfig {
  type: MediaType;
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
  hdri: {
    url: string;
    intensity: number; // 0-2, affects lighting intensity
    rotation: number; // 0-360, rotation of environment
    blur: number; // 0-1, background blur amount
  };
}

export interface GradientConfig {
  enabled: boolean;
  type: GradientType;
  solidColor: string; // For solid mode
  angle: number; // 0-360 for linear
  radialCenter: { x: number; y: number }; // 0-100
  radialSize: number; // 0-200 (percentage)
  stops: GradientStop[];
  orbs: GradientOrb[]; // For orbs mode
  opacity: number;
  blendMode: BlendMode;
}

export interface BackgroundConfig {
  media: MediaConfig;
  gradient: GradientConfig;
}

function generateOrbId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const defaultBackground: BackgroundConfig = {
  media: {
    type: 'none',
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
    hdri: {
      url: '',
      intensity: 1,
      rotation: 0,
      blur: 0,
    },
  },
  gradient: {
    enabled: true,
    type: 'radial',
    solidColor: '#0a0a15',
    angle: 180,
    radialCenter: { x: 50, y: 50 },
    radialSize: 120,
    stops: [
      { color: '#050508', position: 0, opacity: 1 },
      { color: '#0a0a12', position: 50, opacity: 1 },
      { color: '#000000', position: 100, opacity: 1 },
    ],
    orbs: [
      { id: generateOrbId(), x: 20, y: 30, size: 40, color: '#0a1520', opacity: 0.6, softness: 80 },
      { id: generateOrbId(), x: 80, y: 70, size: 50, color: '#100a18', opacity: 0.5, softness: 70 },
      { id: generateOrbId(), x: 50, y: 50, size: 60, color: '#080a10', opacity: 0.4, softness: 90 },
    ],
    opacity: 1,
    blendMode: 'normal',
  },
};

export const useSceneStore = defineStore('scene', () => {
  // State
  const background = reactive<BackgroundConfig>(JSON.parse(JSON.stringify(defaultBackground)));

  // ============================================================================
  // Load / Save
  // ============================================================================

  function loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const settings = JSON.parse(saved) as BackgroundConfig;
        
        // Apply media settings
        if (settings.media) {
          background.media.type = settings.media.type || 'none';
          
          if (settings.media.image) {
            background.media.image.url = settings.media.image.url || '';
            background.media.image.fit = settings.media.image.fit || 'cover';
            background.media.image.opacity = settings.media.image.opacity ?? 1;
          }
          
          if (settings.media.video) {
            background.media.video.url = settings.media.video.url || '';
            background.media.video.fit = settings.media.video.fit || 'cover';
            background.media.video.opacity = settings.media.video.opacity ?? 1;
            background.media.video.loop = settings.media.video.loop ?? true;
            background.media.video.muted = settings.media.video.muted ?? true;
          }
          
          if (settings.media.hdri) {
            background.media.hdri.url = settings.media.hdri.url || '';
            background.media.hdri.intensity = settings.media.hdri.intensity ?? 1;
            background.media.hdri.rotation = settings.media.hdri.rotation ?? 0;
            background.media.hdri.blur = settings.media.hdri.blur ?? 0;
          }
        }
        
        // Apply gradient settings
        if (settings.gradient) {
          background.gradient.enabled = settings.gradient.enabled ?? true;
          background.gradient.type = settings.gradient.type || 'radial';
          background.gradient.solidColor = settings.gradient.solidColor || '#0a0a15';
          background.gradient.angle = settings.gradient.angle ?? 180;
          background.gradient.radialCenter = settings.gradient.radialCenter || { x: 50, y: 50 };
          background.gradient.radialSize = settings.gradient.radialSize ?? 100;
          background.gradient.opacity = settings.gradient.opacity ?? 1;
          background.gradient.blendMode = settings.gradient.blendMode || 'normal';
          
          if (settings.gradient.stops && settings.gradient.stops.length >= 2) {
            background.gradient.stops = settings.gradient.stops;
          }
          
          if (settings.gradient.orbs && settings.gradient.orbs.length > 0) {
            background.gradient.orbs = settings.gradient.orbs;
          }
        }
      } catch (e) {
        console.warn('Failed to load scene settings:', e);
      }
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(background));
    } catch (e) {
      console.warn('Failed to save scene settings:', e);
    }
  }

  // Auto-save when background changes
  watch(
    () => background,
    () => {
      saveSettings();
    },
    { deep: true }
  );

  // Actions
  function setMediaType(type: MediaType) {
    background.media.type = type;
  }

  function setImageUrl(url: string) {
    background.media.image.url = url;
  }

  function setImageFit(fit: MediaFit) {
    background.media.image.fit = fit;
  }

  function setImageOpacity(opacity: number) {
    background.media.image.opacity = opacity;
  }

  function setVideoUrl(url: string) {
    background.media.video.url = url;
  }

  function setVideoFit(fit: MediaFit) {
    background.media.video.fit = fit;
  }

  function setVideoOpacity(opacity: number) {
    background.media.video.opacity = opacity;
  }

  function setVideoLoop(loop: boolean) {
    background.media.video.loop = loop;
  }

  function setVideoMuted(muted: boolean) {
    background.media.video.muted = muted;
  }

  function setHdriUrl(url: string) {
    background.media.hdri.url = url;
  }

  function setHdriIntensity(intensity: number) {
    background.media.hdri.intensity = intensity;
  }

  function setHdriRotation(rotation: number) {
    background.media.hdri.rotation = rotation;
  }

  function setHdriBlur(blur: number) {
    background.media.hdri.blur = blur;
  }

  function setGradientEnabled(enabled: boolean) {
    background.gradient.enabled = enabled;
  }

  function setGradientType(type: GradientType) {
    background.gradient.type = type;
  }

  function setGradientAngle(angle: number) {
    background.gradient.angle = angle;
  }

  function setGradientRadialCenter(x: number, y: number) {
    background.gradient.radialCenter = { x, y };
  }

  function setGradientRadialSize(size: number) {
    background.gradient.radialSize = size;
  }

  function setGradientStops(stops: GradientStop[]) {
    background.gradient.stops = stops;
  }

  function addGradientStop(stop: GradientStop) {
    background.gradient.stops.push(stop);
    background.gradient.stops.sort((a, b) => a.position - b.position);
  }

  function removeGradientStop(index: number) {
    if (background.gradient.stops.length > 2) {
      background.gradient.stops.splice(index, 1);
    }
  }

  function setGradientOrbs(orbs: GradientOrb[]) {
    background.gradient.orbs = orbs;
  }

  function addOrb(orb: GradientOrb) {
    background.gradient.orbs.push(orb);
  }

  function removeOrb(index: number) {
    if (background.gradient.orbs.length > 1) {
      background.gradient.orbs.splice(index, 1);
    }
  }

  function setGradientOpacity(opacity: number) {
    background.gradient.opacity = opacity;
  }

  function setGradientBlendMode(blendMode: BlendMode) {
    background.gradient.blendMode = blendMode;
  }

  function resetToDefaults() {
    Object.assign(background, JSON.parse(JSON.stringify(defaultBackground)));
    saveSettings();
  }

  return {
    // State
    background,
    // Persistence
    loadSettings,
    saveSettings,
    // Actions
    setMediaType,
    setImageUrl,
    setImageFit,
    setImageOpacity,
    setVideoUrl,
    setVideoFit,
    setVideoOpacity,
    setVideoLoop,
    setVideoMuted,
    setHdriUrl,
    setHdriIntensity,
    setHdriRotation,
    setHdriBlur,
    setGradientEnabled,
    setGradientType,
    setGradientAngle,
    setGradientRadialCenter,
    setGradientRadialSize,
    setGradientStops,
    addGradientStop,
    removeGradientStop,
    setGradientOrbs,
    addOrb,
    removeOrb,
    setGradientOpacity,
    setGradientBlendMode,
    resetToDefaults,
  };
});
