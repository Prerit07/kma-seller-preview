"use client";

import ReferralLoginGate from "@/components/referral/ReferralLoginGate";
import { MIN_REDEEM_COINS, RUPEE_PER_COIN } from "@/lib/referral/constants";
import { coinsToInr, getReferrals } from "@/lib/referral/storage";
import { useMemo, useState } from "react";

export default function RedeemOverview() {
  const [tick, setTick] = useState(0);

  const balance = useMemo(() => {
    void tick;
    return getReferrals()
      .filter((r) => r.status === "Deal Closed")
      .reduce((s, r) => s + (r.coinsEarned || 0), 0);
  }, [tick]);

  const inr = coinsToInr(balance);

  return (
    <ReferralLoginGate title="Sign in to redeem coins">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-[#0F172A]">Redeem overview</h2>
          <p className="text-sm text-[#667085] mt-1">Convert earned coins to payout (UPI, bank, or wallet).</p>

          <div className="mt-6 p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC]">
            <p className="text-sm text-[#475467]">Balance</p>
            <p className="text-3xl font-semibold text-[#0F172A] mt-1">{balance} coins</p>
            <p className="text-[#475467] mt-1">≈ ₹{inr.toLocaleString("en-IN")}</p>
            <p className="text-sm text-[#667085] mt-3">1 coin = ₹{RUPEE_PER_COIN}</p>
            <p className="text-sm text-[#667085] mt-2">
              Minimum redeem: {MIN_REDEEM_COINS} coins (₹{(MIN_REDEEM_COINS * RUPEE_PER_COIN).toLocaleString("en-IN")}).
            </p>
          </div>

          <p className="text-sm text-[#475467] mt-6">
            Payout requests are processed within <strong>48 hours</strong> after submission. Full method selection and payout
            details will connect here once the redeem API is live.
          </p>

          <button
            type="button"
            disabled={balance < MIN_REDEEM_COINS}
            className="mt-6 animated-button px-10 py-3 border border-blue text-center disabled:opacity-50 disabled:pointer-events-none"
          >
            <span className="relative">Start payout (coming soon)</span>
          </button>
          {balance < MIN_REDEEM_COINS ? (
            <p className="text-xs text-[#667085] mt-3">Earn more coins to reach the minimum redeem amount.</p>
          ) : null}

          <button
            type="button"
            onClick={() => setTick((n) => n + 1)}
            className="block mt-4 text-sm font-medium text-[#1D4ED8] hover:underline"
          >
            Refresh balance
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <h3 className="font-semibold text-[#0F172A]">Redeem history</h3>
          <p className="text-sm text-[#667085] mt-2">Past redemptions will appear here after the redeem service is enabled.</p>
        </div>
      </div>
    </ReferralLoginGate>
  );
}
