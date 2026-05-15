import axios, { AxiosResponse } from "axios";
import { axiosInstance } from "./axiosService";
import { ListType, UserType } from "@/types/user";

export interface OtpPayload {
    phone: string;
    role?: string;
}

export interface SendOtpResponse {
  message: string;
  success: string;
  otp: string
}


export const sendSignUpOtpApiHandler = async (
  payload: OtpPayload
): Promise<SendOtpResponse> => {
  try {
    const response = await axiosInstance.post<SendOtpResponse>(
      "users/signup/send-otp",
      payload
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export const sendSignInOtpApiHandler = async (
  payload: OtpPayload
): Promise<SendOtpResponse> => {
  try {
    const response = await axiosInstance.post<SendOtpResponse>(
      "users/login/send-otp",
      payload
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export interface ValidateOtpPayload {
    phone: string;
    otp: string;
    role?: UserType
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserType
  isActive: boolean;
  channelPartnerCode?: string | null;
}

export interface ValidateOtpResponse {
  success: boolean;
  message: string;
  requiredOtherDetails: boolean;
  userId: string;
  accessToken: string;
  refreshToken: string;
  user: User;
  propertyCount: number;
  kycCompleted: boolean;
  hasReachedListingLimit: boolean
}

export const validateOtpApiHandler = async (payload: ValidateOtpPayload) : Promise<ValidateOtpResponse> => {
    try{
        const response = await axiosInstance.post<ValidateOtpResponse>(
      "users/validate-otp",
      payload
    );

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export const resendOtpApiHandler = async (payload: OtpPayload) : Promise<SendOtpResponse> => {
    try{
        const response = await axiosInstance.post<SendOtpResponse>(
      "users/resend-otp",
      payload
    );

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface CreateOwnerPayload {
    name: string;
    email: string;
    phone: string;
    intent: ListType;
    profilePhotoUrl?: string;
}

export interface CreateOwnerResponse {
  success: boolean;
  message: string;
  userId: string;
  user: User;
}

export const createOwnerApiHandler = async (payload: CreateOwnerPayload) : Promise<CreateOwnerResponse> => {
    try{
        const response = await axiosInstance.post<CreateOwnerResponse>(
      "users/create-owner",
      payload
    );

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface CreateChannelPartnerPayload {
    name: string;
    email: string;
    phone: string;
    firmName: string;
    businessSince: string;
    cities: string;
    aboutYourSelf: string;
    intent: ListType;
    profilePhotoUrl?: string;
}

export const createChannelPartnerApiHandler = async (payload: CreateChannelPartnerPayload) : Promise<CreateOwnerResponse> => {
    try{
        const response = await axiosInstance.post<CreateOwnerResponse>(
      "users/create-channel-partner",
      payload
    );

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}
// ── End-User Auth ────────────────────────────────────────────────────

export interface EndUserSignupPayload {
  name: string;
  email: string;
  phone: string;
}

export interface EndUserSignupResponse {
  success: boolean;
  message: string;
  phone: string;
  otp?: string;
}

export const sendEndUserSignupOtpApiHandler = async (
  payload: EndUserSignupPayload
): Promise<EndUserSignupResponse> => {
  try {
    const response = await axiosInstance.post<EndUserSignupResponse>(
      "end-user/signup",
      payload
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export interface EndUserVerifyOtpPayload {
  name: string;
  email: string;
  phone: string;
  otp: string;
}

export const verifyEndUserSignupOtpApiHandler = async (
  payload: EndUserVerifyOtpPayload
): Promise<ValidateOtpResponse> => {
  try {
    const sessionId = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("kma-end-user-session") || "{}")?.state?.sessionId
      : null;
    const response = await axiosInstance.post<ValidateOtpResponse>(
      "end-user/verify-otp",
      payload,
      sessionId ? { headers: { "X-Session-Id": sessionId } } : undefined
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export interface EndUserLoginPayload {
  phone: string;
}

export const sendEndUserLoginOtpApiHandler = async (
  payload: EndUserLoginPayload
): Promise<EndUserSignupResponse> => {
  try {
    const response = await axiosInstance.post<EndUserSignupResponse>(
      "end-user/login",
      payload
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export interface EndUserVerifyLoginOtpPayload {
  phone: string;
  otp: string;
}

export const verifyEndUserLoginOtpApiHandler = async (
  payload: EndUserVerifyLoginOtpPayload
): Promise<ValidateOtpResponse> => {
  try {
    const sessionId = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("kma-end-user-session") || "{}")?.state?.sessionId
      : null;
    const response = await axiosInstance.post<ValidateOtpResponse>(
      "end-user/verify-login-otp",
      payload,
      sessionId ? { headers: { "X-Session-Id": sessionId } } : undefined
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export const handleRefreshToken = async (): Promise<string | null> => {
  // const refreshToken = localStorage.getItem("refreshToken");
   const res = await fetch("/api/get-token");
    const { refreshToken } = await res.json();
  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/users/refresh-token`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const newAccessToken = response?.data?.accessToken;

    if (newAccessToken) {
      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};
