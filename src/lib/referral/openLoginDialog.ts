import type { AppRouterInstance } from "nextjs-toploader/app";

/**
 * Opens the same login dialog flow as Refer & Earn (isLogin=true + redirect back).
 */
export function openReferralLoginDialog(router: { replace: (url: string) => void }): void {
  if (typeof window === "undefined") return;

  const currentSearchParams = new URLSearchParams(window.location.search);
  currentSearchParams.delete("isOtp");
  currentSearchParams.delete("flow");
  currentSearchParams.delete("mobile");
  currentSearchParams.delete("code");
  currentSearchParams.delete("redirect");
  currentSearchParams.set("isLogin", "true");

  const redirectParams = new URLSearchParams(window.location.search);
  redirectParams.delete("isLogin");
  redirectParams.delete("isOtp");
  redirectParams.delete("flow");
  redirectParams.delete("mobile");
  redirectParams.delete("code");
  redirectParams.delete("redirect");
  const redirectSearch = redirectParams.toString();
  const redirect = `${window.location.pathname}${redirectSearch ? `?${redirectSearch}` : ""}`;

  currentSearchParams.set("redirect", redirect);
  router.replace(`${window.location.pathname}?${currentSearchParams.toString()}`);
}

export function closeReferralLoginDialog(router: { replace: (url: string) => void }): void {
  if (typeof window === "undefined") return;

  const nextParams = new URLSearchParams(window.location.search);
  nextParams.delete("isLogin");
  nextParams.delete("isOtp");
  nextParams.delete("flow");
  nextParams.delete("mobile");
  nextParams.delete("code");
  nextParams.delete("redirect");
  const query = nextParams.toString();
  router.replace(`${window.location.pathname}${query ? `?${query}` : ""}`);
}
