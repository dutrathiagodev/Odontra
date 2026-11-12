"use client";

import { useState } from "react";
import { friendlyError, withTimeout } from "../async/with-timeout";

/**
 * Envio dos formulários de acesso. O botão nunca fica preso em "Aguarde…":
 * a tarefa devolve uma mensagem de erro (ou nada); exceção e demora viram mensagem clara.
 */
export function useAuthSubmit(initialError = "") {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);

  const run = async (task: () => Promise<string | void>) => {
    setBusy(true);
    setError("");
    try {
      const message = await withTimeout(task());
      if (message) setError(message);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return { busy, error, setError, run };
}
