/**
 * Minimal ThemeModeManager shim for WelcomeLayer.
 * Returns a stub that creates a placeholder theme toggle button.
 */
export function getThemeModeManager(): {
  createThemeToggleButton: (id: string) => HTMLElement;
} {
  return {
    createThemeToggleButton(id: string): HTMLElement {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = id;
      btn.className = 'welcome-theme-toggle';
      btn.setAttribute('aria-label', 'Toggle theme');
      return btn;
    },
  };
}
