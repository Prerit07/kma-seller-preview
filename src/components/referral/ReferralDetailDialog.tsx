"use client";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import type { StoredReferral } from "@/lib/referral/types";
import { statusBadgeClass } from "@/components/referral/statusStyles";

type ReferralDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  referral: StoredReferral | null;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function ReferralDetailDialog({ open, onClose, referral }: ReferralDetailDialogProps) {
  if (!referral) return null;

  const steps: { label: string; done: boolean }[] = [
    { label: "Referral submitted", done: true },
    { label: "KMA review", done: referral.status !== "Pending" },
    { label: "Deal in progress", done: referral.status === "In Process" || referral.status === "Deal Closed" },
    { label: "Deal closed — coins credited", done: referral.status === "Deal Closed" },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent className="!p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[#667085] uppercase tracking-wide">Referral ID</p>
            <p className="font-mono text-sm font-semibold text-[#0F172A]">{referral.referralId}</p>
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass(referral.status)}`}>
            {referral.status}
          </span>
        </div>

        <div className="mt-5 space-y-2 text-sm">
          <p>
            <span className="text-[#667085]">Client:</span>{" "}
            <span className="text-[#101828] font-medium">{referral.clientName}</span> · {referral.clientMobile}
          </p>
          <p>
            <span className="text-[#667085]">Property:</span> {referral.propertyType}
            {referral.location ? ` · ${referral.location}` : ""}
          </p>
          {referral.viaPartner ? (
            <p>
              <span className="text-[#667085]">Channel partner:</span>{" "}
              {referral.channelPartnerName || referral.channelPartnerId || "—"}
            </p>
          ) : null}
          <p className="text-[#667085]">Submitted {formatDate(referral.submittedAt)}</p>
          {referral.status === "Deal Closed" ? (
            <p>
              <span className="text-[#667085]">Coins earned:</span>{" "}
              <span className="font-semibold text-[#0F172A]">{referral.coinsEarned}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold text-[#0F172A] mb-3">Status timeline</p>
          <ul className="space-y-3">
            {steps.map((s) => (
              <li key={s.label} className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.done ? "bg-emerald-500" : "bg-[#E4E7EC]"}`}
                />
                <span className={s.done ? "text-[#101828]" : "text-[#98A2B3]"}>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl border border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] text-sm font-medium"
        >
          Close
        </button>
      </DialogContent>
    </Dialog>
  );
}
