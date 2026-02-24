import { watch } from 'vue';
import { useWorkspaceStore } from '@/stores/workspace';
import { useAuthStore } from '@/stores/auth';
import { useAvatarStore } from '@/stores/avatar';
import { useVoiceStore } from '@/stores/voice';
import { useSceneStore } from '@/stores/scene';
import { useThemeStore } from '@/stores/theme';

export type KwamiConfig = {
  avatar?: unknown;
  voice?: unknown;
  scene?: unknown;
  theme?: unknown;
};

/** Clone config to a plain JSON-serializable object so DB/store never holds reactive refs and round-trip is safe. */
function safeConfigClone(config: KwamiConfig): KwamiConfig {
  try {
    return JSON.parse(JSON.stringify(config)) as KwamiConfig;
  } catch {
    return config;
  }
}

export function useKwamiConfigSync() {
  const workspaceStore = useWorkspaceStore();
  const authStore = useAuthStore();
  const avatarStore = useAvatarStore();
  const voiceStore = useVoiceStore();
  const sceneStore = useSceneStore();
  const themeStore = useThemeStore();

  function getConfig(): KwamiConfig {
    return {
      avatar: avatarStore.getSnapshot(),
      voice: voiceStore.getSnapshot(),
      scene: sceneStore.getSnapshot(),
      theme: themeStore.getSnapshot(), // mode, accent, glass, ui, accessibility, flashlight, effects
    };
  }

  /** Save current config to the active workspace, then switch to the given kwami. Call this when switching kwamis so the previous one's config is not lost. */
  function switchToKwami(id: string) {
    const raw = getConfig();
    const plain = safeConfigClone(raw);
    workspaceStore.saveActiveConfig(plain, authStore.userId);
    workspaceStore.setActive(id);
  }

  function applyConfig(config: KwamiConfig) {
    if (!config) return;
    try {
      if (config.avatar && typeof config.avatar === 'object') {
        avatarStore.applySnapshot(config.avatar as Parameters<typeof avatarStore.applySnapshot>[0]);
      }
      if (config.voice && typeof config.voice === 'object') {
        voiceStore.applySnapshot(config.voice as Record<string, unknown>);
      }
      if (config.scene && typeof config.scene === 'object') {
        sceneStore.applySnapshot(config.scene as Parameters<typeof sceneStore.applySnapshot>[0]);
      }
      if (config.theme && typeof config.theme === 'object' && Object.keys(config.theme as object).length > 0) {
        themeStore.applySnapshot(config.theme as Parameters<typeof themeStore.applySnapshot>[0]);
        themeStore.applyTheme();
      }
      window.dispatchEvent(new CustomEvent('kwami:configApplied'));
    } catch (e) {
      console.warn('Failed to apply kwami config:', e);
    }
  }

  return { getConfig, applyConfig, switchToKwami };
}

export function useKwamiConfigWatchers() {
  const { getConfig, applyConfig, switchToKwami } = useKwamiConfigSync();
  const workspaceStore = useWorkspaceStore();
  const avatarStore = useAvatarStore();
  const voiceStore = useVoiceStore();
  const sceneStore = useSceneStore();
  const themeStore = useThemeStore();

  // When active workspace changes, apply that kwami's config
  watch(
    () => workspaceStore.activeWorkspaceId,
    (id) => {
      if (!id) return;
      const ws = workspaceStore.getActiveWorkspace();
      if (ws?.config && typeof ws.config === 'object' && Object.keys(ws.config as object).length > 0) {
        applyConfig(ws.config as KwamiConfig);
      }
    },
    { immediate: true },
  );

  // Debounced save: shared timeout so any trigger schedules one save
  const authStore = useAuthStore();
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;
  function scheduleSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveTimeout = null;
      try {
        const plain = safeConfigClone(getConfig());
        workspaceStore.saveActiveConfig(plain, authStore.userId);
      } catch (e) {
        console.warn('Failed to save kwami config:', e);
      }
    }, 1500);
  }

  // Watch all config (avatar, voice, scene, theme) – stringify so any deep change triggers save
  watch(
    () => {
      try {
        return JSON.stringify(getConfig());
      } catch {
        return '';
      }
    },
    scheduleSave,
    { flush: 'post' },
  );

  // Explicit watch on theme so theme changes always trigger save (avoids Pinia reactivity not tracking store refs used only inside getSnapshot)
  watch(
    () => JSON.stringify(themeStore.getSnapshot()),
    scheduleSave,
    { flush: 'post' },
  );

  return { applyConfig, getConfig, switchToKwami };
}
