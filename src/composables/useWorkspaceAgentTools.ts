import { watch } from 'vue';
import type {
  Kwami,
  LLMProvider,
  STTProvider,
  STTLanguage,
  TTSProvider,
  RealtimeProvider,
} from 'kwami';
import { useKwami } from '@/composables/useKwami';
import { useUIStore, type PanelSizePreset } from '@/stores/ui';
import { useSearchStore } from '@/stores/search';
import { useVoiceStore } from '@/stores/voice';
import { useThemeStore, accentPresets, themePresets } from '@/stores/theme';
import { useSceneStore } from '@/stores/scene';
import { useAvatarStore } from '@/stores/avatar';
import { useBlobXyzStore } from '@/stores/avatar.blob-xyz';
import { useBlackHoleStore } from '@/stores/avatar.black-hole';
import { useParticlesFaceStore } from '@/stores/avatar.particles-face';
import { useTranscriptionState } from '@/composables/useTranscriptionState';
import { useAgentActionState } from '@/composables/useAgentActionState';
import { avatarPresets } from '@/presets/avatar/avatar-presets';

const WORKSPACE_PANELS = [
  'avatar',
  'scene',
  'voice',
  'enhancements',
  'transcription',
  'communications',
  'soul',
  'memory',
  'tools',
  'info',
  'metrics',
  'account',
  'theme',
  'models',
  'credits',
] as const;

type WorkspacePanel = (typeof WORKSPACE_PANELS)[number];
type ResponseLength = 'short' | 'medium' | 'long';

const PANEL_ALIASES: Record<string, WorkspacePanel> = {
  account: 'account',
  avatar: 'avatar',
  chat: 'transcription',
  communications: 'communications',
  credits: 'credits',
  energy: 'credits',
  enhancements: 'enhancements',
  info: 'info',
  memory: 'memory',
  metrics: 'metrics',
  model: 'models',
  models: 'models',
  scene: 'scene',
  settings: 'theme',
  soul: 'soul',
  theme: 'theme',
  tools: 'tools',
  transcript: 'transcription',
  transcription: 'transcription',
  whatsapp: 'communications',
  messages: 'communications',
  phone: 'communications',
  calls: 'communications',
  voice: 'voice',
};

const ADVANCED_VOICE_CONTROLS = new Set([
  'pipelineMode',
  'llmModel',
  'sttModel',
  'ttsModel',
  'realtimeModel',
]);

const RESETTABLE_DOMAINS = ['avatar', 'theme', 'scene'] as const;
const UI_CONTROL_DOMAINS = [
  'workspace',
  'panel',
  'theme',
  'avatar',
  'scene',
  'voice',
  'enhancements',
  'memory',
  'search',
] as const;

type UiControlDomain = (typeof UI_CONTROL_DOMAINS)[number];

const UI_DOMAIN_ALIASES: Record<string, UiControlDomain> = {
  appearance: 'avatar',
  avatar: 'avatar',
  enhancement: 'enhancements',
  enhancements: 'enhancements',
  memory: 'memory',
  memoryui: 'memory',
  panel: 'panel',
  panels: 'panel',
  scene: 'scene',
  search: 'search',
  theme: 'theme',
  ui: 'workspace',
  voice: 'voice',
  workspace: 'workspace',
};

function humanizePanel(panel: WorkspacePanel): string {
  if (panel === 'credits') return 'Energy';
  if (panel === 'transcription') return 'Transcription';
  return panel.charAt(0).toUpperCase() + panel.slice(1);
}

