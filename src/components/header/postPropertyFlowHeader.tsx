"use client";

import Image from "next/image";

export default function PostPropertyFlowHeader() {
  return (
    <div className="sticky top-0 z-50 w-full flex justify-center">
      <div className="w-[90%] mx-auto max-w-[1440px]">
        <div className="rounded-[200px] h-[50px] 2md:h-[63px] px-4 lg:px-7 pt-[4px] flex justify-between items-center border border-[#FFFFFF1F] bg-blue shadow-xl">
          <a
            href="/api/redirect-to-buyer?path=/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-1.5 shrink-0 cursor-pointer"
          >
            <Image
              src="/assets/kma-logo-white.svg"
              width={100}
              height={35}
              alt="logo"
              className="w-[80px] h-[33px] 2md:w-[100px] 2md:h-[38px]"
            />
          </a>

          <a
            href="/api/redirect-to-buyer?path=/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-100 text-xs sm:text-sm cursor-pointer px-2 py-1 rounded-full hover:bg-white/10 transition-colors duration-200"
          >
            <Image src="/assets/home-white.svg" width={14} height={14} alt="home" />
            <span>Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}
