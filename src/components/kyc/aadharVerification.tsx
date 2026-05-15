'use client'
import FullscreenSpinner from "../common/spinner/fullScreenSpinner"
import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { aadharVerifyApiHandler, aadharVerifyGetApiHandler, AadharVerifyGetApiHandler, AadharVerifyPayload, AadharVerifyResponse } from "@/services/kycService"
import { toast } from "react-toastify"
import { useRouter } from "nextjs-toploader/app"

export default function AadharVerification(){
  const router = useRouter()
  
  const [token, setToken] = useState(null);
  const [showVerifyBtn, setShowVerifyBtn] = useState(false)
  const [verificationStart, setVerificationStart] = useState(false)

  const { mutate: handleAdharVerify, isPending: loader } = useMutation({
    mutationFn: async (
      payload: AadharVerifyPayload
    ): Promise<AadharVerifyResponse> => {
      return await aadharVerifyApiHandler(payload);
    },
    onSuccess: (response: AadharVerifyResponse) => {
        toast.success(response.message)
        router.push('/kyc?tabName=Bank Details')
    },
    onError: (error: any) => {
      setVerificationStart(false)
      if (Array.isArray(error.message)) {
        error.message.map((item: string) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const { data: aadharDetails, isLoading: detailsLoader } = useQuery({
    queryKey: ["aadhar-details"],
    queryFn: async (): Promise<AadharVerifyGetApiHandler> => {
      return aadharVerifyGetApiHandler();
    },
    select: (resposne: AadharVerifyGetApiHandler) => {
      return resposne;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const fetchToken = async () => {
    const res = await fetch("/api/initilize-surepass");
    const data = await res.json();
    if (data?.data?.token) {
      setToken(data.data.token);
    }
  }

  const fetchAadhar = async (id) => {
    const res = await fetch(`/api/get-aadhar-details/${id}`)
    const data = await res.json();
    if(data?.status_code == 200){
      const aadharData = data?.data

      const payload = {
        digilocker_metadata: aadharData?.digilocker_metadata,
        isVerified: true,
        digilocker_clientid: id,
        aadhaar_number: aadharData?.aadhaar_xml_data?.masked_aadhaar
      }

      handleAdharVerify(payload)
    }else if(data?.status_code == 422){
      toast.error(data?.message ?? 'Re verify Aadhar')
      setVerificationStart(false)
    }
  }

    useEffect(() => {

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/surepassio/surepass-digiboost-web-sdk@latest/index.min.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  useEffect(() => {
    if(aadharDetails && !aadharDetails?.aadhaar_verified){
      fetchToken()
      setShowVerifyBtn(true)
    }
  },[aadharDetails])

  useEffect(() => {
  if (!token || !window.DigiboostSdk) return;

  window.DigiboostSdk({
    gateway: process.env.NEXT_PUBLIC_SUREPASS_ENV || "sandbox",
    token,
    selector: "#surepass-button",
    style: {
      backgroundColor: "#0a0a4a", // match your theme
      color: "#ffffff",
      padding: "14px 40px",
      borderRadius: "9999px",
      cursor: "pointer",
    },
    onSuccess: (data: any) => {
       const clientId = data?.client_id;
       setVerificationStart(true)
      if (!clientId) {
        toast.error("Client ID missing");
        setVerificationStart(false)
        return;
      }
      fetchAadhar(clientId)
    },
    onFailure: (error) => {
      console.error("Verification failed:", error);
      toast.error("Aadhaar verification failed. Re try again");
    },
  });
}, [token]);



  const handleCancel = () => {
    router.push('/user-dashboard')
  }

    return(
       <>
           { detailsLoader || verificationStart ?
               <FullscreenSpinner/> : 
           
           <div className="flex flex-col gap-10 items-center justify-center w-full">

              {showVerifyBtn && <button
                disabled={loader}
                id="surepass-button"
                className="cursor-pointer w-fit px-12 py-3"
              ></button>}

              {
                aadharDetails?.aadhaar_verified && <div className="flex flex-col gap-1 w-full items-start">
                  
                  <div className="flex gap-3">
                      <p className="text-text-gray text-lg">Aadhar Number:</p>
                      <p className="text-text-black text-lg font-medium">{aadharDetails?.aadhaar_number}</p>
                  </div>
                  <div className="flex gap-3">
                      <p className="text-text-gray text-lg">Status:</p>
                      <p className="text-text-black text-lg font-medium">{'Verified'}</p>
                  </div>
                </div>
              }
                
             {/* Submit / Cancel */}
             <div className="flex flex-wrap justify-center gap-2 mt-8">
               <button disabled={loader} onClick={handleCancel}  className="w-full md:w-[130px] text-sm 1xl:text-base px-12 py-3 border border-blue text-center cursor-pointer rounded-full bg-light-purple">
                 <span className="gap-3 relative flex justify-center">
                     <p className={`text-nowrap font-medium`}>Cancel</p>
                   </span>
               </button>
       
               {aadharDetails?.aadhaar_verified && <button
                 disabled={loader}
                 className="cursor-pointer w-full md:w-[130px] px-12 py-3 animated-button border border-blue"
                 onClick={() => {
                   router.push('/kyc?tabName=Bank Details')
                 }}
               >
                 <span className="gap-3 relative flex justify-center">
                       <p className={`text-nowrap`}>Next</p>
                   </span>
               </button>}
             </div>
           </div>
       
               }
            </>
    )
}