import { axiosInstance } from "./axiosService";

export interface LivePhotoPayload {
   live_photo_url: string
}

export interface LivePhotoResponse {
  message: string;
  success: string;
  live_photo_url: string;
  live_photo_approved: boolean
}


export const livePhotoUploadApiHandler = async (
  payload: LivePhotoPayload
): Promise<LivePhotoResponse> => {
  try {
    const response = await axiosInstance.post<LivePhotoResponse>(
      "users/verification/live-photo",
      payload
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export interface LivePhotoGetResponse {
 success: string;
  live_photo_url: string;
  live_photo_approved: boolean
}


export const livePhotoGetApiHandler = async (): Promise<LivePhotoGetResponse> => {
  try {
    const response = await axiosInstance.get<LivePhotoGetResponse>(
      "users/verification/live-photo");

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export interface AadharVerifyPayload {
   aadhaar_number: string,
   digilocker_clientid: string,
   digilocker_metadata: {
    name: string,
    gender: string,
    dob: string,
    mobile_number: string,
   },
   isVerified: boolean
}

export interface AadharVerifyResponse {
  message: string;
  success: string;
  aadhaar_verified: boolean
}


export const aadharVerifyApiHandler = async (
  payload: AadharVerifyPayload
): Promise<AadharVerifyResponse> => {
  try {
    const response = await axiosInstance.post<AadharVerifyResponse>(
      "users/verification/aadhaar",
      payload
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};



export interface AadharVerifyGetApiHandler {
 success: string;
  aadhaar_number: string;
  aadhaar_verified: boolean
}

export const aadharVerifyGetApiHandler = async (): Promise<AadharVerifyGetApiHandler> => {
  try {
    const response = await axiosInstance.get<AadharVerifyGetApiHandler>(
      "users/verification/aadhaar");

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};


export interface BankDetailsPayload {
   account_number: string,
   ifsc_code: string;
   bank_name: string;
   account_holder_name: string;
   branch_name?: string;
}

export interface BankDetailsResponse {
  message: string;
  success: string;
  bank_details_filled: boolean
}

export const bankDetailsApiHandler = async (
  payload: BankDetailsPayload
): Promise<BankDetailsResponse> => {
  try {
    const response = await axiosInstance.post<BankDetailsResponse>(
      "users/verification/bank-details",
      payload
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

interface BankDetails {
    account_number: string,
   ifsc_code: string;
   bank_name: string;
   account_holder_name: string;
   branch_name: string;
}
export interface BankDetailsGetResponse {
 success: string;
 bank_details: BankDetails
}

export const bankDetailsGetApiHandler = async (): Promise<BankDetailsGetResponse> => {
  try {
    const response = await axiosInstance.get<BankDetailsGetResponse>(
      "users/verification/bank-details");

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export interface DocusignResponse {
 success: string;
 docusign_agreement_signed: boolean;
 envelope_id: string
}

export const docuSingStatusApiHanlder = async (): Promise<DocusignResponse> => {
  try {
    const response = await axiosInstance.get<DocusignResponse>(
      "users/verification/docusign-agreement");

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export interface step1_live_photo {
  live_photo_url: string,
  live_photo_approved: boolean,
}

export interface step2_aadhaar {
  aadhaar_number: string,
  aadhaar_verified: boolean
}

export interface step3_bank_details {
  bank_details_filled: boolean
}

export interface step4_docusign_agreement {
  docusign_agreement_signed: boolean
}

export interface KycStatusResponse {
 success: string;
 role?: string;
 step1_live_photo: step1_live_photo,
 step2_aadhaar: step2_aadhaar,
 step3_bank_details: step3_bank_details,
 step4_docusign_agreement: step4_docusign_agreement,
 kyc_completed: boolean,
 kyc_steps_completed: number,
 kyc_progress: number,
 kyc_total_steps: number,
 kyc_status: string,
 kyc_rejection_reason: string,
}

export const getKycStatusApiHandler = async (): Promise<KycStatusResponse> => {
  try {
    const response = await axiosInstance.get<KycStatusResponse>(
      "/users/verification/status");

    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};