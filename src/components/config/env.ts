/**
 * Minimal env config shim for WelcomeLayer.
 * Return undefined so Kwami uses defaults.
 */
export function getKwamiAppsConfig(): undefined | Record<string, unknown> {
  return undefined;
}
