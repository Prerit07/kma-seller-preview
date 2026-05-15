"use client";

import ReferralUserShell from "@/components/referral/ReferralUserShell";
import { EXPECTED_COINS_ON_DEAL_CLOSE, RUPEE_PER_COIN } from "@/lib/referral/constants";
import { useReferralSessionActive } from "@/lib/referral/useReferralSessionActive";
import { openReferralLoginDialog } from "@/lib/referral/openLoginDialog";
import {
  appendReferral,
  getOrCreateUniqueUserId,
  getReferrerProfile,
  saveReferrerProfile,
} from "@/lib/referral/storage";
import type { PropertyTypeOption } from "@/lib/referral/types";
import { submitReferralEnquiryApiHandler } from "@/services/contactService";
import { userProfileApiHandler, UserProfileResponse } from "@/services/userService";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type ViewStep = "landing" | "form" | "success";

type ReferralForm = {
  referrerName: string;
  referrerPhone: string;
  clientName: string;
  clientMobile: string;
  propertyType: PropertyTypeOption;
  location: string;
  channelPartnerId: string;
};

const initialForm = (): ReferralForm => ({
  referrerName: "",
  referrerPhone: "",
  clientName: "",
  clientMobile: "",
  propertyType: "Buy",
  location: "",
  channelPartnerId: "",
});

const termsAndConditions: string[] = [
  "Each successful referral gives you reward coins.",
  "1 coin = ₹1000.",
  "1 rent referral gives you 5 coins = ₹5000 fixed.",
  "1 Sale referral Deal successful given you 50% applicable GST and TDS will be Deducted as per prevailing Goverment regulation before payout.",
  "Referral details must be genuine and reachable.",
  "KMA team verification is required before reward settlement.",
];

const referralSteps = [
  {
    title: "Share Referral",
    description: "Submit your details and the client you are referring.",
  },
  {
    title: "KMA Verification",
    description: "Our team verifies the enquiry and intent.",
  },
  {
    title: "Earn Coins",
    description: "Coins are credited when the deal is marked closed.",
  },
];

const propertyTypes: PropertyTypeOption[] = ["Buy", "Sell", "Rent"];

