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

// ==========================================
// 🚨 DYNAMIC DATA CONFIGURATION (STYLING UNTOUCHED)
// ==========================================
const DYNAMIC_STEPS_CONFIG: Record<string, Record<string, Array<{ id: string; label: string; target: string }>>> = {
  commercial: {
    office: [
      { id: 'ext_entrance', label: 'Building exterior & entrance', target: 'the main commercial building look from outside, glass facade panels, corporate entry arch, or the main entrance gate of the office complex' },
      { id: 'reception', label: 'Reception / lobby area', target: 'the front reception desk, visitor waiting area, office lobby walkway, or company branding wall' },
      { id: 'open_hall', label: 'Open work area / hallmust', target: 'clusters of employee workstations, open floor workspace structure, desks, and office cubicles' },
      { id: 'cabins', label: 'Private cabins', target: 'closed private executive glass/wooden cabins, office desk setup, and manager chairs' },
      { id: 'conference', label: 'Conference / meeting room', target: 'a formal meeting boardroom containing a central long table, conference chairs, or presentation whiteboard setup' }
    ],
    plot: [
      { id: 'plot_overview', label: 'Full plot overview (wide)', target: 'a wide-angle open vacant land panoramic view showing boundary marking, fencing, or clear empty ground plot layout' },
      { id: 'road_facing', label: 'Road-facing', target: 'the tar or concrete public road connected directly to the plot boundary showing approach road access and connectivity' }
    ],
    'retail shop': [
      { id: 'shop_front', label: 'Shop front', target: 'the exterior commercial shop shutter, entrance glass look, facade, or market corridor frontage' },
      { id: 'interior_full', label: 'Interior full view', target: 'the inside open structural layout of the commercial retail shop from a corner angle showing floor space' },
      { id: 'display_area', label: 'Display area', target: 'product storage shelves, display racks, clothes hangers, counters, or showcases inside the shop' },
    //   { id: 'signage', label: 'Signage', target: 'the main commercial name banner board, printed brand logo sign, or outdoor marketing signage visible on the shop front' }
    ],
    showroom: [
      { id: 'glass_facade', label: 'Glass facade / front full view', target: 'the premium full glass exterior windows look, grand transparent doors, and illuminated showroom front frame' },
      { id: 'display_floor', label: 'Main display floor', target: 'the primary grand expansive floor showcasing items like cars, luxury goods, appliances, or heavy exhibits' },
      { id: 'ceiling_height', label: 'Ceiling height shot', target: 'a wide vertical clear shot focusing upwards to show high false ceiling architecture, industrial height, and clear vertical clearance' },
      { id: 'road_frontage', label: 'Road-facing frontage', target: 'the main outer commercial setup directly facing passing highway traffic or main road showing maximum visibility' }
    ],
    warehouse: [
      { id: 'ext_aerial', label: 'Exterior / aerial overview', target: 'the large industrial outer tin shed look, corrugated steel structures, heavy boundary layout, or commercial backyard yard' },
      { id: 'storage_floor', label: 'Main storage floor', target: 'the internal massive open storage hall containing high-bay pallet racking racks, bulk raw material storage zones, or heavy inventory bays' },
      { id: 'clear_height', label: 'Ceiling / clear height', target: 'a clear internal perspective emphasizing floor-to-ceiling structural grid, industrial trusses, and massive vertical clearance height' },
      { id: 'loading_dock', label: 'Loading / unloading dock', target: 'elevated concrete platforms, rolling loading shutter doors for trucks, cargo container bays, or dispatch gates' },
      { id: 'security_cabin', label: 'Entry gate / security cabin', target: 'the main heavy entrance commercial checking gate, perimeter checkpoint, or security guard cabin container' },
      { id: 'flooring_condition', label: 'Flooring condition', target: 'the concrete epoxy floor coating or VDF trimix heavy industrial flooring texture checking surface condition' }
    ]
  },
  residential: {
    default: [
      { id: "living", label: "Living Room / Hall", target: 'a domestic apartment living area layout containing couches, sofa setup, TV unit panel, or residential hall items' },
      { id: "kitchen", label: "Kitchen Area", target: 'a standard residential home cooking setup containing modular kitchen cabinets, countertops, or gas stoves slabs' },
      { id: "bedroom", label: "Master Bedroom", target: 'a domestic home bedroom layout containing a double bed setup, residential wardrobes, or pillows' }
    ]
  }
};

