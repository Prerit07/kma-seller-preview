"use client";

import * as React from "react";
import Image from "next/image";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { InputBase } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import MobileInput from "@/components/common/mobileInput";
import OtpInput from "@/components/common/optInput";
import Spinner from "@/components/common/spinner";
import { matchIsNumeric, mobileNumberValidator } from "@/lib/commonValidator";
import { OTP_RESEND_TIME } from "@/lib/enums";
import { useSessionStore } from "@/store/useSessionStore";
import {
  sendEndUserPropertyContactOtpAction,
  submitEndUserPropertyContactAction,
} from "@/api/actions/propertyActions";
import type { Project } from "../_types";

interface ProjectCallBackModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
}

type ModalStep = "form" | "otp";

const INITIAL_FORM = {
  name: "",
  email: "",
  mobile: "",
  countryCode: "+91",
};

export default function ProjectCallBackModal({
  open,
  onClose,
  project,
}: ProjectCallBackModalProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const persistedSessionId = useSessionStore((state) => state.sessionId);

  const [step, setStep] = React.useState<ModalStep>("form");
  const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);
  const [isAuthChecking, setIsAuthChecking] = React.useState(false);
  const [formData, setFormData] = React.useState(INITIAL_FORM);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [otp, setOtp] = React.useState("");
  const [otpError, setOtpError] = React.useState("");
  const [otpTimer, setOtpTimer] = React.useState(OTP_RESEND_TIME);
  const [isEnableOtpResend, setIsEnableOtpResend] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  const resetState = React.useCallback(() => {
    setStep("form");
    setFormData(INITIAL_FORM);
    setErrors({});
    setOtp("");
    setOtpError("");
    setOtpTimer(OTP_RESEND_TIME);
    setIsEnableOtpResend(false);
    setSessionId(null);
    setIsUserLoggedIn(false);
  }, []);

  const closeModal = React.useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    let nextName = "";
    let nextEmail = "";
    let nextPhone = "";
    let isMounted = true;

    if (typeof window !== "undefined") {
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const userData = JSON.parse(rawUser) as {
            name?: string;
            email?: string;
            phone?: string;
          };
          nextName = userData?.name ?? "";
          nextEmail = userData?.email ?? "";
          nextPhone = userData?.phone ?? "";
        }
      } catch (_error) {}
    }

    setFormData({
      name: nextName,
      email: nextEmail,
      mobile: nextPhone,
      countryCode: "+91",
    });

    setIsAuthChecking(true);
    fetch("/api/get-token")
      .then((res) => res.json())
      .then((data: { accessToken?: string | null }) => {
        if (!isMounted) {
          return;
        }
        setIsUserLoggedIn(Boolean(data?.accessToken));
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        setIsUserLoggedIn(false);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }
        setIsAuthChecking(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open || step !== "otp") {
      return;
    }

    if (otpTimer > 0) {
      const interval = window.setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);

      return () => window.clearInterval(interval);
    }

    setIsEnableOtpResend(true);
  }, [open, otpTimer, step]);

  const { mutate: sendOtp, isPending: isOtpSending } = useMutation({
    mutationFn: async (phone: string) =>
      sendEndUserPropertyContactOtpAction({
        propertyId: project.id,
        phone,
      }),
    onSuccess: (response) => {
      if (response?.sessionId) {
        setSessionId(response.sessionId);
      }

      setStep("otp");
      setOtp("");
      setOtpError("");
      setOtpTimer(OTP_RESEND_TIME);
      setIsEnableOtpResend(false);
      toast.success(response?.message ?? "OTP sent successfully");
    },
    onError: (error: any) => {
      const message = error?.message ?? "Unable to send OTP";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    },
  });

  const { mutate: submitContact, isPending: isSubmitting } = useMutation({
    mutationFn: submitEndUserPropertyContactAction,
    onSuccess: (response) => {
      toast.success(response?.message ?? "Request submitted successfully");
      closeModal();
    },
    onError: (error: any) => {
      const message = error?.message ?? "Unable to submit request";
      if (step === "otp") {
        setOtpError(Array.isArray(message) ? message.join(", ") : message);
      } else {
        toast.error(Array.isArray(message) ? message.join(", ") : message);
      }
    },
  });

  const validateForm = React.useCallback(() => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Full name is required";
    }

    if (
      formData.email.trim() &&
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)
    ) {
      nextErrors.email = "Invalid email format";
    }

    const mobileError = mobileNumberValidator(formData.mobile);
    if (mobileError) {
      nextErrors.mobile = mobileError;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData.email, formData.mobile, formData.name]);

  const handleChange = (field: "name" | "email", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleMobileChange = (value: string, code: string) => {
    setFormData((prev) => ({
      ...prev,
      mobile: value,
      countryCode: code,
    }));
    setErrors((prev) => ({ ...prev, mobile: "" }));
  };

  const handleContinue = () => {
    if (isAuthChecking) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (isUserLoggedIn) {
      submitContact({
        propertyId: project.id,
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.mobile,
        countryCode: formData.countryCode,
        sessionId: sessionId ?? persistedSessionId ?? undefined,
      });
      return;
    }

    sendOtp(formData.mobile);
  };

  const handleVerifyAndContinue = (otpValue: string) => {
    if (otpValue.length !== 4) {
      setOtpError("Enter a valid 4 digit OTP");
      return;
    }

    setOtpError("");
    submitContact({
      propertyId: project.id,
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.mobile,
      countryCode: formData.countryCode,
      otp: otpValue,
      sessionId: sessionId ?? persistedSessionId ?? undefined,
    });
  };

  const handleOtpResend = () => {
    if (!isEnableOtpResend || isOtpSending) {
      return;
    }

    sendOtp(formData.mobile);
  };

  const handleChangeNumber = () => {
    setStep("form");
    setOtp("");
    setOtpError("");
    setOtpTimer(OTP_RESEND_TIME);
    setIsEnableOtpResend(false);
    setSessionId(null);
  };

  const handleClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return;
    }
    closeModal();
  };

  const formattedTimer =
    otpTimer > 0 ? `in ${otpTimer < 10 ? `0${otpTimer}` : otpTimer}s` : "";

  const isPrimaryLoading = isSubmitting || isOtpSending || isAuthChecking;

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: fullScreen ? "" : "0.75rem",
          },
        },
      }}
    >
      <DialogContent sx={{ padding: 0 }}>
        {step === "form" ? (
          <div className="w-full rounded-xl bg-[#EFEFEF] p-4 sm:w-[520px]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-[28px] font-semibold text-[#1E2236]">
                Contact Our Channel Partners
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-1 text-[#1E2236] transition hover:bg-black/5"
                aria-label="Close"
              >
                <Image
                  src="/assets/close-icon.svg"
                  alt="Close"
                  width={22}
                  height={22}
                />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-lg bg-[#E3E3E3] px-3 py-2">
              <Image
                src={project.agent?.avatarUrl ?? "/assets/app/call-person.svg"}
                alt={project.agent?.name ?? "KMA Expert"}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-text-black">
                  {project.agent?.name ?? "KMA Expert"}
                </p>
                {project.agent?.badge ? (
                  <span className="mt-1 inline-flex rounded-md bg-[#D08A2F] px-2 py-0.5 text-[11px] font-semibold text-white">
                    {project.agent.badge}
                  </span>
                ) : null}
              </div>
            </div>

            <p className="mb-4 text-sm text-[#7A7A7A]">
              Fill the form below to get the channel partner contact details.
            </p>

            <div className="space-y-4">
              <div>
                <p className="required-label pb-2 text-sm text-text-black">
                  Full Name
                </p>
                <InputBase
                  fullWidth
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className={`box-border h-[44px] rounded-full border px-4 py-2 text-sm ${
                    errors.name
                      ? "border-red-500 focus-within:border-red-500"
                      : "border-border focus-within:border-blue"
                  }`}
                  inputProps={{ className: "placeholder-gray" }}
                />
                {errors.name ? (
                  <p className="pt-1 text-xs text-red-500">{errors.name}</p>
                ) : null}
              </div>

              <div>
                <p className="required-label pb-2 text-sm text-text-black">
                  Email Address
                </p>
                <InputBase
                  fullWidth
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter your email"
                  className={`box-border h-[44px] rounded-full border px-4 py-2 text-sm ${
                    errors.email
                      ? "border-red-500 focus-within:border-red-500"
                      : "border-border focus-within:border-blue"
                  }`}
                  inputProps={{ className: "placeholder-gray" }}
                />
                {errors.email ? (
                  <p className="pt-1 text-xs text-red-500">{errors.email}</p>
                ) : null}
              </div>

              <div>
                <p className="pb-2 text-sm text-text-black">Mobile Number</p>
                <MobileInput
                  placeHolder="Enter your mobile number"
                  required={true}
                  validationMessage={errors.mobile}
                  value={formData.mobile}
                  countryCode={formData.countryCode}
                  onChange={handleMobileChange}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={isPrimaryLoading}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#0A0A63] px-6 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPrimaryLoading ? <Spinner size={18} /> : "Continue"}
            </button>
          </div>
        ) : (
          <div className="w-full rounded-xl bg-[#EFEFEF] p-4 sm:w-[520px]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-[28px] font-semibold text-[#1E2236]">
                Verify Mobile Number
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-1 text-[#1E2236] transition hover:bg-black/5"
                aria-label="Close"
              >
                <Image
                  src="/assets/close-icon.svg"
                  alt="Close"
                  width={22}
                  height={22}
                />
              </button>
            </div>

            <div className="rounded-lg bg-[#E3E3E3] p-4">
              <p className="mb-4 text-sm text-[#7A7A7A]">
                Enter the code we&apos;ve sent on your provided mobile number
              </p>

              <OtpInput
                length={4}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  setOtpError("");
                }}
                onComplete={handleVerifyAndContinue}
                validateChar={matchIsNumeric}
              />

              {otpError ? (
                <p className="pt-2 text-xs text-red-500">{otpError}</p>
              ) : null}

              <p className="pb-5 pt-4 text-sm text-[#7A7A7A]">
                Didn&apos;t get it?{" "}
                <button
                  type="button"
                  onClick={handleOtpResend}
                  className={`font-semibold ${
                    otpTimer > 0 ? "cursor-default text-[#7A7A7A]" : "text-blue"
                  }`}
                >
                  Resend {formattedTimer}
                </button>{" "}
                or{" "}
                <button
                  type="button"
                  onClick={handleChangeNumber}
                  className="font-semibold text-blue underline"
                >
                  Change Number
                </button>
              </p>

              <button
                type="button"
                onClick={() => handleVerifyAndContinue(otp)}
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#0A0A63] px-6 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <Spinner size={18} /> : "Verify & Continue"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