export default function ReferAndEarnClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = useReferralSessionActive();
  const partnerIdFromUrl = searchParams.get("partnerId") ?? searchParams.get("channelPartnerId") ?? "";

  const { data: profileResponse } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async (): Promise<UserProfileResponse> => userProfileApiHandler(),
    enabled: isLoggedIn,
    staleTime: 60 * 1000,
  });

  const [step, setStep] = useState<ViewStep>("landing");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValue, setFormValue] = useState<ReferralForm>(initialForm);
  const [submittedUniqueId, setSubmittedUniqueId] = useState("");

  useEffect(() => {
    if (partnerIdFromUrl && step === "landing") {
      setFormValue((prev) => ({ ...prev, channelPartnerId: partnerIdFromUrl }));
    }
  }, [partnerIdFromUrl, step]);

  const prefilledBase = useMemo(() => {
    return {
      referrerName: profileResponse?.user?.name ?? "",
      referrerPhone: profileResponse?.user?.phone ?? "",
      clientName: "",
      clientMobile: "",
      propertyType: "Buy" as PropertyTypeOption,
      location: "",
      channelPartnerId: partnerIdFromUrl,
    };
  }, [profileResponse?.user?.name, profileResponse?.user?.phone, partnerIdFromUrl]);

  const handleReferNow = () => {
    if (isLoggedIn) {
      const saved = getReferrerProfile();
      setFormValue({
        ...initialForm(),
        ...prefilledBase,
        referrerName: prefilledBase.referrerName || saved?.name || "",
        referrerPhone: prefilledBase.referrerPhone || saved?.phone || "",
      });
      setStep("form");
      return;
    }
    openReferralLoginDialog(router);
  };

  const handleInputChange = (field: keyof ReferralForm, value: string) => {
    setFormValue((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rName = formValue.referrerName.trim();
    const rPhone = formValue.referrerPhone.trim();
    const cName = formValue.clientName.trim();
    const cMobile = formValue.clientMobile.trim();
    const cpId = formValue.channelPartnerId.trim();

    if (!rName) {
      toast.error("Your name is required");
      return;
    }
    if (!/^\d{10}$/.test(rPhone)) {
      toast.error("Please enter a valid 10 digit mobile number for yourself");
      return;
    }
    if (!cName) {
      toast.error("Client name is required");
      return;
    }
    if (!/^\d{10}$/.test(cMobile)) {
      toast.error("Please enter a valid 10 digit client mobile number");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReferralEnquiryApiHandler({
        referrerName: rName,
        referrerPhone: rPhone,
        clientName: cName,
        clientMobile: cMobile,
        propertyType: formValue.propertyType,
        location: formValue.location.trim() || undefined,
        channelPartnerId: cpId || undefined,
      });

      saveReferrerProfile({ name: rName, phone: rPhone });
      const uniqueId = getOrCreateUniqueUserId(rName);
      const viaPartner = Boolean(cpId);
      appendReferral({
        referrerName: rName,
        referrerPhone: rPhone,
        clientName: cName,
        clientMobile: cMobile,
        propertyType: formValue.propertyType,
        location: formValue.location.trim(),
        channelPartnerId: cpId,
        viaPartner,
      });
      toast.success("Referral submitted successfully");
      setSubmittedUniqueId(uniqueId);
      router.push(`/refer-and-earn/my-referrals?submittedId=${encodeURIComponent(uniqueId)}`);
    } catch (error: any) {
      const message =
        error?.message ||
        error?.error ||
        "We couldn't submit referral right now. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToLanding = () => {
    setStep("landing");
    setFormValue(initialForm());
  };

  const openFormAgain = () => {
    const saved = getReferrerProfile();
    setFormValue({
      ...initialForm(),
      ...prefilledBase,
      referrerName: prefilledBase.referrerName || saved?.name || "",
      referrerPhone: prefilledBase.referrerPhone || saved?.phone || "",
    });
    setStep("form");
  };

  return (
    <ReferralUserShell
      title="Refer and Earn"
      description="Help friends discover the right property with KMA and earn rewards. 1 coin = ₹1000."
      breadcrumb="Home / Refer and Earn"
    >
      <div className="space-y-6">
        {step !== "success" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 -mt-2 mb-2">
            <div className="rounded-xl border border-[#EAECF0] bg-white px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-[#667085]">Reward rate</p>
              <p className="text-2xl font-semibold text-[#0F172A] mt-1">1 coin = ₹1000</p>
            </div>
            <div className="rounded-xl border border-[#EAECF0] bg-white px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-[#667085]">Steps</p>
              <p className="text-2xl font-semibold text-[#0F172A] mt-1">3 simple steps</p>
            </div>
            <div className="rounded-xl border border-[#EAECF0] bg-white px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-[#667085]">Network</p>
              <p className="text-2xl font-semibold text-[#0F172A] mt-1">KMA</p>
            </div>
          </div>
        )}

        {step === "landing" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6">
            <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <h2 className="text-2xl font-semibold text-[#0F172A]">Terms and Conditions</h2>
              <ul className="mt-4 space-y-2">
                {termsAndConditions.map((item) => (
                  <li key={item} className="text-[#475467] text-[15px] leading-6">
                    - {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleReferNow}
                className="mt-6 animated-button animate-pulse px-10 py-3 border border-blue text-center cursor-pointer"
              >
                <span className="relative">Give a referral</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <h3 className="text-xl font-semibold text-[#0F172A]">How it works</h3>
              <div className="mt-5 space-y-4">
                {referralSteps.map((s, index) => (
                  <div key={s.title} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#EEF4FF] text-[#1D4ED8] text-sm font-semibold flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1D2939]">{s.title}</p>
                      <p className="text-sm text-[#667085] mt-1">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "form" && (
          <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <h3 className="text-xl font-semibold text-[#0F172A]">Referral details</h3>
              <p className="text-sm text-[#667085]">Your details are saved after your first submission.</p>
            </div>

            <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
              <p className="text-sm font-semibold text-[#344054]">About you</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your name *"
                  value={formValue.referrerName}
                  onChange={(e) => handleInputChange("referrerName", e.target.value)}
                  className="w-full border border-[#D0D5DD] rounded-xl px-4 py-3 outline-none focus:border-[#2563EB]"
                />
                <input
                  type="tel"
                  placeholder="Your mobile *"
                  value={formValue.referrerPhone}
                  onChange={(e) => handleInputChange("referrerPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full border border-[#D0D5DD] rounded-xl px-4 py-3 outline-none focus:border-[#2563EB]"
                />
              </div>

              <p className="text-sm font-semibold text-[#344054] pt-2">Client you are referring</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Client name *"
                  value={formValue.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  className="w-full border border-[#D0D5DD] rounded-xl px-4 py-3 outline-none focus:border-[#2563EB]"
                />
                <input
                  type="tel"
                  placeholder="Client mobile * (WhatsApp preferred)"
                  value={formValue.clientMobile}
                  onChange={(e) => handleInputChange("clientMobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full border border-[#D0D5DD] rounded-xl px-4 py-3 outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <p className="text-sm text-[#344054] mb-2">Property type *</p>
                <div className="inline-flex flex-wrap p-1 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] gap-1">
                  {propertyTypes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleInputChange("propertyType", item)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        formValue.propertyType === item ? "bg-blue text-white" : "text-[#475467] hover:bg-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Location (area or city, optional)"
                value={formValue.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full border border-[#D0D5DD] rounded-xl px-4 py-3 outline-none focus:border-[#2563EB]"
              />

              <div>
                <label className="text-sm text-[#344054]">Channel Partner ID</label>
                <input
                  type="text"
                  placeholder="Optional — required if referring through a partner"
                  value={formValue.channelPartnerId}
                  onChange={(e) => handleInputChange("channelPartnerId", e.target.value)}
                  className="mt-2 w-full border border-[#D0D5DD] rounded-xl px-4 py-3 outline-none focus:border-[#2563EB]"
                />
                <p className="text-xs text-[#667085] mt-1">
                  Leave blank for a direct client referral. Pre-fill using{" "}
                  <code className="text-[11px] bg-[#F2F4F7] px-1 rounded">?partnerId=...</code> when you have a partner ID.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-fit animated-button px-10 py-3 border border-blue text-center cursor-pointer disabled:opacity-60"
                >
                  <span className="relative">{isSubmitting ? "Submitting..." : "Submit referral"}</span>
                </button>
                <button
                  type="button"
                  onClick={resetToLanding}
                  className="px-6 py-3 rounded-full border border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {step === "success" && (
          <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] text-center">
            <p className="text-lg font-semibold text-emerald-700">Thank you! Your referral has been submitted successfully.</p>
            <div className="mt-6 p-5 rounded-2xl bg-[#F8FAFC] border border-[#E4E7EC]">
              <p className="text-sm text-[#667085]">Your unique ID</p>
              <p className="text-2xl md:text-3xl font-bold text-[#1B2DBE] mt-2 tracking-tight">{submittedUniqueId}</p>
              <p className="text-sm text-[#475467] mt-4">
                You can earn up to <strong>{EXPECTED_COINS_ON_DEAL_CLOSE} coins</strong> when this deal is marked closed by KMA.
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button type="button" onClick={openFormAgain} className="animated-button px-8 py-3 border border-blue text-center cursor-pointer">
                <span className="relative">Submit another referral</span>
              </button>
              <Link
                href="/refer-and-earn/my-referrals"
                className="px-8 py-3 rounded-full border border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] text-center font-medium"
              >
                Go to my dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </ReferralUserShell>
  );
}
