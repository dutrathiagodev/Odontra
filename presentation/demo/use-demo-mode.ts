"use client";

import { useSyncExternalStore } from "react";
import { demoMode } from "@/infrastructure/container";

/** true enquanto o modo exemplo está ligado nesta aba. No servidor é sempre false. */
export function useDemoMode(): boolean {
  return useSyncExternalStore(demoMode.subscribe, demoMode.isActive, () => false);
}
