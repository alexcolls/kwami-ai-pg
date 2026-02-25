import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useVoiceStore } from '@/stores/voice';
import { useWorkspaceStore } from '@/stores/workspace';
import { useKwamiConfigSync } from '@/composables/useKwamiConfigSync';
import { useToast } from 'vue-toastification';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface KwamiForEdit {
  id: string;
  name: string;
  colors: { x: string; y: string; z: string };
}

export function useKwamiActions() {
  const authStore = useAuthStore();
  const voiceStore = useVoiceStore();
  const workspaceStore = useWorkspaceStore();
  const { getConfig } = useKwamiConfigSync();
  const toast = useToast();

  const showNewKwamiModal = ref(false);
  const showEditKwamiModal = ref(false);
  const showDeleteConfirm = ref(false);
  const editKwami = ref<KwamiForEdit | null>(null);
  const deleteKwamiId = ref('');
  const deleteKwamiName = ref('');

  const activeWorkspace = computed(() => workspaceStore.getActiveWorkspace());

  function openAdd() {
    showNewKwamiModal.value = true;
  }

  function openEdit(ws: KwamiForEdit) {
    editKwami.value = ws;
    showEditKwamiModal.value = true;
  }

  function closeNew() {
    showNewKwamiModal.value = false;
  }

  function closeEdit() {
    showEditKwamiModal.value = false;
    editKwami.value = null;
  }

  function closeDelete() {
    showDeleteConfirm.value = false;
    deleteKwamiId.value = '';
    deleteKwamiName.value = '';
  }

  function openDeleteFromEdit() {
    if (!editKwami.value) return;
    deleteKwamiId.value = editKwami.value.id;
    deleteKwamiName.value = editKwami.value.name;
    editKwami.value = null;
    showEditKwamiModal.value = false;
    showDeleteConfirm.value = true;
  }

  async function deleteKwamiZepMemory(kwamiId: string, userId: string | null): Promise<void> {
    if (!userId) return;
    const memoryUserId = `kwami_${userId}_${kwamiId}`;
    try {
      const token = await authStore.getAccessToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/memory/${memoryUserId}`, { method: 'DELETE', headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.warn('Failed to delete kwami Zep memory:', body?.detail ?? res.statusText);
      }
    } catch (e) {
      console.warn('Failed to delete kwami Zep memory:', e);
    }
  }

  async function onNewConfirm(payload: {
    name: string;
    randomize: boolean;
    colors: { x: string; y: string; z: string };
  }) {
    const initial: Parameters<typeof workspaceStore.addKwami>[1] = payload.name ? { name: payload.name } : {};
    initial.randomize = payload.randomize;
    initial.colors = { ...payload.colors };
    if (!payload.randomize && activeWorkspace.value) {
      initial.config = getConfig();
    }
    const newKwami = await workspaceStore.addKwami(authStore.userId, initial);
    voiceStore.personaConfig.name = newKwami.name;
    showNewKwamiModal.value = false;
    toast.success(newKwami.emoji ? `Created "${newKwami.name}" ${newKwami.emoji}` : `Created "${newKwami.name}"`);
    return newKwami;
  }

  async function onEditSave(payload: { name: string; colors: { x: string; y: string; z: string } }) {
    const kwami = editKwami.value;
    if (!kwami) return;
    await workspaceStore.updateKwami(kwami.id, payload, authStore.userId);
    if (workspaceStore.activeWorkspaceId === kwami.id) {
      voiceStore.personaConfig.name = payload.name;
    }
    showEditKwamiModal.value = false;
    editKwami.value = null;
    toast.success('Kwami updated');
  }

  async function onDeleteConfirm() {
    const id = deleteKwamiId.value;
    if (!id) {
      closeDelete();
      return;
    }
    const deleteFn = workspaceStore.deleteKwami;
    if (typeof deleteFn !== 'function') {
      toast.error('Please refresh the page and try again');
      closeDelete();
      return;
    }
    const ok = await deleteFn(id, authStore.userId);
    closeDelete();
    if (ok) {
      await deleteKwamiZepMemory(id, authStore.userId);
      toast.success('Kwami deleted');
    } else {
      toast.error('Failed to delete kwami');
    }
  }

  return {
    showNewKwamiModal,
    showEditKwamiModal,
    showDeleteConfirm,
    editKwami,
    deleteKwamiName,
    activeWorkspace,
    openAdd,
    openEdit,
    closeNew,
    closeEdit,
    closeDelete,
    openDeleteFromEdit,
    onNewConfirm,
    onEditSave,
    onDeleteConfirm,
  };
}
