import { Signal } from "../../lib/signals";
import {
  DashboardSettings,
  DEFAULT_SETTINGS,
} from "../../lib/types";
import { loadSettings, saveSettings } from "../../lib/storage";
import { createGitHubAPI, type IGitHubAPI } from "../../lib/github-api";
import { createMockGitHubAPI } from "../../lib/mock-github-api";

type ApiFactory = (token: string) => IGitHubAPI;

export class SettingsManager {
  private _settings: DashboardSettings = DEFAULT_SETTINGS;
  private _loading = true;
  private _debugMode = false;
  private _apiFactory: ApiFactory = createGitHubAPI;

  readonly changed = new Signal<void>();

  get current(): DashboardSettings {
    return this._settings;
  }

  get loading(): boolean {
    return this._loading;
  }

  get debugMode(): boolean {
    return this._debugMode;
  }

  get isConfigured(): boolean {
    if (this._debugMode) return true;
    return (
      this._settings.githubToken.length > 0 &&
      this._settings.repoOwner.length > 0 &&
      this._settings.repoName.length > 0
    );
  }

  setDebugMode(enabled: boolean): void {
    if (this._debugMode === enabled) return;
    this._debugMode = enabled;
    this._apiFactory = enabled ? createMockGitHubAPI : createGitHubAPI;
    this.changed.emit();
  }

  createApi(): IGitHubAPI {
    return this._apiFactory(this._settings.githubToken);
  }

  async resolveUser(api: IGitHubAPI): Promise<string> {
    if (this._debugMode) return (await api.getCurrentUser()).login;
    return this._settings.username || (await api.getCurrentUser()).login;
  }

  async init(): Promise<void> {
    this._settings = await loadSettings();
    this._loading = false;
    this.changed.emit();
  }

  async update(partial: Partial<DashboardSettings>): Promise<DashboardSettings> {
    const updated = { ...this._settings, ...partial };
    this._settings = updated;
    await saveSettings(updated);
    this.changed.emit();
    return updated;
  }

  dispose(): void {
    this.changed.dispose();
  }
}
