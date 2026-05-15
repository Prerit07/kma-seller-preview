'use client'
import Image from "next/image";
import DynamicSelect, { OptionType } from "../common/select";
import { USER_DASHBOARD_PROPERTY_FILTER, USER_TYPE, userType } from "@/lib/enums";

const baseUrl = process.env.NEXT_PUBLIC_AWS_URL ?? "";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UpgreadOwnerToChannelPartnerApiHandler, UpgreadOwnerToChannelPartnerPayload, UpgreadOwnerToChannelPartnerResponse, UserDashboardDetailsApiHandler, UserDashboardDetailsResponse } from "@/services/userService";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import UpgradeChannelPartner from "../common/upgradeChannelpartner";
import { AboutusResponse, getAboutUsDataAPiHanlder } from "@/services/homeService";
import { docuSingStatusApiHanlder, DocusignResponse } from "@/services/kycService";

export default function UserDashboard() {
  const router = useRouter()
  const max_property = process.env.NEXT_PUBLIC_OWNER_MAX_PROPERTY_CREATE;

  const [filterValue, setFilterValue] = useState(USER_DASHBOARD_PROPERTY_FILTER[1])
  const [openCodePopup, setOpenCodePopup] = useState<boolean>(false)

  const { data: userDashboardDetails, refetch: getUpdatedDashboardDetails } = useQuery({
      queryKey: ["user-dashboard-details"],
      queryFn: async (): Promise<UserDashboardDetailsResponse> => {
        return UserDashboardDetailsApiHandler();
      },
      select: (resposne: UserDashboardDetailsResponse) => {
        return resposne;
      },
      staleTime: 0,
      placeholderData: null,
      refetchOnMount: true,
  });

    const {data: aboutusData} = useQuery({
      queryKey: ['aboutus'],
      queryFn: getAboutUsDataAPiHanlder,
      select: (response: AboutusResponse) => {
        return response?.configuration
      }
    });

    const { data: agreementStatus, refetch: refetchAgreementStatus } = useQuery({
      queryKey: ["docusign-agreement-status"],
      queryFn: async (): Promise<DocusignResponse> => docuSingStatusApiHanlder(),
      enabled: userDashboardDetails?.role === USER_TYPE.OWNER,
      staleTime: 0,
    });

  const {
      mutate: handleUpgradUser,
      isPending,
    } = useMutation({
      mutationFn: async (payload: UpgreadOwnerToChannelPartnerPayload): Promise<UpgreadOwnerToChannelPartnerResponse> => {
        return await UpgreadOwnerToChannelPartnerApiHandler(payload);
      },
      onSuccess: (response: UpgreadOwnerToChannelPartnerResponse) => {
        setOpenCodePopup(false)
        const code = response?.channelPartnerCode;
        toast.success(
          code
            ? `Upgraded to Channel Partner. Your CP code: ${code}`
            : 'Upgraded to Channel Partner successfully',
        )
        try {
          const raw = localStorage.getItem("user");
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.role = USER_TYPE.CHANNEL_PARTNER;
            if (code) parsed.channelPartnerCode = code;
            localStorage.setItem("user", JSON.stringify(parsed));
          }
        } catch {}
        getUpdatedDashboardDetails()
        window.location.reload();
      },
      onError: (error: any) => {
        if(Array.isArray(error.message)){
        error.message.map((item: string) => {
          toast.error(item)
        })
      }else{
        toast.error(error.message)
      }
      },
    });

    const handleCloseCodePopup = () => {
      setOpenCodePopup(false)
    }

    const handleCode = (paylaod) => {
      if(!isPending){
        handleUpgradUser(paylaod)
      }
    }

  const progressPercent = userDashboardDetails ? Math.min((userDashboardDetails?.freeListings?.used / userDashboardDetails?.freeListings?.total) * 100, 100) : 0;
  
  const renderPropertyCount = () => {
    if(userDashboardDetails){
      const data = userDashboardDetails['leadsSummary']
      return data[filterValue.value]
    }
    return null
  }

  return (
    <div className="w-full bg-white rounded-xl">
      <div className="flex flex-col gap-4 p-3">
        <div className="flex flex-col 2md:flex-row gap-3">

          <div className="flex flex-1 rounded-xl flex-col lg:flex-row justify-between lg:items-center bg-[#F2F2F2] p-3 gap-2">
            <div className="flex gap-3">
              <Image
                src={
                  userDashboardDetails?.profileImage
                    ? /^https?:\/\//.test(userDashboardDetails.profileImage)
                      ? userDashboardDetails.profileImage
                      : `${baseUrl}${userDashboardDetails.profileImage}`
                    : "/assets/profile.png"
                }
                height={55}
                width={55}
                className="w-[55px] h-[55px] rounded-[50%] object-cover"
                alt="profile"
              />

              <div className="flex flex-col gap-1">
                <p className="font-semibold text-lg text-text-black">
                  Hi, {userDashboardDetails?.name?.trim() || 'there'}  {'(' + (userType[userDashboardDetails?.role] ?? '') + ')'}
                  {userDashboardDetails?.role == USER_TYPE.CHANNEL_PARTNER && <span className="ml-3 px-4 py-1 text-sm sm:text-base rounded-md font-normal text-white bg-gradient-to-r from-[#A43918] to-[#CE8B2D]">
                    KMA Expert <span className="font-semibold">Pro</span>
                  </span>}
                </p>
                <p className="text-base text-text-gray">
                  May your day be filled with progress and good energy!
                </p>
              </div>
              </div>
              {/* Credits section removed */}
          </div>
        </div>
        <div className="flex gap-4 flex-col 2md:flex-row">

          <div className="flex flex-1 rounded-xl flex-col justify-between bg-[#F2F2F2] p-3 gap-3">
            <div className="flex flex-col gap-2 2md:flex-row justify-between 2md:items-center">
              <p className="font-semibold text-base text-text-black">
                Leads Summary{" "}
              </p>
              <div className="w-full 2md:w-[150px]">
              <DynamicSelect
                placeholder="Select filter"
                minHeight="35px"
                options={USER_DASHBOARD_PROPERTY_FILTER}
                value={filterValue}
                onChange={(value: OptionType) => {
                  setFilterValue(value)
                }}
                fontwidth="14px"
              />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row 2md:flex-col lg:flex-row gap-3 justify-start">
              <div className="flex flex-row items-center rounded-xl bg-white flex-1">
                <div className="flex items-center gap-2 p-2.5 flex-1 min-w-0">
                  <Image
                    src="/assets/residential-blue-dashboard.svg"
                    height={25}
                    width={25}
                    alt="residential"
                    className="w-[25px] h-[25px]"
                  />
                  <p
                    className="font-medium text-text-black truncate"
                    title="Residential"
                  >
                    Residential
                  </p>
                </div>

                <div
                  className="min-w-[40px] flex-shrink-0 font-semibold text-base
                                    border-l border-[#E7E7E7] text-center p-2"
                >
                  {renderPropertyCount() ? renderPropertyCount().residential : '00'}
                </div>
              </div>
              <div className="flex flex-row items-center rounded-xl bg-white flex-1">
                <div className="flex items-center gap-2 p-2.5 flex-1 min-w-0">
                  <Image
                    src="/assets/commercial-red-dashboard.svg"
                    height={25}
                    width={25}
                    alt="residential"
                    className="w-[25px] h-[25px]"
                  />
                  <p
                    className="font-medium text-text-black truncate"
                    title="Residential"
                  >
                    Commercial
                  </p>
                </div>

                <div
                  className="min-w-[40px] flex-shrink-0 font-semibold text-base
                                    border-l border-[#E7E7E7] text-center p-2"
                >
                  {renderPropertyCount() ? renderPropertyCount().commercial : '00'}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-1 rounded-xl flex-col justify-between bg-[#F2F2F2] p-3 gap-3">
            <div className="flex flex-col gap-2 2md:flex-row justify-between 2md:items-center">
              <p className="pt-1 font-semibold text-base text-text-black">
                List Summary{" "}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row 2md:flex-col lg:flex-row gap-3 justify-start">
              <div className="flex flex-row items-center rounded-xl bg-white flex-1">
                <div className="flex items-center gap-2 p-2.5 flex-1 min-w-0">
                  <Image
                    src="/assets/residential-blue-dashboard.svg"
                    height={25}
                    width={25}
                    alt="residential"
                    className="w-[25px] h-[25px]"
                  />
                  <p
                    className="font-medium text-text-black truncate"
                    title="Residential"
                  >
                    Residential
                  </p>
                </div>

                <div
                  className="min-w-[40px] flex-shrink-0 font-semibold text-base
                                    border-l border-[#E7E7E7] text-center p-2"
                >
                  {userDashboardDetails?.listingsSummary?.residential ? userDashboardDetails?.listingsSummary?.residential : '00'}
                </div>
              </div>
              <div className="flex flex-row items-center rounded-xl bg-white flex-1">
                <div className="flex items-center gap-2 p-2.5 flex-1 min-w-0">
                  <Image
                    src="/assets/commercial-red-dashboard.svg"
                    height={25}
                    width={25}
                    alt="residential"
                    className="w-[25px] h-[25px]"
                  />
                  <p
                    className="font-medium text-text-black truncate"
                    title="Residential"
                  >
                    Commercial
                  </p>
                </div>

                <div
                  className="min-w-[40px] flex-shrink-0 font-semibold text-base
                                    border-l border-[#E7E7E7] text-center p-2"
                >
                  {userDashboardDetails?.listingsSummary?.commercial ? userDashboardDetails?.listingsSummary?.commercial : '00'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {userDashboardDetails?.role == USER_TYPE.OWNER && <div className="flex flex-col 2md:flex-row border justify-between border-[#E7E7E7] rounded-[10px] px-4 py-3">
          <div className="flex flex-1 flex-col gap-4">
            <div>
              <p className="font-semibold text-text-black text-lg">
                {`You've used ${userDashboardDetails?.freeListings?.used ?? 0} out of ${userDashboardDetails?.freeListings?.total ?? max_property} listing on your ${" "}`}
                <span className="text-accent"> Free Plan.</span>
              </p>
              <p className="text-text-gray text-base">
                Short, clear, and easy to understand
              </p>
            </div>
            <p className="text-base">
              Free Listing:{" "}
              <span className="bg-[#E7E7E7] p-1 rounded-[5px] px-2 text-sm">
                {userDashboardDetails?.freeListings?.total ?? max_property}
              </span>
            </p>
            <div className={`w-full`}>
              <div className="relative w-full sm:w-[250px] h-10 bg-[#01004826] rounded-[5px] overflow-hidden flex items-center">
                <div
                  className="absolute top-0 left-0 h-full bg-[#0A0A4A] rounded-[5px] transition-all duration-500 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                ></div>

                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold tracking-wide">
                    {String(userDashboardDetails?.freeListings?.used ?? 0).padStart(2, "0")}/{String(userDashboardDetails?.freeListings?.total ?? max_property).padStart(2, "0")}*
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[1px] 2md:h-auto 2md:mx-5 my-4 2md:my-0 2md:py-8 border  border-[#E7E7E7]"></div>
          <div className="flex flex-1 flex-col gap-4 justify-start">
            <p className="font-semibold text-text-black text-lg">
              Want to post more listing?
            </p>

            <ul className="">
              <li className="flex items-start gap-2">
                <span className="mt-2 w-2 h-2 rounded-full bg-text-black"></span>
                <span className="flex-1 text-text-gray text-base">
                  {`Free Plan: Post up to ${userDashboardDetails?.freeListings?.total ?? max_property} listings`}
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="mt-2 w-2 h-2 rounded-full bg-text-black"></span>
                <span className="flex-1 text-text-gray text-base">
                  Channel Partner: Post Unlimited Listings after quick
                  registration
                </span>
              </li>
            </ul>
            <button onClick={async () => {
              const latest = await refetchAgreementStatus()
              if (!latest?.data?.docusign_agreement_signed) {
                const isOwner = userDashboardDetails?.role === USER_TYPE.OWNER
                toast.info(`Please sign the ${isOwner ? 'owner' : 'channel partner'} agreement first`)
                router.push('/kyc?tabName=Agreement%20Signature')
                return
              }
              setOpenCodePopup(true)
            }} className="w-full sm:w-fit text-sm sm:text-base animated-button px-5 sm:px-12 py-3 border border-blue text-center cursor-pointer">
              <span className="gap-3 relative flex justify-center">
                <p className={`text-nowrap font-medium`}>
                  Register as Channel Partner
                </p>
              </span>
            </button>
          </div>
        </div>}

        {userDashboardDetails?.role == USER_TYPE.CHANNEL_PARTNER && <div className="flex flex-col 2md:flex-row border justify-between border-[#E7E7E7] rounded-[10px] px-4 py-3">
          <div className="relative flex flex-1 flex-col gap-4 pb-0 sm:pb-10">
            <div>
              <p className="font-semibold text-text-black text-lg">
                Channel Partner {' '}
                <span className="text-[#1B8836]"> Activated</span>
              </p>
              <p className="text-text-gray text-base">
                Now you can post unlimited properties and unlock premium benefits.
              </p>
            </div>
            <ul className="">
                <p className="font-semibold text-text-black text-lg">
               Benefits for Channel Partners:
              </p>
              <li className="flex items-start gap-2">
                <span className="mt-2 w-2 h-2 rounded-full bg-text-black"></span>
                <span className="flex-1 text-text-gray text-base">
                  Unlimited property listings
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="mt-2 w-2 h-2 rounded-full bg-text-black"></span>
                <span className="flex-1 text-text-gray text-base">
                  Verified Partner Badge for higher trust
                </span>
              </li>
            </ul>
            <div className="hidden sm:flex absolute -bottom-[13px] right-0">
                <Image src='/assets/channerl-parter-dashboard.svg' width={100} height={100} alt='' />
            </div>
          </div>
          <div className="h-[1px] 2md:h-auto 2md:mx-5 my-4 2md:my-0 2md:py-8 border  border-[#E7E7E7]"></div>
          <div className="flex flex-1 flex-col gap-4 justify-start">
            <p className="font-semibold text-text-black text-lg">
              Your Channel Partner Status <span className="text-[#1B8836]"> Activated</span>
            </p>

            <div className="w-full sm:w-fit flex flex-row items-center rounded-xl bg-[#F2F2F2]">
                <div className="flex items-center gap-2 p-2.5 flex-1 min-w-0">
                  <Image
                    src="/assets/property-posted-blue.svg"
                    height={25}
                    width={25}
                    alt="residential"
                    className="w-[25px] h-[25px]"
                  />
                  <p
                    className="font-medium text-text-black truncate"
                    title="Residential"
                  >
                    Properties Posted
                  </p>
                </div>

                <div
                  className="min-w-[40px] flex-shrink-0 font-semibold text-base
                                    border-l border-text-black text-center p-2"
                >
                  {userDashboardDetails?.freeListings?.used}
                </div>
            </div>
            <div>
                <p className="text-base text-text-black">Unlimited Quota: 🔓 No limits!</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-text-gray">Your CP Code:</p>
              {userDashboardDetails?.channelPartnerCode ? (
                <span className="font-semibold text-sm bg-[#0A0A4A] text-white px-3 py-1 rounded-md tracking-widest select-all">
                  {userDashboardDetails.channelPartnerCode}
                </span>
              ) : (
                <span className="text-sm text-text-gray italic">Not assigned</span>
              )}
            </div>
          </div>
        </div>}

        <div className="flex rounded-xl flex-col sm:flex-row gap-3 justify-start items-start sm:items-center bg-[#F2F2F2] p-3">
          <div className="flex flex-1 flex-col ">
            <p className="font-semibold text-lg text-text-black">
              We’re Here for You!
            </p>
            <p className="text-base text-text-gray">
              Stuck somewhere or need quick answers? Explore our Help Center for
              guides, FAQs, and instant support.
            </p>
          </div>
          <div>
            <a href={`/api/redirect-to-buyer?path=/help-center`} target="_blank" rel="noopener noreferrer" className="w-full text-sm 1xl:text-base px-5 py-3 border border-[#E7E7E7] text-center cursor-pointer rounded-[5px] bg-light-purple block">
              <span className="gap-3 relative flex justify-center">
                <p className={`text-nowrap font-medium`}>Go to Help Center</p>
              </span>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 border justify-between border-[#E7E7E7] rounded-[10px] px-4 py-3">
          <p className="font-bold text-lg">Customer Support</p>
          <div className="flex flex-col items-center text-center lg:text-left lg:flex-row justify-between gap-4">
            <a href={`tel:${aboutusData?.phoneNumber}`} className="flex flex-col flex-1 cursor-pointer">
              <Image src={'/assets/mobile-blue.svg'} width={45} height={45} alt="mobile" className="mb-3 text-center mx-auto lg:mx-0"/>
              <p className="font-semibold text-lg">Call Us</p>
              <p className="text-xs lg:text-base text-text-gray">{aboutusData?.phoneNumber}</p>
            </a>
            <div className="h-[1px] 2md:h-auto 2md:mx-5 my-4 2md:my-0 2md:py-8 border  border-[#E7E7E7]"></div>
            <a href={`mailto:${aboutusData?.email}`} className="flex flex-col flex-1 cursor-pointer">
              <Image src={'/assets/email-blue.svg'} width={45} height={45} alt="mobile" className="mb-3 text-center mx-auto lg:mx-0"/>
              <p className="font-semibold text-lg">Email Us</p>
              <p className="text-xs lg:text-base text-text-gray">{aboutusData?.email}</p>
            </a>
          </div>
          
        </div>
      </div>
            <UpgradeChannelPartner isCloseNotRequired={true} open={openCodePopup} onClose={() => handleCloseCodePopup()} onSubmit={handleCode}/>
    </div>
  );
}
