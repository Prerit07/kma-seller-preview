"use client";

import { useEffect, useState } from "react";
import EditProfileScreen from "@/components/profile/editProfileScreen";
import UserProfile from "@/components/profile/index";
import CopyRightFooter from "@/components/footer/copyrightFooter";
import ProfileHeader from "@/components/profile/profileHeader";
import { USER_TYPE } from "@/lib/enums";

export default function Profile() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        setRole(parsed.role ?? null);
      }
    } catch {
      // ignore
    }
  }, []);

  const isSeller = role === USER_TYPE.OWNER || role === USER_TYPE.CHANNEL_PARTNER;

  return (
    <div>
      <div className="relative min-h-[calc(100dvh-10dvh)] md:min-h-[calc(100dvh-7dvh)] bg-list-background">
        <div className="absolute left-0 top-0 h-[330px] w-full rounded-b-[25px] bg-blue sm:rounded-b-[60px] lg:rounded-b-[80px] xl:rounded-b-[100px]" />
        <ProfileHeader />
        
        <div className="relative z-10 flex justify-center px-4 pb-8 pt-[7.2rem] sm:px-6 lg:pt-[8.8rem]">
          <div className="w-full max-w-[1100px]">
            {isSeller ? <UserProfile /> : <EditProfileScreen />}
          </div>
        </div>
      </div>
      <CopyRightFooter />
    </div>
  );
}
