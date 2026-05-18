'use client';

import * as React from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, ShieldCheck, Camera, CheckCircle2 } from "lucide-react";

export default function MobilePropertyVerifyLanding() {
  const params = useParams();
  const router = useRouter();
  
  const propertyId = params.id; 

  const [propertyName, setPropertyName] = useState("Loading dynamic asset...");
  const [propertyAddress, setPropertyAddress] = useState("Loading verified coordinates...");
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showCameraPopup, setShowCameraPopup] = useState(false);

  React.useEffect(() => {
    if (!propertyId) return;

    const fetchPropertyData = async () => {
      try {
        setIsFetching(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/end-user/properties/${propertyId}`);
        const data = await response.json();

        if (data?.success && data?.property) {
          setPropertyName(data.property.propertyName || data.property.societyName || "KMA Premium Asset");
          
          const fullAddress = `${data.property.societyName || ""}, ${data.property.localityName || ""}, ${data.property.cityName || ""}`;
          setPropertyAddress(fullAddress.replace(/^,\s*/, "") || "Address details missing");
        }
      } catch (error) {
        console.error("Error fetching property configs:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchPropertyData();
  }, [propertyId]);

  const handleContinueFlow = () => {
    if (!propertyId) return;
    setShowLocationPopup(true);
  };

  const grantLocationAccess = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("GPS Granted from Popup:", position.coords);
        setShowLocationPopup(false);
        setShowCameraPopup(true);
      },
      (error) => {
        console.error("GPS Denied:", error);
        alert("Kripya address track karne ke liye location access grant karein.");
      },
      { enableHighAccuracy: true }
    );
  };

  const grantCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      
      stream.getTracks().forEach(track => track.stop());
      console.log("Camera Access Granted from Popup");
      
      setShowCameraPopup(false);
      setIsLoading(true);

      router.push(`/verify-property/${propertyId}/permissions`);
    } catch (error) {
      console.error("Camera Denied:", error);
      alert("On-site verification ke liye camera permissions active hona mandatory hai.");
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col justify-between font-sans antialiased relative">
      
      <header className="bg-white sticky top-0 z-50 px-4 py-3.5">
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/assets/kma_logo_blue.png"
            width={100}
            height={35}
            alt="logo"
            style={{ height: "38px" }}
          />
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-5 py-6 flex flex-col justify-between">
        <div className="w-full flex flex-col items-center justify-center text-center gap-3 py-6">
          {/* Green Circle Check Mark */}
          <div className="w-[100px] h-[100px] bg-[#33AB41] text-white rounded-full flex items-center justify-center shadow-md">
            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="space-y-0.5 w-full">
            <h5 className="text-[20px] font-semibold text-[#010048]">Self-verify your property</h5>
          </div>
        </div>
        
        <div className="space-y-6 w-full">
          <div className="bg-[#F3F3FF] border border-[#8A73DB] rounded-2xl p-4 shadow-sm space-y-4 relative overflow-hidden">
            {isFetching ? (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-[#8A73DB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex items-start gap-3 pl-1">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-extrabold text-black uppercase tracking-wider mb-1">
                    {propertyName}
                  </h2>
                  <p className="text-md font-bold text-[#0D1520] leading-snug">
                    {propertyAddress}
                  </p>
                  <span className="text-[10px] text-gray-400 block font-mono pt-1">
                    ID: {propertyId || "Loading dynamic asset token..."}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 items-center gap-6 md:gap-4 max-w-[850px] mx-auto py-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <Image src="/assets/visitProperty.png" fill className="object-contain" alt="Visit the property" />
            </div>
            <p className="text-sm text-[#585858]">Visit the property</p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <Image src="/assets/copyLink.png" fill className="object-contain" alt="Open link shared on your mobile" />
            </div>
            <p className="text-sm text-[#585858]">Open link shared on your mobile</p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <Image src="/assets/submitPhoto.png" fill className="object-contain" alt="Click and upload photos" />
            </div>
            <p className="text-sm text-[#585858]">Click and upload photos</p>
          </div>
        </div>

        <div className="w-full mt-10 space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium"></div>
          
          <button
            type="button"
            onClick={handleContinueFlow}
            disabled={isLoading || isFetching || !propertyId}
            className={`w-full text-white font-semibold text-sm py-3.5 rounded-full transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
              isLoading || isFetching || !propertyId 
                ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-[#010048] hover:bg-opacity-90'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Continue"
            )}
          </button>
        </div>

      </main>

      {showLocationPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-[9999] px-6">
          <div className="bg-white max-w-xs w-full rounded-2xl p-5 shadow-2xl border border-gray-100 text-center flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center">
              {/* <MapPin className="w-6 h-6 stroke-[2]" /> */}
              <Image src={"/assets/location_access.png"} width={140} height={140} alt="pic_location"/>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-black">Location Access</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                We need location access to verify property’s location
              </p>
            </div>
            <div className="flex w-full gap-2.5 pt-1.5">
              {/* <button
                type="button"
                onClick={() => setShowLocationPopup(false)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
              >
                Block
              </button> */}
              <button
                type="button"
                onClick={grantLocationAccess}
                className="flex-1 py-3.5 text-sm font-bold text-white bg-[#7048FF] hover:bg-opacity-95 rounded-full shadow-sm transition-all cursor-pointer"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📷 POPUP 2: Camera Permission Overlay */}
      {showCameraPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-[9999] px-6">
          <div className="bg-white max-w-xs w-full rounded-2xl p-5 shadow-2xl border border-gray-100 text-center flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center">
              {/* <Camera className="w-6 h-6 stroke-[2]" /> */}
              <div className="flex items-center justify-center">
              {/* <MapPin className="w-6 h-6 stroke-[2]" /> */}
              <Image src={"/assets/camera_access.png"} width={170} height={170} alt="pic_location"/>
            </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-black">Camera Access</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                We need camera access to click live property photos
              </p>
            </div>
            <div className="flex w-full gap-2.5 pt-1.5">
              {/* <button
                type="button"
                onClick={() => setShowCameraPopup(false)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
              >
                Deny
              </button> */}
              <button
                type="button"
                onClick={grantCameraAccess}
                className="flex-1 py-3.5 text-sm font-bold text-white bg-[#7048FF] hover:bg-opacity-95 rounded-full shadow-sm transition-all cursor-pointer"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center py-4 bg-white border-t border-gray-100 text-[10px] text-gray-400 font-medium">
        &copy; {new Date().getFullYear()} KMA Global Properties
      </footer>
    </div>
  );
}