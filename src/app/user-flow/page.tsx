import { redirect } from "next/navigation";
import ContentLayout from "@/components/channelParterner/contentLayout";
import InfoSection from "@/components/channelParterner/infoSection";
import LoginCard from "@/components/channelParterner/loginCard";
import LoginOtpCard from "@/components/channelParterner/loginOtpCard";
import MainLayout from "@/components/channelParterner/mainLayout";
import SignupOtpCard from "@/components/channelParterner/signupOtpCard";
import SignUp from "@/components/signUp/signUp";

interface UserFlowPageProps {
  searchParams: Promise<{
    isLogin?: string;
    isOtp?: string;
    flow?: string;
    postProperty?: string;
  }>;
}

export default async function UserFlowPage({ searchParams }: UserFlowPageProps) {
  const params = await searchParams;
  const isLogin = params?.isLogin === "true";
  const isOtp = params?.isOtp === "true";
  const flow = params?.flow;
  const isPostProperty = params?.postProperty === "true";

  const buyerUrl = process.env.NEXT_PUBLIC_BUYER_URL || "https://kma-website-frontend-kma-vercels-projects.vercel.app";

  // End User flows don't belong on seller app — redirect to buyer
  if (isOtp && flow === "enduser-login") {
    redirect(`${buyerUrl}/user-flow?isLogin=true`);
  }
  if (isOtp && flow === "enduser-signup") {
    redirect(`${buyerUrl}/user-flow`);
  }

  // Default to login view (Owner/CP). No End User signup on seller.
  let cardContent = <LoginCard />;
  if (isPostProperty && !isOtp) {
    cardContent = <SignUp />;
  }
  if (isOtp && flow === "login") {
    cardContent = <LoginOtpCard />;
  }
  if (isOtp && flow === "signup") {
    cardContent = <SignupOtpCard />;
  }

  const isLoginView = isLogin || (isOtp && flow === "login");
  const isPostPropertyView = isPostProperty && !isOtp;

  return (
    <MainLayout>
      <ContentLayout
        cardContent={cardContent}
        params={params}
      />
    </MainLayout>
  );
}
