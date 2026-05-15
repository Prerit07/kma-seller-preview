"use client";

import { clearAuthCookies } from "@/lib/helper";
import {
  userProfileApiHandler,
  UserProfileResponse,
  UserProfileUpdatePayload,
  userProfileUpdateApiHandler,
  UserLogoutApiHandler,
  UserLogoutResponse,
} from "@/services/userService";
import type { user } from "@/services/userService";
import {
  getFileUploadUrlApiHandler,
  GetFileUploadUrlResponse,
  uploadFileToS3ApiHandler,
} from "@/services/masterService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import MyActivityScreen from "./myActivityScreen";
import MyReviewsScreen from "./myReviewsScreen";
import ImageUpload from "../common/upload";

type ProfileTab = "activity" | "reviews" | "edit";

const inputClassName =
  "h-[42px] w-full rounded-full border border-border bg-white px-4 text-sm text-text-black outline-none placeholder:text-text-gray/80 focus:border-blue";

const baseUrl = process.env.NEXT_PUBLIC_AWS_URL ?? "";

function getProfileImageUrl(profileImage: string | null | undefined): string {
  if (!profileImage) return "/assets/profile.png";
  if (/^https?:\/\//.test(profileImage)) return profileImage;
  return `${baseUrl}${profileImage}`;
}

function getInitials(name: string | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface EditProfileContentProps {
  user: user;
  onSuccess: () => void;
}

function EditProfileContent({ user, onSuccess }: EditProfileContentProps) {
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [city, setCity] = useState(user.city ?? "");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setCity(user.city ?? "");
  }, [user]);

  useEffect(() => {
    return () => {
      if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
    };
  }, [profilePreviewUrl]);

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (payload: UserProfileUpdatePayload) => userProfileUpdateApiHandler(payload),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setProfilePhotoFile(null);
      setProfilePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      onSuccess();
    },
    onError: (error: unknown) => {
      const err = error as { message?: string | string[] };
      const msg = Array.isArray(err?.message) ? err.message.join(", ") : err?.message ?? "Failed to update profile";
      toast.error(msg);
    },
  });

  const { mutateAsync: getFileUrl } = useMutation({
    mutationFn: (payload: { contentType: string; filename: string; expiresIn: number; folder: string }) =>
      getFileUploadUrlApiHandler(payload),
    onError: (error: unknown) => {
      const err = error as { message?: string | string[] };
      toast.error(Array.isArray(err?.message) ? err.message.join(", ") : err?.message ?? "Failed to get upload URL");
    },
  });

  const { mutateAsync: uploadToS3 } = useMutation({
    mutationFn: uploadFileToS3ApiHandler,
    onError: (error: unknown) => {
      const err = error as { message?: string | string[] };
      toast.error(Array.isArray(err?.message) ? err.message.join(", ") : err?.message ?? "Failed to upload image");
    },
  });

  const handleProfilePhotoSelect = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setProfilePhotoFile(file);
    setProfilePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleSave = async () => {
    const payload: UserProfileUpdatePayload = {
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      city: city.trim() || undefined,
    };

    if (profilePhotoFile) {
      try {
        const urlResponse = await getFileUrl({
          contentType: profilePhotoFile.type,
          filename: profilePhotoFile.name,
          expiresIn: 3600,
          folder: process.env.NEXT_PUBLIC_AWS_FOLDER ?? "profile",
        });
        if (!urlResponse?.success || !urlResponse.data?.url || !urlResponse.data?.key) {
          toast.error("Failed to get upload URL");
          return;
        }
        await uploadToS3({ url: urlResponse.data.url, file: profilePhotoFile });
        payload.profileImage = urlResponse.data.key;
      } catch {
        return;
      }
    }

    updateProfile(payload);
  };

  const displayImageSrc = profilePreviewUrl ?? getProfileImageUrl(user.profileImage);

  return (
    <div className="rounded-xl bg-white p-4 sm:p-5">
      <h2 className="text-[30px] font-semibold leading-none text-text-black">Edit Profile</h2>

      <div className="mt-6 flex flex-col gap-8">
        <div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex shrink-0 flex-col items-center gap-3">
              <div className="relative flex h-[78px] w-[78px] overflow-hidden rounded-full bg-light-purple text-xl font-semibold text-blue">
                <Image
                  src={displayImageSrc}
                  width={78}
                  height={78}
                  alt="Profile"
                  className="object-cover"
                  unoptimized={!!profilePreviewUrl}
                />
              </div>
              <div className="w-full max-w-[200px]">
                <ImageUpload
                  onUpload={handleProfilePhotoSelect}
                  type="photo"
                  accept="image/jpeg, image/jpg, image/png"
                  label="Change photo"
                  subLabel="PNG, JPG up to 20 MB"
                />
              </div>
            </div>
            <div className="w-full max-w-[520px] flex-1 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-black">Name</label>
                <input
                  className={inputClassName}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-black">Email</label>
                <input
                  className={inputClassName}
                  placeholder="Enter your email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-black">City</label>
                <input
                  className={inputClassName}
                  placeholder="Enter your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-start sm:justify-end sm:pr-[40px]">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="animated-button px-8 py-2.5 text-sm disabled:opacity-70"
            >
              <span className="relative">{isPending ? "Saving..." : "Save changes"}</span>
            </button>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-[30px] font-semibold leading-none text-text-black">Mobile Number</h3>
          <p className="mt-2 text-sm text-text-gray">{user.phone?.startsWith('+') ? user.phone : `+91 ${user.phone}`}</p>
          <p className="mt-1 text-xs text-text-gray">Contact support to change your mobile number.</p>
        </div>
      </div>
    </div>
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProfileTab>("activity");

  const { data: tokenData, isPending: tokenPending } = useQuery({
    queryKey: ["client-access-token"],
    queryFn: async () => {
      const res = await fetch("/api/get-token");
      return res.json() as Promise<{ accessToken?: string | null }>;
    },
    staleTime: 60_000,
  });
  const isLoggedIn = Boolean(tokenData?.accessToken);

  const { data: profileResponse, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async (): Promise<UserProfileResponse> => userProfileApiHandler(),
    staleTime: 60 * 1000,
    enabled: isLoggedIn,
  });
  const user = profileResponse?.user;

  useEffect(() => {
    if (!isLoggedIn && activeTab === "edit") {
      setActiveTab("activity");
    }
  }, [isLoggedIn, activeTab]);

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

  const renderContent = () => {
    if (activeTab === "activity") return <MyActivityScreen />;
    if (activeTab === "reviews") return <MyReviewsScreen fetchEnabled={isLoggedIn} />;
    if (user) return <EditProfileContent user={user} onSuccess={() => refetchProfile()} />;
    return null;
  };

  return (
    <section className="w-full rounded-2xl bg-[#F5F5F5] p-3 sm:p-5 lg:p-6 shadow-[0_8px_30px_rgba(17,24,39,0.08)]">
      <div className="flex flex-col gap-5 lg:flex-row">
        <aside className="w-full rounded-2xl bg-[#EFEFEF] p-4 lg:w-[240px]">
          <div className="flex flex-col items-center border-b border-border pb-5">
            {tokenPending || (isLoggedIn && profileLoading) ? (
              <div className="flex h-[78px] w-[78px] animate-pulse items-center justify-center rounded-full bg-white shadow-sm" />
            ) : (
              <div className="flex h-[78px] w-[78px] overflow-hidden rounded-full bg-white text-lg font-semibold text-text-black shadow-sm">
                {!isLoggedIn ? (
                  <Image src="/assets/profile.png" width={78} height={78} alt="Profile" className="object-cover" />
                ) : user?.profileImage ? (
                  <Image
                    src={getProfileImageUrl(user.profileImage)}
                    width={78}
                    height={78}
                    alt="Profile"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-light-purple text-blue">
                    {getInitials(user?.name)}
                  </span>
                )}
              </div>
            )}
            <p className="mt-3 text-sm font-medium text-text-black">
              {tokenPending || (isLoggedIn && profileLoading) ? "..." : !isLoggedIn ? "Guest" : user?.name ?? "User"}
            </p>
            <p className="mt-1 text-xs text-text-gray">
              {isLoggedIn && user?.phone ? (user.phone.startsWith("+") ? user.phone : `+91 ${user.phone}`) : ""}
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setActiveTab("activity")}
              className={`relative flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-left text-sm transition ${
                activeTab === "activity"
                  ? "bg-white font-medium text-blue shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                  : "text-text-black hover:bg-white/70"
              }`}
            >
              {activeTab === "activity" ? (
                <span className="absolute -left-4 top-2.5 h-5 w-[2.5px] rounded-r-sm bg-blue" />
              ) : null}
              <span>My Activity</span>
              <Image src="/assets/right-arrow-blue.svg" width={12} height={12} alt="open activity" />
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`relative mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm transition ${
                activeTab === "reviews"
                  ? "bg-white font-medium text-blue shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                  : "text-text-black hover:bg-white/70"
              }`}
            >
              {activeTab === "reviews" ? (
                <span className="absolute -left-4 top-2.5 h-5 w-[2.5px] rounded-r-sm bg-blue" />
              ) : null}
              <Image src="/assets/review-blue.svg" width={14} height={14} alt="reviews" />
              <span>My Reviews</span>
            </button>

            {isLoggedIn && (
              <div className="mt-3 border-t border-border pt-3">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`relative flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm transition ${
                    activeTab === "edit"
                      ? "bg-white font-medium text-blue shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                      : "text-text-black hover:bg-white/70"
                  }`}
                >
                  {activeTab === "edit" ? (
                    <span className="absolute -left-4 top-2.5 h-5 w-[2.5px] rounded-r-sm bg-blue" />
                  ) : null}
                  <Image src="/assets/edit-pen-blue.svg" width={14} height={14} alt="edit profile" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>

          {isLoggedIn && (
            <button
              type="button"
              onClick={() => handleLogoutApi()}
              disabled={isPending}
              className="mt-7 flex h-[42px] w-full items-center justify-center rounded-lg border border-border bg-white text-sm font-medium text-text-black transition hover:bg-[#F9FAFB] disabled:opacity-70"
            >
              {isPending ? "Logging out..." : "Logout"}
            </button>
          )}
        </aside>

        <div className="flex-1">{renderContent()}</div>
      </div>
    </section>
  );
}
