import { InputBase } from "@mui/material";
import FullscreenSpinner from "../common/spinner/fullScreenSpinner";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  bankDetailsApiHandler,
  bankDetailsGetApiHandler,
  BankDetailsGetResponse,
  BankDetailsPayload,
  BankDetailsResponse,
} from "@/services/kycService";
import { toast } from "react-toastify";
import { useRouter } from "nextjs-toploader/app";

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

type VerifiedDetails = {
  full_name: string;
  bank_name: string;
  branch_name: string;
  city: string;
};

export default function BankDetails({ isPopup = false, onClose }: { isPopup?: boolean; onClose?: (success: boolean) => void }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    accountNumber: "",
    ifscCode: "",
  });

  const [errors, setErrors] = useState<{ accountNumber?: string; ifscCode?: string }>({});
  const [verified, setVerified] = useState<VerifiedDetails | null>(null);
  const [verifying, setVerifying] = useState(false);

  const dynamicClass = (flag: string | undefined) =>
    `box-border h-[47.81px] px-4 py-2 text-sm rounded-full border focus:outline-none ${
      flag ? "border-red-500 focus:border-red-500" : "border-border focus:border-blue"
    } text-text-gray`;

  const handleChange = (field: "accountNumber" | "ifscCode", value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    // If user edits after verification, force re-verify.
    if (verified) setVerified(null);
  };

  const validateInputs = () => {
    const e: { accountNumber?: string; ifscCode?: string } = {};
    if (!formData.accountNumber.trim()) e.accountNumber = "Account number is required";
    else if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) e.accountNumber = "Account number must be 9-18 digits";
    if (!formData.ifscCode.trim()) e.ifscCode = "IFSC code is required";
    else if (!IFSC_REGEX.test(formData.ifscCode.toUpperCase())) e.ifscCode = "Invalid IFSC format (e.g. SBIN0032224)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleVerify = async () => {
    if (!validateInputs()) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/verify-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_number: formData.accountNumber,
          ifsc: formData.ifscCode.toUpperCase(),
          beneficiary_name: "",
        }),
      });
      const result = await res.json();

      if (result?.success && result?.data?.account_exists) {
        const ifscDetails = result.data.ifsc_details ?? {};
        setVerified({
          full_name: result.data.full_name ?? "",
          bank_name: ifscDetails.bank ?? "",
          branch_name: ifscDetails.branch ?? "",
          city: ifscDetails.city ?? "",
        });
        toast.success("Account verified — please confirm the details below");
      } else {
        toast.error(result?.data?.remarks || result?.message || "Could not verify account. Check the details and try again.");
      }
    } catch {
      toast.error("Bank verification service unavailable. Please try again.");
    }
    setVerifying(false);
  };

  const { mutate: handleBankDetails, isPending: bankLoader } = useMutation({
    mutationFn: async (payload: BankDetailsPayload): Promise<BankDetailsResponse> => bankDetailsApiHandler(payload),
    onSuccess: (response) => {
      toast.success(response.message);
      if (isPopup) onClose?.(true);
      else router.push("/kyc?tabName=Agreement Signature");
    },
    onError: (error: any) => {
      if (Array.isArray(error.message)) error.message.map((m: string) => toast.error(m));
      else toast.error(error.message);
    },
  });

  const { data: bankDetails, isLoading: detailsLoader } = useQuery({
    queryKey: ["bank details"],
    queryFn: async (): Promise<BankDetailsGetResponse> => bankDetailsGetApiHandler(),
    staleTime: 0,
    refetchOnMount: true,
  });

  useEffect(() => {
    const data = bankDetails?.bank_details;
    if (data) {
      setFormData({
        accountNumber: data.account_number,
        ifscCode: data.ifsc_code,
      });
      // Pre-fill verified state from saved data so the user sees the existing info without re-verifying.
      setVerified({
        full_name: data.account_holder_name,
        bank_name: data.bank_name,
        branch_name: data.branch_name ?? "",
        city: "",
      });
    }
  }, [bankDetails]);

  const handleSubmit = () => {
    if (!verified) {
      toast.error("Please verify your account details first");
      return;
    }
    handleBankDetails({
      account_number: formData.accountNumber,
      ifsc_code: formData.ifscCode.toUpperCase(),
      bank_name: verified.bank_name,
      account_holder_name: verified.full_name,
      branch_name: verified.branch_name,
    });
  };

  const handleCancel = () => {
    if (isPopup) onClose?.(false);
    else router.push("/user-dashboard");
  };

  if (detailsLoader) return <FullscreenSpinner />;

  return (
    <div className={isPopup ? "" : "w-[100%] lg:w-[50%]"}>
      <p className="required-label text-sm 1xl:text-base text-text-black py-2">Account number</p>
      <InputBase
        placeholder="Enter 9-18 digit account number"
        fullWidth
        value={formData.accountNumber}
        onChange={(e) => {
          const v = e.target.value;
          if (!/^\d*$/.test(v) || v.length > 18) return;
          handleChange("accountNumber", v);
          setErrors((p) => ({ ...p, accountNumber: undefined }));
        }}
        className={dynamicClass(errors.accountNumber)}
        inputProps={{ className: "placeholder-gray", inputMode: "numeric" }}
      />
      {errors.accountNumber && <p className="pt-1 text-red-500 text-xs">{errors.accountNumber}</p>}

      <p className="required-label text-sm 1xl:text-base text-text-black py-2">IFSC code</p>
      <InputBase
        placeholder="e.g. SBIN0032224"
        fullWidth
        value={formData.ifscCode}
        onChange={(e) => {
          const v = e.target.value.toUpperCase();
          if (v.length > 11) return;
          handleChange("ifscCode", v);
          setErrors((p) => ({ ...p, ifscCode: undefined }));
        }}
        className={dynamicClass(errors.ifscCode)}
        inputProps={{ className: "placeholder-gray", style: { textTransform: "uppercase" } }}
      />
      {errors.ifscCode && <p className="pt-1 text-red-500 text-xs">{errors.ifscCode}</p>}

      {!verified && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <button
            onClick={handleCancel}
            type="button"
            className="w-full md:w-[130px] text-sm 1xl:text-base px-12 py-3 border border-blue text-center cursor-pointer rounded-full bg-light-purple"
          >
            <p className="text-nowrap font-medium">Cancel</p>
          </button>
          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying}
            className="cursor-pointer w-full md:w-[160px] px-12 py-3 animated-button border border-blue disabled:opacity-70"
          >
            <p className="text-nowrap">{verifying ? "Verifying..." : "Verify Account"}</p>
          </button>
        </div>
      )}

      {verified && (
        <div className="mt-6 rounded-2xl border border-blue/30 bg-light-purple/40 p-4">
          <p className="text-sm font-semibold text-text-black mb-3">Please confirm these details:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
            <div>
              <p className="text-text-gray text-xs">Account holder</p>
              <p className="text-text-black font-medium">{verified.full_name || "—"}</p>
            </div>
            <div>
              <p className="text-text-gray text-xs">Bank</p>
              <p className="text-text-black font-medium">{verified.bank_name || "—"}</p>
            </div>
            {verified.branch_name && (
              <div>
                <p className="text-text-gray text-xs">Branch</p>
                <p className="text-text-black font-medium">{verified.branch_name}</p>
              </div>
            )}
            {verified.city && (
              <div>
                <p className="text-text-gray text-xs">City</p>
                <p className="text-text-black font-medium">{verified.city}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setVerified(null)}
              className="w-full md:w-[130px] text-sm px-6 py-3 border border-blue text-center cursor-pointer rounded-full bg-white"
            >
              <p className="text-nowrap font-medium">Re-enter</p>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={bankLoader}
              className="cursor-pointer w-full md:w-[180px] px-6 py-3 animated-button border border-blue disabled:opacity-70"
            >
              <p className="text-nowrap">{bankLoader ? "Saving..." : "Confirm & Submit"}</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
