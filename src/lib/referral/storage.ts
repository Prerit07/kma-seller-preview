"use client";

import { RUPEE_PER_COIN, STORAGE_KEYS } from "./constants";
import type { ReferrerProfile, StoredReferral } from "./types";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function sanitizeNameForId(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return cleaned.slice(0, 12) || "USER";
}

export function generateUniqueUserId(displayName: string): string {
  const base = sanitizeNameForId(displayName);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `USER_${base}_${suffix}`;
}

export function getOrCreateUniqueUserId(referrerName: string): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(STORAGE_KEYS.uniqueUserId);
  if (existing) return existing;
  const created = generateUniqueUserId(referrerName);
  window.localStorage.setItem(STORAGE_KEYS.uniqueUserId, created);
  return created;
}

export function getStoredUniqueUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEYS.uniqueUserId);
}

export function getReferrerProfile(): ReferrerProfile | null {
  if (typeof window === "undefined") return null;
  return safeParse<ReferrerProfile | null>(window.localStorage.getItem(STORAGE_KEYS.referrerProfile), null);
}

export function saveReferrerProfile(profile: ReferrerProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.referrerProfile, JSON.stringify(profile));
}

export function getReferrals(): StoredReferral[] {
  if (typeof window === "undefined") return [];
  return safeParse<StoredReferral[]>(window.localStorage.getItem(STORAGE_KEYS.referrals), []);
}

export function appendReferral(entry: Omit<StoredReferral, "referralId" | "submittedAt" | "status" | "coinsEarned"> & { status?: StoredReferral["status"]; coinsEarned?: number }): StoredReferral {
  const list = getReferrals();
  const referralId = `REF-${Date.now().toString(36).toUpperCase()}`;
  const record: StoredReferral = {
    ...entry,
    referralId,
    submittedAt: new Date().toISOString(),
    status: entry.status ?? "Pending",
    coinsEarned: entry.coinsEarned ?? 0,
  };
  list.unshift(record);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEYS.referrals, JSON.stringify(list));
  }
  return record;
}

export function totalCoinsEarned(): number {
  return getReferrals()
    .filter((r) => r.status === "Deal Closed")
    .reduce((sum, r) => sum + (r.coinsEarned || 0), 0);
}

export function coinsToInr(coins: number): number {
  return coins * RUPEE_PER_COIN;
}
