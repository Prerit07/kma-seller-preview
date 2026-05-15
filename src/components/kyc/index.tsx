"use client";

import { useEffect, useMemo, useState } from "react";

import PhotoIcon from "@/assets/photo-upload.svg";
import AadharIcon from "@/assets/aadhar-verify.svg";
import BankIcon from "@/assets/bank-details.svg";
import AgreementIcon from "@/assets/aggrement-sign.svg";
import UploadPhoto from "./uploadPhoto";
import AadharVerification from "./aadharVerification";
import BankDetails from "./bankDetails";
import AggrementVerification from "./aggrementVerification";
import { useRouter } from "nextjs-toploader/app";
import { useQuery } from "@tanstack/react-query";
import { getKycStatusApiHandler, KycStatusResponse } from "@/services/kycService";
import { USER_TYPE } from "@/lib/enums";

export default function UserKyc({tabName, event}) {
  const router = useRouter()

  const [isKycComplete, setIsKycComplete] = useState(false)

  const { data: kycDetails, refetch: refreshKyc, isLoading: detailsLoader } = useQuery({
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

  // Role drives which KYC steps render. Prefer the server-authoritative role
  // from the KYC status response so an owner-just-upgraded-to-CP isn't stuck
  // on a stale localStorage role. Fall back to localStorage only until the
  // first server response lands.
  const isOwner = useMemo(() => {
    if (kycDetails?.role) return kycDetails.role === USER_TYPE.OWNER;
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed?.role === USER_TYPE.OWNER;
    } catch {
      return false;
    }
  }, [kycDetails?.role]);

  const defaultTab = isOwner ? 'Agreement Signature' : 'Photo Upload';
  const [activeStep, setActiveStep] = useState(tabName ? tabName : defaultTab);

  const kycList = isOwner
    ? [{ icon: AgreementIcon, name: "Agreement Signature" }]
    : [
        { icon: PhotoIcon, name: "Photo Upload" },
        { icon: AadharIcon, name: "Aadhar Verification" },
        { icon: BankIcon, name: "Bank Details" },
        { icon: AgreementIcon, name: "Agreement Signature" },
      ];

  const handleActiveTab = (tabName, index) => {
    if( index> kycDetails?.kyc_steps_completed){
      return
    }
    setActiveStep(tabName)
    router.replace(`/kyc?tabName=${tabName}`)
  }

  const renderTitle = () => {
    const titleList = {
        'Photo Upload': 'Upload Your Photo',
        'Aadhar Verification': 'Verify Your Aadhar Number',
        'Bank Details': 'Enter Your Bank Details',
        'Agreement Signature': isOwner ? 'Owner Agreement' : 'Channel Partner Agreement',
    }

    return titleList[activeStep]
  }

  useEffect(() => {
    if(kycDetails){
      setIsKycComplete(kycDetails?.kyc_completed)
      // KYC already done — don't let the user sit on /kyc, send them to dashboard.
      // Skip while DocuSign just signed (event=signing_complete) so the
      // agreement screen has its own moment to show "signed successfully" before
      // redirecting.
      if (kycDetails.kyc_completed && event !== "signing_complete") {
        router.replace("/user-dashboard")
      }
    }
  },[kycDetails, event, router])

  useEffect(() => {
    if(tabName){
      setActiveStep(tabName)
    }else{
      setActiveStep(defaultTab)
    }
    refreshKyc()
  },[tabName, defaultTab])

  return (
    <div className="bg-white rounded-xl p-5 lg:p-10 w-full">
      {!isKycComplete && <div className="flex items-center justify-between h-[100px]">
        {kycList.map((item, index) => {
          const Icon = item.icon;

          return (
            <>
            <div onClick={() => handleActiveTab(item.name, index)} className={`flex justify-between items-center flex-col ${activeStep == item.name ? 'text-blue' : 'text-[#888888]'} ${index > kycDetails?.kyc_steps_completed ? 'cursor-no-drop' : 'cursor-pointer'}`}>
              <div className="flex justify-between items-center flex-col gap-2  p-2">
                <div
                  key={item.name}
                  className="flex-1 flex items-center "
                >
                  <Icon className="w-8 h-8" />
                </div>
                <p className="text-xs font-medium lg:text-base text-center leading-4">{item.name}</p>
              </div>
              {activeStep == item.name && <div className="border-b-2 w-full border-blue"></div>}
            </div>
            {index != kycList.length - 1 && <hr className="border-1 text-[#CCCCCC] h-[50%]"/>}
            </>
          );
        })}
      </div>}

        <div className="w-full flex flex-col py-4 items-center gap-6">
            {!isKycComplete && <p className="text-blue text-xl font-semibold">{renderTitle()}</p>}
            {!isKycComplete && <>
            {activeStep == 'Photo Upload' && <UploadPhoto/>}
            {activeStep == 'Aadhar Verification' && <AadharVerification/>}
            {activeStep == 'Bank Details' && <BankDetails/>}
            {activeStep == 'Agreement Signature' && <AggrementVerification event={event}/>}
            </>}
            {isKycComplete && event === "signing_complete" && (
              <p className="text-green-600 text-xl font-semibold">Document signed successfully! Redirecting to dashboard...</p>
            )}
        </div>
    </div>
  );
}
