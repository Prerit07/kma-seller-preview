import MyReferralsDashboard from "@/components/referral/MyReferralsDashboard";
import ReferralUserShell from "@/components/referral/ReferralUserShell";

export default function MyReferralsPage() {
  return (
    <ReferralUserShell
      title="My referrals"
      description="Track every referral you submitted — direct clients and channel partner leads."
      breadcrumb="Home / Refer and Earn / My referrals"
    >
      <MyReferralsDashboard />
    </ReferralUserShell>
  );
}
