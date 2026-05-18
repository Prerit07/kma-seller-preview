import { redirect } from "next/navigation";
import ContentLayout from "@/components/channelParterner/contentLayout";
import InfoSection from "@/components/channelParterner/infoSection";
import LoginCard from "@/components/channelParterner/loginCard";
import LoginOtpCard from "@/components/channelParterner/loginOtpCard";
import MainLayout from "@/components/channelParterner/mainLayout";
import SignupOtpCard from "@/components/channelParterner/signupOtpCard";
import SignUp from "@/components/signUp/signUp";
import { createURLSearchParam } from "@/lib/helper"; // Helper to reconstruct query safely

interface UserFlowPageProps {
  searchParams: Promise<{
    isLogin?: string;
    isOtp?: string;
    flow?: string;
    postProperty?: string;
    redirect?: string; // ⚡ UPDATE 1: Interface me redirect parameter accept kiya
  }>;
}

export default async function UserFlowPage({ searchParams }: UserFlowPageProps) {
  const params = await searchParams;
  const isLogin = params?.isLogin === "true";
  const isOtp = params?.isOtp === "true";
  const flow = params?.flow;
  const isPostProperty = params?.postProperty === "true";
  const redirectTarget = params?.redirect; // Capture the verification redirect path safely

  const buyerUrl = process.env.NEXT_PUBLIC_BUYER_URL || "https://kma-website-frontend-kma-vercels-projects.vercel.app";

  // Build temporary extra params to append during buyer redirects so verification flow doesn't break
  const extraQuery = redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : "";

  // End User flows don't belong on seller app — redirect to buyer (with redirect persistence)
  if (isOtp && flow === "enduser-login") {
    redirect(`${buyerUrl}/user-flow?isLogin=true${extraQuery}`);
  }
  if (isOtp && flow === "enduser-signup") {
    redirect(`${buyerUrl}/user-flow?${extraQuery ? extraQuery.substring(1) : ""}`);
  }

  // Default to login view (Owner/CP). No End User signup on seller.
  let cardContent = <LoginCard />;
  if (isPostProperty && !isOtp) {
    cardContent = <SignUp />;
  }
  if (isOtp && flow === "login") {
    cardContent = <LoginOtpCard />; // ⚡ Note: Make sure LoginOtpCard handles success using searchParams.get('redirect')
  }
  if (isOtp && flow === "signup") {
    cardContent = <SignupOtpCard />;
  }

  return (
    <MainLayout>
      <ContentLayout
        cardContent={cardContent}
        params={params} // Passing params safely to layouts
      />
    </MainLayout>
  );
}