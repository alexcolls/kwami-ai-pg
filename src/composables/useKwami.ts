import { shallowRef, ref, computed } from 'vue';
import { Kwami } from 'kwami-ai';
import { useVoiceStore } from '@/stores/voice';
import { useAuthStore } from '@/stores/auth';

declare global {
  interface Window {
    kwami: Kwami | null;
  }
}

// Singleton state
const kwamiInstance = shallowRef<Kwami | null>(null);
const rendererType = ref<'blob' | 'crystal' | 'particles' | 'crystal-ball'>('blob');
const isConnected = ref(false);

export function useKwami() {
  // Get auth store for user ID
  const authStore = useAuthStore();

  // User ID from authenticated user, fallback to 'anonymous'
  const userId = computed(() => authStore.userId || 'anonymous');

  function init(canvas: HTMLCanvasElement, renderer: 'blob' | 'crystal' | 'particles' | 'crystal-ball' = 'blob') {
    rendererType.value = renderer;

    // Get voice config from store
    const voiceStore = useVoiceStore();

    // Background colors per renderer
    const getBackgroundColors = () => {
      if (renderer === 'crystal') return ['#050510', '#0a0a20', '#050510'];
      if (renderer === 'particles') return ['#000000', '#0a0a15', '#000000'];
      if (renderer === 'crystal-ball') return ['#0a0510', '#150a20', '#0a0510'];
      return ['#0a0a1a', '#1a1a3a', '#0a0a1a'];
    };

    const config = {
      avatar: {
        renderer: renderer,
        blob: {
          colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
          spikes: { x: 0.3, y: 0.3, z: 0.3 },
          rotation: { x: 0.002, y: 0.003, z: 0.001 },
        },
        crystal: {
          formation: { formation: 'constellation' as 'constellation' | 'helix' | 'vortex' },
          colors: {
            primary: '#00e5ff',
            secondary: '#7c4dff',
            accent: '#ff4081',
          },
          shards: { count: 28 },
          core: {
            size: 0.8,
            glowIntensity: 1.4,
            innerColor: '#ffffff',
            outerColor: '#00ffff',
          },
          scale: 1.0,
          rotation: { x: 0, y: 0.002, z: 0 },
        },
        particles: {
          particleCount: 6000,
          visual: {
            color: '#ffffff',
            glowColor: '#88ccff',
            particleSize: 0.6,
            opacity: 0.95,
            sharpness: 0.7,
          },
          formation: {
            type: 'sphere' as 'sphere' | 'disc' | 'ring' | 'cube',
            radius: 2,
          },
          animation: {
            enabled: true,
            breathing: { enabled: true, speed: 1.0, intensity: 0.15 },
            floating: { enabled: true, speed: 0.5, amplitude: 0.08 },
            rotation: { enabled: true, speedX: 0, speedY: 0.1, speedZ: 0 },
            turbulence: { enabled: true, intensity: 0.02, speed: 1.0 },
          },
          audioEffects: {
            enabled: true,
            reactivity: 1.5,
            bassInfluence: 1.0,
            movementIntensity: 0.5,
          },
        },
        crystalBall: {
          style: { style: 'mystical' as 'mystical' | 'nebula' | 'earth' | 'fire' | 'ocean' },
          colors: { primary: '#6b5b95', secondary: '#feb236' },
          // Tutorial defaults: iterations: 48, depth: 0.6, smoothing: 0.2, displacement: 0.1, speed: 0.071
          volume: { iterations: 48, depth: 0.6, smoothing: 0.2, noiseScale: 2.0 },
          animation: {
            displacementSpeed: 0.071,
            displacementStrength: 0.1,
            rotationSpeed: { x: 0, y: 0.001, z: 0 },
          },
          scale: 4.0,
          roughness: 0.1,
          metalness: 0.0,
          envMapIntensity: 0.8,
          audioEffects: {
            enabled: true,
            reactivity: 1.0,
            smoothing: 0.85,
          },
        },
        scene: {
          enableControls: true,
          background: {
            type: 'gradient' as 'gradient' | 'transparent' | 'solid' | 'image' | 'video',
            gradient: {
              colors: getBackgroundColors(),
              direction: 'radial' as 'radial' | 'vertical' | 'horizontal' | 'diagonal',
            },
          },
        },
      },
      agent: {
        adapter: 'livekit' as 'livekit' | 'custom',
        livekit: {
          url: import.meta.env.VITE_LIVEKIT_URL || '',
          tokenEndpoint: import.meta.env.VITE_LIVEKIT_TOKEN_ENDPOINT || '',
          userId: userId.value, // Use authenticated user ID for memory recall
          voice: voiceStore.voiceConfig,
        },
      },
      persona: {
        name: 'Kwami',
        personality: 'A friendly and helpful AI companion',
        traits: ['friendly', 'helpful', 'curious'],
        conversationStyle: 'friendly',
        responseLength: 'medium' as 'medium' | 'short' | 'long',
        emotionalTone: 'warm' as 'warm' | 'neutral' | 'enthusiastic' | 'calm',
      },
      memory: {
        adapter: 'zep' as 'zep' | 'local',
        zep: {
          apiKey: import.meta.env.VITE_ZEP_API_KEY || '',
          baseUrl: import.meta.env.VITE_ZEP_BASE_URL || '',
        },
      },
    };

    kwamiInstance.value = new Kwami(canvas, config);

    // Track connection state changes
    kwamiInstance.value.agent.onStateChange((state) => {
      const wasConnected = isConnected.value;
      isConnected.value = state !== 'idle';

      if (wasConnected !== isConnected.value) {
        console.log(`🔌 Connection state: ${isConnected.value ? 'connected' : 'disconnected'}`);
      }
    });

    // Expose for debugging
    window.kwami = kwamiInstance.value;
  }

  /**
   * Connect to the agent
   */
  async function connect() {
    if (!kwamiInstance.value) {
      console.warn('Cannot connect: Kwami not initialized');
      return;
    }

    try {
      // Get auth token and voice config before connecting
      const voiceStore = useVoiceStore();
      const authToken = await authStore.getAccessToken();

      // Update config with current user ID, auth token, and voice settings
      kwamiInstance.value.agent.updateConfig({
        livekit: {
          ...kwamiInstance.value.agent.getConfig().livekit,
          userId: userId.value, // Use current authenticated user ID
          authToken: authToken || undefined, // Include auth token for API calls
          voice: voiceStore.voiceConfig,
        },
      });

      await kwamiInstance.value.agent.connect();
      isConnected.value = true;
      console.log(`✅ Connected to agent as user: ${userId.value}`);
    } catch (error) {
      console.error('Failed to connect:', error);
      isConnected.value = false;
    }
  }

  /**
   * Disconnect from the agent
   */
  async function disconnect() {
    if (!kwamiInstance.value) {
      console.warn('Cannot disconnect: Kwami not initialized');
      return;
    }

    try {
      await kwamiInstance.value.agent.disconnect();

      // Safety cleanup: Stop any browser MediaStream tracks that might still be active
      // This ensures the browser mic indicator disappears
      try {
        // Check for any active audio contexts or streams that might keep mic active
        // Note: getUserMedia with audio:false doesn't actually help here, 
        // but cleaning up orphaned elements does
      } catch {
        // Ignore - just a safety check
      }

      // Also remove any orphaned audio elements
      const audioElements = document.querySelectorAll('audio[id^="kwami-"]');
      audioElements.forEach(el => {
        const audioEl = el as HTMLAudioElement;
        audioEl.pause();
        audioEl.srcObject = null;
        el.remove();
      });

      isConnected.value = false;
      console.log('🔌 Disconnected from agent');
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  function switchRenderer(newRenderer: 'blob' | 'crystal' | 'particles' | 'crystal-ball') {
    if (!kwamiInstance.value) {
      console.warn('Cannot switch renderer: Kwami not initialized');
      return;
    }

    // Use the Avatar's built-in switchRenderer method
    kwamiInstance.value.avatar.switchRenderer(newRenderer);
    rendererType.value = newRenderer;

    // Dispatch event for UI sync
    window.dispatchEvent(new CustomEvent('kwami:rendererChanged', { detail: newRenderer }));
    console.log(`🔄 Switched to ${newRenderer} renderer`);
  }

  return {
    kwami: kwamiInstance,
    rendererType,
    isConnected,
    userId,
    init,
    switchRenderer,
    connect,
    disconnect,
  };
}
