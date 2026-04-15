<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { panelIcons } from '@/constants/panel-icons';
import { useToast } from 'vue-toastification';
import { useKwami } from '@/composables/useKwami';
import type { ToolDefinition } from 'kwami';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import PanelHeaderControls from '@/components/ui/PanelHeaderControls.vue';

const toast = useToast();

const { kwami } = useKwami();

// State
const tools = ref<ToolDefinition[]>([]);
const newTool = ref({ name: '', description: '', parameters: '' });
const mcp = ref({ name: '', url: '', apiKey: '' });
const mcps = ref<Array<{ name: string; url: string }>>([]);
const exec = ref({ toolName: '', params: '', result: '', loading: false, error: '' });

const templates: Record<string, any> = {
  weather: {
    name: 'get_weather',
    description: 'Get current weather',
    parameters: {
      location: { type: 'string' },
      units: { type: 'string', enum: ['metric', 'imperial'] },
    },
  },
  search: {
    name: 'web_search',
    description: 'Search the web',
    parameters: { query: { type: 'string' }, limit: { type: 'number' } },
  },
  calc: {
    name: 'calculate',
    description: 'Perform math',
    parameters: { expression: { type: 'string' } },
  },
};

function refreshTools() {
  if (kwami.value) tools.value = kwami.value.tools.getAll();
}

function removeTool(name: string) {
  if (confirm(`Remove tool "${name}"?`)) {
    kwami.value?.tools.unregister(name);
    refreshTools();
  }
}

function useTemplate(key: string) {
  const tmpl = templates[key];
  if (tmpl) {
    newTool.value = {
      name: tmpl.name,
      description: tmpl.description,
      parameters: JSON.stringify(tmpl.parameters, null, 2),
    };
  }
}

function addTool() {
  if (!newTool.value.name || !newTool.value.description) {
    toast.warning('Name and description are required');
    return;
  }
  let parsedParams;
  try {
    if (newTool.value.parameters) parsedParams = JSON.parse(newTool.value.parameters);
  } catch {
    toast.error('Invalid JSON in parameters');
    return;
  }

  kwami.value?.tools.register({
    name: newTool.value.name,
    description: newTool.value.description,
    parameters: parsedParams,
    handler: async (p) => {
      console.log(`Tool ${newTool.value.name}:`, p);
      return { success: true, message: `Executed ${newTool.value.name} (Mock)` };
    },
  });
  newTool.value = { name: '', description: '', parameters: '' };
  refreshTools();
}

async function connectMCP() {
  if (!mcp.value.name || !mcp.value.url) return;
  try {
    await kwami.value?.tools.connectMCP({
      name: mcp.value.name,
      url: mcp.value.url,
      apiKey: mcp.value.apiKey || undefined,
    });
    mcps.value.push({ name: mcp.value.name, url: mcp.value.url });
    mcp.value = { name: '', url: '', apiKey: '' };
    refreshTools();
  } catch (e) {
    toast.error('MCP connection failed: ' + (e as Error).message);
  }
}

async function executeTool() {
  if (!exec.value.toolName) return;
  exec.value.loading = true;
  exec.value.result = '';
  exec.value.error = '';
  let params = {};
  try {
    if (exec.value.params) params = JSON.parse(exec.value.params);
  } catch {
    exec.value.error = 'Invalid JSON';
    exec.value.loading = false;
    return;
  }
  try {
    exec.value.result = JSON.stringify(
      await kwami.value?.executeTool(exec.value.toolName, params),
      null,
      2,
    );
  } catch (e) {
    exec.value.error = (e as Error).message;
  } finally {
    exec.value.loading = false;
  }
}

