'use client'

import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import InfoSection from "./infoSection";

export default function ContentLayout({
  cardContent,
  params
}: {
  cardContent: React.ReactNode;
  params: any;
}) {
  const formData = useSelector((state: RootState) => state.form);
  const isLogin = params?.isLogin === "true";
  const isOtp = params?.isOtp === "true";
  const flow = params?.flow;
  const isPostProperty = params?.postProperty === "true";
  const isLoginView = isLogin || (isOtp && flow === "login");
  const isPostPropertyView = isPostProperty && !isOtp;
  const isOwner = formData.userType === "OWNER";

  const postPropertyTitle = isOwner
    ? "List Your Property in 3 Simple Steps"
    : "Scale Your Business with Gurgaon's Smartest Network";
  const postPropertySubHeading = isOwner && !isOtp
    ? "Quick, verified, and 100% free. Experience the new way of closing deals in Gurgaon with our 80/20 support model."
    : "";
  const loginTitle = isOwner ? "Login To Your Account" : "Welcome Back to KMA Network";

  return (
    <div className="w-full grid grid-cols-1 lg:flex lg:flex-wrap justify-between items-start gap-6 md:gap-8 lg:gap-10">
      <div className="w-full order-2 lg:order-none" style={{ flex: "2.6 1" }}>
        <InfoSection
            titlePrefix={isPostPropertyView ? "Create An Account" : isLoginView ? "Welcome Back" : isOtp ? "" : "New To KMA?"}
            title={isPostPropertyView ? postPropertyTitle : isLoginView ? loginTitle : isOtp ? "Join Gurgaon's Smartest Property Network" : "Create An Account"}
            subHeading={postPropertySubHeading}
            params={params}
          />
      </div>
      <div style={{ flex: "1.5 1" }} className="w-full mt-4 md:mt-6 lg:mt-[4.5rem] order-1 lg:order-none">
        {cardContent}
      </div>
    </div>
  );
}
