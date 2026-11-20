"use client";

import { useSyncExternalStore } from "react";
import { getState, subscribe } from "@/lib/dash/store";
import type { DashState } from "@/lib/dash/types";

export function useDash(): DashState | null {
  return useSyncExternalStore(subscribe, getState, () => null);
}
