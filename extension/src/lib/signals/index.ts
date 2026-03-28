export type { SignalCallback, ISignalConnection, ISignal } from "./types";
export { Signal } from "./signal";
export { useSignalValue } from "./useSignalValue";

import { Signal } from "./signal";

export function createSignal<T = void>(): Signal<T> {
  return new Signal<T>();
}
