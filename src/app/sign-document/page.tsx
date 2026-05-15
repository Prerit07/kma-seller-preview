'use client'

import { ChannelPartnerAgreementApiHandler, ChannelPartnerAgreementResponse } from "@/services/userService";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function DocumentSigned() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const event = searchParams.get('event');


  const {
    mutate: handleSignChannelPartnerAgreement,
    isPending: docuemntLoader
} = useMutation({
    mutationFn: async (url: string): Promise<ChannelPartnerAgreementResponse> => {
    return await ChannelPartnerAgreementApiHandler(url);
    },
    onSuccess: (response: ChannelPartnerAgreementResponse) => {
    if (response.url) {
        window.open(response.url, "_blank");
    }

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

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-sm w-full">
        <p className="text-lg font-semibold text-text-black mb-4">{'Please Sign the agreement before post property'}</p>
                <button
                onClick={() => {
                    const domainUrl = `${window.location.origin}/document-signed-success`;
                    handleSignChannelPartnerAgreement(domainUrl)
                }}
                disabled={docuemntLoader}
                className="w-full md:w-auto text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer"
            >
                <span className="gap-3 relative">
                <p className="text-nowrap">
                  Sign Agreement
                </p>
                </span>
            </button>
            
      </div>
    </div>
  );
}
