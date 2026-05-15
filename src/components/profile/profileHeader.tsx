"use client";

import UserHeader from "@/components/header/userHeader";

export default function ProfileHeader() {
  return (
    <div className="sticky top-0 z-50 w-full flex justify-center">
      <UserHeader />
    </div>
  );
}
