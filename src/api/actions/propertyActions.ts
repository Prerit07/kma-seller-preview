import { axiosInstance } from "@/services/axiosService";

export interface EndUserPropertyMedia {
  fileKey?: string;
  view?: string;
  isCoverImage?: boolean | string;
  format?: string;
}

export interface EndUserPropertyDetails {
  id: string;
  propertyName?: string;
  title?: string;
  address?: string;
  description?: string;
  images?: EndUserPropertyMedia[];
  photos?: EndUserPropertyMedia[];
  videos?: EndUserPropertyMedia[];
  [key: string]: unknown;
}

export interface GetEndUserPropertyDetailsPayload {
  id: string;
  correlationId?: string;
  sessionId?: string;
}

/** Location object returned in property details API response */
export interface PropertyDetailsLocation {
  latitude?: number;
  longitude?: number;
  state?: string;
  city?: string;
  society?: string;
  locality?: string;
  address?: string;
}

/** Channel partner / specialist details from property details API */
export interface PropertyDetailsChannelPartner {
  id?: string;
  name?: string | null;
  firmName?: string | null;
  profileImage?: string | null;
  channelPartnerCode?: string | null;
  phone?: string | null;
  email?: string | null;
  buyersServed?: number;
  yearsOfExperience?: number | null;
  propertyHoldings?: number;
  areasOfOperation?: number;
  propertyListings?: { rent?: number; sale?: number };
}

export interface OwnerDetails {
  id: string;
  name: string | null;
  profileImage: string | null;
  phone: string;
  email: string | null;
}

export interface PropertyRatingsAndReviews {
  totalReviews: number;
  averageOverallRating: number;
  starDistribution: Record<string, number>;
  featureRatings: {
    connectivity: number;
    neighbourhood: number;
    safety: number;
    livability: number;
  };
  likes: string[];
  dislikes: string[];
}

export interface PropertySampleReview {
  id: string;
  endUserId: string;
  reviewerName: string | null;
  role: string;
  overallRating: number;
  connectivityRating: number;
  neighbourhoodRating: number;
  safetyRating: number;
  livabilityRating: number;
  likeText?: string | null;
  dislikeText?: string | null;
  createdAt: string;
}

export interface GetEndUserPropertyDetailsResponse {
  success?: boolean;
  message?: string;
  property?: EndUserPropertyDetails;
  data?: EndUserPropertyDetails;
  location?: PropertyDetailsLocation;
  verificationStatus?: string | null;
  comments?: string | null;
  channelPartnerDetails?: PropertyDetailsChannelPartner | null;
  ownerDetails?: OwnerDetails;
  ratingsAndReviews?: PropertyRatingsAndReviews;
  sampleReviews?: PropertySampleReview[];
}

/** GET /end-user/properties/{propertyId}/rating-reviews */
export interface PropertyRatingReviewSummary {
  averageRating: number;
  totalReviews: number;
  starDistribution: Record<string, number>;
}

export interface PropertyRatingReviewFeatureRatings {
  connectivity?: number;
  neighbourhood?: number;
  safety?: number;
  livability?: number;
}

export interface PropertyRatingReviewItem {
  id: string;
  reviewerName: string;
  reviewerProfileImage?: string | null;
  reviewerDetail?: string | null;
  overallRating: number;
  role?: string | null;
  likeText?: Record<string, unknown>;
  dislikeText?: Record<string, unknown>;
  createdAt: string;
}

export interface GetPropertyRatingReviewsPayload {
  propertyId: string;
  page?: number;
  limit?: number;
  q?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  sortBy?: "recommended" | "newest" | "oldest" | "highest" | "lowest";
  correlationId?: string;
}

