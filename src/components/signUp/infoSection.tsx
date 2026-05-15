'use client'
import { RootState } from "@/store/store";
import Image from "next/image";
import { useSelector } from "react-redux";

const cardInfo = {
  owner: [
    {
      src: "/assets/home-color.png",
      title: "Simple Account Setup",
      subTitle:
        "Set up your profile as an Owner or Partner. It’s quick, professional, and built for the Gurgaon market.",
    },
    {
      src: "/assets/location-color.png",
      title: "Verified Property Posting",
      subTitle:
        "List your property with ease. Our digital MOU process ensures all listings are genuine and highly trusted.",
    },
    {
      src: "/assets/upload-color.png",
      title: "Quality Over Quantity",
      subTitle:
        "Get access to leads filtered through our smart WhatsApp API, synced directly to your personal dashboard.",
    },
  ],
  channelPartner: [
    {
      src: "/assets/home-color.png",
      title: "Profile Verification",
      subTitle:
        "Enter your professional details. This helps us maintain a high-quality, trusted network for all partners.",
    },
    {
      src: "/assets/location-color.png",
      title: "Strategic Location",
      subTitle:
        "Tell us your primary operating zones in Gurgaon to receive inquiries that match your expertise.",
    },
    {
      src: "/assets/upload-color.png",
      title: "Access Dashboard",
      subTitle:
        "Once registered, get instant access to your CRM to manage listings, track leads, and view field updates.",
    },
  ],
};

function Card({ src, title, subTitle }: { [key: string]: string }) {
  return (
    <div className="flex flex-col flex-grow py-3.5 px-3 2xl:py-8 items-center justify-start">
      <Image alt='Home' src={src} width={70} height={70} className="w-[35px] 2xl:w-[50px] h-[35px] 2xl:h-[50px]  mb-2 sm:mb-4" />
      <div>
      <p className="text-center text-text-black font-ibm-plex-sans font-semibold text-sm 1xl:text-base  leading-3 md:leading-4 mb-2">
        {title}
      </p>
      <p className="text-center text-text-gray font-ibm-plex-sans font-normal text-xs 1xl:text-sm leading-5 md:leading-5 ">
        {subTitle}
      </p>
      </div>
    </div>
  );
}

export default function InfoSection() {
  const formData = useSelector((state: RootState) => state.form);
  const isOwner = formData.userType === "OWNER";
  const heading = isOwner
    ? "Experience a Better Way to List & Sell"
    : "Complete Your Partner Profile";
  const subHeading = isOwner
    ? "Join Gurgaon’s exclusive network where we handle the heavy lifting of lead management and field visits for you."
    : "Just a few more details to get your professional dashboard ready and start listing your properties.";
  const cards = isOwner ? cardInfo.owner : cardInfo.channelPartner;

  return (
    <div className="flex felx-wrap justify-center items-start flex-col"  >
      <p className="text-white font-ibm-plex-sans font-semibold text-[1.5rem] sm:text-[1.65rem] lg:text-[1.8rem] mb-2 sm:mb-3 text-center">
        {heading}
      </p>
      <p className="text-text-light-gray font-ibm-plex-sans font-normal text-sm sm:text-lg lg:text-base mb-6 sm:mb-8">
        {subHeading}
      </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
          {cards.map((info, index) => (
            <div
              key={index}
              className={`
                bg-white rounded-[10px] shadow-md flex flex-col h-full
                ${index === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}
              `}
            >
              <Card {...info} />
            </div>
          ))}
        </div>
    </div>
  );
}
