'use client';

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { MoveLeft, Copy, Check, ArrowRight } from "lucide-react"; // ⚡ ArrowRight icon for mobile CTA
import { useRouter } from "next/navigation"; // ⚡ Router for redirection

interface VerifyPropertyLinkProps {
  open: boolean;
  onClose: () => void;
  propertyId: string; 
  propertyAddress?: string;
  onSetReminder?: (date: string) => void;
  onShareLink?: (mobileNumber: string) => void;
}

export default function VerifyPropertyLink({
  open,
  onClose,
  propertyId, 
  propertyAddress = "742 Evergreen Terrace, Springfield, IL 62704", 
  onSetReminder,
  onShareLink
}: VerifyPropertyLinkProps) {
  const theme = useTheme();
  const router = useRouter(); // ⚡ Router initialised safely
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [visitDate, setVisitDate] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLinkSent, setIsLinkSent] = useState(false); 
  const [copied, setCopied] = useState(false); 

  const baseUrl = process.env.NEXT_PUBLIC_MOBILE_APP_URL || "http://localhost:3000";
  const dynamicVerificationLink = `${baseUrl}/user-flow?isLogin=true&redirect=/verify-property/${propertyId}`;

  const handleClose: DialogProps["onClose"] = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    onClose();
  };

  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate) return alert("Please select a date");
    if (onSetReminder) onSetReminder(visitDate);
    alert(`Reminder set for: ${visitDate}`);
  };

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber) return alert("Please enter a mobile number");
    if (onShareLink) onShareLink(mobileNumber);
    
    setIsLinkSent(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(dynamicVerificationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); 
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  return (
    <Dialog
      fullScreen={isMobile}
      open={open}
      onClose={handleClose}
      aria-labelledby="verify-property-dialog"
      maxWidth="lg"
      slotProps={{
        paper: {
          sx: { 
            borderRadius: isMobile ? '0' : "1rem",
            maxWidth: "1000px",
            width: "100%"
          },
        },
      }}
    >
      <DialogContent className="p-4 md:p-8 bg-[#F8FAFC]">
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-dashed border-blue/30 w-full">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
            >
              <MoveLeft width={20} height={20} />
            </button>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-black leading-tight">Verify your property</h3>
              <p className="text-xs md:text-sm text-gray-500">Verify your property to see it on listing</p>
            </div>
          </div>
          
          <div className="sm:text-right text-left">
            <p className="text-sm font-bold text-black">{propertyAddress}</p>
          </div>
        </div>

        {/* How It Works Center Section */}
        <div className="mt-8 relative">
          <div className="flex justify-center items-center mb-6">
            <h4 className="text-base font-bold text-black mx-auto md:mx-0">How it works</h4>
          </div>

          {/* Three Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-6 md:gap-4 max-w-[850px] mx-auto py-4">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <Image src="/assets/visitProperty.png" fill className="object-contain" alt="Visit the property" />
              </div>
              <p className="text-sm text-[#585858]">Visit the property</p>
            </div>

            {/* Arrow 1 */}
            <div className="hidden md:block text-blue/40 text-2xl font-light">
              <svg className="w-[80px] h-[80px] text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <Image src="/assets/copyLink.png" fill className="object-contain" alt="Open link shared on your mobile" />
              </div>
              <p className="text-sm text-[#585858]">Open link shared on your mobile</p>
            </div>

            {/* Arrow 2 */}
            <div className="hidden md:block text-blue/40 text-2xl font-light">
              <svg className="w-[80px] h-[80px] text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <Image src="/assets/submitPhoto.png" fill className="object-contain" alt="Click and upload photos" />
              </div>
              <p className="text-sm text-[#585858]">Click and upload photos</p>
            </div>
          </div>
        </div>

        {/* Form Options Wrapper */}
        <div className="mt-10 relative flex flex-col md:flex-row items-stretch justify-between gap-8 md:gap-0 max-w-[900px] mx-auto">
          
          {/* Left Form: I will visit */}
          <form onSubmit={handleReminderSubmit} className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <h5 className="text-sm md:text-base font-semibold text-center text-[#0D1520]">I will visit the property</h5>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">Select Date <span className="text-red-500">*</span></label>
                <input 
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-black focus:outline-none focus:border-blue bg-white"
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-[#8E8EA1] hover:bg-gray-500 text-white font-medium text-sm py-3 rounded-lg transition-colors cursor-pointer mt-2"
            >
              Set Reminder
            </button>
          </form>

          {/* Central OR Divider */}
          <div className="flex md:flex-col items-center justify-center relative px-4">
            <div className="absolute z-10 bg-[#EEF2F6] border border-gray-200 text-[#010048] font-bold text-xs rounded-full w-15 h-15 flex items-center justify-center shadow-sm">
              OR
            </div>
          </div>

          {/* Right Section: ⚡ DYNAMIC MOBILE VIEW ENGINE CONDITION */}
          <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center min-h-[190px]">
            {isMobile ? (
              /* State 1: Mobile View Screen CTA Mode */
              <div className="w-full h-full flex flex-col justify-between text-center items-center gap-4 py-2">
                <div className="space-y-3">
                  <h5 className="text-base font-bold text-[#0D1520]">Verify Directly on this Mobile</h5>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed px-2">
                    Since you are accessing from your smartphone, you can trigger the live AI camera verification interface directly.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => router.push(`/verify-property/${propertyId}`)}
                  className="w-full bg-[#010048] hover:bg-opacity-95 text-white font-semibold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  Continue Verification <ArrowRight width={16} height={16} />
                </button>
              </div>
            ) : !isLinkSent ? (
              /* State 2: Original Desktop View Form Input */
              <form onSubmit={handleShareSubmit} className="w-full h-full flex flex-col justify-between gap-4">
                <div className="space-y-4">
                  <h5 className="text-sm md:text-base font-semibold text-center text-[#0D1520]">Share link with someone else</h5>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">Enter mobile number <span className="text-red-500">*</span></label>
                    <input 
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter mobile number"
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-black focus:outline-none focus:border-blue bg-white"
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-[#8E8EA1] hover:bg-gray-500 text-white font-medium text-sm py-3 rounded-lg transition-colors cursor-pointer mt-2"
                >
                  Share link
                </button>
              </form>
            ) : (
              /* State 3: Original Desktop View Link Sent Success View */
              <div className="w-full flex flex-col items-center justify-center text-center gap-3 py-2">
                <div className="w-14 h-14 bg-[#33AB41] text-white rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div className="space-y-0.5 w-full">
                  <h5 className="text-base font-bold text-[#000033]">Verification Link Sent</h5>
                  <p className="text-xs text-gray-500 font-medium">to +91 {mobileNumber}</p>

                  <div className="mt-3 flex items-center justify-between gap-2 bg-[#F1F5F9] border border-gray-200 rounded-lg p-2 max-w-full overflow-hidden">
                    <span className="text-[11px] text-gray-600 truncate text-left select-all font-mono block flex-1 pr-1">
                      {dynamicVerificationLink}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="p-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-gray-500 hover:text-black cursor-pointer shadow-sm shrink-0 flex items-center justify-center"
                      title={copied ? "Copied!" : "Copy Link"}
                    >
                      {copied ? <Check width={14} height={14} className="text-[#33AB41]" /> : <Copy width={14} height={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLinkSent(false)}
                  className="text-xs font-bold text-[#010048] underline hover:text-opacity-80 cursor-pointer mt-1 bg-transparent border-none outline-none"
                >
                  Change Number
                </button>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}