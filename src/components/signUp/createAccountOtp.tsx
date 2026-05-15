"use client";
import React, { useEffect, useState } from "react";
import OtpInput from "../common/optInput";
import { matchIsNumeric, validateAndRedirect } from "@/lib/commonValidator";
import { useSearchParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
import { OTP_RESEND_TIME, USER_TYPE } from "@/lib/enums";
import { OtpPayload, resendOtpApiHandler, SendOtpResponse, validateOtpApiHandler, ValidateOtpPayload, ValidateOtpResponse } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import { UserType } from "@/types/user";
import { createURLSearchParam, setAuthCookies } from "@/lib/helper";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { resetForm } from "@/store/createAccountSlice";
import Spinner from "../common/spinner";

export default function CreateAccountOtp() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useDispatch()

  const mobileNumber = searchParams.get('mobile')
  const code = searchParams.get('code')
  const ownerType = searchParams.get('ownerType')
  const propertyIntent = searchParams.get('propertyIntent')


  const [otp, setOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<string>('')

  const [otpTimer, setOtpTimer] = useState(OTP_RESEND_TIME)
  const [isEnableOtopResend, setIsEnableOtpResend] = useState(false)

  const handleChange = (val: string) => {
    setOtp(val);
    setOtpError('')
  };

  const {
    mutate: handleVerifyOtp,
    isPending,
  } = useMutation({
    mutationFn: async (payload: ValidateOtpPayload): Promise<ValidateOtpResponse> => {
      return await validateOtpApiHandler(payload);
    },
    onSuccess:async (response: ValidateOtpResponse) => {
      await setAuthCookies(response.accessToken,response.refreshToken)
      // localStorage.setItem('refreshToken', response.refreshToken)
      // localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('user',JSON.stringify(response.user))
      const params = createURLSearchParam({
        ...(ownerType == USER_TYPE.OWNER ? {propertyIntent: propertyIntent,} : '')
      })
      dispatch(resetForm())
      setTimeout(() => {
        router.replace(`/create-account${params}`)
      }, 300);
    },
    onError: (error: any) => {
      setOtpError(error?.message)
    },
  });

  const {
    mutate: handleResendOtp
  } = useMutation({
    mutationFn: async (payload: OtpPayload): Promise<SendOtpResponse> => {
      return await resendOtpApiHandler(payload);
    },
    onSuccess: (response: SendOtpResponse) => {
      toast.success(response.message ?? "OTP sent successfully")
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

  const handleComplete = (val: string) => {
    verifyOtp(val)
  };

  const verifyOtp = (val: string) => {
    if(ownerType && mobileNumber && val.length == 4){
    const payload = {
          phone: mobileNumber || '',
          otp: val,
          role: ownerType as UserType
        }
        setOtpError('')
    handleVerifyOtp(payload)
    }
  }

  const handleOtpResend = () => {
    if(isPending){
      return
    }
    if(isEnableOtopResend){
      setOtpTimer(OTP_RESEND_TIME)
      setIsEnableOtpResend(false)
      if(mobileNumber){
        const payload = {
          phone: mobileNumber || '',
          // role: ownerType
        }
        handleResendOtp(payload)
      }
    }
  }

  const handleChangeNumber = () => {
    const params = createURLSearchParam({
      mobile: mobileNumber,
      code: code,
      ownerType: ownerType,
      ...(ownerType == USER_TYPE.OWNER ? {propertyIntent: propertyIntent,} : '')
    })
    router.push(`/user-flow?postProperty=true&${params.replace('?', '')}`)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (otpTimer > 0) {
      setIsEnableOtpResend(false);
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setIsEnableOtpResend(true);
    }

    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    validateAndRedirect(searchParams)
  },[])

  return (
    <div
      className="bg-white relative w-full md:min-w-96 h-auto rounded-b-xl rounded-tr-xl mt-0 md:mt-20"
      style={{ boxShadow: "0px 4px 20px 0px #0000000D", flexGrow: "11" }}
    >
      <div className="absolute rounded-full w-[90%] -top-[32px] rounded-[100px] bg-white h-[60px]"></div>
      <div className="pt-4 px-5">
        <div className="relative flex flex-wrap w-[90%] -top-[32px] text-sm gap-4 bg-white p-2 rounded-full">
          <p className="text-text-black font-semibold text-base lg:text-lg 1xl:text-xl">
            Verify Your Mobile Number
          </p>
        </div>
        <div className="relative -top-[32px] p-2 flex flex-col gap-6 md:gap-10 w-full">
          <div>
            <p className="text-sm 1xl:text-base text-text-gray">
              We've sent a 4-digit OTP to your mobile number{" "}
              <span className="text-blue">{code + '-' + mobileNumber}</span>
            </p>
            <p className="text-sm 1xl:text-base text-text-gray">
              Not your number?{" "}
              <span onClick={handleChangeNumber} className="text-blue italic underline cursor-pointer">Change</span>
            </p>
          </div>
          <div>
            <p className="text-sm lg:text-base 2xl:text-lg text-text-black font-medium pb-3">
              Enter the OTP below to continue
            </p>
            <OtpInput
              length={4}
              value={otp}
              onChange={handleChange}
              onComplete={handleComplete}
              validateChar={matchIsNumeric}
            />
            {otpError && <p className="text-red-500 text-xs pt-2">{otpError}</p>}
          </div>
          <div className="flex flex-col justify-center gap-4 items-start">
              <button disabled={isPending} onClick={() => verifyOtp(otp)} className={`animated-button px-12 py-3 border border-blue text-center text-sm 1xl:text-base cursor-pointer`}>
                <span className="gap-3 relative">
                   {!isPending ? (
                    <p className={`text-nowrap`}>Verify OTP</p>
                  ) : (
                    <Spinner size={20} className="h-[24px]"/>
                  )}
                </span>
              </button>
              <p className="text-sm lg:text-base 2xl:text-lg text-text-gray">
                Didn't get the code?
                <span onClick={handleOtpResend} className={`text-sm lg:text-sm 2xl:text-lg cursor-pointer ml-1 ${otpTimer > 0 ? 'text-text-gray' : 'text-text-black'}`}>
                Resend OTP <span className="text-text-black ">{otpTimer > 0 ? 'in 0:' + `${otpTimer < 10 ? '0' + otpTimer : otpTimer}` : ''}</span>
                </span>
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
