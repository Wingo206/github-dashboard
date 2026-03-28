import { Signal } from "../../lib/signals";
import {
  DashboardSettings,
  DEFAULT_SETTINGS,
} from "../../lib/types";
import { loadSettings, saveSettings } from "../../lib/storage";

export class SettingsManager {
  private _settings: DashboardSettings = DEFAULT_SETTINGS;
  private _loading = true;

  readonly changed = new Signal<void>();

  get current(): DashboardSettings {
    return this._settings;
  }

  get loading(): boolean {
    return this._loading;
  }

  get isConfigured(): boolean {
    return (
      this._settings.githubToken.length > 0 &&
      this._settings.repoOwner.length > 0 &&
      this._settings.repoName.length > 0
    );
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
