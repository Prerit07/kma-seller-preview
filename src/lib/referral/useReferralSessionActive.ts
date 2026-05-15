"use client";

import { getSessionUserRoleFromStorage, isReferralSessionActive } from "@/lib/referral/session";
import { useHeaderStore } from "@/store/useHeaderStore";
import { useLayoutEffect, useState } from "react";

/**
 * True when the visitor has an authenticated session for Refer & Earn.
 * Uses Redux `userRole` and falls back to localStorage so the form works right after OTP
 * if the store has not synced yet.
 */
export function useReferralSessionActive(): boolean {
  const { userRole } = useHeaderStore(true);
  const [storageRole, setStorageRole] = useState<string | null>(() =>
    typeof window !== "undefined" ? getSessionUserRoleFromStorage() : null,
  );

  useLayoutEffect(() => {
    setStorageRole(getSessionUserRoleFromStorage());
  }, [userRole]);

  return isReferralSessionActive(userRole) || isReferralSessionActive(storageRole);
}
