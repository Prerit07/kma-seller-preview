"use client";

import { useReferralSessionActive } from "@/lib/referral/useReferralSessionActive";
import { useRouter } from "nextjs-toploader/app";
import { openReferralLoginDialog } from "@/lib/referral/openLoginDialog";

export function useIsReferralUserLoggedIn(): boolean {
  return useReferralSessionActive();
}

type ReferralLoginGateProps = {
  children: React.ReactNode;
  title?: string;
};

export default function ReferralLoginGate({ children, title = "Sign in to continue" }: ReferralLoginGateProps) {
  const router = useRouter();
  const loggedIn = useIsReferralUserLoggedIn();

  if (!loggedIn) {
    return (
      <div className="bg-white rounded-2xl border border-[#EAECF0] p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] text-center">
        <h2 className="text-xl font-semibold text-[#0F172A]">{title}</h2>
        <p className="text-sm text-[#667085] mt-2 max-w-md mx-auto">
          Log in with your KMA account to access referrals, your unique ID, and coin balance.
        </p>
        <button
          type="button"
          onClick={() => openReferralLoginDialog(router)}
          className="mt-6 animated-button px-10 py-3 border border-blue text-center cursor-pointer"
        >
          <span className="relative">Log in</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
