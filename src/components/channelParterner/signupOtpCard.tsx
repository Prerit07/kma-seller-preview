"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

import OtpInput from "../common/optInput";
import Spinner from "../common/spinner";
import { OTP_RESEND_TIME, USER_TYPE } from "@/lib/enums";
import { matchIsNumeric } from "@/lib/commonValidator";
import { createURLSearchParam, setAuthCookies } from "@/lib/helper";
import {
  OtpPayload,
  resendOtpApiHandler,
  SendOtpResponse,
  validateOtpApiHandler,
  ValidateOtpPayload,
  ValidateOtpResponse,
} from "@/services/authService";
import { UserType } from "@/types/user";
import { resetForm } from "@/store/createAccountSlice";

export default function SignupOtpCard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const mobileNumber = searchParams.get("mobile");
  const code = searchParams.get("code");
  const ownerType = searchParams.get("ownerType");
  const propertyIntent = searchParams.get("propertyIntent");

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(OTP_RESEND_TIME);
  const [isEnableOtpResend, setIsEnableOtpResend] = useState(false);

  const { mutate: handleVerifyOtp, isPending } = useMutation({
    mutationFn: async (payload: ValidateOtpPayload): Promise<ValidateOtpResponse> => {
      return await validateOtpApiHandler(payload);
    },
    onSuccess: async (response: ValidateOtpResponse) => {
      await setAuthCookies(response.accessToken, response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));
      const params = createURLSearchParam({
        ...(ownerType == USER_TYPE.OWNER ? { propertyIntent: propertyIntent } : ""),
      });
      dispatch(resetForm());
      setTimeout(() => {
        router.replace(`/create-account${params}`);
      }, 300);
    },
    onError: (error: any) => {
      setOtpError(error?.message);
    },
  });

  const { mutate: handleResendOtp } = useMutation({
    mutationFn: async (payload: OtpPayload): Promise<SendOtpResponse> => {
      return await resendOtpApiHandler(payload);
    },
    onSuccess: (response: SendOtpResponse) => {
      toast.success(response.message ?? "OTP sent successfully");
    },
    onError: (error: any) => {
      if (Array.isArray(error.message)) {
        error.message.forEach((item: string) => toast.error(item));
      } else {
        toast.error(error.message);
      }
    },
  });

  const verifyOtp = (value: string) => {
    if (ownerType && mobileNumber && value.length == 4) {
      const payload: ValidateOtpPayload = {
        phone: mobileNumber,
        otp: value,
        role: ownerType as UserType,
      };
      setOtpError("");
      handleVerifyOtp(payload);
    }
  };

  const handleOtpResend = () => {
    if (isPending || !isEnableOtpResend) {
      return;
    }
    setOtpTimer(OTP_RESEND_TIME);
    setIsEnableOtpResend(false);
    if (mobileNumber) {
      handleResendOtp({ phone: mobileNumber });
    }
  };

  const handleChangeNumber = () => {
    const params = createURLSearchParam({
      mobile: mobileNumber,
      code,
      ownerType,
      ...(ownerType == USER_TYPE.OWNER ? { propertyIntent } : ""),
      postProperty: true,
    });
    router.replace(`/user-flow${params}`);
  };

  useEffect(() => {
    if (!mobileNumber || !ownerType) {
      router.replace("/user-flow");
      return;
    }
  }, [mobileNumber, ownerType, router]);

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

  return (
    <div
      className="bg-white w-full md:min-w-[420px] h-auto rounded-[16px] p-6 md:p-8"
      style={{ boxShadow: "0px 4px 20px 0px #0000000D", flexGrow: "11" }}
    >
      <p className="text-text-black font-semibold text-3xl leading-[2.3rem] mb-2">Verify Your Mobile Number</p>
      <p className="text-sm md:text-base text-text-gray">
        We've sent a 4-digit OTP to your number <span className="text-blue">+91-XXXXXXXXXX</span>. Verify to access your all the features.
      </p>
      <p className="text-sm md:text-base text-text-gray mb-6">
        Not your number?{" "}
        <span onClick={handleChangeNumber} className="text-blue italic underline cursor-pointer">
          Change
        </span>
      </p>

      <div className="flex flex-col gap-6 w-full">
        <div>
          <p className="text-sm lg:text-base text-text-black font-medium pb-3">Enter the OTP below to continue</p>
          <OtpInput
            length={4}
            value={otp}
            onChange={(val) => {
              setOtp(val);
              setOtpError("");
            }}
            onComplete={verifyOtp}
            validateChar={matchIsNumeric}
          />
          {otpError && <p className="text-red-500 text-xs pt-2">{otpError}</p>}
        </div>
        <div className="flex flex-col justify-center gap-4 items-start">
          <button
            disabled={isPending}
            onClick={() => verifyOtp(otp)}
            className="animated-button px-12 py-3 border border-blue text-center text-sm cursor-pointer"
          >
            <span className="gap-3 relative">
              {!isPending ? <p className="text-nowrap">Verify OTP</p> : <Spinner size={20} className="h-[24px]" />}
            </span>
          </button>
          <p className="text-sm lg:text-base text-text-gray">
            Didn&apos;t get the code?
            <span onClick={handleOtpResend} className={`text-sm cursor-pointer ml-1 ${otpTimer > 0 ? "text-text-gray" : "text-text-black"}`}>
              Resend OTP <span className="text-text-black">{otpTimer > 0 ? `in 0:${otpTimer < 10 ? `0${otpTimer}` : otpTimer}` : ""}</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
