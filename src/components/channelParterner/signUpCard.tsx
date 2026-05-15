"use client";

import { InputBase } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import MobileInput from "../common/mobileInput";
import Spinner from "../common/spinner";
import { mobileNumberValidator } from "@/lib/commonValidator";
import { createURLSearchParam } from "@/lib/helper";
import {
  EndUserSignupPayload,
  EndUserSignupResponse,
  sendEndUserSignupOtpApiHandler,
} from "@/services/authService";

interface MobileState {
  value: string;
  validationMessage: string;
  code: string;
}

interface FormState {
  fullName: string;
  email: string;
}

export default function SignUpCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const mobileNumber = searchParams.get("mobile");

  const [mobileInput, setMobileInput] = useState<MobileState>({
    value: "",
    validationMessage: "",
    code: "+91",
  });
  const [formState, setFormState] = useState<FormState>({
    fullName: "",
    email: "",
  });
  const [formError, setFormError] = useState<{ fullName?: string; email?: string }>({});

  const handleMobileInputChange = (value: string, code: string) => {
    const msg = mobileInput.validationMessage ? mobileNumberValidator(value) : "";
    setMobileInput({ value, code, validationMessage: msg });
  };

  const { mutate: handleSendOtp, isPending } = useMutation({
    mutationFn: async (payload: EndUserSignupPayload): Promise<EndUserSignupResponse> => {
      return await sendEndUserSignupOtpApiHandler(payload);
    },
    onSuccess: (response: EndUserSignupResponse) => {
      const params = createURLSearchParam({
        mobile: mobileInput.value,
        code: mobileInput.code,
        fullName: formState.fullName,
        email: formState.email,
        isOtp: true,
        flow: "enduser-signup",
      });
      toast.success(response.message ?? "OTP sent successfully");
      router.replace(`${pathname}${params}`);
    },
    onError: (error: any) => {
      if (Array.isArray(error.message)) {
        error.message.forEach((item: string) => toast.error(item));
      } else {
        toast.error(error.message);
      }
    },
  });

  const validateSignupForm = () => {
    const errors: { fullName?: string; email?: string } = {};
    if (!formState.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    // Email is optional. Only validate format if the user typed something.
    if (formState.email.trim() && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formState.email)) {
      errors.email = "Invalid email format";
    }
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = () => {
    if (!validateSignupForm()) {
      return;
    }
    const msg = mobileNumberValidator(mobileInput.value);
    if (msg) {
      setMobileInput({ ...mobileInput, validationMessage: msg });
      return;
    }
    handleSendOtp({
      name: formState.fullName.trim(),
      ...(formState.email.trim() ? { email: formState.email.trim() } : {}),
      phone: mobileInput.value,
    });
  };

  const handleRedirectToLogin = () => {
    const params = createURLSearchParam({ isLogin: true });
    router.replace(`${pathname}${params}`);
  };

  const handleRedirectToPostProperty = () => {
    const params = createURLSearchParam({ postProperty: true });
    router.replace(`${pathname}${params}`);
  };

  useEffect(() => {
    if (mobileNumber) {
      setMobileInput((prev) => ({ ...prev, value: mobileNumber, code: "+91" }));
    }
  }, [mobileNumber]);

  return (
    <div
      className="bg-white w-full md:min-w-[420px] h-auto rounded-[16px] p-6 md:p-8"
      style={{ boxShadow: "0px 4px 20px 0px #0000000D", flexGrow: 11 }}
    >
      <p className="text-text-black font-semibold text-[2rem] leading-[2.3rem] mb-2">
        Buy or Rent Property - <span className="text-accent">Absolutely FREE!</span>
      </p>
      <p className="text-sm md:text-base text-text-gray pb-4 border-b border-border">
        Find your next home without paying any service charges. Connect directly with property owners and get
        the best deals instantly.
      </p>

      <p className="required-label text-sm md:text-base text-text-black font-medium mt-6 mb-2">Full Name</p>
      <InputBase
        placeholder="Enter your full name"
        fullWidth
        value={formState.fullName}
        onChange={(event) => {
          const value = event.target.value;
          setFormState((prev) => ({ ...prev, fullName: value }));
          setFormError((prev) => ({ ...prev, fullName: "" }));
        }}
        className="box-border h-[47.81px] px-4 py-2 text-sm rounded-full border border-border focus:outline-none focus:border-blue text-text-gray"
        inputProps={{ className: "placeholder-gray" }}
      />
      {formError.fullName && <p className="text-red-500 text-xs mt-1 ml-2">{formError.fullName}</p>}

      <p className="text-sm md:text-base text-text-black font-medium mt-4 mb-2">Email Address <span className="text-text-gray text-xs">(optional)</span></p>
      <InputBase
        placeholder="Enter your email"
        fullWidth
        value={formState.email}
        onChange={(event) => {
          const value = event.target.value;
          setFormState((prev) => ({ ...prev, email: value }));
          setFormError((prev) => ({ ...prev, email: "" }));
        }}
        className="box-border h-[47.81px] px-4 py-2 text-sm rounded-full border border-border focus:outline-none focus:border-blue text-text-gray"
        inputProps={{ className: "placeholder-gray" }}
      />
      {formError.email && <p className="text-red-500 text-xs mt-1 ml-2">{formError.email}</p>}

      <p className="required-label text-sm md:text-base text-text-black font-medium mt-4 mb-2">Mobile Number</p>
      <MobileInput
        placeHolder="Enter your mobile number"
        required={true}
        validationMessage={mobileInput.validationMessage}
        value={mobileInput.value}
        countryCode={mobileInput.code}
        onChange={handleMobileInputChange}
      />

      <div className="flex justify-start flex-col md:flex-row gap-4 items-center mt-8">
        <button
          disabled={isPending}
          onClick={handleContinue}
          className="w-full md:w-[170px] text-sm animated-button px-12 py-3 border border-blue text-center cursor-pointer"
        >
          <span className="gap-3 relative flex justify-center">
            {!isPending ? <p className="text-nowrap">Create Account</p> : <Spinner size={20} className="h-[24px]" />}
          </span>
        </button>
        <p className="text-sm text-text-gray">
          Already have an account?{" "}
          <span onClick={handleRedirectToLogin} className="font-semibold underline text-text-black cursor-pointer">
            Login Here
          </span>
        </p>
      </div>

      {/* <div className="mt-6 pt-4 border-t border-border">
        <p className="text-sm text-text-gray">
          Want to list your property?{" "}
          <span onClick={handleRedirectToPostProperty} className="font-semibold underline text-text-black cursor-pointer">
            Register as Owner / Channel Partner
          </span>
        </p>
      </div> */}
    </div>
  );
}
