"use client";

import { useInitializeEndUserSession } from "@/api/hooks/useAuth";

export default function SessionInitializer() {
  useInitializeEndUserSession();
  return null;
}
