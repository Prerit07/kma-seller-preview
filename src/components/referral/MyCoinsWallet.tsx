"use client";

import ReferralLoginGate from "@/components/referral/ReferralLoginGate";
import { MIN_REDEEM_COINS, RUPEE_PER_COIN } from "@/lib/referral/constants";
import { coinsToInr, getReferrals } from "@/lib/referral/storage";
import type { StoredReferral } from "@/lib/referral/types";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return iso;
  }
}

export default function MyCoinsWallet() {
  const [referrals, setReferrals] = useState<StoredReferral[]>([]);

  const refresh = useCallback(() => {
    setReferrals(getReferrals());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const balance = useMemo(() => {
    return referrals.filter((r) => r.status === "Deal Closed").reduce((s, r) => s + (r.coinsEarned || 0), 0);
  }, [referrals]);

  const inr = coinsToInr(balance);

  const historyRows = useMemo(() => {
    return referrals
      .filter((r) => r.status === "Deal Closed" && r.coinsEarned > 0)
      .map((r) => ({
        id: r.referralId,
        date: r.submittedAt,
        clientName: r.clientName,
        coins: r.coinsEarned,
        status: r.status,
      }));
  }, [referrals]);

  return (
    <ReferralLoginGate title="Sign in to view your coins">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-[#667085]">Total coin balance</p>
          <p className="text-4xl font-semibold text-[#0F172A] mt-2">{balance} coins</p>
          <p className="text-lg text-[#475467] mt-2">≈ ₹{inr.toLocaleString("en-IN")}</p>
          <p className="text-sm text-[#98A2B3] mt-3">
            1 coin = ₹{RUPEE_PER_COIN}. Coins are added when a referral is marked Deal Closed by KMA.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/refer-and-earn/redeem" className="animated-button px-8 py-3 border border-blue text-center">
              <span className="relative">Redeem</span>
            </Link>
            <button
              type="button"
              onClick={refresh}
              className="px-6 py-3 rounded-full border border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] text-sm font-medium"
            >
              Refresh
            </button>
          </div>
          {balance < MIN_REDEEM_COINS ? (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-4">
              Minimum redeem is {MIN_REDEEM_COINS} coins (₹{(MIN_REDEEM_COINS * RUPEE_PER_COIN).toLocaleString("en-IN")}) once
              available.
            </p>
          ) : null}
        </div>

        <div className="bg-white rounded-2xl border border-[#EAECF0] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <div className="px-5 py-4 border-b border-[#EAECF0]">
            <h2 className="text-lg font-semibold text-[#0F172A]">Earning history</h2>
            <p className="text-sm text-[#667085]">Credits appear after deals close.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[#475467]">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Referral ID</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Coins</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {historyRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[#667085]">
                      No coin credits yet. When KMA closes a deal, coins will show here.
                    </td>
                  </tr>
                ) : (
                  historyRows.map((row) => (
                    <tr key={row.id} className="border-t border-[#EAECF0]">
                      <td className="px-4 py-3 text-[#475467] whitespace-nowrap">{formatDate(row.date)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#101828]">{row.id}</td>
                      <td className="px-4 py-3 text-[#101828]">{row.clientName}</td>
                      <td className="px-4 py-3 font-medium text-[#0F172A]">+{row.coins}</td>
                      <td className="px-4 py-3 text-emerald-700 text-xs font-medium">{row.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ReferralLoginGate>
  );
}
