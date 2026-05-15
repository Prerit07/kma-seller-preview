"use client";

import { clearAuthCookies } from "@/lib/helper";
import { USER_TYPE } from "@/lib/enums";
import {
  getActivityCountsApiHandler,
  UserLogoutApiHandler,
  UserLogoutResponse,
  userProfileApiHandler,
  UserProfileResponse,
} from "@/services/userService";
import { useSessionStore } from "@/store/useSessionStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useMemo } from "react";
import { toast } from "react-toastify";

type ProfileViewProps = {
  userRole?: string | null;
};

type MenuItem = {
  label: string;
  icon: string;
  count?: number;
  route?: string;
};

const baseUrl = process.env.NEXT_PUBLIC_AWS_URL ?? "";

// Seller-only items (shown for OWNER and CHANNEL_PARTNER)
const SELLER_MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", icon: "/assets/home-white.svg", route: "/user-dashboard" },
  { label: "My Listings", icon: "/assets/service-blue.svg", route: "/my-listing" },
  { label: "Leads", icon: "/assets/home-contact-blue.svg", route: "/lead-summary/list" },
];

// Common items for all logged-in users
const COMMON_MENU_BASE: MenuItem[] = [
  { label: "Recently Search", icon: "/assets/home-search-blue.svg", route: "/recently-viewed?tab=recentSearch" },
  { label: "Recently Viewed", icon: "/assets/home-recent-blue.svg", route: "/recently-viewed?tab=recentlyViewed" },
  { label: "Saved Properties", icon: "/assets/home-save-blue.svg", route: "/recently-viewed?tab=saved" },
  { label: "Contacted Properties", icon: "/assets/home-contact-blue.svg", route: "/recently-viewed?tab=contacted" },
  { label: "My Reviews (New)", icon: "/assets/review-blue.svg", route: "/profile" },
  { label: "Refer And Earn", icon: "/assets/refer-earn-blue.svg", route: "/refer-and-earn" },
  { label: "Help", icon: "/assets/help-blue.svg", route: "/help-center" },
];

const GUEST_MENU_BASE: MenuItem[] = [
  { label: "Recently Search", icon: "/assets/home-search-blue.svg", route: "/recently-viewed?tab=recentSearch" },
  { label: "Recently Viewed", icon: "/assets/home-recent-blue.svg", route: "/recently-viewed?tab=recentlyViewed" },
  { label: "Saved Properties", icon: "/assets/home-save-blue.svg", route: "/recently-viewed?tab=saved" },
  { label: "Contacted Properties", icon: "/assets/home-contact-blue.svg", route: "/recently-viewed?tab=contacted" },
  { label: "My Reviews (New)", icon: "/assets/review-blue.svg", route: "/profile" },
  { label: "Refer And Earn", icon: "/assets/refer-earn-blue.svg", route: "/refer-and-earn" },
  { label: "Help", icon: "/assets/help-blue.svg", route: "/help-center" },
];

function CountBadge({ count }: { count?: number }) {
  if (typeof count !== "number") return null;

  return (
    <span className="min-w-[18px] h-[18px] rounded-full bg-[#EEF2FF] text-[#3538CD] text-[11px] font-medium leading-[18px] px-1 text-center">
      {count}
    </span>
  );
}

