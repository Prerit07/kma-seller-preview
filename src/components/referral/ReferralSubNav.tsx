"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/refer-and-earn", label: "Give a referral" },
  { href: "/refer-and-earn/my-referrals", label: "My referrals" },
  { href: "/refer-and-earn/my-coins", label: "My coins" },
] as const;

export default function ReferralSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 mt-6" aria-label="Referral section">
      {links.map((item) => {
        const active =
          item.href === "/refer-and-earn"
            ? pathname === "/refer-and-earn"
            : item.href === "/refer-and-earn/my-coins"
              ? pathname === "/refer-and-earn/my-coins" || pathname.startsWith("/refer-and-earn/redeem")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              active ? "bg-white text-[#1B2DBE] shadow-sm" : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
