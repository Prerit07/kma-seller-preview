'use client'

import { ChannelPartnerAgreementApiHandler, ChannelPartnerAgreementResponse } from "@/services/userService";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AUTO_REDIRECT_SECONDS = 3;

export default function DocumentSigned() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const event = searchParams.get('event');
  const [message, setMessage] = useState('');
  const [canRetry, setCanRetry] = useState(false);
  const [navigate, setNavigate] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!event) return;

    switch(event) {
      case 'signing_complete':
        setMessage('Document signed successfully');
        toast.success('Document signed successfully');
        setNavigate(true)
        setSecondsLeft(AUTO_REDIRECT_SECONDS)
        break;
      case 'decline':
        setMessage('Document was declined');
        setCanRetry(true);
        break;
      case 'view':
        setMessage('Document viewed');
        setCanRetry(true);
        break;
    case 'cancel':
        setMessage('Document sign canceled');
        setCanRetry(true);
        break;
      default:
        setMessage('Document sign not completed');
        setCanRetry(true);
    }
  }, [event]);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      router.replace('/user-dashboard');
      return;
    }
    const timeout = window.setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => window.clearTimeout(timeout);
  }, [secondsLeft, router]);
   const {
    mutate: handleSignChannelPartnerAgreement,
    isPending
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

  const handleRetry = () => {
      const domainUrl = `${window.location.origin}/document-signed-success`;
   handleSignChannelPartnerAgreement(domainUrl)
  }

  const handleRedirect = () => {
    router.replace('/user-dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-sm w-full">
        <p className="text-lg font-semibold text-text-black mb-2">{message}</p>
        {navigate && secondsLeft !== null && secondsLeft > 0 && (
          <p className="text-text-gray text-xs mb-4">Redirecting to dashboard in {secondsLeft}s...</p>
        )}

        {canRetry && (
          <button
            disabled={isPending}
            onClick={handleRetry}
            className="w-full md:w-auto text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer"
            >
            <span className="gap-3 relative">
                <p className="text-nowrap">
                Retry Document Signing
                </p>
            </span>
            </button>
        )}
        {
            navigate && (
                <button
                onClick={handleRedirect}
                className="w-full md:w-auto text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer"
            >
                <span className="gap-3 relative">
                <p className="text-nowrap">
                   Go to Dashboard
                </p>
                </span>
            </button>
            )
        }
      </div>
    </div>
  );
}
