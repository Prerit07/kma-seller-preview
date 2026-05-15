'use client'
import { useEffect, useState } from "react";
import StepperCustom from "./customStepper";
import PostPropertyForm from "./form";
import Progress from "./porgress";
import { User } from "@/services/authService";

export default function ContentLayout({mode}: {mode: string}) {
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    const userRaw = localStorage.getItem("user");

    if (userRaw) {
      const userData: User = JSON.parse(userRaw);
      setUserName(userData?.name ?? "");
    }
  },[])
  return (
    <>
      <div
        className="bg-white relative w-full md:min-w-96 md:min-h-[450px] h-auto rounded-b-xl rounded-tr-xl"
        style={{ boxShadow: "0px 4px 20px 0px #0000000D", flexGrow: 11 }}
      >
        <div className="absolute rounded-full w-[65%] -top-[32px] rounded-[100px] bg-white h-[60px]" />
        <div className="pt-4 px-5">
          <div className="relative flex flex-wrap w-[65%] -top-[32px] text-sm gap-4 bg-white rounded-full">
            <p className="text-text-black font-semibold text-base lg:text-lg 1xl:text-xl">
            {`Welcome ${userName} – Start Listing Properties for Your Clients`}
            </p>
        </div>
         <div className="relative -top-[32px] flex flex-col gap-6 md:gap-6 w-full">
             <p className="text-sm pt-1 1xl:text-base text-text-gray">
              Add your client's property in just a few simple steps and connect with genuine buyers and tenants quickly – 100% free.
            </p>
            <div className="w-[100%] 2md:w-[25%]">
                <Progress/>
            </div>
            <div className="w-[100%]">
                <div className="grid grid-cols-1 2md:grid-cols-[1fr_3fr] gap-4">
                    {/* <StepperCustom/>
                    <PostPropertyForm/> */}

                    <div className=""> 
                        <StepperCustom />
                    </div>
                    <div id='formWrapper' className="max-h-[calc(100vh-150px)] overflow-y-auto pr-2">
                      <PostPropertyForm mode={mode}/>
                    </div>
                </div>

            </div>
         </div>
        </div>
      </div>
    </>
  );
}
