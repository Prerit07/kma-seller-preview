const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Returns the stored user role if any, regardless of whether the profile has a name.
 * Cross-domain hydrated users land here without a name until /create-account is
 * finished; that's still a logged-in session.
 */
export function getSessionUserRoleFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("user");
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (typeof parsed.role === "string" && parsed.role.trim().length > 0) return parsed.role;
    return null;
  } catch {
    return null;
  }
}

/**
 * Refer & Earn is available to any logged-in KMA account (User, Owner, or Channel Partner).
 */
export function isReferralSessionActive(userRole: string | null | undefined): boolean {
  return Boolean(userRole);
}
