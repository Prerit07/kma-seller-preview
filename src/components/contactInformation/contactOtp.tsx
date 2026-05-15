'use client';

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useMutation } from "@tanstack/react-query";

import OtpInput from "../common/optInput";

import { OTP_RESEND_TIME } from "@/lib/enums";
import { matchIsNumeric } from "@/lib/commonValidator";
import { toast } from "react-toastify";
import Spinner from "../common/spinner";
import { contactUsHomeOtpApiHandler, ContactUsHomeOtpPayload, ContactUsHOmeOtpResponse, submitHomeContactApiHandler, SubmitHomeContactPayload, SubmitHomeContactResponse } from "@/services/contactService";

export default function ContactOtp({open,mobileNumber, onClose, name, email}) {
  // Router & Params
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // States
  const [otp, setOtp] = React.useState<string>("");
  const [otpError, setOtpError] = React.useState<string>("");
  const [otpTimer, setOtpTimer] = React.useState(OTP_RESEND_TIME);
  const [isEnableOtpResend, setIsEnableOtpResend] = React.useState(false);

  // Derived State

  // Dialog Close Handler
  const handleClose: DialogProps["onClose"] = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    setOtp('')
    onClose()
  };

  // Resend OTP
  const { mutate: resendOtp, isPending: isResending } = useMutation({
    mutationFn: (payload: ContactUsHomeOtpPayload): Promise<ContactUsHOmeOtpResponse> =>
      contactUsHomeOtpApiHandler(payload),
    onSuccess: async (res) => {
      toast.success(res.message ?? "OTP sent successfully")
    },
    onError: (err: any) => {
      console.error("OTP Verify Error:", err);
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
  const {
    mutate: submitEndUserContactDetails,
    isPending: enduserLoader,
  } = useMutation({
    mutationFn: async (payload: SubmitHomeContactPayload): Promise<SubmitHomeContactResponse> => {
      return await submitHomeContactApiHandler(payload);
    },
    onSuccess: (response: SubmitHomeContactResponse) => {
      toast.success(response.message)
      setOtp('')
      onClose()
    },
    onError: (error: any) => {
      if(Array.isArray(error.message)){
        error.message.map((item: string) => {
          toast.success(item)
        })
      }else{
        toast.success(error.message)
      }
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
    const formData = {
      name: name,
      email: email,
      phone: mobileNumber,
      otp: val
    }
    setOtpError("");
    submitEndUserContactDetails(formData);
  }else{
    setOtpError('Enter otp')
  }
}

  React.useEffect(() => {
    if(!open){
      return
    }
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }

    setIsEnableOtpResend(true);
  }, [otpTimer, open]);

  const formattedTimer = otpTimer > 0
    ? `in 0:${otpTimer < 10 ? "0" + otpTimer : otpTimer}`
    : "";
  
  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
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
             {mobileNumber}
            </span>
            .
          </p>

          <p className="text-sm text-text-gray pb-6">
            Enter it below to submit your query.
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
          </p>

          <div className="flex justify-start flex-col md:flex-row gap-4 items-center">
            <button
              disabled={enduserLoader}
              onClick={() => verifyOtp(otp)}
              className="w-full md:w-auto animated-button px-12 py-3 border border-blue text-center cursor-pointer"
            >
              <span className="gap-3 relative">
                {!(enduserLoader) ? (
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
