import { axiosInstance } from "./axiosService";

// Enums matching backend
export enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  INTERESTED = "INTERESTED",
  NOT_INTERESTED = "NOT_INTERESTED",
  CONVERTED = "CONVERTED",
  LOST = "LOST",
}

export enum LeadBuildingType {
  RESIDENTIAL = "RESIDENTIAL",
  COMMERCIAL = "COMMERCIAL",
}

// Query params for GET /property/leads
export interface LeadListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  propertyId?: string;
  status?: LeadStatus;
  timeFilter?: "new" | "this_month" | "last_month";
  budgetMin?: number;
  budgetMax?: number;
  sizeMin?: number;
  sizeMax?: number;
  buildingType?: LeadBuildingType;
  locality?: string;
}

// Property contact within a lead
export interface LeadPropertyContact {
  id: string;
  propertyId: string;
  property: {
    id: string;
    title?: string;
    price?: number;
    monthlyRent?: number;
    area?: number;
    areaUnit?: string;
    bhkTypeName?: string;
    societyName?: string;
    localityName?: string;
    ownerRole?: string;
  };
  contactedAt: string | null;
}

// Single lead item
export interface LeadItem {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  sizeMin?: number | null;
  sizeMax?: number | null;
  buildingType?: LeadBuildingType | null;
  propertyTypes?: string[] | null;
  locations?: string[] | null;
  status: LeadStatus;
  syncWithCrm?: boolean;
  lastContactedAt?: string | null;
  propertiesContactedCount: number;
  propertyContacts: LeadPropertyContact[];
  createdAt: string;
  updatedAt: string;
}

// Tab counts
export interface LeadTabCounts {
  all: number;
  new: number;
  this_month: number;
  last_month: number;
}

// Response from GET /property/leads
export interface LeadListResponse {
  success: boolean;
  data: LeadItem[];
  total: number;
  page: number;
  limit: number;
  tabCounts?: LeadTabCounts;
}

// GET /property/leads
export const getLeadsApiHandler = async (
  params: LeadListQueryParams
): Promise<LeadListResponse> => {
  try {
    const response = await axiosInstance.get<LeadListResponse>(
      "property/leads",
      { params }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

// GET /property/leads/export (returns CSV blob)
export const exportLeadsApiHandler = async (
  params: LeadListQueryParams
): Promise<Blob> => {
  try {
    const response = await axiosInstance.get("property/leads/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

// POST /property/leads/sync
export const syncLeadsApiHandler = async (): Promise<{
  message: string;
  synced: number;
}> => {
  try {
    const response = await axiosInstance.post<{
      message: string;
      synced: number;
    }>("property/leads/sync");
    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export interface SyncCrmPayload {
  customer: {
    name: string;
    email: string;
    phone: string;
    website_user_id: string;
  };
  property: Record<string, unknown>;
}

export const syncCrmApiHandler = async (
  payload: SyncCrmPayload
): Promise<{ success?: boolean; message?: string; [key: string]: unknown }> => {
  try {
    const response = await axiosInstance.post("property/sync-crm", payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};