onMounted(refreshTools);
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon :icon="panelIcons.tools" class="panel-icon"></iconify-icon>
      <h2>Tools</h2>
      <PanelHeaderControls />
    </div>

    <div class="panel-body">
      <!-- Registered -->
      <PanelSection title="Registered Tools">
        <div class="tools-list">
          <div v-if="!tools.length" class="empty">No tools registered</div>
          <div v-for="t in tools" :key="t.name" class="card">
            <div class="head">
              <iconify-icon icon="ph:function-duotone"></iconify-icon>
              <span class="name">{{ t.name }}</span>
              <button class="remove" @click="removeTool(t.name)">×</button>
            </div>
            <p class="desc">{{ t.description }}</p>
            <details v-if="t.parameters" class="params">
              <summary>Params</summary>
              <pre>{{ JSON.stringify(t.parameters, null, 2) }}</pre>
            </details>
          </div>
        </div>
        <BaseButton
          size="sm"
          icon="ph:arrows-clockwise-duotone"
          @click="refreshTools"
          style="margin-top: 8px"
          >Refresh</BaseButton
        >
      </PanelSection>

      <!-- Add Tool -->
      <PanelSection title="Add Custom Tool">
        <div class="form">
          <BaseInput label="Name" v-model="newTool.name" placeholder="my_tool" />
          <div class="group">
            <label>Description</label><textarea v-model="newTool.description" rows="2"></textarea>
          </div>
          <div class="group">
            <label>Parameters (JSON)</label
            ><textarea v-model="newTool.parameters" rows="3" placeholder="{}"></textarea>
          </div>
          <BaseButton variant="primary" icon="ph:plus-duotone" @click="addTool"
            >Add Tool</BaseButton
          >
        </div>
        <div class="tmpls">
          <span class="tmpl-label">Templates:</span>
          <button v-for="(_, k) in templates" :key="k" @click="useTemplate(k as string)">
            {{ k }}
          </button>
        </div>
      </PanelSection>

      <!-- MCP -->
      <PanelSection title="MCP Servers">
        <div class="tools-list">
          <div v-if="!mcps.length" class="empty">No MCP servers</div>
          <div v-for="s in mcps" :key="s.name" class="card">
            <div class="head">
              <iconify-icon icon="ph:plugs-connected-duotone"></iconify-icon>
              <span class="name">{{ s.name }}</span>
              <span class="badg">Connected</span>
            </div>
            <span class="url">{{ s.url }}</span>
          </div>
        </div>
        <div class="form" style="margin-top: 12px">
          <BaseInput label="Name" v-model="mcp.name" placeholder="my-mcp" />
          <BaseInput label="URL" v-model="mcp.url" placeholder="http://localhost:3001" />
          <BaseInput label="API Key" v-model="mcp.apiKey" type="password" />
          <BaseButton icon="ph:plugs-connected-duotone" @click="connectMCP">Connect MCP</BaseButton>
        </div>
      </PanelSection>

      <!-- Test -->
      <PanelSection title="Test Tool Execution">
        <div class="form">
          <BaseSelect
            label="Tool"
            v-model="exec.toolName"
            :options="tools.map((t) => ({ label: t.name, value: t.name }))"
          />
          <div class="group">
            <label>Params (JSON)</label
            ><textarea v-model="exec.params" rows="2" placeholder="{}"></textarea>
          </div>
          <BaseButton :disabled="exec.loading" icon="ph:play-duotone" @click="executeTool">{{
            exec.loading ? 'Running...' : 'Execute'
          }}</BaseButton>

          <div v-if="exec.result" class="res success">
            <pre>{{ exec.result }}</pre>
          </div>
          <div v-if="exec.error" class="res error">{{ exec.error }}</div>
        </div>
      </PanelSection>
    </div>
  </div>
</template>

<style scoped>
.tools-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.empty {
  text-align: center;
  padding: 12px;
  color: var(--text-tertiary);
  font-size: 13px;
  background: var(--surface-1);
  border-radius: 8px;
}
.card {
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 10px;
}
.head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.name {
  font-weight: 600;
  font-size: 13px;
  flex: 1;
}
.remove {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 16px;
  padding: 0;
}
.remove:hover {
  color: var(--accent-error);
}
.desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 6px 0;
  line-height: 1.3;
}
.params {
  font-size: 11px;
}
.params pre {
  background: var(--surface-2);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 4px 0 0 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.group label {
  font-size: 11px;
  color: var(--text-tertiary);
}
textarea {
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  padding: 8px;
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  resize: vertical;
}

.tmpls {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
}
.tmpl-label {
  font-size: 11px;
  color: var(--text-tertiary);
}
.tmpls button {
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 10px;
  cursor: pointer;
  color: var(--text-secondary);
}
.tmpls button:hover {
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.badg {
  font-size: 10px;
  color: var(--accent-success);
  background: rgba(var(--accent-success-rgb), 0.1);
  padding: 2px 6px;
  border-radius: 10px;
}
.url {
  font-size: 11px;
  color: var(--text-tertiary);
  word-break: break-all;
}

.res {
  margin-top: 8px;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
}
.res.success {
  background: rgba(0, 255, 100, 0.1);
  color: var(--text-primary);
}
.res.success pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
.res.error {
  background: rgba(255, 0, 0, 0.1);
  color: var(--accent-error);
}
</style>
