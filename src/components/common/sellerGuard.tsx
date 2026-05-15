"use client";

import { USER_TYPE } from "@/lib/enums";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";

/**
 * Client-side guard that redirects END_USER away from seller-only pages.
 * Middleware handles this server-side, but this is a safety net for client navigation.
 */
export default function SellerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        setAllowed(true); // middleware will handle redirect for unauthenticated
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed.role === USER_TYPE.END_USER || parsed.role === USER_TYPE.USER) {
        router.replace("/");
        return;
      }
      setAllowed(true);
    } catch {
      setAllowed(true);
    }
  }, [router]);

  if (allowed === null) return null; // loading
  return <>{children}</>;
}
