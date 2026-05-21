"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PropertyThankYouPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col justify-between font-sans antialiased relative overflow-hidden">
      
      {/* Header with KMA Logo matching main screen layout */}
      <header className="bg-white px-4 py-3.5 border-b border-gray-100 flex justify-center items-center sticky top-0 z-50">
        <Image
          src="/assets/kma_logo_blue.png"
          width={100}
          height={35}
          alt="KMA Logo"
          style={{ height: "38px" }}
        />
      </header>

      {/* Main Container Card Area */}
      <main className="max-w-md mx-auto w-full px-6 flex flex-col flex-1 justify-center items-center text-center gap-6">
        
        {/* Verification Success Box Card Layout */}
        <div className="w-full bg-[#F3F3FF]/40 border border-[#8A73DB]/20 rounded-3xl p-8 shadow-xs space-y-5 animate-fadeIn">
          
          {/* Animated Green Check Badge Center Block */}
          <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border border-green-100 shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-[#33AB41]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#010048] tracking-tight">
              Property Verification Completed
            </h1>
          </div>

          {/* Reference Property Tag details badge */}
          {propertyId && (
            <div className="inline-block bg-white border border-gray-100 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-[#8A73DB] tracking-wide">
              ID: {propertyId.toUpperCase()}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full text-white font-semibold text-sm py-4 rounded-full bg-[#010048] hover:bg-opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          Back to Dashboard <ArrowRight className="w-4 h-4" />
        </button>

      </main>

      {/* Footer Go to Home Action Button fixed layout */}
      <footer className="max-w-md mx-auto w-full px-4 pb-8 pt-2">
        {/* <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full text-white font-semibold text-sm py-4 rounded-full bg-[#010048] hover:bg-opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          Back to Dashboard <ArrowRight className="w-4 h-4" />
        </button> */}
      </footer>

    </div>
  );
}