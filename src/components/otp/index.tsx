'use client';

import * as React from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import OtpInput from "../common/optInput";

import {
  resendOtpApiHandler,
  validateOtpApiHandler,
  OtpPayload,
  SendOtpResponse,
  ValidateOtpPayload,
  ValidateOtpResponse
} from "@/services/authService";

import { OTP_RESEND_TIME } from "@/lib/enums";
import { matchIsNumeric } from "@/lib/commonValidator";
import { createURLSearchParam, setAuthCookies } from "@/lib/helper";
import { toast } from "react-toastify";
import Spinner from "../common/spinner";

export default function Otp() {
  // Router & Params
  const queryClient = useQueryClient()
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const isOtp = searchParams.get("isOtp");
  const mobileNumber = searchParams.get("mobile");
  const code = searchParams.get("code");

  // States
  const [otp, setOtp] = React.useState<string>("");
  const [otpError, setOtpError] = React.useState<string>("");
  const [otpTimer, setOtpTimer] = React.useState(OTP_RESEND_TIME);
  const [isEnableOtpResend, setIsEnableOtpResend] = React.useState(false);

  // Derived State
  const openPopup = React.useMemo(() => isOtp === "true", [isOtp]);

  // Dialog Close Handler
  const handleClose: DialogProps["onClose"] = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    setOtp('')
    router.push(pathname);
  };

  // Resend OTP
  const { mutate: resendOtp, isPending: isResending } = useMutation({
    mutationFn: (payload: OtpPayload): Promise<SendOtpResponse> =>
      resendOtpApiHandler(payload),
    onSuccess: (res) => {
      toast.success(res.message ?? "OTP sent successfully")
    },
    onError: (err: any) => {
      console.error("Resend OTP Error:", err);
      setOtpError(err?.message || "Something went wrong");
    },
  });

  const handleOtpResend = () => {
    if (!isEnableOtpResend || isResending) return;

    if (mobileNumber) {
      resendOtp({ phone: mobileNumber});
      setOtpTimer(OTP_RESEND_TIME);
      setIsEnableOtpResend(false);
    }
  };

  // OTP Verify
  const { mutate: handleVerifyOtp, isPending: isVerifying } = useMutation({
    mutationFn: (payload: ValidateOtpPayload): Promise<ValidateOtpResponse> =>
      validateOtpApiHandler(payload),
    onSuccess: async (res) => {
      await setAuthCookies(res.accessToken, res.refreshToken)
      localStorage.setItem("user", JSON.stringify(res.user));
      setOtp('')
      toast.success(res.message)
      queryClient.clear();
      // Force profile completion before letting Owner/CP into the dashboard.
      // Otherwise users land on dashboard with empty name and the greeting
      // shows "Hi, (Owner)" with a blank.
      if (res.requiredOtherDetails) {
        router.replace('/create-account')
        return
      }
      router.replace('/user-dashboard')
    },
    onError: (err: any) => {
      console.error("OTP Verify Error:", err);
      setOtpError(err?.message || "Invalid OTP");
    },
  });

  const handleChange = (val: string) => {
    setOtp(val);
    setOtpError("");
  };

  const handleComplete = (val: string) => {
    verifyOtp(val);
  };

  
const verifyOtp = (val: string) => {
  if(mobileNumber && val.length == 4){
    const payload = {
      phone: mobileNumber || '',
      otp: val,
      // role: ownerType as UserType
    }
    setOtpError("");
    handleVerifyOtp(payload);
  }else{
    setOtpError('Enter otp')
  }
}
  const handleChangeNumber = () => {
    const params = createURLSearchParam({
      mobile: mobileNumber,
      code,
      isLogin: true,
    });
    setOtp('')
    router.push(`${pathname}${params}`);
  };

  React.useEffect(() => {
    if(!openPopup){
      return
    }
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }

    setIsEnableOtpResend(true);
  }, [otpTimer, openPopup]);

  const formattedTimer = otpTimer > 0
    ? `in 0:${otpTimer < 10 ? "0" + otpTimer : otpTimer}`
    : "";

  return (
    <Dialog
      fullScreen={fullScreen}
      open={openPopup}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
      slotProps={{
        paper: {
          sx: { borderRadius: fullScreen ? '' : "1rem", },
        },
      }}
    >
      <DialogContent>
        <div className="flex flex-col w-full sm:w-[400px] p-2">
          <div className="flex justify-end w-full">
            <Image
              onClick={() => {
                setOtp('')
                router.push(pathname)}}
              src="/assets/close-icon.svg"
              alt="close"
              width={24}
              height={24}
              className="cursor-pointer"
            />
          </div>

          <p className="text-text-black font-semibold text-xl pb-1">
            Verify Your Mobile Number
          </p>

          <p className="text-sm text-text-gray pb-6">
            We've sent a 4-digit OTP to{" "}
            <span className="text-blue font-medium">
              {code} {mobileNumber}
            </span>
            .
          </p>

          <p className="text-sm text-text-gray pb-6">
            Enter it below to access your property dashboard, post listings,
            and connect with verified owners.
          </p>

          <OtpInput
            length={4}
            value={otp}
            onChange={handleChange}
            onComplete={handleComplete}
            validateChar={matchIsNumeric}
          />

          {otpError && (
            <p className="text-red-500 text-xs pt-2">{otpError}</p>
          )}

          <p className="text-sm text-text-gray pb-6 pt-6">
            Didn't get the code?{" "}
            <span
              onClick={handleOtpResend}
              className={`cursor-pointer font-medium ${
                otpTimer > 0 ? "text-text-gray" : "text-blue"
              }`}
            >
              Resend OTP <span className="text-text-black cursor-text">{formattedTimer}</span>
            </span>{" "}
            or{" "}
            <span
              onClick={handleChangeNumber}
              className="underline text-blue cursor-pointer"
            >
              Change Number
            </span>
          </p>

          <div className="flex justify-start flex-col md:flex-row gap-4 items-center">
            <button
              disabled={isVerifying}
              onClick={() => verifyOtp(otp)}
              className="w-full md:w-auto animated-button px-12 py-3 border border-blue text-center cursor-pointer"
            >
              <span className="gap-3 relative">
                {!(isVerifying) ? (
                    <p className={`text-nowrap`}>Continue</p>
                  ) : (
                    <Spinner size={20} className="h-[24px]"/>
                  )}
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
