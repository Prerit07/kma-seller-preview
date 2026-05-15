import RedeemOverview from "@/components/referral/RedeemOverview";
import ReferralUserShell from "@/components/referral/ReferralUserShell";

export default function RedeemPage() {
  return (
    <ReferralUserShell
      title="Redeem coins"
      description="Turn your earned coins into money. Payouts are processed within 48 hours."
      breadcrumb="Home / Refer and Earn / Redeem"
    >
      <RedeemOverview />
    </ReferralUserShell>
  );
}
