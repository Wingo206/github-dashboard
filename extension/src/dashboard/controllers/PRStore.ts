import { Signal } from "../../lib/signals";
import type { EnrichedPR } from "../../lib/types";
import { initialStoreState, type StoreState } from "./types";

export class PRStore {
  private _state: StoreState<EnrichedPR[]> = initialStoreState();

  readonly changed = new Signal<void>();

  get state(): StoreState<EnrichedPR[]> {
    return this._state;
  }

  reset(): void {
    this._state = { snapshot: { status: "none" }, loading: true };
    this.changed.emit();
  }

  setLoading(): void {
    this._state = { ...this._state, loading: true };
    this.changed.emit();
  }

  setReady(data: EnrichedPR[]): void {
    this._state = { snapshot: { status: "ready", data }, loading: false };
    this.changed.emit();
  }

  setError(error: string): void {
    if (this._state.snapshot.status === "ready") {
      this._state = { ...this._state, loading: false };
    } else {
      this._state = { snapshot: { status: "error", error }, loading: false };
    }
    this.changed.emit();
  }

  dispose(): void {
    this.changed.dispose();
  }
}
