import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useKwami } from '@/composables/useKwami';
import { useSceneStore, type BlendMode } from '@/stores/scene';
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// Singleton state
let initialized = false;
let currentHdriTexture: THREE.DataTexture | null = null;
let videoElement: HTMLVideoElement | null = null;
let videoAnimationFrame: number | null = null;

const hdriLoading = ref(false);

export function useSceneBackground() {
  const { kwami } = useKwami();
  const sceneStore = useSceneStore();
  const { background } = storeToRefs(sceneStore);

  function getScene() {
    return kwami.value?.avatar.getScene();
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
    const { gradient } = background.value;
    if (!gradient.enabled) return null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const { type, solidColor, angle, radialCenter, radialSize, stops, orbs, opacity } = gradient;
    
    ctx.globalAlpha = opacity;
    
    if (type === 'solid') {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, width, height);
    } else if (type === 'orbs') {
      for (const orb of orbs) {
        const cx = (orb.x / 100) * width;
        const cy = (orb.y / 100) * height;
        const baseRadius = (orb.size / 100) * Math.max(width, height) * 0.5;
        const blurAmount = (orb.softness / 100) * baseRadius * 0.8;
        
        ctx.save();
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(orb.color, orb.opacity);
        ctx.fill();
        ctx.restore();
      }
    } else {
      const sortedStops = [...stops].sort((a, b) => a.position - b.position);
      let canvasGradient: CanvasGradient;
      
      if (type === 'radial') {
        const cx = (radialCenter.x / 100) * width;
        const cy = (radialCenter.y / 100) * height;
        const radius = (radialSize / 100) * Math.max(width, height);
        canvasGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      } else {
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

      for (const stop of sortedStops) {
        canvasGradient.addColorStop(stop.position / 100, hexToRgba(stop.color, stop.opacity));
      }

      ctx.fillStyle = canvasGradient;
      ctx.fillRect(0, 0, width, height);
    }

    return canvas;
  }

  // Render media layer to canvas with fit support
  function renderMediaToCanvas(
    canvas: HTMLCanvasElement, 
    mediaImage: HTMLImageElement | HTMLVideoElement | null,
    mediaOpacity: number,
    fit: 'cover' | 'contain' | 'stretch' = 'cover'
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx || !mediaImage) return;

    ctx.globalAlpha = mediaOpacity;
    
    const imgWidth = mediaImage instanceof HTMLVideoElement ? mediaImage.videoWidth : mediaImage.width;
    const imgHeight = mediaImage instanceof HTMLVideoElement ? mediaImage.videoHeight : mediaImage.height;
    
    if (!imgWidth || !imgHeight) return;
    
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = imgWidth / imgHeight;
    
    let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;
    
    if (fit === 'stretch') {
      drawWidth = canvas.width;
      drawHeight = canvas.height;
      offsetX = 0;
      offsetY = 0;
    } else if (fit === 'contain') {
      if (imgRatio > canvasRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
    } else {
      if (imgRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = imgWidth * (canvas.height / imgHeight);
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = imgHeight * (canvas.width / imgWidth);
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }
    }
    
    ctx.drawImage(mediaImage, offsetX, offsetY, drawWidth, drawHeight);
  }

  // Composite both layers together
  function compositeBackground(
    mediaImage: HTMLImageElement | HTMLVideoElement | null = null,
    mediaOpacity: number = 1,
    mediaFit: 'cover' | 'contain' | 'stretch' = 'cover'
  ) {
    const scene = getScene();
    if (!scene) return;

    const { media, gradient } = background.value;
    
    if (media.type === 'none' && !gradient.enabled) {
      scene.scene.background = null;
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (media.type !== 'none' && mediaImage) {
      renderMediaToCanvas(canvas, mediaImage, mediaOpacity, mediaFit);
    }

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

  function updateVideoLoop() {
    if (videoElement && background.value.media.type === 'video') {
      const { opacity, fit } = background.value.media.video;
      compositeBackground(videoElement, opacity, fit);
      videoAnimationFrame = requestAnimationFrame(updateVideoLoop);
    }
  }

  function stopVideoLoop() {
    if (videoAnimationFrame) {
      cancelAnimationFrame(videoAnimationFrame);
      videoAnimationFrame = null;
    }
  }

  function loadHdriEnvironment() {
    if (!initialized) return;
    if (background.value.media.type !== 'hdri') return;

    const scene = getScene();
    if (!scene) return;

    const { hdri } = background.value.media;
    
    if (!hdri.url) {
      if (currentHdriTexture) {
        currentHdriTexture.dispose();
        currentHdriTexture = null;
      }
      scene.scene.background = null;
      scene.scene.environment = null;
      return;
    }

    hdriLoading.value = true;

    const rgbeLoader = new RGBELoader();
    rgbeLoader.load(
      hdri.url,
      (texture) => {
        if (currentHdriTexture) {
          currentHdriTexture.dispose();
        }

        texture.mapping = THREE.EquirectangularReflectionMapping;
        currentHdriTexture = texture;
        
        scene.scene.background = texture;
        scene.scene.environment = texture;
        
        if (hdri.blur > 0) {
          const pmremGenerator = new THREE.PMREMGenerator(scene.renderer);
          pmremGenerator.compileEquirectangularShader();
          const envMap = pmremGenerator.fromEquirectangular(texture).texture;
          scene.scene.background = texture;
          scene.scene.environment = envMap;
          pmremGenerator.dispose();
        }
        
        hdriLoading.value = false;
      },
      undefined,
      (error) => {
        console.warn('Failed to load HDRI:', error);
        hdriLoading.value = false;
      }
    );
  }

  function updateHdriProperties() {
    if (!initialized) return;
    if (background.value.media.type !== 'hdri') return;
    
    const scene = getScene();
    if (scene) {
      const { intensity } = background.value.media.hdri;
      scene.renderer.toneMappingExposure = intensity;
    }
  }

  function updateMediaBackground() {
    if (!initialized) return;
    
    const scene = getScene();
    if (!scene) return;

    const { media } = background.value;
    
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
    
    if (media.type !== 'hdri') {
      if (currentHdriTexture) {
        currentHdriTexture.dispose();
        currentHdriTexture = null;
      }
      if (scene) {
        scene.renderer.toneMappingExposure = 1;
      }
    }

    if (media.type === 'none') {
      scene.scene.background = null;
      scene.scene.environment = null;
      compositeBackground();
    } else if (media.type === 'hdri') {
      loadHdriEnvironment();
    } else if (media.type === 'image') {
      const { url, opacity, fit } = media.image;
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
          compositeBackground(img, opacity, fit);
        },
        undefined,
        (error) => {
          console.warn('Failed to load background image:', error);
          compositeBackground();
        }
      );
    } else if (media.type === 'video') {
      const { url, muted, loop } = media.video;
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

  function updateGradientOverlay() {
    if (!initialized) return;
    
    if (background.value.media.type === 'video' && videoElement) {
      return;
    }
    
    if (background.value.media.type === 'image' && background.value.media.image.url) {
      updateMediaBackground();
      return;
    }
    
    compositeBackground();
  }

  function resumeVideoIfNeeded() {
    if (background.value.media.type === 'video' && background.value.media.video.url) {
      const existingVideo = document.getElementById('scene-bg-video') as HTMLVideoElement;
      if (existingVideo && !existingVideo.paused) {
        videoElement = existingVideo;
        if (!videoAnimationFrame) {
          updateVideoLoop();
        }
      }
    }
  }

  // Setup watchers (only once)
  function setupWatchers() {
    // Media watchers
    watch(() => background.value.media.type, updateMediaBackground);
    watch(() => background.value.media.image, updateMediaBackground, { deep: true });
    watch(() => background.value.media.video.url, updateMediaBackground);
    watch(() => background.value.media.video.muted, (muted) => {
      const video = document.getElementById('scene-bg-video') as HTMLVideoElement;
      if (video) video.muted = muted;
    });
    watch(() => background.value.media.video.loop, (loop) => {
      const video = document.getElementById('scene-bg-video') as HTMLVideoElement;
      if (video) video.loop = loop;
    });

    // HDRI watchers
    watch(() => background.value.media.hdri.url, loadHdriEnvironment);
    watch(() => background.value.media.hdri.intensity, updateHdriProperties);
    watch(() => background.value.media.hdri.blur, loadHdriEnvironment);

    // Gradient watchers
    watch(() => background.value.gradient.enabled, updateGradientOverlay);
    watch(() => background.value.gradient.type, updateGradientOverlay);
    watch(() => background.value.gradient.solidColor, updateGradientOverlay);
    watch(() => background.value.gradient.angle, updateGradientOverlay);
    watch(() => background.value.gradient.radialCenter, updateGradientOverlay, { deep: true });
    watch(() => background.value.gradient.radialSize, updateGradientOverlay);
    watch(() => background.value.gradient.stops, updateGradientOverlay, { deep: true });
    watch(() => background.value.gradient.orbs, updateGradientOverlay, { deep: true });
    watch(() => background.value.gradient.opacity, updateGradientOverlay);
    watch(() => background.value.gradient.blendMode, updateGradientOverlay);
  }

  // Initialize the scene background system
  function initialize() {
    if (initialized) return;
    
    // Load settings from localStorage
    sceneStore.loadSettings();
    
    if (kwami.value) {
      initialized = true;
      setupWatchers();
      updateMediaBackground();
      resumeVideoIfNeeded();
    } else {
      // Wait for kwami to be ready
      const unwatch = watch(
        kwami,
        (k) => {
          if (k) {
            initialized = true;
            setupWatchers();
            updateMediaBackground();
            resumeVideoIfNeeded();
            unwatch();
          }
        },
        { immediate: true }
      );
    }
  }

  return {
    initialize,
    hdriLoading,
    updateMediaBackground,
    updateGradientOverlay,
  };
}
