import Image from "next/image";

export default function CopyRightFooter() {
  return (
    <div className="w-full h-[10dvh] md:h-[7dvh] items-center flex justify-center bg-text-black">
      <div className="flex md:justify-between gap-1 items-center flex-col md:flex-row w-[85%]">
        <p className="text-white text-sm text-center">Copyright  2025 KMA. All Rights Reserved.</p>
        <div className="flex flex-row justify-start items-center gap-3">
          <p className="text-white text-sm">Social Media:</p>
          <Image src='/assets/facebook-white.svg' width={12} height={20} alt="Facebook" className="w-[10px] h-[18px] md:w-[12px] md:h-[20px]"/>
          <Image src='/assets/x-white.svg' width={20} height={20} alt="X" className="w-[20px] h-[16px] md:w-[20px] md:h-[20px]"/>
          <Image src='/assets/youtube-white.svg' width={22} height={20} alt="Youtube" className="w-[20px] h-[18px] md:w-[22px] md:h-[20px]"/>
          <Image src='/assets/instagram-white.svg' width={22} height={20} alt="Instagram" className="w-[20px] h-[18px] md:w-[22px] md:h-[20px]"/>
        </div>
      </div>
    </div>
  )
  }
