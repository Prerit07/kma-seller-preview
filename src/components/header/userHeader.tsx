"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import ProfileMenu from "../common/profileMenu";
import { useRouter } from "nextjs-toploader/app";
import { useQuery } from "@tanstack/react-query";
import { UserDashboardDetailsApiHandler, UserDashboardDetailsResponse, userProfileApiHandler, UserProfileResponse } from "@/services/userService";
import { toast } from "react-toastify";
import { USER_TYPE } from "@/lib/enums";

const baseUrl = process.env.NEXT_PUBLIC_AWS_URL ?? "";
export default function UserHeader() {
  const pathName = usePathname();
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

    const isActiveRoute = (routeName: string) => {
    const cleaned = pathName.startsWith("/") ? pathName.slice(1) : pathName;
    if (routeName == cleaned) {
      return true;
    } else {
      return false;
    }
  };

   const handleRedirect = (routeName: string) => {
    router.push(routeName);
  };

  const { data: userDashboardDetails } = useQuery({
    queryKey: ["user-dashboard-details-to-verify-count"],
    queryFn: async (): Promise<UserDashboardDetailsResponse> => {
      return UserDashboardDetailsApiHandler();
    },
    select: (resposne: UserDashboardDetailsResponse) => {
      return resposne;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: profileResponse } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async (): Promise<UserProfileResponse> => userProfileApiHandler(),
    staleTime: 60 * 1000,
  });
  const headerAvatarSrc = useMemo(() => {
    const user = profileResponse?.user;
    if (!user?.profileImage) return "/assets/profile.png";
    if (/^https?:\/\//.test(user.profileImage)) return user.profileImage;
    return `${baseUrl}${user.profileImage}`;
  }, [profileResponse?.user?.profileImage]);

  const handleRedirectPostProperty = () => {
    if(userDashboardDetails?.role == USER_TYPE.CHANNEL_PARTNER){
      if(userDashboardDetails?.kycStatus?.kyc_completed){
        router.push('/post-property')
      }else{
        if(userDashboardDetails?.kycStatus?.kyc_status == 'in_review'){
          toast.info('Your KYC is under review. You can post property once it is approved.')
        }else{
          router.push('/kyc')
        }
      }
    }else if(userDashboardDetails?.role == USER_TYPE.OWNER){
      if(userDashboardDetails.freeListings.remaining != 0){
        router.push('/post-property')
      }else{
        toast.error('Your free listing used upgread to channel partner to post property.')
      }
    }
    
  }

  return (
    <div className="w-full flex justify-center px-4 md:px-0">
      
      <div className={`bg-blue shadow-xl rounded-2xl md:rounded-[200px] w-full md:w-[80%] h-auto md:h-[63px] px-4 md:px-7 py-3 md:py-[4px] flex flex-col md:flex-row justify-between items-center border border-1 border-[#FFFFFF1F] z-[60] gap-4 md:gap-0 relative`}>
        
        <div className="w-full md:w-auto flex justify-between items-center shrink-0">
          <a href="/api/redirect-to-buyer?path=/" target="_blank" rel="noopener noreferrer" className="flex items-center px-1.5 cursor-pointer">
            <Image
              src="/assets/kma-logo-white.svg"
              width={100}
              height={35}
              alt="logo"
              style={{ height: "38px" }}
            />
          </a>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="block md:hidden text-white focus:outline-none p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              // Cross Icon
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              // Hamburger Icon
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>

        <div className={`${isMobileMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12 w-full px-4 md:px-8 py-2 md:py-0 border-t border-white/10 md:border-none`}>
          {[{name:"Dashboard", route: 'user-dashboard'}, {name: "Listing", route: 'my-listing'}, {name: "Leads", route:'lead-summary/list'}].map((item) => (
            <p
              key={item.name}
              onClick={() => {
                handleRedirect(`/${item.route}`);
                setIsMobileMenuOpen(false);
              }}
              style={{borderBottom: isActiveRoute(item.route) ? '2px solid white' : ''}}
              className="mt-0 md:mt-2 text-gray-100 break-word text-sm w-max border-b-2 border-transparent hover:border-white transition-colors duration-200 cursor-pointer px-1.5 pb-1 text-center py-2 md:py-0"
            >
              {item.name}
            </p>
          ))}

          <div
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            className="cursor-pointer flex justify-start items-center gap-2 py-2 md:py-0"
          >
            <p className="mt-0 md:mt-2 text-gray-100 break-word text-sm w-max border-b-2 border-transparent cursor-pointer px-1.5 pb-1">
              More
            </p>
            <Image
              src="/assets/down-arrow-white.svg"
              width={12}
              height={5}
              alt="Down Arrow"
              className="w-[12px] h-auto mt-0 md:mt-1"
            />
          </div>
        </div>

        <div className={`${isMobileMenuOpen ? "flex" : "hidden"} md:flex items-center justify-center md:justify-start gap-[12px] md:gap-[7px] shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t border-white/10 md:border-none`}>
          {/* Profile Avatar */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => e.key === "Enter" && handleClick(e as unknown as React.MouseEvent<HTMLElement>)}
            className="cursor-pointer rounded-full ring-2 ring-white/30 focus:outline-none focus:ring-2 focus:ring-white shrink-0"
            aria-label="Profile menu"
          >
            <Image
              src={headerAvatarSrc}
              width={36}
              height={36}
              alt="profile"
              className="w-9 h-9 rounded-full object-cover"
            />
          </div>
          
          {/* Post Property Button */}
          <button
            onClick={() => {
              handleRedirectPostProperty();
              setIsMobileMenuOpen(false);
            }}
            className="bg-white text-black rounded-[999px] px-[20px] py-[9px] cursor-pointer w-full md:w-auto flex justify-center"
          >
            <span className="flex items-center justify-center gap-[6px] relative z-11">
              <Image
                src="/assets/plus-sign.svg"
                width={14}
                height={14}
                alt="home"
                className="invert"
              />
              <p className="text-nowrap text-sm font-medium">Post Property</p>
            </span>
          </button>
        </div>

        {/* Material UI or Custom Profile Menu component */}
        <ProfileMenu anchorEl={anchorEl} handleClose={handleClose} open={open} />
      </div>
    </div>
  );
}
