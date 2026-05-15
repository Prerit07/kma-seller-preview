"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "react-toastify";

import OtpInput from "../common/optInput";
import Spinner from "../common/spinner";
import { OTP_RESEND_TIME } from "@/lib/enums";
import { createURLSearchParam, setAuthCookies } from "@/lib/helper";
import { matchIsNumeric } from "@/lib/commonValidator";
import {
  EndUserVerifyOtpPayload,
  verifyEndUserSignupOtpApiHandler,
  ValidateOtpResponse,
  sendEndUserSignupOtpApiHandler,
  EndUserSignupPayload,
  EndUserSignupResponse,
} from "@/services/authService";

export default function EndUserSignupOtpCard() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const mobileNumber = searchParams.get("mobile");
  const code = searchParams.get("code");
  const fullName = searchParams.get("fullName");
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(OTP_RESEND_TIME);
  const [isEnableOtpResend, setIsEnableOtpResend] = useState(false);

  const { mutate: resendOtp } = useMutation({
    mutationFn: (payload: EndUserSignupPayload): Promise<EndUserSignupResponse> =>
      sendEndUserSignupOtpApiHandler(payload),
    onSuccess: (response) => {
      toast.success(response.message ?? "OTP sent successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Unable to resend OTP");
    },
  });

  const { mutate: verifyOtp, isPending } = useMutation({
    mutationFn: (payload: EndUserVerifyOtpPayload): Promise<ValidateOtpResponse> =>
      verifyEndUserSignupOtpApiHandler(payload),
    onSuccess: async (response) => {
      await setAuthCookies(response.accessToken, response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));
      toast.success(response.message);
      queryClient.clear();
      window.location.href = `/api/redirect-to-buyer?path=/projects`;
    },
    onError: (error: any) => {
      setOtpError(error?.message ?? "Invalid OTP");
    },
  });

  const handleOtpResend = () => {
    if (!isEnableOtpResend || !mobileNumber || !fullName || !email || isPending) return;
    resendOtp({ name: fullName, email, phone: mobileNumber });
    setOtpTimer(OTP_RESEND_TIME);
    setIsEnableOtpResend(false);
  };

  const handleChangeNumber = () => {
    const params = createURLSearchParam({ mobile: mobileNumber, code });
    router.replace(`/user-flow${params}`);
  };

  const handleVerifyOtp = (value: string) => {
    if (!mobileNumber || !fullName || !email || value.length !== 4) {
      setOtpError("Enter OTP");
      return;
    }
    setOtpError("");
    verifyOtp({ name: fullName, email, phone: mobileNumber, otp: value });
  };

  useEffect(() => {
    if (!mobileNumber || !fullName || !email) {
      router.replace("/user-flow");
      return;
    }
  }, [mobileNumber, fullName, email, router]);

  useEffect(() => {
    if (otpTimer <= 0) {
      setIsEnableOtpResend(true);
      return;
    }
    const interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const formattedTimer = useMemo(() => {
    return otpTimer > 0 ? `0:${otpTimer < 10 ? `0${otpTimer}` : otpTimer}` : "";
  }, [otpTimer]);

  return (
    <div
      className="bg-white w-full md:min-w-[420px] h-auto rounded-[16px] p-6 md:p-8"
      style={{ boxShadow: "0px 4px 20px 0px #0000000D", flexGrow: 11 }}
    >
      <p className="text-text-black font-semibold text-3xl leading-[2.3rem] mb-2">Verify Your Mobile Number</p>
      <p className="text-sm md:text-base text-text-gray">
        We&apos;ve sent a 4-digit OTP to your mobile number{" "}
        <span className="text-blue font-medium">
          {code}
          {mobileNumber ? `-${mobileNumber}` : ""}
        </span>
      </p>
      <p className="text-sm md:text-base text-text-gray mb-6">
        Not your number?{" "}
        <span onClick={handleChangeNumber} className="text-blue italic underline cursor-pointer">
          Change
        </span>
      </p>

      <p className="text-sm lg:text-base text-text-black font-medium pb-3">Enter the OTP below to continue</p>
      <OtpInput
        length={4}
        value={otp}
        onChange={(value) => {
          setOtp(value);
          setOtpError("");
        }}
        onComplete={handleVerifyOtp}
        validateChar={matchIsNumeric}
      />
      {otpError && <p className="text-red-500 text-xs pt-2">{otpError}</p>}

      <div className="flex flex-col justify-center gap-4 items-start mt-8">
        <button
          disabled={isPending}
          onClick={() => handleVerifyOtp(otp)}
          className="animated-button px-12 py-3 border border-blue text-center text-sm cursor-pointer"
        >
          <span className="gap-3 relative">
            {!isPending ? <p className="text-nowrap">Verify OTP</p> : <Spinner size={20} className="h-[24px]" />}
          </span>
        </button>
        <p className="text-sm lg:text-base text-text-gray">
          Didn&apos;t get the code?
          <span onClick={handleOtpResend} className={`text-sm cursor-pointer ml-1 ${otpTimer > 0 ? "text-text-gray" : "text-text-black"}`}>
            Resend OTP <span className="text-text-black">{otpTimer > 0 ? `in ${formattedTimer}` : ""}</span>
          </span>
        </p>
      </div>
    </div>
  );
}
