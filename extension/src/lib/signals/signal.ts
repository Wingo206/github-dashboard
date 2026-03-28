import type { SignalCallback, ISignal, ISignalConnection } from "./types";

export class Signal<T = void> implements ISignal<T> {
  private handlers = new Set<SignalCallback<T>>();
  private _isDisposed = false;

  get connectionCount(): number {
    return this.handlers.size;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  connect(callback: SignalCallback<T>): ISignalConnection {
    if (this._isDisposed) {
      throw new Error("Cannot connect to a disposed signal");
    }

    this.handlers.add(callback);

    let disposed = false;
    return {
      dispose: () => {
        if (!disposed) {
          disposed = true;
          this.handlers.delete(callback);
        }
      },
    };
  }

  emit = ((...args: T extends void ? [] : [T]) => {
    if (this._isDisposed) return;

    const data = args[0] as T;
    for (const handler of this.handlers) {
      (handler as (data: T) => void)(data);
    }
  }) as ISignal<T>["emit"];

  disconnectAll(): void {
    this.handlers.clear();
  }

  dispose(): void {
    if (this._isDisposed) return;
    this.disconnectAll();
    this._isDisposed = true;
  }
}