export interface GetPropertyRatingReviewsResponse {
  success: boolean;
  summary: PropertyRatingReviewSummary;
  featureRatings: PropertyRatingReviewFeatureRatings;
  whatsGood: string[];
  whatsBad: string[];
  reviews: PropertyRatingReviewItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EndUserPropertySummary {
  id: string;
  propertyName?: string;
  title?: string;
  address?: string;
  description?: string;
  imageUrl?: string;
  images?: EndUserPropertyMedia[];
  photos?: EndUserPropertyMedia[];
  videos?: EndUserPropertyMedia[];
  isFavorite?: boolean;
  city?: string | { id?: string; name?: string; code?: string; state?: string };
  locality?: string | { id?: string; name?: string; sector?: string; cityId?: string };
  category?: string | { id?: string; name?: string; code?: string };
  listingType?: string | { id?: string; name?: string; code?: string };
  propertyType?: string | { id?: string; name?: string; code?: string };
  bhkType?: string | { id?: string; name?: string; code?: string };
  society?: { id?: string; name?: string; address?: string; localityName?: string; cityId?: string };
  furnishType?: string;
  furnishingType?: string;
  constructionStatus?: string;
  price?: number | null;
  monthlyRent?: number | null;
  plotArea?: number | null;
  builtUpArea?: number | null;
  carpetArea?: number | null;
  facing?: string | null;
  postedBy?: string;
  owner?: {
    role?: string;
    [key: string]: unknown;
  };
  user?: {
    id?: string;
    name?: string;
    role?: string;
    [key: string]: unknown;
  };
  listingTypeId?: string;
  categoryId?: string;
  propertyTypeId?: string;
  bhkTypeId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

type CsvParam = string | string[] | null | undefined;

/** Filter option item from GET /end-user/filters */
export interface EndUserFilterOption {
  id: string;
  name: string;
  code: string;
  icon?: string | null;
}

export interface GetEndUserFiltersPayload {
  listingTypeId?: string;
  categoryId?: string;
  propertyTypeId?: string;
  correlationId?: string;
}

export interface GetEndUserFiltersResponse {
  success?: boolean;
  listingTypes: EndUserFilterOption[];
  categories: EndUserFilterOption[];
  propertyTypes: EndUserFilterOption[];
  bhkTypes: EndUserFilterOption[];
  amenities: EndUserFilterOption[];
  furnishing: EndUserFilterOption[];
}

export interface GetEndUserPropertiesPayload {
  page?: number;
  limit?: number;
  cityId?: string;
  search?: string;
  categoryIds?: CsvParam;
  listingTypeIds?: CsvParam;
  propertyTypeIds?: CsvParam;
  bhkTypeIds?: CsvParam;
  furnishingTypes?: CsvParam;
  constructionStatuses?: CsvParam;
  minPrice?: number;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: "price" | "createdAt" | "updatedAt" | string;
  sortOrder?: "ASC" | "DESC" | string;
  postedBy?: CsvParam;
  correlationId?: string;
}

export interface EndUserPropertiesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetEndUserPropertiesResponse {
  success?: boolean;
  message?: string;
  properties?: EndUserPropertySummary[];
  data?: EndUserPropertySummary[];
  total?: number;
  pagination?: EndUserPropertiesPagination;
}

export interface GetEndUserPropertiesCountResponse {
  success?: boolean;
  message?: string;
  count?: number;
}

/** GET /end-user/recently-viewed - paginated recently viewed properties */
export interface GetRecentlyViewedPayload {
  page?: number;
  limit?: number;
  listingType?: "sale" | "rent";
  sort?: "newest" | "oldest" | "price_high" | "price_low";
  xSessionId?: string;
  correlationId?: string;
}

export interface GetRecentlyViewedResponse {
  success: boolean;
  properties: EndUserPropertySummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** GET /end-user/recently-searched - paginated recent search queries with filters */
export interface RecentSearchItem {
  id: string;
  searchQuery: string;
  location: string;
  city: string;
  priceRange: string;
  filters?: {
    propertyType?: string;
    bhk?: string;
    [key: string]: unknown;
  };
  createdAt: string;
}

export interface GetRecentlySearchedPayload {
  page?: number;
  limit?: number;
  sortBy?: "recent" | "relevance";
  xSessionId?: string;
  correlationId?: string;
}

export interface GetRecentlySearchedResponse {
  searches: RecentSearchItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** GET /end-user/contacted-properties - paginated list of properties user has contacted */
export interface GetContactedPropertiesPayload {
  page?: number;
  limit?: number;
  listingType?: "sale" | "rent";
  sort?: "newest" | "oldest" | "price_high" | "price_low";
  xSessionId?: string;
  correlationId?: string;
}

export interface GetContactedPropertiesResponse {
  success?: boolean;
  properties: EndUserPropertySummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** GET /end-user/favorites - paginated list of properties favorited by the logged-in user */
export interface GetFavoritePropertiesPayload {
  page?: number;
  limit?: number;
  listingType?: "sale" | "rent";
  sort?: "newest" | "oldest" | "price_high" | "price_low";
  correlationId?: string;
}

export interface GetFavoritePropertiesResponse {
  success?: boolean;
  properties: EndUserPropertySummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** GET /end-user/my-reviews - paginated list of property reviews submitted by the logged-in user */
export interface MyReviewItem {
  id: string;
  propertyId: string;
  projectId?: string;
  listingId?: string;
  propertyName?: string;
  propertyAddress?: string;
  propertyImageUrl?: string | null;
  title?: string;
  address?: string;
  overallRating?: number;
  connectivityRating?: number;
  neighbourhoodRating?: number;
  safetyRating?: number;
  livabilityRating?: number;
  likeText?: string | null;
  dislikeText?: string | null;
  reviewText?: string | null;
  role?: string;
  createdAt?: string;
  property?: {
    id?: string;
    propertyName?: string;
    title?: string;
    address?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface GetMyReviewsPayload {
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest";
  correlationId?: string;
}

export interface GetMyReviewsResponse {
  success?: boolean;
  reviews: MyReviewItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Similar property item from GET /end-user/properties/similar */
export interface SimilarProperty {
  id: string;
  title: string;
  address: string;
  imageUrl: string;
  propertyType: string;
  averageRating: number;
  totalReviews: number;
  price: number;
  priceType: "sale" | "rent";
  listedOn: string;
  possessionStatus: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  owner: {
    id: string;
    name: string;
    profileImage?: string | null;
    role?: string;
  };
  isFavorite?: boolean;
}

export interface GetSimilarPropertiesPayload {
  cityId: string;
  propertyTypeId?: string;
  limit?: number;
  correlationId?: string;
}

export interface GetSimilarPropertiesResponse {
  success: boolean;
  properties: SimilarProperty[];
  total: number;
}

export interface UpdateEndUserFavoritePayload {
  propertyId: string;
  correlationId?: string;
}

export interface UpdateEndUserFavoriteResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export interface SendPropertyContactOtpPayload {
  propertyId: string;
  phone: string;
  correlationId?: string;
}

export interface SendPropertyContactOtpResponse {
  success?: boolean;
  message?: string;
  otp?: string;
  sessionId?: string;
}

export interface SubmitPropertyContactPayload {
  propertyId: string;
  name: string;
  email?: string;
  phone: string;
  countryCode?: string;
  otp?: string;
  sessionId?: string;
  correlationId?: string;
}

export interface SubmitPropertyContactResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

const getCorrelationId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const toCsvParam = (value?: CsvParam) => {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    const filtered = value.map((item) => String(item).trim()).filter(Boolean);
    return filtered.length > 0 ? filtered.join(",") : undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getErrorPayload = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const maybeResponse = (error as { response?: { data?: unknown } }).response;
    if (maybeResponse?.data !== undefined) {
      return maybeResponse.data;
    }
  }
  return error;
};

/** GET /end-user/filters - list property filters for dropdowns */
export const getEndUserFiltersAction = async ({
  listingTypeId,
  categoryId,
  propertyTypeId,
  correlationId,
}: GetEndUserFiltersPayload): Promise<GetEndUserFiltersResponse> => {
  try {
    const response = await axiosInstance.get<GetEndUserFiltersResponse>(
      "end-user/filters",
      {
        params: {
          ...(listingTypeId ? { listingTypeId } : {}),
          ...(categoryId ? { categoryId } : {}),
          ...(propertyTypeId ? { propertyTypeId } : {}),
        },
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
        },
      }
    );
    const data = response.data;
    return {
      success: data?.success ?? true,
      listingTypes: Array.isArray(data?.listingTypes) ? data.listingTypes : [],
      categories: Array.isArray(data?.categories) ? data.categories : [],
      propertyTypes: Array.isArray(data?.propertyTypes) ? data.propertyTypes : [],
      bhkTypes: Array.isArray(data?.bhkTypes) ? data.bhkTypes : [],
      amenities: Array.isArray(data?.amenities) ? data.amenities : [],
      furnishing: Array.isArray(data?.furnishing) ? data.furnishing : [],
    };
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const getEndUserPropertyDetailsAction = async ({
  id,
  correlationId,
  sessionId,
}: GetEndUserPropertyDetailsPayload): Promise<GetEndUserPropertyDetailsResponse> => {
  try {
    const headers: Record<string, string> = {
      "x-correlation-id": correlationId ?? getCorrelationId(),
    };
    if (sessionId) {
      headers["X-Session-Id"] = sessionId;
    }
    const response = await axiosInstance.get<GetEndUserPropertyDetailsResponse>(
      `end-user/properties/${id}`,
      { headers }
    );

    return response.data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const getEndUserPropertiesAction = async ({
  page = 1,
  limit = 20,
  cityId,
  search,
  categoryIds,
  listingTypeIds,
  propertyTypeIds,
  bhkTypeIds,
  furnishingTypes,
  constructionStatuses,
  minPrice,
  maxPrice,
  latitude,
  longitude,
  radius,
  sortBy,
  sortOrder,
  postedBy,
  correlationId,
}: GetEndUserPropertiesPayload): Promise<
  GetEndUserPropertiesResponse | EndUserPropertySummary[]
> => {
  try {
    const response = await axiosInstance.get<
      GetEndUserPropertiesResponse | EndUserPropertySummary[]
    >(
      "end-user/properties",
      {
        params: {
          page,
          limit,
          cityId,
          search,
          categoryIds: toCsvParam(categoryIds),
          listingTypeIds: toCsvParam(listingTypeIds),
          propertyTypeIds: toCsvParam(propertyTypeIds),
          bhkTypeIds: toCsvParam(bhkTypeIds),
          furnishingTypes: toCsvParam(furnishingTypes),
          constructionStatuses: toCsvParam(constructionStatuses),
          minPrice,
          maxPrice,
          latitude,
          longitude,
          radius,
          sortBy,
          sortOrder,
          postedBy: toCsvParam(postedBy),
        },
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const getEndUserPropertiesCountAction = async ({
  cityId,
  search,
  categoryIds,
  listingTypeIds,
  propertyTypeIds,
  bhkTypeIds,
  furnishingTypes,
  constructionStatuses,
  minPrice,
  maxPrice,
  latitude,
  longitude,
  radius,
  sortBy,
  sortOrder,
  postedBy,
  correlationId,
}: GetEndUserPropertiesPayload): Promise<GetEndUserPropertiesCountResponse> => {
  try {
    const response = await axiosInstance.get<GetEndUserPropertiesCountResponse>(
      "end-user/properties/count",
      {
        params: {
          cityId,
          search,
          categoryIds: toCsvParam(categoryIds),
          listingTypeIds: toCsvParam(listingTypeIds),
          propertyTypeIds: toCsvParam(propertyTypeIds),
          bhkTypeIds: toCsvParam(bhkTypeIds),
          furnishingTypes: toCsvParam(furnishingTypes),
          constructionStatuses: toCsvParam(constructionStatuses),
          minPrice,
          maxPrice,
          latitude,
          longitude,
          radius,
          postedBy: toCsvParam(postedBy),
        },
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

/** GET /end-user/recently-viewed - paginated recently viewed properties (Bearer or X-Session-Id) */
export const getRecentlyViewedAction = async ({
  page = 1,
  limit = 20,
  listingType,
  sort,
  xSessionId,
  correlationId,
}: GetRecentlyViewedPayload): Promise<GetRecentlyViewedResponse> => {
  try {
    const response = await axiosInstance.get<GetRecentlyViewedResponse>(
      "end-user/recently-viewed",
      {
        params: {
          page,
          limit,
          ...(listingType ? { listingType } : {}),
          ...(sort ? { sort } : {}),
        },
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
          ...(xSessionId ? { "X-Session-Id": xSessionId } : {}),
        },
      }
    );
    const data = response.data;
    return {
      success: data?.success ?? true,
      properties: Array.isArray(data?.properties) ? data.properties : [],
      total: data?.total ?? 0,
      page: data?.page ?? page,
      limit: data?.limit ?? limit,
      totalPages: data?.totalPages ?? 1,
    };
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

/** GET /end-user/recently-searched - paginated recent search queries (Bearer or X-Session-Id) */
export const getRecentlySearchedAction = async ({
  page = 1,
  limit = 10,
  sortBy = "recent",
  xSessionId,
  correlationId,
}: GetRecentlySearchedPayload): Promise<GetRecentlySearchedResponse> => {
  try {
    const response = await axiosInstance.get<GetRecentlySearchedResponse>(
      "end-user/recently-searched",
      {
        params: { page, limit, sortBy },
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
          ...(xSessionId ? { "X-Session-Id": xSessionId } : {}),
        },
      }
    );
    const data = response.data;
    return {
      searches: Array.isArray(data?.searches) ? data.searches : [],
      total: data?.total ?? 0,
      page: data?.page ?? page,
      limit: data?.limit ?? limit,
      totalPages: data?.totalPages ?? 1,
    };
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

/** GET /end-user/contacted-properties - paginated properties user has contacted (Bearer or X-Session-Id) */
export const getContactedPropertiesAction = async ({
  page = 1,
  limit = 20,
  listingType,
  sort,
  xSessionId,
  correlationId,
}: GetContactedPropertiesPayload): Promise<GetContactedPropertiesResponse> => {
  try {
    const response = await axiosInstance.get<GetContactedPropertiesResponse>(
      "end-user/contacted-properties",
      {
        params: {
          page,
          limit,
          ...(listingType ? { listingType } : {}),
          ...(sort ? { sort } : {}),
        },
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
          ...(xSessionId ? { "X-Session-Id": xSessionId } : {}),
        },
      }
    );
    const data = response.data;
    return {
      success: data?.success ?? true,
      properties: Array.isArray(data?.properties) ? data.properties : [],
      total: data?.total ?? 0,
      page: data?.page ?? page,
      limit: data?.limit ?? limit,
      totalPages: data?.totalPages ?? 1,
    };
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

/** GET /end-user/favorites - paginated list of properties favorited by the logged-in user */
export const getFavoritePropertiesAction = async ({
  page = 1,
  limit = 20,
  listingType,
  sort,
  correlationId,
}: GetFavoritePropertiesPayload): Promise<GetFavoritePropertiesResponse> => {
  try {
    const response = await axiosInstance.get<GetFavoritePropertiesResponse>(
      "end-user/favorites",
      {
        params: {
          page,
          limit,
          ...(listingType ? { listingType } : {}),
          ...(sort ? { sort } : {}),
        },
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
        },
      }
    );
    const data = response.data;
    return {
      success: data?.success ?? true,
      properties: Array.isArray(data?.properties) ? data.properties : [],
      total: data?.total ?? 0,
      page: data?.page ?? page,
      limit: data?.limit ?? limit,
      totalPages: data?.totalPages ?? 1,
    };
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

/** GET /end-user/my-reviews - Get all property reviews submitted by the logged-in user */
export const getMyReviewsAction = async ({
  page = 1,
  limit = 10,
  sortBy = "newest",
  correlationId,
}: GetMyReviewsPayload): Promise<GetMyReviewsResponse> => {
  try {
    const response = await axiosInstance.get<GetMyReviewsResponse>("end-user/my-reviews", {
      params: { page, limit, sortBy },
      headers: {
        "x-correlation-id": correlationId ?? getCorrelationId(),
      },
    });
    const data = response.data;
    return {
      success: data?.success ?? true,
      reviews: Array.isArray(data?.reviews) ? data.reviews : [],
      total: Number(data?.total) ?? 0,
      page: Number(data?.page) || page,
      limit: Number(data?.limit) || limit,
      totalPages: Number(data?.totalPages) || 1,
    };
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const getSimilarPropertiesAction = async ({
  cityId,
  propertyTypeId,
  limit = 10,
  correlationId,
}: GetSimilarPropertiesPayload): Promise<GetSimilarPropertiesResponse> => {
  try {
    const response = await axiosInstance.get<GetSimilarPropertiesResponse>(
      "end-user/properties/similar",
      {
        params: { cityId, propertyTypeId, limit },
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const addEndUserFavoriteAction = async ({
  propertyId,
  correlationId,
}: UpdateEndUserFavoritePayload): Promise<UpdateEndUserFavoriteResponse> => {
  try {
    const response = await axiosInstance.post<UpdateEndUserFavoriteResponse>(
      "end-user/favorites",
      { propertyId },
      {
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const removeEndUserFavoriteAction = async ({
  propertyId,
  correlationId,
}: UpdateEndUserFavoritePayload): Promise<UpdateEndUserFavoriteResponse> => {
  try {
    const response = await axiosInstance.delete<UpdateEndUserFavoriteResponse>(
      "end-user/favorites",
      {
        data: { propertyId },
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const sendEndUserPropertyContactOtpAction = async ({
  propertyId,
  phone,
  correlationId,
}: SendPropertyContactOtpPayload): Promise<SendPropertyContactOtpResponse> => {
  try {
    const response = await axiosInstance.post<SendPropertyContactOtpResponse>(
      `end-user/properties/${propertyId}/contact/send-otp`,
      { phone },
      {
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const submitEndUserPropertyContactAction = async ({
  propertyId,
  name,
  email,
  phone,
  countryCode,
  otp,
  sessionId,
  correlationId,
}: SubmitPropertyContactPayload): Promise<SubmitPropertyContactResponse> => {
  try {
    const response = await axiosInstance.post<SubmitPropertyContactResponse>(
      `end-user/properties/${propertyId}/contact`,
      {
        name,
        phone,
        ...(email ? { email } : {}),
        ...(countryCode ? { countryCode } : {}),
        ...(otp ? { otp } : {}),
      },
      {
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
          ...(sessionId ? { "X-Session-Id": sessionId } : {}),
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

export const getPropertyRatingReviewsAction = async ({
  propertyId,
  page = 1,
  limit = 10,
  q,
  rating,
  sortBy = "recommended",
  correlationId,
}: GetPropertyRatingReviewsPayload): Promise<GetPropertyRatingReviewsResponse> => {
  try {
    const response = await axiosInstance.get<GetPropertyRatingReviewsResponse>(
      `end-user/properties/${propertyId}/rating-reviews`,
      {
        params: { page, limit, q, rating, sortBy },
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

/** POST /end-user/properties/{propertyId}/rating-review (submit or update review, logged-in users only) */
export interface SubmitPropertyRatingReviewPayload {
  propertyId: string;
  role?: string;
  connectivityRating: number;
  neighbourhoodRating: number;
  safetyRating: number;
  livabilityRating: number;
  likeText?: string;
  dislikeText?: string;
  correlationId?: string;
}

export interface SubmitPropertyRatingReviewResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export const submitPropertyRatingReviewAction = async ({
  propertyId,
  role,
  connectivityRating,
  neighbourhoodRating,
  safetyRating,
  livabilityRating,
  likeText,
  dislikeText,
  correlationId,
}: SubmitPropertyRatingReviewPayload): Promise<SubmitPropertyRatingReviewResponse> => {
  try {
    const response = await axiosInstance.post<SubmitPropertyRatingReviewResponse>(
      `end-user/properties/${propertyId}/rating-review`,
      {
        ...(role ? { role } : {}),
        connectivityRating,
        neighbourhoodRating,
        safetyRating,
        livabilityRating,
        ...(likeText != null && likeText !== "" ? { likeText } : {}),
        ...(dislikeText != null && dislikeText !== "" ? { dislikeText } : {}),
      },
      {
        headers: {
          "x-correlation-id": correlationId ?? getCorrelationId(),
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};

/** GET /end-user/nearby-places */
export interface NearbyPlace {
  name: string;
  distance: string;
  address: string | null;
}

export interface GetNearbyPlacesResponse {
  success: boolean;
  places: NearbyPlace[];
}

export const getNearbyPlacesAction = async ({
  latitude,
  longitude,
  type,
  radius = 2000,
}: {
  latitude: number;
  longitude: number;
  type: string;
  radius?: number;
}): Promise<GetNearbyPlacesResponse> => {
  try {
    const response = await axiosInstance.get<GetNearbyPlacesResponse>(
      "end-user/nearby-places",
      {
        params: { latitude, longitude, type, radius },
        headers: {
          "x-correlation-id": getCorrelationId(),
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    throw getErrorPayload(error);
  }
};
