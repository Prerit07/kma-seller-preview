"use client";

import LoginCard from "@/components/channelParterner/loginCard";
import LoginOtpCard from "@/components/channelParterner/loginOtpCard";
import HomeFooter from "@/components/footer/homeFooter";
import AboutusDataSync from "@/components/footer/AboutusDataSync";
import PostPropertyFlowHeader from "@/components/header/postPropertyFlowHeader";
import ReferralSubNav from "@/components/referral/ReferralSubNav";
import { closeReferralLoginDialog } from "@/lib/referral/openLoginDialog";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

type ReferralUserShellProps = {
  title: string;
  description?: string;
  breadcrumb?: string;
  showSubNav?: boolean;
  children: React.ReactNode;
};

export default function ReferralUserShell({
  title,
  description,
  breadcrumb = "Home / Refer and Earn",
  showSubNav = true,
  children,
}: ReferralUserShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoginParam = searchParams.get("isLogin") === "true";
  const isOtpParam = searchParams.get("isOtp") === "true";
  const flowParam = searchParams.get("flow");
  /** Owner/CP uses flow=login; "User" role uses flow=enduser-login after OTP is sent (see LoginCard). */
  const isOtpStep =
    isOtpParam && (flowParam === "login" || flowParam === "enduser-login");
  const isLoginDialogOpen = isLoginParam || isOtpStep;

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="relative pt-[25px] min-h-[280px] rounded-b-[60px] bg-[linear-gradient(120deg,#1B2DBE_0%,#0D9DF2_100%)]">
        <PostPropertyFlowHeader />
        <div className="w-[90%] max-w-[1100px] mx-auto mt-[70px] pb-[100px] text-white">
          <p className="text-sm opacity-90">{breadcrumb}</p>
          <h1 className="text-[26px] md:text-[36px] leading-[1.15] font-semibold mt-2">{title}</h1>
          {description ? <p className="text-sm md:text-base mt-3 max-w-[720px] opacity-95">{description}</p> : null}
          {showSubNav ? <ReferralSubNav /> : null}
        </div>
      </div>

      <div className="w-[90%] max-w-[1100px] mx-auto mt-[72px] pb-[90px]">{children}</div>

      <div className="bg-text-black flex justify-center">
        <AboutusDataSync />
        <HomeFooter tab={1} />
      </div>

      <Dialog
        open={isLoginDialogOpen}
        onClose={() => closeReferralLoginDialog(router)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "0.75rem",
            },
          },
        }}
      >
        <DialogContent sx={{ padding: 0 }}>
          <div className="relative w-full rounded-xl bg-white sm:w-[460px]">
            <button
              type="button"
              onClick={() => closeReferralLoginDialog(router)}
              className="absolute right-4 top-4 z-10 rounded-full p-1 text-[#1E2236] transition hover:bg-black/5"
              aria-label="Close login dialog"
            >
              ✕
            </button>
            {isOtpStep ? <LoginOtpCard /> : <LoginCard />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
