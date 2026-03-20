import { shallowRef, ref, computed } from 'vue';
import { Kwami } from 'kwami';
import type { KwamiConfig } from 'kwami';
import { useVoiceStore } from '@/stores/voice';
import { useAuthStore } from '@/stores/auth';
import { useWorkspaceStore } from '@/stores/workspace';

declare global {
  interface Window {
    kwami: Kwami | null;
  }
}

// Singleton state
const kwamiInstance = shallowRef<Kwami | null>(null);
const rendererType = ref<'blob-xyz' | 'black-hole' | 'particles-face'>('blob-xyz');
const isConnected = ref(false);

export function useKwami() {
  const authStore = useAuthStore();
  const workspaceStore = useWorkspaceStore();

  /** Per-kwami memory user id: kwami_<authUserId>_<activeKwamiId>. Each kwami has its own memory. */
  const memoryUserId = computed(() => {
    const uid = authStore.userId || 'anonymous';
    const kwamiId = workspaceStore.activeWorkspaceId;
    return kwamiId ? `kwami_${uid}_${kwamiId}` : `kwami_${uid}`;
  });

  /** @deprecated Use memoryUserId for memory/agent. Kept for compatibility. */
  const userId = computed(() => authStore.userId || 'anonymous');

  function init(
    canvas: HTMLCanvasElement,
    renderer: 'blob-xyz' | 'black-hole' | 'particles-face' = 'blob-xyz',
    options?: {
      onSearchResults?: (data: { query: string; results: Array<{ title: string; url: string; content: string }>; answer: string | null }) => void;
    },
  ) {
    rendererType.value = renderer;

    // Get voice config from store
    const voiceStore = useVoiceStore();

    const config: KwamiConfig = {
      avatar: {
        renderer: renderer,
        blob: {
          colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
          spikes: { x: 0.3, y: 0.3, z: 0.3 },
          rotation: { x: 0.002, y: 0.003, z: 0.001 },
        },
        scene: {
          enableControls: true,
        },
      },
      agent: {
        adapter: 'livekit' as 'livekit' | 'custom',
        livekit: {
          url: import.meta.env.VITE_LIVEKIT_URL || '',
          tokenEndpoint: import.meta.env.VITE_LIVEKIT_TOKEN_ENDPOINT || '',
          userId: memoryUserId.value, // Per-kwami memory id so each kwami has its own memory
          voice: voiceStore.voiceConfig,
          ...(options?.onSearchResults && { onSearchResults: options.onSearchResults }),
        },
      },
      soul: {
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

    // Web search runs on the LiveKit agent (server-side); results are sent via data channel
    // and displayed when the client receives the 'search_results' message (see useSearchResults).

    // Track connection state changes
    kwamiInstance.value.agent.onStateChange((state) => {
      const wasConnected = isConnected.value;
      isConnected.value = state !== 'idle';

      if (wasConnected !== isConnected.value) {
        console.log(`🔌 Connection state: ${isConnected.value ? 'connected' : 'disconnected'}`);
        if (!isConnected.value) {
          window.dispatchEvent(new CustomEvent('kwami:disconnected'));
        }
      }
    });

    // Expose for debugging
    window.kwami = kwamiInstance.value;
  }

  /**
   * Sync all persisted panel configs to the backend agent after connecting.
   * This ensures soul, enhancements, voice, and model settings are applied
   * regardless of which panel is currently mounted.
   */
  function syncAllConfigToBackend(kwami: Kwami, voiceStore: ReturnType<typeof useVoiceStore>) {
    const agent = kwami.agent;

    // 1. Soul config
    const soulConfig = kwami.soul.getConfig();
    agent.syncConfigToBackend('soul', {
      name: soulConfig.name,
      personality: soulConfig.personality,
      systemPrompt: soulConfig.systemPrompt,
      traits: soulConfig.traits || [],
      conversationStyle: soulConfig.conversationStyle,
      responseLength: soulConfig.responseLength,
      emotionalTone: soulConfig.emotionalTone,
      emotionalTraits: soulConfig.emotionalTraits,
    });

    // 2. Enhancements + VAD config
    const eState = voiceStore.enhancementsState;
    agent.syncConfigToBackend('voice', {
      enhancements: {
        turnDetection: {
          enabled: eState.turnDetection.enabled,
          mode: eState.turnDetection.mode,
          model: eState.turnDetection.model,
          minEndpointingDelay: eState.turnDetection.minEndpointingDelay,
          maxEndpointingDelay: eState.turnDetection.maxEndpointingDelay,
          allowInterruptions: eState.interruptions.enabled,
          minInterruptionDuration: eState.interruptions.minDuration,
          minInterruptionWords: eState.interruptions.minWords,
        },
        noiseCancellation: {
          enabled: eState.noiseCancellation.enabled,
          mode: eState.noiseCancellation.mode,
        },
        echoCancellation: eState.audioProcessing.echoCancellation,
        autoGainControl: eState.audioProcessing.autoGainControl,
        preemptiveGeneration: eState.performance.preemptiveGeneration,
      },
      vad: {
        provider: eState.vad.provider,
        threshold: eState.vad.threshold,
        minSpeechDuration: eState.vad.minSpeech,
        minSilenceDuration: eState.vad.minSilence,
      },
    });

    // 3. LLM live params (temperature)
    if ('updateLlmLive' in agent && typeof agent.updateLlmLive === 'function') {
      agent.updateLlmLive({
        provider: voiceStore.llm.provider,
        model: voiceStore.llm.model,
        temperature: voiceStore.llm.temperature,
      });
    }

    // 4. TTS/Realtime voice + speed
    if (voiceStore.pipelineMode === 'realtime') {
      if ('updateRealtimeLive' in agent && typeof agent.updateRealtimeLive === 'function') {
        agent.updateRealtimeLive({
          voice: voiceStore.realtime.voice,
        });
      }
    } else {
      if ('updateTtsLive' in agent && typeof agent.updateTtsLive === 'function') {
        agent.updateTtsLive({
          voice: voiceStore.tts.voice,
          speed: voiceStore.tts.speed,
        });
      }
    }

    // 5. STT model
    if ('updateSttLive' in agent && typeof agent.updateSttLive === 'function') {
      agent.updateSttLive({
        provider: voiceStore.stt.provider,
        model: voiceStore.stt.model,
      });
    }

    console.log('📤 Synced all configs to backend on connect');
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

      // Update config with per-kwami memory id, auth token, and voice settings
      kwamiInstance.value.agent.updateConfig({
        livekit: {
          ...kwamiInstance.value.agent.getConfig().livekit,
          userId: memoryUserId.value, // Per-kwami so each kwami has its own memory
          authToken: authToken || undefined,
          voice: voiceStore.voiceConfig,
        },
      });

      await kwamiInstance.value.agent.connect();
      isConnected.value = true;
      console.log(`✅ Connected to agent as user: ${memoryUserId.value}`);

      // Sync all persisted panel configs to the backend agent after connecting
      syncAllConfigToBackend(kwamiInstance.value, voiceStore);
    } catch (error: unknown) {
      console.error('Failed to connect:', error);
      isConnected.value = false;

      // Handle insufficient credits (402 from /token endpoint)
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('402') || msg.includes('Insufficient credits')) {
        window.dispatchEvent(new CustomEvent('kwami:insufficient-credits'));
      }
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
      isConnected.value = false;
      window.dispatchEvent(new CustomEvent('kwami:disconnected'));

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

  function switchRenderer(newRenderer: 'blob-xyz' | 'black-hole' | 'particles-face') {
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
    memoryUserId,
    init,
    switchRenderer,
    connect,
    disconnect,
  };
}
