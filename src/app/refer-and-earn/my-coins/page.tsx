import MyCoinsWallet from "@/components/referral/MyCoinsWallet";
import ReferralUserShell from "@/components/referral/ReferralUserShell";

export default function MyCoinsPage() {
  return (
    <ReferralUserShell
      title="My coins"
      description="Your balance and earning history. Redeem when you have enough coins."
      breadcrumb="Home / Refer and Earn / My coins"
    >
      <MyCoinsWallet />
    </ReferralUserShell>
  );
}
