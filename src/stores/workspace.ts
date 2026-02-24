import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/lib/supabase';
import type { KwamiConfig } from '@/composables/useKwamiConfigSync';

export interface KwamiWorkspace {
  id: string;
  name: string;
  emoji: string;
  colors: { x: string; y: string; z: string };
  config?: KwamiConfig;
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref<KwamiWorkspace[]>([]);
  const activeWorkspaceId = ref<string>('');
  const loading = ref(false);
  const loadedFromDb = ref(false);

  function generateRandomKwami(): Omit<KwamiWorkspace, 'config'> {
    const emojis = ['🌸', '🔮', '✨', '🌊', '🎭', '🌙', '⚡', '🎪', '🌈', '💫', '🦋', '🌺'];
    const adjectives = [
      'Cosmic', 'Mystic', 'Neon', 'Stellar', 'Aurora', 'Crystal', 'Shadow', 'Prism',
    ];
    const nouns = ['Spark', 'Wave', 'Pulse', 'Echo', 'Drift', 'Glow', 'Flux', 'Vibe'];
    const randomColor = () =>
      '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)] || 'Cosmic';
    const noun = nouns[Math.floor(Math.random() * nouns.length)] || 'Spark';
    const emoji = emojis[Math.floor(Math.random() * emojis.length)] || '🌸';
    return {
      id: `kwami_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `${adj} ${noun}`,
      emoji,
      colors: { x: randomColor(), y: randomColor(), z: randomColor() },
    };
  }

  function ensureLocalWorkspace() {
    if (workspaces.value.length === 0) {
      const initial = { ...generateRandomKwami(), config: undefined };
      workspaces.value.push(initial);
      activeWorkspaceId.value = initial.id;
    }
  }

  async function loadFromDb(userId: string) {
    if (loading.value || !userId) return;
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('user_kwamis')
        .select('id, name, emoji, colors, config')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const rows = (data || []) as Array<{
        id: string;
        name: string;
        emoji: string;
        colors: { x: string; y: string; z: string };
        config?: KwamiConfig;
      }>;

      if (rows.length === 0) {
        const newKwami = await createKwamiInDb(userId, generateRandomKwami());
        if (newKwami) {
          workspaces.value = [newKwami];
          activeWorkspaceId.value = newKwami.id;
        }
      } else {
        workspaces.value = rows.map((r) => ({
          id: r.id,
          name: r.name,
          emoji: r.emoji,
          colors: r.colors || { x: '#00d9ff', y: '#a855f7', z: '#22c55e' },
          config: r.config,
        }));
        activeWorkspaceId.value = workspaces.value[0]!.id;
      }
      loadedFromDb.value = true;
    } catch (e) {
      console.warn('Failed to load kwamis from DB:', e);
      ensureLocalWorkspace();
    } finally {
      loading.value = false;
    }
  }

  async function createKwamiInDb(
    userId: string,
    data: { name: string; emoji: string; colors: { x: string; y: string; z: string } },
  ): Promise<KwamiWorkspace | null> {
    const { data: row, error } = await supabase
      .from('user_kwamis')
      .insert({
        user_id: userId,
        name: data.name,
        emoji: data.emoji,
        colors: data.colors,
        config: {},
      })
      .select('id, name, emoji, colors, config')
      .single();

    if (error) {
      console.warn('Failed to create kwami in DB:', error);
      return null;
    }
    return {
      id: row.id,
      name: row.name,
      emoji: row.emoji,
      colors: row.colors || data.colors,
      config: row.config,
    };
  }

  async function addKwami(userId: string | null): Promise<KwamiWorkspace> {
    const generated = generateRandomKwami();
    if (userId) {
      const created = await createKwamiInDb(userId, generated);
      if (created) {
        workspaces.value.push(created);
        activeWorkspaceId.value = created.id;
        return created;
      }
    }
    const local: KwamiWorkspace = { ...generated, config: undefined };
    workspaces.value.push(local);
    activeWorkspaceId.value = local.id;
    return local;
  }

  function setActive(id: string) {
    if (workspaces.value.some((w) => w.id === id)) {
      activeWorkspaceId.value = id;
    }
  }

  function getActiveWorkspace(): KwamiWorkspace | undefined {
    ensureLocalWorkspace();
    return workspaces.value.find((w) => w.id === activeWorkspaceId.value);
  }

  async function saveActiveConfig(config: KwamiConfig, userId: string | null) {
    if (!activeWorkspaceId.value) return;
    const ws = workspaces.value.find((w) => w.id === activeWorkspaceId.value);
    if (!ws) return;
    // Always update in-memory so switching back loads the right config (even when not logged in)
    ws.config = config;
    if (!userId) return;
    // Only persist to DB when the active kwami has a DB id (UUID). Local-only kwamis have ids like kwami_*
    const id = activeWorkspaceId.value;
    const isDbId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isDbId) return;
    try {
      const configPayload = JSON.parse(JSON.stringify(config)) as object;
      const { error } = await supabase
        .from('user_kwamis')
        .update({ config: configPayload })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase save kwami config failed:', error.message, error.details);
        throw error;
      }
    } catch (e) {
      console.warn('Failed to save kwami config:', e);
    }
  }

  return {
    workspaces,
    activeWorkspaceId,
    loading,
    loadedFromDb,
    addKwami,
    setActive,
    getActiveWorkspace,
    loadFromDb,
    saveActiveConfig,
    ensureLocalWorkspace,
  };
});
