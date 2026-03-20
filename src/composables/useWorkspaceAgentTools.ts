import { watch } from 'vue';
import type { Kwami } from 'kwami';
import { useKwami } from '@/composables/useKwami';
import { useUIStore } from '@/stores/ui';
import { useSearchStore } from '@/stores/search';
import { useVoiceStore } from '@/stores/voice';
import { useTranscriptionState } from '@/composables/useTranscriptionState';
import { useAgentActionState } from '@/composables/useAgentActionState';

const WORKSPACE_PANELS = [
  'avatar',
  'scene',
  'voice',
  'enhancements',
  'transcription',
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
  voice: 'voice',
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
  const { kwami, switchRenderer, rendererType, isConnected } = useKwami();
  const uiStore = useUIStore();
  const searchStore = useSearchStore();
  const voiceStore = useVoiceStore();
  const { messages } = useTranscriptionState();
  const actionState = useAgentActionState();

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
      return {
        success: true,
        message: 'The workspace panel is already closed.',
      };
    }

    uiStore.togglePanel();
    actionState.recordAction('Closed panel', humanizePanel(uiStore.activePanel as WorkspacePanel), {
      announce: true,
    });
    return {
      success: true,
      message: 'Closed the workspace panel.',
    };
  }

  async function setRenderer(renderer: unknown) {
    if (renderer !== 'blob-xyz' && renderer !== 'black-hole' && renderer !== 'particles-face') {
      actionState.recordError('Unable to switch renderer', `Unknown renderer "${String(renderer)}"`);
      return {
        success: false,
        message: 'Unknown renderer. Use blob-xyz, black-hole, or particles-face.',
      };
    }

    if (rendererType.value === renderer) {
      return {
        success: true,
        message: `The renderer is already set to ${renderer}.`,
      };
    }

    switchRenderer(renderer);
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

    const applyChange = () => {
      voiceStore.soulConfig.responseLength = length as ResponseLength;
      const soulConfig = buildSoulConfig(voiceStore);
      kwami.value?.soul.updateConfig(soulConfig);
      if (isConnected.value) {
        kwami.value?.agent.syncConfigToBackend('soul', soulConfig);
      }
      actionState.recordAction('Updated response length', length, { announce: true });
      return {
        success: true,
        persisted: true,
        responseLength: length,
        message: `Changed response length to ${length}.`,
      };
    };

    if (confirm !== true) {
      const approved = await actionState.requestConfirmation({
        title: 'Confirm response style change',
        message: `Change response length to ${length}? This updates the current workspace preference.`,
        confirmLabel: 'Apply',
        cancelLabel: 'Keep current',
      });

      if (!approved) {
        actionState.recordAction('Kept current response length', undefined, { announce: true });
        return {
          success: false,
          cancelled: true,
          message: 'Response length change was cancelled.',
        };
      }
    }

    return applyChange();
  }

  async function clearSearchResults() {
    if (!searchStore.hasSearchData) {
      return {
        success: true,
        message: 'There are no search results to clear.',
      };
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
      visibleMessages: messages.value.length,
      message:
        `Workspace status: panel ${uiStore.isPanelOpen ? 'open' : 'closed'}, ` +
        `active panel ${uiStore.activePanel}, renderer ${rendererType.value}, ` +
        `response length ${voiceStore.soulConfig.responseLength}.`,
    };
  }

  function registerTools(instance: Kwami) {
    instance.registerTool({
      name: 'open_workspace_panel',
      description:
        'Open a workspace panel in the app UI. Use for requests like open memory, show tools, or switch to transcription.',
      parameters: {
        panelName: {
          type: 'string',
          enum: [...WORKSPACE_PANELS],
        },
      },
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
      name: 'set_workspace_renderer',
      description: 'Switch the visual renderer for the main Kwami avatar.',
      parameters: {
        renderer: {
          type: 'string',
          enum: ['blob-xyz', 'black-hole', 'particles-face'],
        },
      },
      handler: async ({ renderer }) => setRenderer(renderer),
    });

    instance.registerTool({
      name: 'set_response_length',
      description:
        'Change how long your spoken responses should be. This updates a workspace preference and may require confirmation.',
      parameters: {
        length: {
          type: 'string',
          enum: ['short', 'medium', 'long'],
        },
        confirm: {
          type: 'boolean',
        },
      },
      handler: async ({ length, confirm }) => setResponseLength(length, confirm),
    });

    instance.registerTool({
      name: 'clear_search_results',
      description: 'Clear the current search cards and search summary from the app UI.',
      handler: async () => clearSearchResults(),
    });

    instance.registerTool({
      name: 'show_workspace_status',
      description: 'Get a short summary of the current workspace state, including panel, renderer, and search visibility.',
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
