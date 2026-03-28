import { Signal } from "../../lib/signals";
import type { EnrichedPR } from "../../lib/types";
import type { StoreState } from "./types";

export class PRStore {
  private _state: StoreState<EnrichedPR[]> = { status: "loading" };

  readonly changed = new Signal<void>();

  get state(): StoreState<EnrichedPR[]> {
    return this._state;
  }

  setLoading(): void {
    this._state = { status: "loading" };
    this.changed.emit();
  }

  setReady(data: EnrichedPR[]): void {
    this._state = { status: "ready", data };
    this.changed.emit();
  }

  setError(error: string): void {
    this._state = { status: "error", error };
    this.changed.emit();
  }

  dispose(): void {
    this.changed.dispose();
  }
}
