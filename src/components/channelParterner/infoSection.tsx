"use client"

import { RootState } from "@/store/store";
import Image from "next/image";
import { useSelector } from "react-redux";

const cardInfo = {
  channelPartnerRegister: [
    {
      src: "/assets/home-color.png",
      title: "No Listing Packages",
      subTitle: "List your properties without buying any expensive packages. Start for free and scale as you grow.",
    },
    {
      src: "/assets/partnerAccess.png",
      title: "Verified Partner Access",
      subTitle: "Get exclusive access to a verified network. We ensure every listing and inquiry meets our quality standards.",
    },
    {
      src: "/assets/upload-color.png",
      title: "End-to-End Assistance",
      subTitle: "From digital MOU to field support, our team assists you at every step to ensure smoother closures.",
    },
  ],
  channelPartnerLogin: [
    {
      src: "/assets/home-color.png",
      title: "Live CRM Tracking",
      subTitle: "Access your personal dashboard to track lead status, field updates, and property performance in real-time.",
    },
    {
      src: "/assets/partnerAccess.png",
      title: "Direct Partner Leads",
      subTitle: "Continue managing your exclusive inquiries filtered through our WhatsApp API and pre-sales support.",
    },
    {
      src: "/assets/upload-color.png",
      title: "Field & Sales Support",
      subTitle: "Stay connected with our field team for site visits and closures. We are here to help you close faster.",
    },
  ],
  owner: [
    {
      src: "/assets/propertyDetails.png",
      title: "Basic Property Details",
      subTitle: "Tell us what you're listing—Flat, Villa, or Plot. It only takes a minute to start.",
    },
    {
      src: "/assets/location-color.png",
      title: "Location & Pricing",
      subTitle: "Set your price and pinpoint the location. Transparency leads to faster closures.",
    },
    {
      src: "/assets/propertyLive.png",
      title: "Verify & Go Live",
      subTitle: "Complete a quick digital MOU to get verified leads directly on your WhatsApp and CRM.",
    },
  ],
  ownerOtp: [
    {
      src: "/assets/home-color.png",
      title: "Zero Listing Fees",
      subTitle: "Post your property for free. No hidden charges, no premium packages—just pure results.",
    },
    {
      src: "/assets/propertyDetails.png",
      title: "Verified Listings",
      subTitle: "Access premium, WhatsApp-verified leads. No shared data. No spam calls. Only genuine, exclusive opportunities.",
    },
    {
      src: "/assets/propertyLive.png",
      title: "80% Operational Support",
      subTitle: "We handle pre-sales and field visits. You just focus on closing the deal.",
    },
  ],
};

function Card({ src, title, subTitle }: { [key: string]: string | any }) {
  return (
    <div className="flex flex-col flex-grow py-4 sm:py-5 px-3 sm:px-4 items-center justify-start">
      <Image alt={title} src={src} width={100} height={100} className="w-12 h-12 sm:w-14 sm:h-14 md:w-[60px] md:h-[60px] mb-3" />
      <div>
        <p className="text-center text-text-black font-semibold text-[clamp(1rem,1.3vw,1.6rem)] leading-tight mb-1.5 sm:mb-2">
          {title}
        </p>
        <p className="text-center text-text-gray font-normal text-[clamp(0.78rem,0.9vw,1rem)] leading-[1.45]">
          {subTitle}
        </p>
      </div>
    </div>
  );
}

interface InfoSectionProps {
  titlePrefix: string;
  title: string;
  subHeading?: string;
  params?: any;
}

export default function InfoSection({ titlePrefix, title, subHeading, params }: InfoSectionProps) {
  const formData = useSelector((state: RootState) => state.form);
  const isOtp = params?.isOtp === "true";
  const isLogin = params?.isLogin === "true";
  const flow = params?.flow;
  const isCpLoginView = formData.userType === "CHANNEL_PARTNER" && (isLogin || (isOtp && flow === "login"));

  const cardKey = isCpLoginView
    ? "channelPartnerLogin"
    : isOtp
      ? (formData.userType === "OWNER" ? "ownerOtp" : "channelPartnerRegister")
      : (formData.userType === "OWNER" ? "owner" : "channelPartnerRegister");

  return (
    <div className="flex justify-center items-start flex-col mt-0 md:mt-2 lg:mt-4">
      <p className="text-blue lg:text-white font-normal text-[clamp(0.9rem,1.1vw,1.15rem)] mb-2">{titlePrefix}</p>
      <h2 className="text-blue lg:text-white font-semibold text-[clamp(2rem,3.2vw,3rem)] leading-[1.2] mb-2 max-w-[22ch]">
        {title}
      </h2>
      <p className="text-blue lg:text-white font-normal text-[clamp(0.95rem,1.2vw,1.25rem)] mb-5 md:mb-7 max-w-[62ch]">
        {subHeading}
      </p>
      <div className="mt-1 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 sm:gap-4 w-full">
        {cardInfo[cardKey].map((info) => (
          <div key={info.title} className="bg-white rounded-[10px] shadow-md flex flex-col h-full min-h-[200px] sm:min-h-[220px]">
            <Card {...info} />
          </div>
        ))}
      </div>
    </div>
  );
}
