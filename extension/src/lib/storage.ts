import { DashboardSettings, DEFAULT_SETTINGS } from "./types";

const SETTINGS_KEY = "settings";

function getStorage(): typeof chrome.storage.local | null {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    return chrome.storage.local;
  }
  return null;
}

export async function loadSettings(): Promise<DashboardSettings> {
  const storage = getStorage();
  if (storage) {
    const result = await storage.get(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...result[SETTINGS_KEY] };
  }
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (raw) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(
  settings: DashboardSettings
): Promise<void> {
  const storage = getStorage();
  if (storage) {
    await storage.set({ [SETTINGS_KEY]: settings });
  } else {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}

export async function updateSettings(
  partial: Partial<DashboardSettings>
): Promise<DashboardSettings> {
  const current = await loadSettings();
  const updated = { ...current, ...partial };
  await saveSettings(updated);
  return updated;
}
