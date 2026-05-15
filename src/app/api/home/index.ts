import { CitiesPayload, CitiesResponse, GetPropertyMasterDataResponse } from "@/services/homeService";

/** Response shape for GET /end-user/properties/{propertyId}/media */
export interface PropertyMediaPhoto {
  fileKey: string;
  view?: string;
  isCoverImage?: boolean;
  isVerified?: boolean;
}

export interface PropertyMediaCategory {
  name: string;
  photos: PropertyMediaPhoto[];
}

export interface PropertyMediaVideo {
  fileKey: string;
  format?: string;
  isVerified?: boolean;
}

export interface PropertyMediaResponse {
  success: boolean;
  property?: {
    id: string;
    name: string;
    price: string;
    address: string;
  };
  photoCount?: number;
  videoCount?: number;
  categories?: PropertyMediaCategory[];
  videos?: PropertyMediaVideo[];
}

export const fetchPropertyMedia = async (
  propertyId: string,
  correlationId?: string
): Promise<PropertyMediaResponse | null> => {
  if (!propertyId) return null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (correlationId) {
      headers["x-correlation-id"] = correlationId;
    }
    const response = await fetch(
      `${baseUrl}/end-user/properties/${propertyId}/media`,
      { method: "GET", headers, cache: "no-store" }
    );
    if (!response.ok) return null;
    const result: PropertyMediaResponse = await response.json();
    return result.success ? result : null;
  } catch (error) {
    console.error("Property Media Error", error);
    return null;
  }
};

export const fetchPropertyMasterData = async (): Promise<GetPropertyMasterDataResponse> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(
      `${baseUrl}/end-user/property-master-data`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "force-cache", // or 'no-store' if dynamic
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GetPropertyMasterDataResponse = await response.json();

    if (result.success) {
      return result;
    }

    return null;
  } catch (error) {
    console.error("Property Master Data Error", error);
    return null;
  }
};

export const fetchPropertyCitiesData = async (): Promise<CitiesResponse> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(
      `${baseUrl}/end-user/home/cities`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "force-cache", // or 'no-store' if dynamic
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: CitiesResponse = await response.json();

    if (result.success) {
      return result;
    }

    return null;
  } catch (error) {
    console.error("Property Cities Data Error", error);
    return null;
  }
};