function getDynamicSteps(category?: string, title?: string) {
  const cleanCategory = category?.toLowerCase().trim() || 'residential';
  const cleanTitle = title?.toLowerCase().trim() || 'default';

  if (cleanCategory === 'commercial') {
    return DYNAMIC_STEPS_CONFIG.commercial[cleanTitle] || DYNAMIC_STEPS_CONFIG.commercial['office'];
  }
  return DYNAMIC_STEPS_CONFIG.residential.default;
}

export default function PropertyCameraCapturePage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;

  const [openAccordionIdx, setOpenAccordionIdx] = useState<number | null>(0);
  const [capturedImages, setCapturedImages] = useState<Record<string, string>>({});
  const [verifiedImages, setVerifiedImages] = useState<Record<string, string>>({});
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  // Live Database Objects Map
  const [propertyObj, setPropertyObj] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initial LocalStorage Hydration Hook
  useEffect(() => {
    if (propertyId) {
      const savedPreviews = localStorage.getItem(`captured_${propertyId}`);
      const savedVerified = localStorage.getItem(`verified_${propertyId}`);
      
      if (savedPreviews) setCapturedImages(JSON.parse(savedPreviews));
      if (savedVerified) setVerifiedImages(JSON.parse(savedVerified));
    }
  }, [propertyId]);

  // ⚡ FETCHING WITH THE ACCURATE NEW API PIPELINE URL
  useEffect(() => {
    async function fetchPropertyDetails() {
      try {
        setLoading(true);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/end-user/properties/${propertyId}`;
        const response = await fetch(apiUrl);
        if (response.ok) {
          const resData = await response.json();
          // Storing the nested property block directly
          if (resData?.success && resData?.property) {
            setPropertyObj(resData.property);
          }
        }
      } catch (error) {
        console.error("Failed to fetch property matching schema:", error);
      } finally {
        setLoading(false);
      }
    }
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  // 🎯 REAL TIME NORMALIZED CONVERSIONS FROM YOUR SHARED STRUCTURE
  const currentCategory = propertyObj?.category?.code || ''; // matches 'commercial'
  const currentType = propertyObj?.propertyType?.name || '';     // matches 'Office'
  
  const VERIFICATION_STEPS = getDynamicSteps(currentCategory, currentType);

  // Active step lifecycle synchronizer
  useEffect(() => {
    if (VERIFICATION_STEPS.length > 0) {
      const isCurrentValid = VERIFICATION_STEPS.some(s => s.id === activeStepId);
      if (!isCurrentValid) {
        setActiveStepId(VERIFICATION_STEPS[0].id);
      }
    }
  }, [VERIFICATION_STEPS, activeStepId]);

  const startCamera = async (stepId: string) => {
    setActiveStepId(stepId);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Please grant camera permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && activeStepId) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");

        setCapturedImages((prev) => {
          const updated = { ...prev, [activeStepId]: dataUrl };
          localStorage.setItem(`captured_${propertyId}`, JSON.stringify(updated));
          return updated;
        });

        stopCamera();
        verifyWithAI(dataUrl, activeStepId);
      }
    }
  };

  const verifyWithAI = async (imageSrc: string, stepId: string) => {
    const activeStepObj = VERIFICATION_STEPS.find((s) => s.id === stepId);
    if (!activeStepObj) return;

    const dynamicPrompt = `You are a real estate verification audit system. Verify if this picture confidently displays: "${activeStepObj.label}" for a property category "${currentCategory}" and sub-type "${currentType}".
The image must clearly contain features matching: ${activeStepObj.target}.
You must respond strictly in JSON format matching this pattern:
{
  "isValid": true or false,
  "reason": "Describe exactly why the verification passed or failed so the user can fix it."
}`;

    try {
      setIsVerifying(true);
      const response = await fetch("/api/verify-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          stepId,
          stepLabel: activeStepObj.label,
          imageBase64: imageSrc,
          prompt: dynamicPrompt
        }),
      });

      const result = await response.json();
      
      if (result?.success && result?.aiVerified) {
        setVerifiedImages((prev) => {
          const updated = { ...prev, [stepId]: result.s3Url };
          localStorage.setItem(`verified_${propertyId}`, JSON.stringify(updated));
          return updated;
        });

        alert(`✅ Success!\n\n${activeStepObj.label} has been successfully verified by AI and saved.`);

      } else {
        setCapturedImages((prev) => {
          const updated = { ...prev };
          delete updated[stepId];
          localStorage.setItem(`captured_${propertyId}`, JSON.stringify(updated));
          return updated;
        });

        const alertReason = result?.message || "Image properties did not match the required specifications.";
        alert(`❌ Verification Failed for ${activeStepObj.label}\n\nReason: ${alertReason}`);
      }
    } catch (error) {
      console.error("AI verification failed:", error);
      
      setCapturedImages((prev) => {
        const updated = { ...prev };
        delete updated[stepId];
        localStorage.setItem(`captured_${propertyId}`, JSON.stringify(updated));
        return updated;
      });

      alert("❌ Verification timeout. Please ensure clear image lightning conditions and capture again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNextStep = (index: number) => {
    if (index < VERIFICATION_STEPS.length - 1) {
      setOpenAccordionIdx(index + 1);
    }
  };

 const handleFinalSubmit = async () => {
    try {
      setIsUploading(true);

      const activeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjU0MTgyOC1mZjM0LTQzMzItODBiNy0yMTM1ZTk5YWRmMWIiLCJwaG9uZSI6IjkzNTQwNDA1MjciLCJyb2xlIjoiQ0hBTk5FTF9QQVJUTkVSIiwidHlwZSI6ImFjY2Vzc190b2tlbiIsImlhdCI6MTc3OTcwNjM4NiwiZXhwIjoxNzc5NzkyNzg2fQ.tl90zmOzMmmRNdA4ZEursLkH92xiWiEIXW4Qgz3mN00";

      // 1. NestJS clean string enums mapping helper
      const mapLabelToBackendEnum = (label: string) => {
        const lower = label.toLowerCase();
        if (lower.includes("living") || lower.includes("hall")) return "Living Room";
        if (lower.includes("kitchen")) return "Kitchen";
        if (lower.includes("bedroom")) return "Bedroom";
        if (lower.includes("bathroom")) return "Bathroom";
        if (lower.includes("balcony")) return "Balcony";
        if (lower.includes("exterior") || lower.includes("entrance")) return "Exterior";
        if (lower.includes("parking")) return "Parking";
        if (lower.includes("amenities")) return "Amenities";
        return "Other";
      };

      // 2. Photos array array structure structure matching dynamic step definitions
      const formattedPhotosArray = VERIFICATION_STEPS.map((step, idx) => {
        const urlLink = verifiedImages[step.id];
        return {
          view: mapLabelToBackendEnum(step.label),
          fileKey: urlLink,
          isCoverImage: idx === 0
        };
      });

      // 🎯 PIPELINE STEP A: Pehle Standard Step-4 call se sari photos register/save karwao
      const step4Url = `https://kmaglobalproperty.com/api/backend/property/step-4`;

      const saveResponse = await fetch(step4Url, {
        method: "POST", // Strict POST required for registration
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}` 
        },
        body: JSON.stringify({
          propertyId: propertyId, // Request body dynamic DTO wrap encapsulation
          photos: formattedPhotosArray
        }),
      });

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(`Step-4 Data Save Failed: ${errorText}`);
      }

      // 🎯 PIPELINE STEP B: Swagger bulk-approve endpoint se ek hi baar me sari photos status Approved mark karvao!
      // Saari verified photos ke Cloudinary/S3 URLs ka array ready kar rahe hain pure arrays lookup ke liye
      const allVerifiedFileKeys = VERIFICATION_STEPS
        .filter(step => verifiedImages[step.id])
        .map(step => verifiedImages[step.id]);

      if (allVerifiedFileKeys.length > 0) {
        const bulkApproveUrl = `https://kmaglobalproperty.com/api/backend/admin/properties/${propertyId}/media/bulk-approve`;

        const approveResponse = await fetch(bulkApproveUrl, {
          method: "POST", //
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeToken}` 
          },
          body: JSON.stringify({
            fileKeys: allVerifiedFileKeys // 👈 Passing string arrays matching Swagger array contract specification schema
          }),
        });

        if (!approveResponse.ok) {
          const approveErrorText = await approveResponse.text();
          console.warn("Bulk approval background warning trace:", approveErrorText);
        }
      }

      // Safe clean up parameters state logs
      localStorage.removeItem(`captured_${propertyId}`);
      localStorage.removeItem(`verified_${propertyId}`);
      
      alert("🎉 Property verified and photos successfully pushed to bulk approval pipeline!");
      router.push(`/verify-property/${propertyId}/thank-you`);

    } catch (error: any) {
      alert(`🚨 Submission Failure:\n${error?.message || "Format Payload Discrepancy"}`);
    } finally {
      setIsUploading(false);
    }
  };
  const isAllStepsCompleted = VERIFICATION_STEPS.every((step) => verifiedImages[step.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 max-w-md mx-auto relative pb-24">
         <header className="bg-white px-4 py-3.5 border-b border-gray-100 flex justify-center items-center sticky top-0 z-50">
        <Image
          src="/assets/kma_logo_blue.png"
          width={100}
          height={35}
          alt="logo"
          style={{ height: "38px" }}
        />
      </header>
       <Image
          src={"/assets/capture_screen.jpg"}
          height={300}
          width={300}
          alt="capture"
          className="mx-auto w-full"
        />
      <div className="flex items-center gap-3 bg-white -mx-4 px-4 sticky top-0 z-10">
        {/* <button onClick={() => router.back()} className="p-1">
          <X className="w-6 h-6 text-gray-700" />
        </button> */}
        <div>
          {/* 🎯 HEADER RENDERING PARSED STRAIGHT FROM YOUR DATA OBJECT */}
          <h1 className="text-lg font-bold text-gray-900 capitalize">
            {(propertyObj?.propertyType?.name || "Property")} Verification
          </h1>
          <p className="text-xs text-gray-500 capitalize">
            {(propertyObj?.category?.name || "Residential")}
          </p>
        </div>
      </div>

      {isCameraActive && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between">
          <div className="flex justify-between items-center p-4 text-white">
            <p className="text-sm font-medium">Capturing: {VERIFICATION_STEPS.find(s => s.id === activeStepId)?.label}</p>
            <button onClick={stopCamera} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative flex-1 bg-neutral-900 flex items-center justify-center overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
          <div className="p-8 bg-black flex justify-center items-center">
            <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white bg-white/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white" />
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Accordion Layout Loops (STYLING INTACT) */}
      <div className="mt-6 space-y-3">
        {VERIFICATION_STEPS.map((step, index) => {
          const isCurrentOpen = openAccordionIdx === index;
          const isCompleted = !!verifiedImages[step.id];
          const currentPreview = capturedImages[step.id];

          return (
            <div
              key={step.id}
              className={`border rounded-2xl overflow-hidden bg-white transition-all ${
                isCurrentOpen ? "ring-1 ring-black border-transparent" : "border-gray-200"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenAccordionIdx(isCurrentOpen ? null : index)}
                className="w-full flex items-center justify-between p-4 bg-white text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-50 text-gray-700">
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Camera className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                    <p className="text-xs text-gray-500">{isCompleted ? "Verified by AI" : "Verification pending"}</p>
                  </div>
                </div>
                {isCurrentOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
              </button>

              {isCurrentOpen && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  {currentPreview ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-4 group">
                      <Image src={currentPreview} alt={step.label} fill className="object-cover" />
                      {isVerifying && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-white" />
                          <p className="text-xs font-medium animate-pulse">AI is analyzing</p>
                        </div>
                      )}
                      {!isVerifying && (
                        <button
                          onClick={() => startCamera(step.id)}
                          className="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm transition-all shadow-md"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Retake
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => startCamera(step.id)}
                      className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 bg-white hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <div className="p-3 bg-gray-50 rounded-full text-gray-400 group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-white bg-blue p-2 rounded-xl">Open Camera</span>
                    </button>
                  )}

                  {index < VERIFICATION_STEPS.length - 1 && (
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => handleNextStep(index)}
                        disabled={isVerifying}
                        className="text-xs font-bold text-black flex items-center gap-1 py-1 px-3 bg-white border rounded-full shadow-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isVerifying ? (
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
    </div>
  );
}