function normalizePanel(panelName: unknown): WorkspacePanel | null {
  if (typeof panelName !== 'string') return null;
  const normalized = panelName.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  return PANEL_ALIASES[normalized.replace(/_/g, '')] ?? PANEL_ALIASES[normalized] ?? null;
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function normalizeDomain(domain: unknown): UiControlDomain | null {
  if (typeof domain !== 'string') return null;
  return UI_DOMAIN_ALIASES[normalizeKey(domain)] ?? null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function buildSoulConfig(voiceStore: ReturnType<typeof useVoiceStore>) {
  const saved = voiceStore.soulConfig;
  return {
    name: saved.name,
    personality: saved.personality,
    systemPrompt: saved.systemPrompt,
    traits: [...saved.traits],
    conversationStyle: saved.conversationStyle,
    responseLength: saved.responseLength,
    emotionalTone: saved.emotionalTone,
    emotionalTraits: { ...saved.emotionalTraits },
  };
}

export function useWorkspaceAgentTools() {
  const { kwami, rendererType, isConnected } = useKwami();
  const uiStore = useUIStore();
  const searchStore = useSearchStore();
  const voiceStore = useVoiceStore();
  const themeStore = useThemeStore();
  const sceneStore = useSceneStore();
  const avatarStore = useAvatarStore();
  const blobStore = useBlobXyzStore();
  const blackHoleStore = useBlackHoleStore();
  const particlesFaceStore = useParticlesFaceStore();
  const { messages } = useTranscriptionState();
  const actionState = useAgentActionState();

  function emitConfigApplied() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kwami:configApplied'));
    }
  }

  function persistAvatarChanges() {
    avatarStore.saveSettings();
    emitConfigApplied();
  }

  function syncSoulToAgent() {
    const soulConfig = buildSoulConfig(voiceStore);
    kwami.value?.soul.updateConfig(soulConfig);
    if (isConnected.value) {
      kwami.value?.agent.syncConfigToBackend('soul', soulConfig);
    }
  }

  function syncVoiceModelsToAgent(control: string, value: Record<string, unknown>) {
    if (!kwami.value || !isConnected.value) return;
    const agent = kwami.value.agent;

    if (control === 'llmModel') {
      agent.updateLlmLive({
        provider: typeof value.provider === 'string' ? value.provider : undefined,
        model: typeof value.model === 'string' ? value.model : undefined,
        temperature: typeof value.temperature === 'number' ? value.temperature : undefined,
      });
      return;
    }

    if (control === 'sttModel') {
      agent.updateSttLive({
        provider: typeof value.provider === 'string' ? value.provider : undefined,
        model: typeof value.model === 'string' ? value.model : undefined,
        language: typeof value.language === 'string' ? value.language : undefined,
      });
      return;
    }

    if (control === 'ttsModel') {
      agent.updateTtsLive({
        provider: typeof value.provider === 'string' ? value.provider : undefined,
        model: typeof value.model === 'string' ? value.model : undefined,
        voice: typeof value.voice === 'string' ? value.voice : undefined,
        speed: typeof value.speed === 'number' ? value.speed : undefined,
      });
      return;
    }

    if (control === 'realtimeModel') {
      agent.updateRealtimeLive({
        provider: typeof value.provider === 'string' ? value.provider : undefined,
        model: typeof value.model === 'string' ? value.model : undefined,
        voice: typeof value.voice === 'string' ? value.voice : undefined,
      });
    }
  }

  function syncEnhancementsToAgent() {
    if (!kwami.value) return;
    const agent = kwami.value.agent;
    const eState = voiceStore.enhancementsState;
    const voiceConfig = {
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
    };

    agent.updateConfig({
      livekit: {
        ...agent.getConfig().livekit,
        voice: {
          ...agent.getConfig().livekit?.voice,
          ...voiceConfig,
        },
      } as any,
    });

    if (isConnected.value) {
      agent.syncConfigToBackend('voice', voiceConfig);
    }
  }

  async function confirmIfNeeded(
    required: boolean,
    confirm: unknown,
    title: string,
    message: string,
  ): Promise<boolean> {
    if (!required || confirm === true) return true;
    return actionState.requestConfirmation({
      title,
      message,
      confirmLabel: 'Apply',
      cancelLabel: 'Cancel',
    });
  }

  async function openPanel(panelName: unknown) {
    const panel = normalizePanel(panelName);
    if (!panel) {
      const allowedPanels = WORKSPACE_PANELS.join(', ');
      actionState.recordError('Unable to open panel', `Unknown panel "${String(panelName)}"`);
      return {
        success: false,
        message: `Unknown panel "${String(panelName)}". Available panels: ${allowedPanels}.`,
      };
    }

    uiStore.setPanel(panel);
    const readablePanel = humanizePanel(panel);
    actionState.recordAction('Opened panel', readablePanel, { announce: true });
    return {
      success: true,
      panel,
      message: `Opened the ${readablePanel} panel.`,
    };
  }

  async function closePanel() {
    if (!uiStore.isPanelOpen) {
      return { success: true, message: 'The workspace panel is already closed.' };
    }

    uiStore.togglePanel();
    actionState.recordAction('Closed panel', humanizePanel(uiStore.activePanel as WorkspacePanel), {
      announce: true,
    });
    return { success: true, message: 'Closed the workspace panel.' };
  }

  async function setRenderer(renderer: unknown) {
    if (renderer !== 'blob-xyz' && renderer !== 'black-hole' && renderer !== 'particles-face') {
      actionState.recordError('Unable to switch renderer', `Unknown renderer "${String(renderer)}"`);
      return {
        success: false,
        message: 'Unknown renderer. Use blob-xyz, black-hole, or particles-face.',
      };
    }

    avatarStore.setRendererType(renderer);
    persistAvatarChanges();
    actionState.recordAction('Switched renderer', renderer, { announce: true });
    return {
      success: true,
      renderer,
      message: `Switched the renderer to ${renderer}.`,
    };
  }

  async function setResponseLength(length: unknown, confirm: unknown) {
    if (length !== 'short' && length !== 'medium' && length !== 'long') {
      actionState.recordError('Unable to change response length', `Unknown length "${String(length)}"`);
      return {
        success: false,
        message: 'Unknown response length. Use short, medium, or long.',
      };
    }

    const approved = await confirmIfNeeded(
      true,
      confirm,
      'Confirm response style change',
      `Change response length to ${length}? This updates the current workspace preference.`,
    );
    if (!approved) {
      actionState.recordAction('Kept current response length', undefined, { announce: true });
      return { success: false, cancelled: true, message: 'Response length change was cancelled.' };
    }

    voiceStore.soulConfig.responseLength = length as ResponseLength;
    syncSoulToAgent();
    actionState.recordAction('Updated response length', length, { announce: true });
    return {
      success: true,
      responseLength: length,
      message: `Changed response length to ${length}.`,
    };
  }

  async function clearSearchResults() {
    if (!searchStore.hasSearchData) {
      return { success: true, message: 'There are no search results to clear.' };
    }

    const clearedCount = searchStore.results.length;
    searchStore.clear();
    actionState.recordAction('Cleared search results', `${clearedCount} result${clearedCount === 1 ? '' : 's'}`, {
      announce: true,
    });
    return {
      success: true,
      clearedCount,
      message: 'Cleared the current search results.',
    };
  }

  async function showWorkspaceStatus() {
    return {
      success: true,
      connected: isConnected.value,
      activePanel: uiStore.activePanel,
      isPanelOpen: uiStore.isPanelOpen,
      renderer: rendererType.value,
      responseLength: voiceStore.soulConfig.responseLength,
      hasSearchResults: searchStore.hasSearchData,
      themeMode: themeStore.mode,
      sidebarPosition: themeStore.sidebarPosition,
      visibleMessages: messages.value.length,
      message:
        `Workspace status: panel ${uiStore.isPanelOpen ? 'open' : 'closed'}, ` +
        `active panel ${uiStore.activePanel}, renderer ${rendererType.value}, ` +
        `theme ${themeStore.mode}, sidebar ${themeStore.sidebarPosition}.`,
    };
  }

  async function setPanelControl(control: unknown, value: unknown) {
    if (control === 'activePanel') {
      return openPanel(value);
    }

    if (control === 'isOpen') {
      if (typeof value !== 'boolean') {
        return { success: false, message: 'Panel open state expects a boolean value.' };
      }
      if (uiStore.isPanelOpen !== value) {
        uiStore.togglePanel();
      }
      actionState.recordAction(value ? 'Opened panel column' : 'Closed panel column', undefined, {
        announce: true,
      });
      return { success: true, message: `Panel column is now ${value ? 'open' : 'closed'}.` };
    }

    if (control === 'sizePreset') {
      if (value !== 'small' && value !== 'medium' && value !== 'large') {
        return { success: false, message: 'Size preset must be small, medium, or large.' };
      }
      uiStore.setSizePreset(value as PanelSizePreset);
      actionState.recordAction('Updated panel size preset', value, { announce: true });
      return { success: true, message: `Panel size preset set to ${value}.` };
    }

    return { success: false, message: `Unknown panel control "${String(control)}".` };
  }

  async function setThemeControl(control: unknown, value: unknown) {
    if (typeof control !== 'string') {
      return { success: false, message: 'Theme control must be a string.' };
    }

    const normalized = normalizeKey(control);
    if (normalized === 'preset') {
      if (typeof value !== 'string') return { success: false, message: 'Theme preset expects a preset name.' };
      const preset = themePresets.find((item) => normalizeKey(item.name) === normalizeKey(value));
      if (!preset) return { success: false, message: `Unknown theme preset "${value}".` };
      themeStore.applyPreset(preset);
      actionState.recordAction('Applied theme preset', preset.name, { announce: true });
      return { success: true, message: `Applied the ${preset.name} theme preset.` };
    }

    if (normalized === 'accentpreset') {
      if (typeof value !== 'string') return { success: false, message: 'Accent preset expects a preset name.' };
      const preset = accentPresets.find((item) => normalizeKey(item.name) === normalizeKey(value));
      if (!preset) return { success: false, message: `Unknown accent preset "${value}".` };
      themeStore.setAccentPreset(preset);
      actionState.recordAction('Applied accent preset', preset.name, { announce: true });
      return { success: true, message: `Applied the ${preset.name} accent preset.` };
    }

    switch (normalized) {
      case 'mode':
        if (value === 'dark' || value === 'light' || value === 'system' || value === 'auto') {
          themeStore.setMode(value);
          break;
        }
        return { success: false, message: 'Theme mode must be dark, light, system, or auto.' };
      case 'sidebarposition':
        if (value === 'left' || value === 'right') {
          themeStore.setSidebarPosition(value);
          break;
        }
        return { success: false, message: 'Sidebar position must be left or right.' };
      case 'compactmode':
        if (typeof value !== 'boolean') return { success: false, message: 'Compact mode expects a boolean value.' };
        themeStore.setCompactMode(value);
        break;
      case 'accentprimary':
        if (typeof value !== 'string') return { success: false, message: 'Accent primary expects a hex color string.' };
        themeStore.setAccentPrimary(value);
        break;
      case 'accentsecondary':
        if (typeof value !== 'string') return { success: false, message: 'Accent secondary expects a hex color string.' };
        themeStore.setAccentSecondary(value);
        break;
      case 'glassblur':
        if (typeof value !== 'number') return { success: false, message: 'Glass blur expects a number.' };
        themeStore.setGlassBlur(value);
        break;
      case 'glassopacity':
        if (typeof value !== 'number') return { success: false, message: 'Glass opacity expects a number.' };
        themeStore.setGlassOpacity(value);
        break;
      case 'saturation':
        if (typeof value !== 'number') return { success: false, message: 'Saturation expects a number.' };
        themeStore.setSaturation(value);
        break;
      case 'gradientdirection':
        if (typeof value !== 'number') return { success: false, message: 'Gradient direction expects a number.' };
        themeStore.setGradientDirection(value);
        break;
      case 'panelborder':
        if (typeof value !== 'boolean') return { success: false, message: 'Panel border expects a boolean value.' };
        themeStore.setPanelBorder(value);
        break;
      case 'gloweffects':
        if (typeof value !== 'boolean') return { success: false, message: 'Glow effects expects a boolean value.' };
        themeStore.setGlowEffects(value);
        break;
      case 'highcontrast':
        if (typeof value !== 'boolean') return { success: false, message: 'High contrast expects a boolean value.' };
        themeStore.setHighContrast(value);
        break;
      case 'focusindicators':
        if (typeof value !== 'boolean') return { success: false, message: 'Focus indicators expects a boolean value.' };
        themeStore.setFocusIndicators(value);
        break;
      case 'cursorflashlight':
        if (typeof value !== 'boolean') return { success: false, message: 'Cursor flashlight expects a boolean value.' };
        themeStore.setCursorFlashlight(value);
        break;
      case 'flashlightsize':
        if (typeof value !== 'number') return { success: false, message: 'Flashlight size expects a number.' };
        themeStore.setFlashlightSize(value);
        break;
      case 'flashlightintensity':
        if (typeof value !== 'number') return { success: false, message: 'Flashlight intensity expects a number.' };
        themeStore.setFlashlightIntensity(value);
        break;
      case 'flashlightcolor':
        if (typeof value !== 'string') return { success: false, message: 'Flashlight color expects a hex color string.' };
        themeStore.setFlashlightColor(value);
        break;
      case 'borderradius':
        if (typeof value !== 'number') return { success: false, message: 'Border radius expects a number.' };
        themeStore.setBorderRadius(value);
        break;
      default:
        return { success: false, message: `Unknown theme control "${control}".` };
    }

    actionState.recordAction('Updated theme control', String(control), { announce: true });
    return { success: true, message: `Updated theme control ${control}.` };
  }

  async function setAvatarControl(control: unknown, value: unknown) {
    if (typeof control !== 'string') {
      return { success: false, message: 'Avatar control must be a string.' };
    }

    const normalized = normalizeKey(control);
    if (normalized === 'renderer') {
      return setRenderer(value);
    }

    if (normalized === 'preset') {
      if (typeof value !== 'string') return { success: false, message: 'Avatar preset expects a preset id or name.' };
      const preset = avatarPresets.find(
        (item) => normalizeKey(item.id) === normalizeKey(value) || normalizeKey(item.name) === normalizeKey(value),
      );
      if (!preset) return { success: false, message: `Unknown avatar preset "${value}".` };
      avatarStore.applyPreset(preset.id);
      persistAvatarChanges();
      actionState.recordAction('Applied avatar preset', preset.name, { announce: true });
      return { success: true, message: `Applied the ${preset.name} avatar preset.` };
    }

    switch (normalized) {
      case 'blobskintype': {
        const validSkins = [
          'poles', 'donut', 'vintage', 'marble', 'fresnel', 'iridescent', 'spiral', 'plasma', 'gradient',
          'matte', 'glossy', 'metallic', 'subsurface',
          'chrome', 'clay', 'jade', 'toon-matcap', 'hologram',
          'flat', 'stepped', 'halftone', 'outlined',
        ];
        if (!validSkins.includes(value as string)) {
          return { success: false, message: `Blob skin type must be one of: ${validSkins.join(', ')}.` };
        }
        blobStore.skin.type = value as typeof blobStore.skin.type;
      }
        break;
      case 'blobcolors':
        if (!isRecord(value)) return { success: false, message: 'Blob colors expects an object with x, y, and z.' };
        blobStore.setColors(
          typeof value.x === 'string' ? value.x : blobStore.skin.colors.x,
          typeof value.y === 'string' ? value.y : blobStore.skin.colors.y,
          typeof value.z === 'string' ? value.z : blobStore.skin.colors.z,
        );
        break;
      case 'blobspikes':
        if (!isRecord(value)) return { success: false, message: 'Blob spikes expects an object with x, y, and z.' };
        blobStore.setSpikes(
          typeof value.x === 'number' ? value.x : blobStore.shape.spikes.x,
          typeof value.y === 'number' ? value.y : blobStore.shape.spikes.y,
          typeof value.z === 'number' ? value.z : blobStore.shape.spikes.z,
        );
        break;
      case 'blobamplitude':
        if (!isRecord(value)) return { success: false, message: 'Blob amplitude expects an object with x, y, and z.' };
        blobStore.setAmplitude(
          typeof value.x === 'number' ? value.x : blobStore.shape.amplitude.x,
          typeof value.y === 'number' ? value.y : blobStore.shape.amplitude.y,
          typeof value.z === 'number' ? value.z : blobStore.shape.amplitude.z,
        );
        break;
      case 'blobrotation':
        if (!isRecord(value)) return { success: false, message: 'Blob rotation expects an object with x, y, and z.' };
        blobStore.setRotation(
          typeof value.x === 'number' ? value.x : blobStore.animation.rotation.x,
          typeof value.y === 'number' ? value.y : blobStore.animation.rotation.y,
          typeof value.z === 'number' ? value.z : blobStore.animation.rotation.z,
        );
        break;
      case 'blobscale':
        if (typeof value !== 'number') return { success: false, message: 'Blob scale expects a number.' };
        blobStore.shape.scale = value;
        break;
      case 'blobopacity':
        if (typeof value !== 'number') return { success: false, message: 'Blob opacity expects a number.' };
        blobStore.skin.opacity = value;
        break;
      case 'blobshininess':
        if (typeof value !== 'number') return { success: false, message: 'Blob shininess expects a number.' };
        blobStore.skin.shininess = value;
        break;
      case 'blobwireframe':
        if (typeof value !== 'boolean') return { success: false, message: 'Blob wireframe expects a boolean value.' };
        blobStore.skin.wireframe = value;
        break;
      case 'blobglassmode':
        if (typeof value !== 'boolean') return { success: false, message: 'Blob glass mode expects a boolean value.' };
        blobStore.skin.glassMode = value;
        break;
      case 'blobaudioreactivity':
        if (typeof value !== 'number') return { success: false, message: 'Blob audio reactivity expects a number.' };
        blobStore.audio.reactivity = value;
        break;
      case 'blobaudioenabled':
        if (typeof value !== 'boolean') return { success: false, message: 'Blob audio enabled expects a boolean value.' };
        blobStore.audio.enabled = value;
        break;
      case 'blackholecolorscheme':
        if (typeof value !== 'string') return { success: false, message: 'Black hole color scheme expects a preset name.' };
        blackHoleStore.setColorSchemePreset(value as 'classic' | 'fire' | 'ice' | 'nebula' | 'void');
        break;
      case 'blackholecolors':
        if (!isRecord(value)) return { success: false, message: 'Black hole colors expects an object with hot, mid1, mid2, mid3, and outer.' };
        blackHoleStore.updateColors({
          hot: typeof value.hot === 'string' ? value.hot : blackHoleStore.colors.hot,
          mid1: typeof value.mid1 === 'string' ? value.mid1 : blackHoleStore.colors.mid1,
          mid2: typeof value.mid2 === 'string' ? value.mid2 : blackHoleStore.colors.mid2,
          mid3: typeof value.mid3 === 'string' ? value.mid3 : blackHoleStore.colors.mid3,
          outer: typeof value.outer === 'string' ? value.outer : blackHoleStore.colors.outer,
        });
        break;
      case 'blackholecore':
        if (!isRecord(value)) return { success: false, message: 'Black hole core expects a settings object.' };
        blackHoleStore.updateCore(value);
        break;
      case 'blackholedisk':
        if (!isRecord(value)) return { success: false, message: 'Black hole disk expects a settings object.' };
        blackHoleStore.updateDisk(value);
        break;
      case 'blackholeanimation':
        if (!isRecord(value)) return { success: false, message: 'Black hole animation expects a settings object.' };
        blackHoleStore.updateAnimation(value);
        break;
      case 'blackholeeffects':
        if (!isRecord(value)) return { success: false, message: 'Black hole effects expects a settings object.' };
        blackHoleStore.updateEffects(value);
        break;
      case 'blackholescale':
        if (typeof value !== 'number') return { success: false, message: 'Black hole scale expects a number.' };
        blackHoleStore.setScale(value);
        break;
      case 'particlesfaceappearance':
      case 'particlesfacemotion':
        if (!isRecord(value)) return { success: false, message: 'Particles face settings expect an object.' };
        particlesFaceStore.update(value);
        break;
      default:
        return { success: false, message: `Unknown avatar control "${control}".` };
    }

    persistAvatarChanges();
    actionState.recordAction('Updated avatar control', String(control), { announce: true });
    return { success: true, message: `Updated avatar control ${control}.` };
  }

  async function setSceneControl(control: unknown, value: unknown) {
    if (typeof control !== 'string') {
      return { success: false, message: 'Scene control must be a string.' };
    }

    switch (normalizeKey(control)) {
      case 'mediatype':
        if (value !== 'none' && value !== 'image' && value !== 'video' && value !== 'hdri') {
          return { success: false, message: 'Media type must be none, image, video, or hdri.' };
        }
        sceneStore.setMediaType(value);
        break;
      case 'imageurl':
        if (typeof value !== 'string') return { success: false, message: 'Image URL expects a string.' };
        sceneStore.setImageUrl(value);
        break;
      case 'imagefit':
        if (value !== 'cover' && value !== 'contain' && value !== 'stretch') {
          return { success: false, message: 'Image fit must be cover, contain, or stretch.' };
        }
        sceneStore.setImageFit(value);
        break;
      case 'imageopacity':
        if (typeof value !== 'number') return { success: false, message: 'Image opacity expects a number.' };
        sceneStore.setImageOpacity(value);
        break;
      case 'videourl':
        if (typeof value !== 'string') return { success: false, message: 'Video URL expects a string.' };
        sceneStore.setVideoUrl(value);
        break;
      case 'videofit':
        if (value !== 'cover' && value !== 'contain' && value !== 'stretch') {
          return { success: false, message: 'Video fit must be cover, contain, or stretch.' };
        }
        sceneStore.setVideoFit(value);
        break;
      case 'videoopacity':
        if (typeof value !== 'number') return { success: false, message: 'Video opacity expects a number.' };
        sceneStore.setVideoOpacity(value);
        break;
      case 'videoloop':
        if (typeof value !== 'boolean') return { success: false, message: 'Video loop expects a boolean value.' };
        sceneStore.setVideoLoop(value);
        break;
      case 'videomuted':
        if (typeof value !== 'boolean') return { success: false, message: 'Video muted expects a boolean value.' };
        sceneStore.setVideoMuted(value);
        break;
      case 'hdriurl':
        if (typeof value !== 'string') return { success: false, message: 'HDRI URL expects a string.' };
        sceneStore.setHdriUrl(value);
        break;
      case 'hdriintensity':
        if (typeof value !== 'number') return { success: false, message: 'HDRI intensity expects a number.' };
        sceneStore.setHdriIntensity(value);
        break;
      case 'hdriopacity':
        if (typeof value !== 'number') return { success: false, message: 'HDRI opacity expects a number.' };
        sceneStore.setHdriOpacity(value);
        break;
      case 'hdrirotation':
        if (typeof value !== 'number') return { success: false, message: 'HDRI rotation expects a number.' };
        sceneStore.setHdriRotation(value);
        break;
      case 'hdriblur':
        if (typeof value !== 'number') return { success: false, message: 'HDRI blur expects a number.' };
        sceneStore.setHdriBlur(value);
        break;
      case 'gradientenabled':
        if (typeof value !== 'boolean') return { success: false, message: 'Gradient enabled expects a boolean value.' };
        sceneStore.setGradientEnabled(value);
        break;
      case 'gradienttype':
        if (value !== 'solid' && value !== 'radial' && value !== 'linear' && value !== 'orbs') {
          return { success: false, message: 'Gradient type must be solid, radial, linear, or orbs.' };
        }
        sceneStore.setGradientType(value);
        break;
      case 'gradientsolidcolor':
        if (typeof value !== 'string') return { success: false, message: 'Gradient solid color expects a hex color string.' };
        sceneStore.background.gradient.solidColor = value;
        break;
      case 'gradientangle':
        if (typeof value !== 'number') return { success: false, message: 'Gradient angle expects a number.' };
        sceneStore.setGradientAngle(value);
        break;
      case 'gradientradialcenter':
        if (!isRecord(value) || typeof value.x !== 'number' || typeof value.y !== 'number') {
          return { success: false, message: 'Gradient radial center expects an object with x and y.' };
        }
        sceneStore.setGradientRadialCenter(value.x, value.y);
        break;
      case 'gradientradialsize':
        if (typeof value !== 'number') return { success: false, message: 'Gradient radial size expects a number.' };
        sceneStore.setGradientRadialSize(value);
        break;
      case 'gradientopacity':
        if (typeof value !== 'number') return { success: false, message: 'Gradient opacity expects a number.' };
        sceneStore.setGradientOpacity(value);
        break;
      case 'gradientblendmode':
        if (
          value !== 'normal' &&
          value !== 'multiply' &&
          value !== 'screen' &&
          value !== 'overlay' &&
          value !== 'soft-light'
        ) {
          return { success: false, message: 'Gradient blend mode is invalid.' };
        }
        sceneStore.setGradientBlendMode(value);
        break;
      default:
        return { success: false, message: `Unknown scene control "${control}".` };
    }

    actionState.recordAction('Updated scene control', String(control), { announce: true });
    return { success: true, message: `Updated scene control ${control}.` };
  }

  async function setVoiceControl(control: unknown, value: unknown, confirm: unknown) {
    if (typeof control !== 'string') {
      return { success: false, message: 'Voice control must be a string.' };
    }

    const normalized = normalizeKey(control);
    const approved = await confirmIfNeeded(
      ADVANCED_VOICE_CONTROLS.has(normalized),
      confirm,
      'Confirm advanced voice change',
      `Apply the ${control} voice change? Advanced model and pipeline updates may require reconnecting the current session.`,
    );
    if (!approved) {
      return { success: false, cancelled: true, message: `Cancelled voice control ${control}.` };
    }

    if (normalized === 'pipelinemode') {
      if (value !== 'realtime' && value !== 'stt-llm-tts') {
        return { success: false, message: 'Pipeline mode must be realtime or stt-llm-tts.' };
      }
      voiceStore.setPipelineMode(value);
      if (kwami.value) {
        kwami.value.agent.updateConfig({
          livekit: {
            ...kwami.value.agent.getConfig().livekit,
            voice: voiceStore.voiceConfig,
          },
        });
      }
      actionState.recordAction('Updated pipeline mode', value, { announce: true });
      return {
        success: true,
        message: isConnected.value
          ? `Pipeline mode set to ${value}. Reconnect the session if the active backend pipeline does not change immediately.`
          : `Pipeline mode set to ${value}.`,
      };
    }

    if (normalized === 'ttsvoice') {
      if (typeof value !== 'string') return { success: false, message: 'TTS voice expects a voice id string.' };
      voiceStore.updateTTS({ voice: value });
      if (isConnected.value && kwami.value) {
        kwami.value.agent.updateTtsLive({ voice: value, speed: voiceStore.tts.speed });
      }
    } else if (normalized === 'ttsspeed') {
      if (typeof value !== 'number') return { success: false, message: 'TTS speed expects a number.' };
      voiceStore.updateTTS({ speed: value });
      if (isConnected.value && kwami.value) {
        kwami.value.agent.updateTtsLive({ voice: voiceStore.tts.voice, speed: value });
      }
    } else if (normalized === 'realtimevoice') {
      if (typeof value !== 'string') return { success: false, message: 'Realtime voice expects a voice id string.' };
      voiceStore.updateRealtime({ voice: value });
      if (isConnected.value && kwami.value) {
        kwami.value.agent.updateRealtimeLive({ voice: value });
      }
    } else if (normalized === 'sttlanguage') {
      if (typeof value !== 'string') return { success: false, message: 'STT language expects a language code.' };
      voiceStore.updateSTT({ language: value as STTLanguage });
      if (isConnected.value && kwami.value) {
        kwami.value.agent.updateSttLive({
          provider: voiceStore.stt.provider,
          model: voiceStore.stt.model,
          language: value as STTLanguage,
        });
      }
    } else if (normalized === 'responselength') {
      return setResponseLength(value, true);
    } else if (normalized === 'emotionaltone') {
      if (value !== 'neutral' && value !== 'warm' && value !== 'enthusiastic' && value !== 'calm') {
        return { success: false, message: 'Emotional tone must be neutral, warm, enthusiastic, or calm.' };
      }
      voiceStore.soulConfig.emotionalTone = value;
      syncSoulToAgent();
    } else if (normalized === 'llmmodel' || normalized === 'sttmodel' || normalized === 'ttsmodel' || normalized === 'realtimemodel') {
      if (!isRecord(value)) return { success: false, message: `Voice control ${control} expects a settings object.` };
      if (normalized === 'llmmodel') {
        voiceStore.updateLLM({
          provider:
            typeof value.provider === 'string'
              ? (value.provider as LLMProvider)
              : voiceStore.llm.provider,
          model: typeof value.model === 'string' ? value.model : voiceStore.llm.model,
          temperature: typeof value.temperature === 'number' ? value.temperature : voiceStore.llm.temperature,
        });
      } else if (normalized === 'sttmodel') {
        voiceStore.updateSTT({
          provider:
            typeof value.provider === 'string'
              ? (value.provider as STTProvider)
              : voiceStore.stt.provider,
          model: typeof value.model === 'string' ? value.model : voiceStore.stt.model,
          language:
            typeof value.language === 'string'
              ? (value.language as STTLanguage)
              : voiceStore.stt.language,
        });
      } else if (normalized === 'ttsmodel') {
        voiceStore.updateTTS({
          provider:
            typeof value.provider === 'string'
              ? (value.provider as TTSProvider)
              : voiceStore.tts.provider,
          model: typeof value.model === 'string' ? value.model : voiceStore.tts.model,
          voice: typeof value.voice === 'string' ? value.voice : voiceStore.tts.voice,
          speed: typeof value.speed === 'number' ? value.speed : voiceStore.tts.speed,
        });
      } else {
        voiceStore.updateRealtime({
          provider:
            typeof value.provider === 'string'
              ? (value.provider as RealtimeProvider)
              : voiceStore.realtime.provider,
          model: typeof value.model === 'string' ? value.model : voiceStore.realtime.model,
          voice: typeof value.voice === 'string' ? value.voice : voiceStore.realtime.voice,
        });
      }

      syncVoiceModelsToAgent(
        normalized === 'llmmodel'
          ? 'llmModel'
          : normalized === 'sttmodel'
            ? 'sttModel'
            : normalized === 'ttsmodel'
              ? 'ttsModel'
              : 'realtimeModel',
        value,
      );
    } else {
      return { success: false, message: `Unknown voice control "${control}".` };
    }

    actionState.recordAction('Updated voice control', String(control), { announce: true });
    return { success: true, message: `Updated voice control ${control}.` };
  }

  async function setEnhancementControl(control: unknown, value: unknown) {
    if (typeof control !== 'string') {
      return { success: false, message: 'Enhancement control must be a string.' };
    }

    const eState = voiceStore.enhancementsState;
    switch (normalizeKey(control)) {
      case 'turndetectionenabled':
        if (typeof value !== 'boolean') return { success: false, message: 'Turn detection enabled expects a boolean value.' };
        eState.turnDetection.enabled = value;
        break;
      case 'turndetectionmode':
        if (value !== 'vad' && value !== 'stt' && value !== 'model' && value !== 'manual') {
          return { success: false, message: 'Turn detection mode is invalid.' };
        }
        eState.turnDetection.mode = value;
        break;
      case 'turndetectionmodel':
        if (value !== 'english' && value !== 'multilingual') {
          return { success: false, message: 'Turn detection model must be english or multilingual.' };
        }
        eState.turnDetection.model = value;
        break;
      case 'minendpointingdelay':
        if (typeof value !== 'number') return { success: false, message: 'Min endpointing delay expects a number.' };
        eState.turnDetection.minEndpointingDelay = value;
        break;
      case 'maxendpointingdelay':
        if (typeof value !== 'number') return { success: false, message: 'Max endpointing delay expects a number.' };
        eState.turnDetection.maxEndpointingDelay = value;
        break;
      case 'interruptionsenabled':
        if (typeof value !== 'boolean') return { success: false, message: 'Interruptions enabled expects a boolean value.' };
        eState.interruptions.enabled = value;
        break;
      case 'interruptionduration':
        if (typeof value !== 'number') return { success: false, message: 'Interruption duration expects a number.' };
        eState.interruptions.minDuration = value;
        break;
      case 'interruptionwords':
        if (typeof value !== 'number') return { success: false, message: 'Interruption words expects a number.' };
        eState.interruptions.minWords = value;
        break;
      case 'noisecancellationenabled':
        if (typeof value !== 'boolean') return { success: false, message: 'Noise cancellation enabled expects a boolean value.' };
        eState.noiseCancellation.enabled = value;
        break;
      case 'noisecancellationmode':
        if (value !== 'bvc' && value !== 'krisp' && value !== 'default') {
          return { success: false, message: 'Noise cancellation mode is invalid.' };
        }
        eState.noiseCancellation.mode = value;
        break;
      case 'vadthreshold':
        if (typeof value !== 'number') return { success: false, message: 'VAD threshold expects a number.' };
        eState.vad.threshold = value;
        break;
      case 'vadminspeech':
        if (typeof value !== 'number') return { success: false, message: 'VAD min speech expects a number.' };
        eState.vad.minSpeech = value;
        break;
      case 'vadminsilence':
        if (typeof value !== 'number') return { success: false, message: 'VAD min silence expects a number.' };
        eState.vad.minSilence = value;
        break;
      case 'echocancellation':
        if (typeof value !== 'boolean') return { success: false, message: 'Echo cancellation expects a boolean value.' };
        eState.audioProcessing.echoCancellation = value;
        break;
      case 'autogaincontrol':
        if (typeof value !== 'boolean') return { success: false, message: 'Auto gain control expects a boolean value.' };
        eState.audioProcessing.autoGainControl = value;
        break;
      case 'preemptivegeneration':
        if (typeof value !== 'boolean') return { success: false, message: 'Preemptive generation expects a boolean value.' };
        eState.performance.preemptiveGeneration = value;
        break;
      default:
        return { success: false, message: `Unknown enhancement control "${control}".` };
    }

    syncEnhancementsToAgent();
    actionState.recordAction('Updated enhancement control', String(control), { announce: true });
    return { success: true, message: `Updated enhancement control ${control}.` };
  }

  async function setMemoryUiControl(control: unknown, value: unknown) {
    if (control !== 'activeTab') {
      return { success: false, message: `Unknown memory UI control "${String(control)}".` };
    }
    if (value !== 'facts' && value !== 'entities' && value !== 'messages') {
      return { success: false, message: 'Memory tab must be facts, entities, or messages.' };
    }
    voiceStore.memoryUI.activeTab = value;
    uiStore.setPanel('memory');
    actionState.recordAction('Opened memory view', String(value), { announce: true });
    return { success: true, message: `Opened the memory ${value} view.` };
  }

  async function resetUiDomain(domain: unknown, confirm: unknown) {
    if (domain !== 'avatar' && domain !== 'theme' && domain !== 'scene') {
      return { success: false, message: `Resettable domains are ${RESETTABLE_DOMAINS.join(', ')}.` };
    }

    const approved = await confirmIfNeeded(
      true,
      confirm,
      `Reset ${domain} settings`,
      `Reset the ${domain} settings to defaults? This will overwrite your current ${domain} configuration.`,
    );
    if (!approved) {
      return { success: false, cancelled: true, message: `Cancelled reset for ${domain}.` };
    }

    if (domain === 'avatar') {
      avatarStore.reset();
      blobStore.resetAll();
      blackHoleStore.resetAll();
      particlesFaceStore.resetAll();
      persistAvatarChanges();
    } else if (domain === 'theme') {
      themeStore.resetToDefaults();
    } else {
      sceneStore.resetToDefaults();
    }

    actionState.recordAction('Reset UI domain', String(domain), { announce: true });
    return { success: true, message: `Reset ${domain} settings to defaults.` };
  }

  async function listUiControls() {
    return {
      success: true,
      panels: [...WORKSPACE_PANELS],
      panelControls: ['activePanel', 'isOpen', 'sizePreset'],
      themeControls: [
        'preset',
        'accentPreset',
        'mode',
        'sidebarPosition',
        'compactMode',
        'accentPrimary',
        'accentSecondary',
        'glassBlur',
        'glassOpacity',
        'saturation',
        'gradientDirection',
        'panelBorder',
        'glowEffects',
        'highContrast',
        'focusIndicators',
        'cursorFlashlight',
        'flashlightSize',
        'flashlightIntensity',
        'flashlightColor',
        'borderRadius',
      ],
      avatarControls: [
        'renderer',
        'preset',
        'blobSkinType',
        'blobColors',
        'blobSpikes',
        'blobAmplitude',
        'blobRotation',
        'blobScale',
        'blobOpacity',
        'blobShininess',
        'blobWireframe',
        'blobGlassMode',
        'blobAudioReactivity',
        'blobAudioEnabled',
        'blackHoleColorScheme',
        'blackHoleColors',
        'blackHoleCore',
        'blackHoleDisk',
        'blackHoleAnimation',
        'blackHoleEffects',
        'blackHoleScale',
        'particlesFaceAppearance',
        'particlesFaceMotion',
      ],
      sceneControls: [
        'mediaType',
        'imageUrl',
        'imageFit',
        'imageOpacity',
        'videoUrl',
        'videoFit',
        'videoOpacity',
        'videoLoop',
        'videoMuted',
        'hdriUrl',
        'hdriIntensity',
        'hdriOpacity',
        'hdriRotation',
        'hdriBlur',
        'gradientEnabled',
        'gradientType',
        'gradientSolidColor',
        'gradientAngle',
        'gradientRadialCenter',
        'gradientRadialSize',
        'gradientOpacity',
        'gradientBlendMode',
      ],
      voiceControls: [
        'pipelineMode',
        'ttsVoice',
        'ttsSpeed',
        'realtimeVoice',
        'sttLanguage',
        'responseLength',
        'emotionalTone',
        'llmModel',
        'sttModel',
        'ttsModel',
        'realtimeModel',
      ],
      enhancementControls: [
        'turnDetectionEnabled',
        'turnDetectionMode',
        'turnDetectionModel',
        'minEndpointingDelay',
        'maxEndpointingDelay',
        'interruptionsEnabled',
        'interruptionDuration',
        'interruptionWords',
        'noiseCancellationEnabled',
        'noiseCancellationMode',
        'vadThreshold',
        'vadMinSpeech',
        'vadMinSilence',
        'echoCancellation',
        'autoGainControl',
        'preemptiveGeneration',
      ],
      memoryUiControls: ['activeTab'],
      resettableDomains: [...RESETTABLE_DOMAINS],
      message: 'Structured UI controls are available across panels, theme, avatar, scene, voice, enhancements, memory, and search.',
    };
  }

  async function setUiControl(
    domain: unknown,
    control: unknown,
    value: unknown,
    confirm: unknown,
  ) {
    const normalizedDomain = normalizeDomain(domain);
    if (!normalizedDomain) {
      return {
        success: false,
        message: `Unknown UI domain "${String(domain)}". Supported domains: ${UI_CONTROL_DOMAINS.join(', ')}.`,
      };
    }

    if (typeof control !== 'string') {
      return {
        success: false,
        message: 'UI control requests need a string control name.',
      };
    }

    const normalizedControl = normalizeKey(control);

    if (normalizedDomain === 'workspace') {
      if (normalizedControl === 'openpanel') return openPanel(value);
      if (normalizedControl === 'closepanel') return closePanel();
      if (normalizedControl === 'focustranscription') return openPanel('transcription');
      if (normalizedControl === 'renderer') return setRenderer(value);
      if (normalizedControl === 'responselength') return setResponseLength(value, confirm);
      if (normalizedControl === 'status') return showWorkspaceStatus();
      if (normalizedControl === 'listcontrols') return listUiControls();
      return {
        success: false,
        message:
          'Workspace controls include openPanel, closePanel, focusTranscription, renderer, responseLength, status, and listControls.',
      };
    }

    if (normalizedDomain === 'panel') {
      return setPanelControl(
        normalizedControl === 'openpanel' ? 'activePanel' : control,
        normalizedControl === 'openpanel' ? value : value,
      );
    }

    if (normalizedDomain === 'theme') {
      return setThemeControl(control, value);
    }

    if (normalizedDomain === 'avatar') {
      return setAvatarControl(control, value);
    }

    if (normalizedDomain === 'scene') {
      return setSceneControl(control, value);
    }

    if (normalizedDomain === 'voice') {
      return setVoiceControl(control, value, confirm);
    }

    if (normalizedDomain === 'enhancements') {
      return setEnhancementControl(control, value);
    }

    if (normalizedDomain === 'memory') {
      return setMemoryUiControl(control, value);
    }

    if (normalizedDomain === 'search') {
      if (normalizedControl === 'clear' || normalizedControl === 'clearresults') {
        return clearSearchResults();
      }
      return {
        success: false,
        message: 'Search controls currently support clear or clearResults.',
      };
    }

    return {
      success: false,
      message: `Unsupported UI domain "${normalizedDomain}".`,
    };
  }

  function registerTools(instance: Kwami) {
    instance.registerTool({
      name: 'set_ui_control',
      description:
        'Primary tool for natural-language UI control. Route app changes through domain/control/value requests. Examples: domain=theme control=mode value=dark; domain=theme control=sidebarPosition value=right; domain=avatar control=blobSpikes value={x:0.6,y:0.5,z:0.7}; domain=workspace control=openPanel value=memory; domain=voice control=ttsSpeed value=1.2.',
      parameters: {
        domain: {
          type: 'string',
          enum: [...UI_CONTROL_DOMAINS],
        },
        control: {
          type: 'string',
        },
        value: {},
        confirm: {
          type: 'boolean',
        },
      },
      handler: async ({ domain, control, value, confirm }) =>
        setUiControl(domain, control, value, confirm),
    });

    instance.registerTool({
      name: 'open_workspace_panel',
      description: 'Open a workspace panel in the app UI.',
      parameters: { panelName: { type: 'string', enum: [...WORKSPACE_PANELS] } },
      handler: async ({ panelName }) => openPanel(panelName),
    });

    instance.registerTool({
      name: 'close_workspace_panel',
      description: 'Close the currently visible workspace side panel.',
      handler: async () => closePanel(),
    });

    instance.registerTool({
      name: 'focus_transcription_panel',
      description: 'Open the transcription panel so the user can see the conversation log.',
      handler: async () => openPanel('transcription'),
    });

    instance.registerTool({
      name: 'set_panel_control',
      description: 'Control panel UI properties like activePanel, isOpen, or sizePreset.',
      parameters: {
        control: { type: 'string', enum: ['activePanel', 'isOpen', 'sizePreset'] },
        value: { type: 'string' },
      },
      handler: async ({ control, value }) => setPanelControl(control, value),
    });

    instance.registerTool({
      name: 'set_theme_control',
      description:
        'Control the theme UI. Supports preset, accentPreset, mode, sidebarPosition, compactMode, accent colors, glass settings, saturation, glow, border, contrast, and flashlight controls.',
      parameters: {
        control: { type: 'string' },
        value: {},
      },
      handler: async ({ control, value }) => setThemeControl(control, value),
    });

    instance.registerTool({
      name: 'set_avatar_control',
      description:
        'Control avatar UI settings across blob, black-hole, and particles-face renderers. Supports renderer switching, presets, colors, spikes, amplitude, rotation, scale, black-hole core/disk/effects, and particles-face appearance or motion.',
      parameters: {
        control: { type: 'string' },
        value: {},
      },
      handler: async ({ control, value }) => setAvatarControl(control, value),
    });

    instance.registerTool({
      name: 'set_scene_control',
      description:
        'Control scene background settings such as mediaType, image/video/HDRI sources, fit, opacity, HDRI background opacity, environment light intensity, blur, and gradient settings.',
      parameters: {
        control: { type: 'string' },
        value: {},
      },
      handler: async ({ control, value }) => setSceneControl(control, value),
    });

    instance.registerTool({
      name: 'set_voice_control',
      description:
        'Control voice and model UI settings such as ttsVoice, ttsSpeed, realtimeVoice, sttLanguage, responseLength, emotionalTone, llmModel, sttModel, ttsModel, realtimeModel, or pipelineMode. Advanced model and pipeline changes can require confirmation.',
      parameters: {
        control: { type: 'string' },
        value: {},
        confirm: { type: 'boolean' },
      },
      handler: async ({ control, value, confirm }) => setVoiceControl(control, value, confirm),
    });

    instance.registerTool({
      name: 'set_enhancement_control',
      description:
        'Control enhancement UI settings such as turn detection, interruptions, noise cancellation, VAD thresholds, echo cancellation, auto gain control, and preemptive generation.',
      parameters: {
        control: { type: 'string' },
        value: {},
      },
      handler: async ({ control, value }) => setEnhancementControl(control, value),
    });

    instance.registerTool({
      name: 'set_memory_ui_control',
      description: 'Control memory UI settings such as the activeTab value.',
      parameters: {
        control: { type: 'string', enum: ['activeTab'] },
        value: { type: 'string', enum: ['facts', 'entities', 'messages'] },
      },
      handler: async ({ control, value }) => setMemoryUiControl(control, value),
    });

    instance.registerTool({
      name: 'set_workspace_renderer',
      description: 'Switch the visual renderer for the main Kwami avatar.',
      parameters: {
        renderer: { type: 'string', enum: ['blob-xyz', 'black-hole', 'particles-face'] },
      },
      handler: async ({ renderer }) => setRenderer(renderer),
    });

    instance.registerTool({
      name: 'set_response_length',
      description: 'Change how long your spoken responses should be. This updates a workspace preference and requires confirmation.',
      parameters: {
        length: { type: 'string', enum: ['short', 'medium', 'long'] },
        confirm: { type: 'boolean' },
      },
      handler: async ({ length, confirm }) => setResponseLength(length, confirm),
    });

    instance.registerTool({
      name: 'clear_search_results',
      description: 'Clear the current search cards and search summary from the app UI.',
      handler: async () => clearSearchResults(),
    });

    instance.registerTool({
      name: 'reset_ui_domain',
      description: 'Reset an app UI domain to defaults. Supports avatar, theme, or scene and requires confirmation.',
      parameters: {
        domain: { type: 'string', enum: [...RESETTABLE_DOMAINS] },
        confirm: { type: 'boolean' },
      },
      handler: async ({ domain, confirm }) => resetUiDomain(domain, confirm),
    });

    instance.registerTool({
      name: 'list_ui_controls',
      description: 'List the available structured UI controls that the app supports.',
      handler: async () => listUiControls(),
    });

    instance.registerTool({
      name: 'show_workspace_status',
      description: 'Get a short summary of the current workspace state, including panel, renderer, theme, and search visibility.',
      handler: async () => showWorkspaceStatus(),
    });
  }

  watch(
    kwami,
    (instance) => {
      if (!instance) return;
      registerTools(instance);
    },
    { immediate: true },
  );
}
