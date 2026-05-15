"use client";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";

const AUTO_REDIRECT_SECONDS = 3;

export default function KycSuccess(){
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REDIRECT_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      router.replace('/user-dashboard');
      return;
    }
    const timeout = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [secondsLeft, router]);

    return(
        <div className="flex flex-col justify-center items-center gap-2">
            <Image src='/assets/kyc-success.svg' width={150} height={150} alt="success" />
            <p className="text-blue text-base font-bold">KYC Details Added Successfully!</p>
            <p className="text-text-gray text-sm font-semibold">Profile Complete</p>
            <p className="text-text-gray text-xs">Redirecting to dashboard in {secondsLeft}s...</p>
            <div className="flex flex-wrap justify-center gap-2 mt-8">
               <button onClick={() => {
                router.push('/user-dashboard')
               }}  className="w-full md:w-[130px] text-sm 1xl:text-base px-12 py-3 border border-blue text-center cursor-pointer rounded-full bg-light-purple">
                 <span className="gap-3 relative flex justify-center">
                     <p className={`text-nowrap font-medium`}>Go to Dashboard</p>
                   </span>
               </button>

               <button
                 className="w-full md:w-[170px] px-12 py-3 animated-button border border-blue"
                 onClick={() => {
                  router.push('/profile')
                 }}
               >
                 <span className="gap-3 relative flex justify-center">
                       <p className={`text-nowrap`}>Back to your profile</p>
                   </span>
               </button>
             </div>
        </div>
    )
}