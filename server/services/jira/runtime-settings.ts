/**
 * A server-only convenience store for local single-instance deployments.
 * It is intentionally never serialized and is cleared on process restart.
 * Production deployments should configure secrets through an environment or
 * secret manager, not rely on this store.
 */
type RuntimeJiraSettings = { baseUrl: string; email: string; apiToken: string; projectKey: string };

type RuntimeGlobal = typeof globalThis & {
  __aiProductJiraRuntimeSettings?: RuntimeJiraSettings;
};

// Kept server-side only; using globalThis preserves local settings through dev-server HMR.
const runtimeGlobal = globalThis as RuntimeGlobal;

export function saveRuntimeJiraSettings(next: RuntimeJiraSettings) {
  runtimeGlobal.__aiProductJiraRuntimeSettings = { ...next };
}

export function getRuntimeJiraSettings(): RuntimeJiraSettings | undefined {
  const settings = runtimeGlobal.__aiProductJiraRuntimeSettings;
  return settings ? { ...settings } : undefined;
}
