"use client";

import { useCallback, useEffect, useState } from "react";
import { friendlyError, withTimeout } from "../async/with-timeout";

export type AsyncState<T> = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: T };

/**
 * Carrega dados com tempo limite e erro legível. `reload()` busca de novo (ex.: depois de excluir).
 * Regra do app: nenhuma lista fica em "Carregando…" para sempre.
 */
export function useAsync<T>(task: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    withTimeout(task())
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch((err) => !cancelled && setState({ status: "error", message: friendlyError(err) }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const retry = useCallback(() => {
    setState({ status: "loading" });
    setVersion((v) => v + 1);
  }, []);

  return { state, reload, retry };
}
