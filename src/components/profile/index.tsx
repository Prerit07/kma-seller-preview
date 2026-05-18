"use client";

import { KYC_STATUS, USER_TYPE, userType } from "@/lib/enums";
import {
  getKycStatusApiHandler,
  KycStatusResponse,
} from "@/services/kycService";
import {
  UserDashboardDetailsApiHandler,
  UserDashboardDetailsResponse,
  userProfileApiHandler,
  UserProfileResponse,
} from "@/services/userService";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import FullscreenSpinner from "../common/spinner/fullScreenSpinner";
import ProfileUpdate from "./profileedit";
import { useDispatch } from "react-redux";
import { resetForm } from "@/store/createAccountSlice";
import BankDetailsUpdate from "./editBankDetails";

export default function UserProfile() {
  const baseUrl = process.env.NEXT_PUBLIC_AWS_URL;
  const router = useRouter();
  const dispatch = useDispatch();
  const [openProfileUpdate, setOpenProfileUpdate] = useState(false);
  const [openBankDetailsUpdate, setOpenBankDetaislUpdate] = useState(false)

  const { data: kycDetails, isLoading: detailsLoader } = useQuery({
    queryKey: ["kyc"],
    queryFn: async (): Promise<KycStatusResponse> => {
      return getKycStatusApiHandler();
    },
    select: (resposne: KycStatusResponse) => {
      return resposne;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const {
    data: userProfile,
    isLoading: profielLoader,
    refetch: refreshUserProfileData,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async (): Promise<UserProfileResponse> => {
      return userProfileApiHandler();
    },
    select: (resposne: UserProfileResponse) => {
      return resposne.user;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  // const { data: userDashboardDetails } = useQuery({
  //   queryKey: ["user-dashboard-details-profile"],
  //   queryFn: async (): Promise<UserDashboardDetailsResponse> => {
  //     return UserDashboardDetailsApiHandler();
  //   },
  //   select: (resposne: UserDashboardDetailsResponse) => {
  //     return resposne;
  //   },
  //   staleTime: 0,
  //   refetchOnMount: true,
  // });

  const renderTitle = (status) => {
    if (status == "pending") {
      return "KYC is Pending";
    }else if(status == 'rejected') {
      return 'KYC is Rejected'
    }
  };

  return (
    <>
      {profielLoader && <FullscreenSpinner />}
      {userProfile && (
        <div className="w-full bg-white rounded-xl flex flex-col justify-start items-start p-5 gap-3">
          <div className="flex w-full justify-between items-start gap-4">
            <div className="flex-3 flex justify-between  gap-2 lg:gap-4">
              <div className="flex  gap-2 lg:gap-4">
                <div className="w-fit rounded-full overflow-hidden">
                  <Image
                    src={userProfile.profileImage ? baseUrl + userProfile.profileImage : "/assets/profile.png"}
                    width={100}
                    height={100}
                    alt="user profile"
                    className="w-[85px] h-[85px] object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-text-black text-base font-semibold">
                    {userProfile.name}
                  </p>
                  <p className="text-text-gray text-xs lg:text-base">
                    {userProfile.phone?.startsWith('+') ? userProfile.phone : `+91 ${userProfile.phone}`}
                  </p>
                  <p className="text-text-gray text-xs lg:text-base">
                    {userProfile.email}
                  </p>
                </div>
              </div>
              <div>
                <p
                  onClick={() => {
                    setOpenProfileUpdate(true);
                  }}
                  className="cursor-pointer flex text-[#757BEE] gap-2 text-base font-medium"
                >
                  <Image
                    src={"/assets/editprofile.svg"}
                    width={16}
                    height={16}
                    alt="edit"
                  />
                  Edit Profile
                </p>
                {userProfile?.role == USER_TYPE.CHANNEL_PARTNER &&
                  kycDetails?.kyc_status == "approved" && (
                  <p
                    onClick={() => {
                      setOpenBankDetaislUpdate(true);
                    }}
                    className="cursor-pointer flex text-[#757BEE] gap-2 text-base font-medium"
                  >
                    <Image
                      src={"/assets/editprofile.svg"}
                      width={16}
                      height={16}
                      alt="edit"
                    />
                    Edit Bank Details
                  </p>
                )}
              </div>
            </div>

            <div className="hidden lg:flex flex-1">
              {kycDetails &&
                userProfile?.role == USER_TYPE.CHANNEL_PARTNER &&
                kycDetails?.kyc_status != "approved" &&
                kycDetails?.kyc_status !=
                  "in_review" && (
                  <div className="bg-light-purple w-[200px] h-auto p-3 flex flex-col justify-center items-center gap-1 border border-[#757BEE] rounded-xl">
                    <Image
                      src="/assets/kyc-info.svg"
                      width={35}
                      height={35}
                      alt="kyc-info"
                    />
                    <p className="font-medium text-text-black text-sm">
                      {renderTitle(kycDetails?.kyc_status)}
                    </p>
                    {!kycDetails?.kyc_completed && (
                      <button
                        onClick={() => {
                          router.push("/kyc");
                        }}
                        className="w-full md:w-auto text-xs 1xl:text-sm animated-button px-6 py-2 border border-blue text-center cursor-pointer"
                      >
                        <span className="gap-3 relative">
                          <p className="text-nowrap">Complete kyc</p>
                        </span>
                      </button>
                    )}
                  </div>
                )}
            </div>
          </div>
          <div className="flex justify-center w-full lg:hidden">
              {kycDetails &&
                userProfile?.role == USER_TYPE.CHANNEL_PARTNER &&
                kycDetails?.kyc_status != "approved" &&
                kycDetails?.kyc_status !=
                  "in_review" && (
                  <div className="bg-light-purple w-[200px] h-auto p-3 flex flex-col justify-center items-center gap-1 border border-[#757BEE] rounded-xl">
                    <Image
                      src="/assets/kyc-info.svg"
                      width={35}
                      height={35}
                      alt="kyc-info"
                    />
                    <p className="font-medium text-text-black text-sm">
                      {renderTitle(kycDetails?.kyc_status)}
                    </p>
                    {!kycDetails?.kyc_completed && (
                      <button
                        onClick={() => {
                          router.push("/kyc");
                        }}
                        className="w-full md:w-auto text-xs 1xl:text-sm animated-button px-6 py-2 border border-blue text-center cursor-pointer"
                      >
                        <span className="gap-3 relative">
                          <p className="text-nowrap">Complete kyc</p>
                        </span>
                      </button>
                    )}
                  </div>
                )}
            </div>
          {userProfile.role == USER_TYPE.CHANNEL_PARTNER && (
            <>
              <hr className="border-border w-full " />
              <div className="flex gap-4">
                <p className="text-text-black text-base w-[85px]">Kyc Status</p>
                <p className="text-text-gray text-base">
                  {KYC_STATUS[kycDetails?.kyc_status]} {kycDetails?.kyc_status == 'rejected' ? `(${kycDetails?.kyc_rejection_reason})` : ''}
                </p>
              </div>
            </>
          )}
          <hr className="border-border w-full " />
          <div className="flex gap-4">
            <p className="text-text-black text-base w-[85px]">Role</p>
            <p className="text-text-gray text-base">
              {userType[userProfile?.role]}
            </p>
          </div>
          <hr className="border-border w-full " />
          <div className="flex gap-4">
            <p className="text-text-black text-base w-[85px]">City</p>
            <p className="text-text-gray text-base">
              {userProfile?.role == USER_TYPE.CHANNEL_PARTNER
                ? userProfile?.cities
                : userProfile?.city}
            </p>
          </div>
          {userProfile?.role == USER_TYPE.CHANNEL_PARTNER && (
            <>
              <hr className="border-border w-full " />
              <div className="flex gap-4">
                <p className="text-text-black text-base w-[85px]">Experience</p>
                <p className="text-text-gray text-base">
                  {userProfile?.businessSince}
                </p>
              </div>
            </>
          )}
          {userProfile?.role == USER_TYPE.CHANNEL_PARTNER && (
            <>
              <hr className="border-border w-full " />
              <div className="flex gap-4">
                <p className="text-text-black text-base w-[85px]">Firm Name</p>
                <p className="text-text-gray text-base">
                  {userProfile?.firmName}
                </p>
              </div>{" "}
            </>
          )}
          {userProfile?.role == USER_TYPE.CHANNEL_PARTNER && (
            <>
              <hr className="border-border w-full " />
              <div className="flex gap-4">
                <p className="text-text-black text-base w-[85px]">
                  Partner code
                </p>
                <p className="text-text-gray text-base">
                  {userProfile?.channelPartnerCode}
                </p>
              </div>
            </>
          )}
          {userProfile?.role == USER_TYPE.CHANNEL_PARTNER && (
            <>
              {" "}
              <hr className="border-border w-full " />
              <div className="flex gap-4">
                <p className="text-text-black text-base w-[85px]">
                  Description
                </p>
                <p className="text-text-gray text-base">
                  {userProfile?.aboutYourSelf}
                </p>
              </div>{" "}
            </>
          )}
        </div>
      )}
      {openProfileUpdate && (
        <ProfileUpdate
          open={openProfileUpdate}
          onClose={(isUpdate) => {
            if (isUpdate) {
              refreshUserProfileData();
            }
            setOpenProfileUpdate(false);
            dispatch(resetForm());
          }}
        />
      )}

      {
        openBankDetailsUpdate && (
          <BankDetailsUpdate  open={openBankDetailsUpdate} onClose={() => {
            setOpenBankDetaislUpdate(false)
          }}/>
        )
      }

    </>
  );
}
