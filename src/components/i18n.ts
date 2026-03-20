/**
 * Minimal i18n shim for WelcomeLayer (no full i18n in app).
 * Replace with real i18n if you add translations.
 */
const defaultStrings: Record<string, string> = {
  'welcome_layer.heading': 'KWAMI',
  'welcome_layer.line1': 'Your AI companion',
  'welcome_layer.line2': 'Click to enter',
  'welcome_layer.line3': 'Voice, memory, and personality',
};

export function t(key: string): string {
  return defaultStrings[key] ?? key;
}

const listeners: Array<() => void> = [];

const i18next = {
  on(_event: string, callback: () => void) {
    listeners.push(callback);
  },
  off() {
    listeners.length = 0;
  },
};

export default i18next;
export { i18next };

export function createLanguageSwitcher(_id: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'welcome-language-switcher';
  el.setAttribute('aria-hidden', 'true');
  return el;
}
