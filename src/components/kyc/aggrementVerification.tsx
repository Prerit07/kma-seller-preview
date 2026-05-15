import {
  ChannelPartnerAgreementApiHandler,
  ChannelPartnerAgreementResponse,
} from "@/services/userService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Spinner from "../common/spinner";
import { DocusignResponse, docuSingStatusApiHanlder } from "@/services/kycService";
import { axiosInstance } from "@/services/axiosService";

export default function AggrementVerification({event}: {event?: string}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState('Pending')
  const [isSignDone, setIsSignDone] = useState(false)
  const [canRetry, setCanRetry] = useState(false);
  const signingHandledRef = useRef(false);

  const { mutate: handleSignChannelPartnerAgreement, isPending } = useMutation({
    mutationFn: async (
      url: string
    ): Promise<ChannelPartnerAgreementResponse> => {
      return await ChannelPartnerAgreementApiHandler(url);
    },
    onSuccess: (response: ChannelPartnerAgreementResponse) => {
      if (response.url) {
        // Same tab redirect — after signing DocuSign redirects back to returnUrl
        window.location.href = response.url;
      }
    },
    onError: (error: any) => {
      if (Array.isArray(error.message)) {
        error.message.map((item: string) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleSignDocument = () => {
    // Return to KYC page after signing — not dashboard
    const domainUrl = `${window.location.origin}/kyc?tabName=Agreement%20Signature`;
    handleSignChannelPartnerAgreement(domainUrl);
  };

  const { data: documentDetails, isLoading: detailsLoader } = useQuery({
    queryKey: ["docusign details"],
    queryFn: async (): Promise<DocusignResponse> => {
      return docuSingStatusApiHanlder();
    },
    select: (resposne: DocusignResponse) => {
      return resposne;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  useEffect(() => {
    if(documentDetails){
        if(documentDetails?.docusign_agreement_signed){
            setStatus('Completed')
            setIsSignDone(true)
        } else {
            axiosInstance.post("/users/docusign/sync-status").then((res) => {
              if (res.data?.status === "completed") {
                setStatus("Completed");
                setIsSignDone(true);
              }
            }).catch(() => {});
        }
    }
  },[documentDetails])

  useEffect(() => {
    if (!event) return;

    switch (event) {
      case "signing_complete":
        // Guard: run once only — router identity can change and re-trigger this effect
        if (signingHandledRef.current) return;
        signingHandledRef.current = true;
        setMessage("Document signed successfully! Redirecting to dashboard...");
        toast.success("Document signed successfully!");
        setStatus("Completed");
        setIsSignDone(true);
        // Sync status in background — redirect happens regardless of outcome
        axiosInstance.post("/users/docusign/sync-status").catch(() => {});
        setTimeout(() => router.push("/user-dashboard"), 1500);
        break;
      case "decline":
        setMessage("Document was declined");
        setCanRetry(true);
        break;
      case "view":
        setMessage("Document viewed — please complete signing");
        setCanRetry(true);
        break;
      case "cancel":
        setMessage("Document signing was canceled");
        setCanRetry(true);
        break;
      default:
        setMessage("Document signing not completed");
        setCanRetry(true);
    }
  }, [event, router]);

  const handleCancel = () => {
    router.push('/user-dashboard')
  }

  if (detailsLoader) {
    return <div className="flex justify-center py-10"><Spinner size={30} /></div>;
  }

  return (
    <div>
      <p className="font-bold text-text-gray">
        Status: <span className={`${status === 'Completed' ? 'text-green-600' : 'text-blue'}`}>{status}</span>
      </p>
      {message && <p className="mt-2 text-sm text-text-gray">{message}</p>}

      <div className="flex flex-wrap justify-center gap-2 mt-8">
        <button onClick={handleCancel} className="w-full md:w-[130px] text-sm 1xl:text-base px-12 py-3 border border-blue text-center cursor-pointer rounded-full bg-light-purple">
          <span className="gap-3 relative flex justify-center">
            <p className={`text-nowrap font-medium`}>Cancel</p>
          </span>
        </button>

        {!isSignDone && <button
          disabled={isPending}
          className="cursor-pointer w-full md:w-[160px] px-12 py-3 animated-button border border-blue"
          onClick={handleSignDocument}
        >
          <span className="gap-3 relative flex justify-center">
            {!isPending ? (
                <p className={`text-nowrap`}>{canRetry ? 'Retry Again' : 'Sign Document'}</p>
              ) : (
                <Spinner size={20} className="h-[24px]"/>
              )}
          </span>
        </button>}
      </div>
    </div>
  );
}
