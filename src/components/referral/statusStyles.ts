import type { ReferralStatus } from "@/lib/referral/types";

export function statusBadgeClass(status: ReferralStatus): string {
  switch (status) {
    case "Deal Closed":
      return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
    case "In Process":
      return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
    default:
      return "bg-amber-50 text-amber-900 ring-1 ring-amber-200";
  }
}
