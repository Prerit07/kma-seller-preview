'use client'
import { Easing, Variants } from "framer-motion";
import { motion } from "framer-motion";
import { useRouter } from "nextjs-toploader/app";

export default function SectionHeader({
  heading = "",
  subHeading = "",
  sectionName = "",
  hideButton = false,
  channelPartnerBtn = false,
  isInView = false,
  listingFilter = "Sale",
  onListingFilterChange,
  onViewMore,
}: {
  heading?: string;
  subHeading?: string;
  sectionName?: string;
  hideButton?: boolean;
  channelPartnerBtn?: boolean;
  isInView?: boolean;
  listingFilter?: "Sale" | "Rent";
  onListingFilterChange?: (filter: "Sale" | "Rent") => void;
  onViewMore?: () => void;
}) {
  const router = useRouter()
  const smartTransition = {
    duration: 1,
    ease: "easeOut" as Easing,
  };

  const fromTop: Variants = {
    hidden: {
      opacity: 0,
      y: -120,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: smartTransition,
    },
  };

  const naviageChannelPartner = () => {
    router.push('/signup?ownerType=CHANNEL_PARTNER')
  }

  return (
    <motion.div
      className="flex flex-col md:flex-row gap-4 justify-start md:justify-between items-center"
      variants={fromTop}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <div className="w-full">
        <div className="bg-gray-400 h-0.5 w-8 mb-2">
          <div className="w-1/2 h-0.5 bg-gray-900" />
        </div>
        <h2 className="text-2xl text-black font-semibold">{heading}</h2>
        <h3 className="text-text-gray text-xs">{subHeading}</h3>
      </div>
      <div className="flex gap-3 w-full md:justify-end">
        {channelPartnerBtn && (
          <button onClick={naviageChannelPartner} className="font-medium w-auto text-sm 1xl:text-base animated-button px-9 py-2 border border-blue text-blue! hover:text-white! bg-transparent! text-center cursor-pointer">
            <span className="gap-3 relative flex justify-center">
              <p className={`text-nowrap`}>Contact Us</p>
            </span>
          </button>
        )}
        {!hideButton && (
          <button
            type="button"
            onClick={onViewMore}
            className="font-medium w-auto text-sm 1xl:text-base animated-button px-9 py-2 border border-blue text-center cursor-pointer"
          >
            <span className="gap-3 relative flex justify-center">
              <p className={`text-nowrap`}>View More</p>
            </span>
          </button>
        )}
        {sectionName == "featureProperties" && (
          <button onClick={() => onListingFilterChange?.("Sale")} className={`font-medium w-auto text-sm 1xl:text-base px-9 py-2 border border-blue text-center cursor-pointer ${listingFilter === "Sale" ? "animated-button" : "animated-button text-blue! hover:text-white! bg-transparent!"}`}>
            <span className="gap-3 relative flex justify-center">
              <p className={`text-nowrap`}>For Sale</p>
            </span>
          </button>
        )}
        {sectionName == "featureProperties" && (
          <button onClick={() => onListingFilterChange?.("Rent")} className={`font-medium w-auto text-sm 1xl:text-base px-9 py-1.5 border border-blue text-center cursor-pointer ${listingFilter === "Rent" ? "animated-button" : "animated-button text-blue! hover:text-white! bg-transparent!"}`}>
            <span className="gap-3 relative flex justify-center">
              <p className={`text-nowrap`}>For Rentals</p>
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
