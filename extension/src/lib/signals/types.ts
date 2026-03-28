export type SignalCallback<T = void> = T extends void
  ? () => void
  : (data: T) => void;

export interface ISignalConnection {
  dispose(): void;
}

export interface ISignal<T = void> {
  connect(callback: SignalCallback<T>): ISignalConnection;
  emit: T extends void ? () => void : (data: T) => void;
  disconnectAll(): void;
  dispose(): void;
  readonly connectionCount: number;
  readonly isDisposed: boolean;
}
