import { Signal } from "../../lib/signals";

export class CheckoutController {
  readonly changed = new Signal<void>();
  private _branch: string | null = null;

  get branch(): string | null {
    return this._branch;
  }

  open(branch: string): void {
    this._branch = branch;
    this.changed.emit();
  }

  close(): void {
    this._branch = null;
    this.changed.emit();
  }

  dispose(): void {
    this.changed.dispose();
  }
}
