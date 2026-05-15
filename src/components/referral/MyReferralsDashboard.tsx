"use client";

import ReferralDetailDialog from "@/components/referral/ReferralDetailDialog";
import ReferralLoginGate from "@/components/referral/ReferralLoginGate";
import { statusBadgeClass } from "@/components/referral/statusStyles";
import { RUPEE_PER_COIN } from "@/lib/referral/constants";
import { coinsToInr, getReferrals, totalCoinsEarned } from "@/lib/referral/storage";
import type { StoredReferral } from "@/lib/referral/types";
import { useCallback, useEffect, useMemo, useState } from "react";

type TabKey = "direct" | "partner";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return iso;
  }
}

export default function MyReferralsDashboard() {
  const [tab, setTab] = useState<TabKey>("direct");
  const [rows, setRows] = useState<StoredReferral[]>([]);
  const [selected, setSelected] = useState<StoredReferral | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const refresh = useCallback(() => {
    setRows(getReferrals());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const { direct, partner } = useMemo(() => {
    const all = rows;
    return {
      direct: all.filter((r) => !r.viaPartner),
      partner: all.filter((r) => r.viaPartner),
    };
  }, [rows]);

  const list = tab === "direct" ? direct : partner;
  const points = totalCoinsEarned();
  const inr = coinsToInr(points);

  const openDetail = (r: StoredReferral) => {
    setSelected(r);
    setDetailOpen(true);
  };

  return (
    <ReferralLoginGate title="Sign in to view your referrals">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC]">
            <button
              type="button"
              onClick={() => setTab("direct")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === "direct" ? "bg-blue text-white" : "text-[#475467] hover:bg-white"
              }`}
            >
              Client referrals
            </button>
            <button
              type="button"
              onClick={() => setTab("partner")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === "partner" ? "bg-blue text-white" : "text-[#475467] hover:bg-white"
              }`}
            >
              Channel partner referrals
            </button>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="text-sm font-medium text-[#1D4ED8] hover:underline self-start sm:self-auto"
          >
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAECF0] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[#475467]">
                <tr>
                  {tab === "direct" ? (
                    <>
                      <th className="px-4 py-3 font-medium">Client name</th>
                      <th className="px-4 py-3 font-medium">Mobile</th>
                      <th className="px-4 py-3 font-medium">Property</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 font-medium">Partner</th>
                      <th className="px-4 py-3 font-medium">Client</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Coins</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[#667085]">
                      No referrals in this view yet. Submit a referral from{" "}
                      <a href="/refer-and-earn" className="text-[#1D4ED8] font-medium hover:underline">
                        Give a referral
                      </a>
                      .
                    </td>
                  </tr>
                ) : (
                  list.map((r) => (
                    <tr
                      key={r.referralId}
                      onClick={() => openDetail(r)}
                      className="border-t border-[#EAECF0] hover:bg-[#F9FAFB] cursor-pointer"
                    >
                      {tab === "direct" ? (
                        <>
                          <td className="px-4 py-3 text-[#101828] font-medium">{r.clientName}</td>
                          <td className="px-4 py-3 text-[#475467]">{r.clientMobile}</td>
                          <td className="px-4 py-3 text-[#475467]">{r.propertyType}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass(r.status)}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#475467] whitespace-nowrap">{formatDate(r.submittedAt)}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-[#101828]">{r.channelPartnerName || r.channelPartnerId || "—"}</td>
                          <td className="px-4 py-3 text-[#101828] font-medium">{r.clientName}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass(r.status)}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#475467]">{r.status === "Deal Closed" ? r.coinsEarned : "—"}</td>
                          <td className="px-4 py-3 text-[#475467] whitespace-nowrap">{formatDate(r.submittedAt)}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-[#667085]">My points</p>
            <p className="text-3xl font-semibold text-[#0F172A] mt-1">{points} coins</p>
            <p className="text-sm text-[#475467] mt-1">≈ ₹{inr.toLocaleString("en-IN")} (1 coin = ₹{RUPEE_PER_COIN})</p>
          </div>
          <p className="text-xs text-[#98A2B3] max-w-sm">
            Coins are credited when KMA marks your referral as Deal Closed. Totals update when you refresh after admin updates.
          </p>
        </div>
      </div>

      <ReferralDetailDialog open={detailOpen} onClose={() => setDetailOpen(false)} referral={selected} />
    </ReferralLoginGate>
  );
}
