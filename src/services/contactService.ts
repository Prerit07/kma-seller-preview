import axios, { AxiosResponse } from "axios";
import { axiosInstance } from "./axiosService";

export interface SubmitFormPayload {
    firstName: string;
    email: string;
    phoneNumber: string;
    message?: string;
}

export interface SubmitFormResponse {
  message: string;
  success: string;
  contactId: string
}


export const submitContactForm = async (
  payload: SubmitFormPayload
): Promise<SubmitFormResponse> => {
  try {
    const response = await axiosInstance.post<SubmitFormResponse>(
      "contact-us",
      payload
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};


export interface SubmitHomeContactPayload {
    name: string;
    email?: string;
    phone: string;
    message?: string;
}

export interface SubmitHomeContactResponse {
  message: string;
  success: string;
  contactId: string
}


export const submitHomeContactApiHandler = async (
  payload: SubmitHomeContactPayload
): Promise<SubmitHomeContactResponse> => {
  try {
    const response = await axiosInstance.post<SubmitHomeContactResponse>(
      "end-user/contact-us",
      payload
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export interface ContactUsHomeOtpPayload {
  phone: string;
}

export interface ContactUsHOmeOtpResponse {
  success: boolean;
  message: string;
  otp: string;
}

export const contactUsHomeOtpApiHandler = async (
  payload: ContactUsHomeOtpPayload
): Promise<ContactUsHOmeOtpResponse> => {
  try {
    const response = await axiosInstance.post<ContactUsHOmeOtpResponse>(
      "end-user/contact-us/send-otp",
      payload
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export interface SubmitReferralEnquiryPayload {
  referrerName: string;
  referrerPhone: string;
  clientName: string;
  clientMobile: string;
  propertyType: "Buy" | "Sell" | "Rent";
  location?: string;
  channelPartnerId?: string;
}

export interface SubmitReferralEnquiryResponse {
  success: boolean;
  message: string;
}

export const submitReferralEnquiryApiHandler = async (
  payload: SubmitReferralEnquiryPayload
): Promise<SubmitReferralEnquiryResponse> => {
  try {
    const response = await axiosInstance.post<SubmitReferralEnquiryResponse>(
      "contact-us/referral-enquiry",
      payload
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};