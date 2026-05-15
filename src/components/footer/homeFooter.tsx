"use client";
import Image from "next/image";
import { useSelector } from "react-redux";
import { getAboutusData } from "@/store/homeHeaderSlice";

export default function HomeFooter() {
  const aboutusData = useSelector(getAboutusData);
  const currentYear = new Date().getFullYear();

  const {
    fbLink = "",
    twitterLink = "",
    youtubeLink = "",
    instagramLink = "",
  } = aboutusData || {};

  return (
    <footer className="bg-[#0a0a2e] w-full flex justify-center">
      <div className="w-[90%] md:w-[75%] py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-white">
        <p className="text-center md:text-left">
          Copyright &copy; {currentYear} KMA. All Rights Reserved.
        </p>

        <div className="flex items-center justify-center md:justify-end gap-3">
          <span className="text-white/90">Social Media:</span>

          {fbLink && (
            <a
              href={fbLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition"
              aria-label="Facebook"
            >
              <Image src="/assets/footor/facebook.svg" width={14} height={14} alt="facebook" />
            </a>
          )}

          {twitterLink && (
            <a
              href={twitterLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition"
              aria-label="X"
            >
              <Image src="/assets/footor/x.svg" width={16} height={16} alt="x" />
            </a>
          )}

          {youtubeLink && (
            <a
              href={youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition"
              aria-label="YouTube"
            >
              <Image src="/assets/footor/youtube.svg" width={18} height={18} alt="youtube" />
            </a>
          )}

          {instagramLink && (
            <a
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition"
              aria-label="Instagram"
            >
              <Image src="/assets/footor/instagram.svg" width={16} height={16} alt="instagram" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
