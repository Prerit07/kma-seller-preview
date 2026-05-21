"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Loader2,
  X,
  ChevronRight,
} from "lucide-react";

const VERIFICATION_STEPS = [
//   { id: "entrance", label: "Property Front" },
  { id: "living", label: "Living Room / Hall" },
  { id: "kitchen", label: "Kitchen Area" },
  { id: "bedroom", label: "Master Bedroom" },
];

export default function PropertyCameraCapturePage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;

  const [openAccordionIdx, setOpenAccordionIdx] = useState<number | null>(0);
  
  // Local UI previews state (Base64 ya Cloudinary URL dono hold karega)
  const [capturedImages, setCapturedImages] = useState<Record<string, string>>({});
  // Verified Cloudinary URLs mapping state
  const [verifiedImages, setVerifiedImages] = useState<Record<string, string>>({});
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const activeStepConfig =
    openAccordionIdx !== null ? VERIFICATION_STEPS[openAccordionIdx] : null;

  // ⚡ 1. LOAD PERSISTED DATA ON INITIAL MOUNT (Page Refresh Setup)
  useEffect(() => {
    if (propertyId) {
      const savedImages = localStorage.getItem(`kma_verified_${propertyId}`);
      if (savedImages) {
        const parsed = JSON.parse(savedImages);
        setVerifiedImages(parsed);
        setCapturedImages(parsed); // Previews me bhi vahi URLs daal diye taaki photo dikhti rahe

        // Automatic agla incomplete accordion open karne ka logic
        const completedCount = Object.keys(parsed).length;
        if (completedCount < VERIFICATION_STEPS.length) {
          setOpenAccordionIdx(completedCount);
        } else {
          setOpenAccordionIdx(null); // Saare done hain toh collapse rakho
        }
      }
    }
  }, [propertyId]);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error("Fullscreen camera hardware trigger failed:", error);
      alert("Camera module initialization failed. Please check app permissions.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = (stepId: string) => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 1080;
    canvas.height = videoRef.current.videoHeight || 1920;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.5);

      setCapturedImages((prev) => ({ ...prev, [stepId]: dataUrl }));
    }

    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleRetake = (stepId: string) => {
    setCapturedImages((prev) => {
      const updated = { ...prev };
      delete updated[stepId];
      return updated;
    });
    
    setVerifiedImages((prev) => {
      const updated = { ...prev };
      delete updated[stepId];
      // Sync localStorage after deletion
      localStorage.setItem(`kma_verified_${propertyId}`, JSON.stringify(updated));
      return updated;
    });
    
    startCamera();
  };

  // ⚡ 2. SAVE ON SUCCESS: AI Verify hote hi local storage me lock kardo
  const handleNextAccordionFlow = async (currentIdx: number) => {
    const stepConfig = VERIFICATION_STEPS[currentIdx];
    const currentImageBase64 = capturedImages[stepConfig.id];

    if (!currentImageBase64) {
      alert("Please capture an image first!");
      return;
    }

    // Agar yeh image pehle se verified Cloudinary URL hai (User refresh karke aya hai), toh direct skip karo
    if (currentImageBase64.startsWith("http")) {
      if (currentIdx < VERIFICATION_STEPS.length - 1) {
        setOpenAccordionIdx(currentIdx + 1);
      } else {
        setOpenAccordionIdx(null);
      }
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch(`/api/verify-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: propertyId,
          stepId: stepConfig.id,
          stepLabel: stepConfig.label,
          imageBase64: currentImageBase64
        })
      });

      const result = await response.json();

      if (result.success && result.aiVerified) {
        alert(`Success! ${result.message || "Image verified and saved."}`);
        
        if (result.s3Url) {
          const updatedVerified = { ...verifiedImages, [stepConfig.id]: result.s3Url };
          setVerifiedImages(updatedVerified);
          setCapturedImages(prev => ({ ...prev, [stepConfig.id]: result.s3Url }));
          
          // ⚡ Local Storage Sync: Data refresh proof bana diya
          localStorage.setItem(`kma_verified_${propertyId}`, JSON.stringify(updatedVerified));
        }

        if (currentIdx < VERIFICATION_STEPS.length - 1) {
          setOpenAccordionIdx(currentIdx + 1);
        } else {
          setOpenAccordionIdx(null);
        }
      } else {
        alert(`AI Verification Failed: ${result.message || "The captured image does not match this section. Please retake."}`);
      }
    } catch (err) {
      console.error("AI Node connection error:", err);
      alert("Network or server connection issue during AI verification.");
    } finally {
      setIsUploading(false);
    }
  };

  // Final submit hote hi localStorage flush kar denge taaki agle session ke liye fresh memory rahe
//   const handleFinalSubmit = async () => {
//     setIsUploading(true);
//     try {
//       const response = await fetch(`/api/property/save-verification`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           propertyId: propertyId,
//           verifiedImages: Object.values(verifiedImages),
//           status: "ACTIVE"
//         })
//       });

//       const dbResult = await response.json();

//       if (dbResult.success) {
//         // ⚡ Fresh Token Clean-up: Submission ke baad purana cache clear
//         localStorage.removeItem(`kma_verified_${propertyId}`);
//         router.push(`/verify-property/${propertyId}/thank-you`);
//       } else {
//         alert(`Failed to lock verification: ${dbResult.message || "Database update failure."}`);
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Pipeline context updates error.");
//     } finally {
//       setIsUploading(false);
//     }
//   };

const getCookie = (name: string): string => {
  if (typeof document === "undefined") return ""; 
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
};

// ⚡ NEW HELPER: Prompt se liye huye token ko cookie me store karne ke liye
const setCookie = (name: string, value: string, days = 1) => {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  // path=/ lagane se poori website par ye cookie access ho payegi
  document.cookie = `${name}=${value}${expires}; path=/; Secure; SameSite=Lax`;
};

const handleFinalSubmit = async () => {
  setIsUploading(true);
  try {
    console.log("Submitting collected images...");
    
    // 1. Pehle check karega cookie me token hai ya nahi
    let dynamicToken = getCookie("accessToken");

    // 2. Agar cookie me nahi mila, toh prompt khulega
    if (!dynamicToken) {
      const fallbackToken = prompt(
        "Dev Tunnel Cookie Blocked! Please paste your fresh accessToken here. (It will be saved in cookies for future automatically):"
      );
      
      if (!fallbackToken) {
        alert("Token required to complete verification.");
        setIsUploading(false);
        return;
      }
      
      dynamicToken = fallbackToken.trim();
      
      // ⚡ MAGIC LINE: Token ko cookie me store kar diya 1 din ke liye
      setCookie("accessToken", dynamicToken, 1);
      console.log("Token successfully locked inside browser cookies!");
    }

    const response = await fetch(`/api/property/save-verification`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${dynamicToken}`
      },
      body: JSON.stringify({
        propertyId: propertyId,
        verifiedImages: Object.values(verifiedImages),
        status: "ACTIVE"
      })
    });

    const dbResult = await response.json();

    if (dbResult.success) {
      localStorage.removeItem(`kma_verified_${propertyId}`); //
      router.push(`/verify-property/${propertyId}/thank-you`);
    } else {
      // Agar token real me expire ho chuka hoga backend side se, toh error handle hoga
      alert(`Failed to lock verification: ${dbResult.message || JSON.stringify(dbResult)}`);
    }
  } catch (err) {
    console.error(err);
    alert("Pipeline context updates error.");
  } finally {
    setIsUploading(false);
  }
};

  const isAllStepsCompleted = VERIFICATION_STEPS.every(
    (step) => verifiedImages[step.id] !== undefined
  );

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col justify-between font-sans antialiased relative overflow-hidden">
      {isCameraActive && activeStepConfig && (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col justify-between animate-fadeIn">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="relative z-10 w-full bg-gradient-to-b from-black/75 via-black/30 to-transparent p-5 pt-8 flex items-start justify-between text-white">
            <div className="space-y-0.5 text-left">
              <h2 className="text-base font-black tracking-tight pt-1">
                Capturing: {activeStepConfig.label}
              </h2>
            </div>
            <button
              type="button"
              onClick={stopCamera}
              className="p-2 bg-black/40 rounded-full text-white/90 active:scale-90 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative pointer-events-none mx-auto my-auto w-48 h-48 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white/40 rounded-full" />
          </div>

          <div className="relative z-10 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-12 pt-8 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => capturePhoto(activeStepConfig.id)}
              className="w-20 h-20 bg-white rounded-full p-1 border-4 border-white/30 shadow-2xl active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <div className="w-full h-full bg-red-600 rounded-full border-2 border-white" />
            </button>
          </div>
        </div>
      )}

      <header className="bg-white px-4 py-3.5 border-b border-gray-100 flex justify-center items-center sticky top-0 z-50">
        <Image
          src="/assets/kma_logo_blue.png"
          width={100}
          height={35}
          alt="logo"
          style={{ height: "38px" }}
        />
      </header>

      <main className="max-w-md mx-auto w-full px-4 py-6 flex flex-col flex-1 gap-5 overflow-y-auto">
        <Image
          src={"/assets/capture_screen.jpg"}
          height={300}
          width={300}
          alt="capture"
          className="mx-auto w-full"
        />

        <div className="w-full space-y-3.5">
          {VERIFICATION_STEPS.map((step, idx) => {
            const isCompleted = verifiedImages[step.id] !== undefined;
            const isOpen = openAccordionIdx === idx;
            const stepPreview = capturedImages[step.id];

            return (
              <div
                key={step.id}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? "border-[#8A73DB] shadow-md"
                    : isCompleted
                      ? "border-green-100 opacity-90"
                      : "border-gray-100"
                }`}
              >
                <div
                  onClick={() => {
                    if (isOpen) {
                      setOpenAccordionIdx(null);
                    } else {
                      setOpenAccordionIdx(idx);
                    }
                  }}
                  className={`flex items-center justify-between p-4 cursor-pointer select-none transition-colors ${
                    isOpen ? "bg-[#F3F3FF]/40" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-[#33AB41] shrink-0" />
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isOpen
                            ? "border-[#8A73DB] text-[#8A73DB] bg-[#F3F3FF]"
                            : "border-gray-200 text-gray-400"
                        }`}
                      >
                        {idx + 1}
                      </div>
                    )}

                    <span
                      className={`text-md font-bold tracking-tight ${
                        isOpen
                          ? "text-[#010048]"
                          : isCompleted
                            ? "text-gray-500 decoration-gray-200"
                            : "text-gray-700"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {isOpen && (
                  <div className="p-4 bg-white space-y-4 animate-fadeIn">
                    <div className="w-full aspect-[4/2] bg-[#A9A9DB]/10 border border-dashed rounded-xl relative overflow-hidden flex flex-col items-center justify-center shadow-inner">
                      {stepPreview ? (
                        <img
                          src={stepPreview}
                          alt={step.label}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                      ) : (
                        <div className="text-center space-y-2.5 p-4 flex flex-col items-center">
                          <button
                            type="button"
                            onClick={startCamera}
                            className="text-xs font-bold text-white bg-[#010048] px-4 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                          >
                            Capture Images
                          </button>
                          <p className="text-[11px] text-gray-400 font-medium">
                            Click here to start capturing property images
                          </p>
                        </div>
                      )}
                    </div>

                    {stepPreview && (
                      <div className="grid grid-cols-2 gap-3 w-full pt-1">
                        <button
                          type="button"
                          onClick={() => handleRetake(step.id)}
                          disabled={isUploading}
                          className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Retake Photo
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNextAccordionFlow(idx)}
                          disabled={isUploading}
                          className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-white bg-[#010048] hover:bg-opacity-95 rounded-xl shadow-xs transition-all cursor-pointer disabled:bg-gray-400"
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isCompleted ? (
                            <>Skip Section <ArrowRight className="w-3.5 h-3.5" /></>
                          ) : (
                            <>Next <ArrowRight className="w-3.5 h-3.5" /></>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="w-full mt-auto pt-4">
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={!isAllStepsCompleted || isUploading}
            className={`w-full text-white font-semibold text-sm py-3.5 rounded-full transition-all shadow-md flex items-center justify-center gap-2 ${
              isAllStepsCompleted && !isUploading
                ? "bg-[#33AB41] hover:bg-opacity-95 cursor-pointer active:scale-[0.98]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-100 font-medium"
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-1.5">
                Complete Verification <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}