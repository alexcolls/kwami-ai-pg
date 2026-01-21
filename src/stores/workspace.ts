import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface KwamiWorkspace {
    id: string;
    name: string;
    emoji: string;
    colors: { x: string; y: string; z: string };
}

export const useWorkspaceStore = defineStore('workspace', () => {
    const workspaces = ref<KwamiWorkspace[]>([]);
    const activeWorkspaceId = ref<string>('');

    // Initial generation
    function generateRandomKwami(): KwamiWorkspace {
        const emojis = ['🌸', '🔮', '✨', '🌊', '🎭', '🌙', '⚡', '🎪', '🌈', '💫', '🦋', '🌺'];
        const adjectives = [
            'Cosmic',
            'Mystic',
            'Neon',
            'Stellar',
            'Aurora',
            'Crystal',
            'Shadow',
            'Prism',
        ];
        const nouns = ['Spark', 'Wave', 'Pulse', 'Echo', 'Drift', 'Glow', 'Flux', 'Vibe'];

        const randomColor = () =>
            '#' +
            Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, '0');

        const adj = adjectives[Math.floor(Math.random() * adjectives.length)] || 'Cosmic';
        const noun = nouns[Math.floor(Math.random() * nouns.length)] || 'Spark';
        const emoji = emojis[Math.floor(Math.random() * emojis.length)] || '🌸';

        return {
            id: `kwami_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: `${adj} ${noun}`,
            emoji: emoji,
            colors: { x: randomColor(), y: randomColor(), z: randomColor() },
        };
    }

    // Initialize with one
    if (workspaces.value.length === 0) {
        const initial = generateRandomKwami();
        workspaces.value.push(initial);
        activeWorkspaceId.value = initial.id;
    }

    function addKwami() {
        const newWs = generateRandomKwami();
        workspaces.value.push(newWs);
        activeWorkspaceId.value = newWs.id;
        return newWs;
    }

    function setActive(id: string) {
        if (workspaces.value.find((w) => w.id === id)) {
            activeWorkspaceId.value = id;
        }
    }

    function getActiveWorkspace() {
        return workspaces.value.find((w) => w.id === activeWorkspaceId.value);
    }

    return { workspaces, activeWorkspaceId, addKwami, setActive, getActiveWorkspace };
});