function MenuRow({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left rounded-lg hover:bg-[#F7F8FC] transition-colors duration-200"
      type="button"
    >
      <span className="flex items-center gap-2.5">
        <Image src={item.icon} width={18} height={18} alt={item.label} className="w-[18px] h-[18px]" />
        <span className="text-sm text-[#202939]">{item.label}</span>
      </span>
      <CountBadge count={item.count} />
    </button>
  );
}

const ACTIVITY_COUNT_KEYS = [
  "recentlySearch",
  "recentlyViewed",
  "savedProperties",
  "contactedProperties",
] as const;

export default function ProfileView({ userRole }: ProfileViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isLoggedIn = Boolean(userRole);
  const sessionId = useSessionStore((state) => state.sessionId);

  const { data: profileResponse } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async (): Promise<UserProfileResponse> => userProfileApiHandler(),
    enabled: isLoggedIn,
    staleTime: 60 * 1000,
  });
  const user = profileResponse?.user;

  const { data: activityCounts } = useQuery({
    queryKey: ["end-user-activity-counts", isLoggedIn, sessionId ?? null],
    queryFn: () => getActivityCountsApiHandler(isLoggedIn ? undefined : sessionId ?? undefined),
    staleTime: 60 * 1000,
  });

  const { mutate: handleLogoutApi, isPending } = useMutation({
    mutationFn: async (): Promise<UserLogoutResponse> => {
      return await UserLogoutApiHandler();
    },
    onSuccess: async () => {
      localStorage.clear();
      await clearAuthCookies();
      queryClient.clear();
      router.replace("/");
    },
    onError: async () => {
      // Even if logout API fails (401/token expired), still clear local state and redirect
      localStorage.clear();
      await clearAuthCookies();
      queryClient.clear();
      router.replace("/");
    },
  });

  const isSeller = userRole === USER_TYPE.CHANNEL_PARTNER || userRole === USER_TYPE.OWNER;

  const menuItems = useMemo(() => {
    if (!isLoggedIn) {
      const base = GUEST_MENU_BASE;
      if (!activityCounts) return base;
      return base.map((item, index) => {
        const key = ACTIVITY_COUNT_KEYS[index];
        const count = key ? activityCounts[key] : undefined;
        return { ...item, count };
      });
    }
    // For sellers, prepend seller-specific items
    const base = isSeller ? [...SELLER_MENU_ITEMS, ...COMMON_MENU_BASE] : COMMON_MENU_BASE;
    if (!activityCounts) return base;
    const sellerOffset = isSeller ? SELLER_MENU_ITEMS.length : 0;
    return base.map((item, index) => {
      const commonIndex = index - sellerOffset;
      const key = commonIndex >= 0 ? ACTIVITY_COUNT_KEYS[commonIndex] : undefined;
      const count = key ? activityCounts[key] : undefined;
      return { ...item, count };
    });
  }, [isLoggedIn, isSeller, activityCounts]);
  const profileImage =
    user?.profileImage && /^https?:\/\//.test(user.profileImage)
      ? user.profileImage
      : user?.profileImage
        ? `${baseUrl}${user.profileImage}`
        : "/assets/profile.png";

  const navigateToLogin = () => {
    router.push("/user-flow?isLogin=true");
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.route) {
      router.push(item.route);
      return;
    }
    if (!isLoggedIn) {
      navigateToLogin();
    }
  };

  return (
    <div className="w-[320px] sm:w-[340px]">
      <div className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_14px_38px_rgba(15,23,42,0.08)] p-4">
        {isLoggedIn ? (
          <div className="flex items-center justify-between rounded-[14px] bg-[#F8FAFC] px-3 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Image
                src={profileImage}
                width={42}
                height={42}
                alt="user profile"
                className="w-[42px] h-[42px] rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="text-[15px] leading-5 font-semibold text-[#101828] truncate">{user?.name || "User"}</p>
                <p className="text-xs leading-4 text-[#667085] truncate">{user?.phone ? (user.phone.startsWith('+') ? user.phone : `+91 ${user.phone}`) : ""}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="flex items-center gap-1 text-[#475467] hover:text-blue text-sm font-medium shrink-0"
            >
              <Image src="/assets/edit-blue.svg" width={14} height={14} alt="edit profile" className="w-[14px] h-[14px]" />
              Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-[14px] bg-[#F8FAFC] px-3 py-3">
            <div className="flex items-center gap-2.5">
              <span className="w-[42px] h-[42px] rounded-full bg-white border border-[#EAECF0] flex items-center justify-center">
                <Image src="/assets/profile.png" width={24} height={24} alt="guest profile" className="w-6 h-6 rounded-full" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-[#101828]">Hello</p>
                <div className="flex items-center gap-1">
                  <Image src="/assets/check-arrow-transparent.svg" width={12} height={12} alt="check" className="w-3 h-3" />
                  <p className="text-xs text-[#667085]">Easy contact with sellers</p>
                </div>
                <div className="flex items-center gap-1">
                  <Image src="/assets/check-arrow-transparent.svg" width={12} height={12} alt="check" className="w-3 h-3" />
                  <p className="text-xs text-[#667085]">Personalized experience</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={navigateToLogin}
              className="h-9 px-5 rounded-full bg-blue text-white text-sm font-medium hover:opacity-95"
            >
              Login
            </button>
          </div>
        )}

        <div className="mt-3 flex flex-col gap-2">
          {menuItems.map((item) => (
            <MenuRow key={item.label} item={item} onClick={() => handleMenuClick(item)} />
          ))}
        </div>

        {isLoggedIn && (
          <button
            type="button"
            onClick={() => handleLogoutApi()}
            disabled={isPending}
            className="mt-4 h-11 w-full rounded-full bg-blue text-white text-sm font-medium hover:opacity-95 disabled:opacity-70"
          >
            {isPending ? "Logging out..." : "Logout"}
          </button>
        )}
      </div>
    </div>
  );
}