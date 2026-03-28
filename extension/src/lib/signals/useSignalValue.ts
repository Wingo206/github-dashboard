import { useState, useEffect } from "react";
import type { ISignal } from "./types";

export function useSignalValue<T>(signal: ISignal<any>, getValue: () => T): T {
  const [value, setValue] = useState(getValue);

  useEffect(() => {
    setValue(getValue());

    if (signal.isDisposed) return;

    const connection = signal.connect(() => setValue(getValue()));
    return () => connection.dispose();
  }, [signal, getValue]);

  return value;
}
