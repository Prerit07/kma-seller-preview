import { axiosInstance } from "./axiosService";

export interface City {
    id: string;
    name: string;
    code: string;
    state: string;
    icon: string;
    latitude: number;
    longitude: number;
}

export interface CitiesPayload {
    search?: string | null,
    latitude?: string | null,
    longitude?: string | null,
}
export interface CitiesResponse {
  success: boolean;
  featuredCities: City[];
  allCities: City[];
  detectedCity: City | null;
}

export const getCityListApiHandler = async ({search, latitude, longitude}: CitiesPayload) : Promise<CitiesResponse> => {
    try{
        const response = await axiosInstance.get<CitiesResponse>(
      "end-user/home/cities", {
        params: {search, latitude, longitude}
      });

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface PropertyUnit {
  unit: string;
  size: string;
  price: string;
}

export interface Property {
  id: string;
  propertyName: string;
  address: string;
  description: string;
  imageUrl: string;
  isReraRegistered: boolean;
  constructionStatus: string;
  category: string;
  propertyType: string;
  bhkType: string;
  price: number;
  monthlyRent: number;
  city: string;
  society: string;
  locality: string;
  units: PropertyUnit[];
}

export interface TopPropertiesPayload {
    city: string
}

export interface TopPropertiesResponse {
    success: boolean;
    properties: Property[];
    total: number
}

export const topPropertiesApiHandler = async ({city}: TopPropertiesPayload) : Promise<TopPropertiesResponse> => {
    try{
        const response = await axiosInstance.get<TopPropertiesResponse>(
      "end-user/top-properties", {
        params: {city}
      });

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface TopCity {
  id: string;
  name: string;
  code: string;
  state: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  propertyCount: number;
}

export interface TopCitiesResponse {
    success: boolean;
    cities: TopCity[];
}

export const topCitiesApiHandler = async () : Promise<TopCitiesResponse> => {
    try{
        const response = await axiosInstance.get<TopCitiesResponse>(
      "end-user/top-cities");

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface GetChannelPartnerListPayload {
    search: string | null,
    city: string | null,
    experience: string | null,
    properties?: string | null,
    page: string | null,
    limit: string | null,
}

export interface ChannelPartner {
    id: string;
    name?: string;
    firm_name?: string;
    profile_image?: string | null;
    cities?: string | null;

    // Some endpoints return experience/property stats at the top-level.
    experience_years?: number | null;
    property_count?: number | null;

    // Some endpoints return rating (used on list/details UI).
    rating?: number | string | null;

    // --- Details payload fields (example from user) ---
    channel_partner_code?: string | null;
    created_at?: string | null;
    phone?: string | null;
    email?: string | null;
    about?: string | null;
    trusted_since?: string | null;

    areas_of_operation_list?: string[] | null;

    statistics?: {
        buyers_served?: number | null;
        years_of_experience?: number | null;
        property_holdings?: number | null;
        active_properties?: number | null;
        team_size?: number | null;
        areas_of_operation?: number | null;
    } | null;

    active_properties?: {
        buy?: ChannelPartnerActiveProperty[] | null;
        rent?: ChannelPartnerActiveProperty[] | null;
        commercial?: ChannelPartnerActiveProperty[] | null;
    } | null;
}

export interface ChannelPartnerActivePropertyUnit {
  unit?: string | null;
  size?: string | null;
  price?: string | null;
}

export interface ChannelPartnerActiveProperty {
  id: string;
  propertyName?: string | null;
  address?: string | null;
  description?: string | null;
  imageUrl?: string | null;

  isReraRegistered?: boolean | null;
  constructionStatus?: string | null;

  category?: string | null;
  categoryId?: string | null;
  listingType?: string | null;
  listingTypeId?: string | null;

  propertyType?: string | null;
  propertyTypeId?: string | null;
  bhkType?: string | null;
  bhkTypeId?: string | null;

  price?: number | null;
  monthlyRent?: number | null;

  city?: string | null;
  society?: string | null;
  locality?: string | null;
  units?: ChannelPartnerActivePropertyUnit[] | null;
}

export interface GetChannelPartnerListResponse {
    success: boolean;
    data: ChannelPartner[],
    pagination: {
        page: number,
        limit: number,
        total: number,
        totalPages: number
    }
}

export const getChannelPartnerListApiHandler = async ({search, city, experience, properties,page,limit}: GetChannelPartnerListPayload) : Promise<GetChannelPartnerListResponse> => {
    try{
        const response = await axiosInstance.get<GetChannelPartnerListResponse>(
      "end-user/channel-partners", {
        params: {search, city, experience, properties,page,limit}
      });

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}
export interface GetChannelPartnerDetailsResponse {
    success?: boolean;
    data?: ChannelPartner;
    partner?: ChannelPartner;
}

/**
 * Fetch a single channel partner by id.
 * We normalize the response to `ChannelPartner | null`.
 */
export const getChannelPartnerDetailsApiHandler = async (
  id: string
): Promise<ChannelPartner | null> => {
    try{
        const response = await axiosInstance.get<
          GetChannelPartnerDetailsResponse | ChannelPartner
        >(`end-user/channel-partners/${id}`);

        const raw = response.data;
        const normalized =
          (raw as GetChannelPartnerDetailsResponse)?.data ??
          (raw as GetChannelPartnerDetailsResponse)?.partner ??
          (raw as ChannelPartner);

        return normalized ?? null;
    }catch(error: any){
        // If endpoint doesn't exist / id is invalid, show fallback UI.
        return null;
    }
}

export interface User {
    id: string,
    name: string,
    email: string,
    profileImage: string,
}
export interface Rating {
    id: string;
    rating: string;
    review: string;
    name: string;
    endUser: User | null;
    createdAt: string
}

export interface GetUserReviewApiHandlerResponse {
    success: true,
    reviews: Rating[],
    statistics: {
        totalCount: number,
        averageRating: number
    },
    trustedByText: string
}

export const getUserReviewApiHandler = async () : Promise<GetUserReviewApiHandlerResponse> => {
    try{
        const response = await axiosInstance.get<GetUserReviewApiHandlerResponse>(
      "end-user/home/reviews");

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface PropertyType {
    id: string;
    name: string;
    code: string;
}
export interface Categories {
    id: string;
    name: string;
    code: string;
    propertyTypes: PropertyType[]
}
export interface PropertyData {
    id: string;
    name: string;
    code: string;
    categories: Categories[]
}

export interface GetPropertyMasterDataResponse {
    success: boolean;
    message: string;
    data: PropertyData[]
}
export const getPropertyMasterDataApiHandler = async () : Promise<GetPropertyMasterDataResponse> => {
    try{
        const response = await axiosInstance.get<GetPropertyMasterDataResponse>(
      "end-user/property-master-data");

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}   

export interface GetAboutUsSectionResponse {
    success: boolean;
    aboutUs: {
        heading: string;
        description: string;
    };
    statistics: {
        totalOwners: number;
        totalChannelPartners: number;
        totalUsers: number;
        totalActiveProperties: number;
        propertiesListedLast24Hours: number;
    }
}
export const getAboutUsSectionDataApiResponse = async () : Promise<GetAboutUsSectionResponse> => {
    try{
        const response = await axiosInstance.get<GetAboutUsSectionResponse>(
      "end-user/home/about-us");

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}   

export interface AboutusResponse {
  success: boolean;
  configuration: {
    id: string;
    mobileAppAvailable: boolean;
    description: string;
    phoneNumber: string;
    email: string;
    address: string;
    latitude: number;
    longitude: number;
    instagramLink: string;
    fbLink: string;
    youtubeLink: string;
    twitterLink: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  };
}

export const getAboutUsDataAPiHanlder = async () : Promise<AboutusResponse> => {
    try{
        const response = await axiosInstance.get<AboutusResponse>(
      "end-user/configurations");

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}


export interface GetExplorePayload {
    cityId?: string | null,
    propertyTypeId?: string | null,
    listingTypeId?: string | null,
}

export interface PropertyType {
    id: string;
    name: string;
    code: string;
    propertyCount: number
}
export interface GetExploreResponse {
    success: boolean;
    propertyTypes: PropertyType[]
}

export const getExploreApiHanlder = async ({cityId, propertyTypeId, listingTypeId}: GetExplorePayload) : Promise<GetExploreResponse> => {
    try{
        const response = await axiosInstance.get<GetExploreResponse>(
      "end-user/property-types/explore", {
        params: {cityId, propertyTypeId, listingTypeId}
      });

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface GetTopPropertiesPayload {
    cityId: string | null
}
export interface PropertyDetails {
    id: string;
    propertyName: string;
    address: string;
    description: number;
    imageUrl: string;
    images: {
        fileKey: string;
        view: string;
        isCoverImage: string;
    }[];
    videos: {
        fileKey: string;
        format: string;
    };
    isReraRegistered: boolean;
    constructionStatus: string;
    category: string;
    listingType: string;
    propertyType: string;
    bhkType: string;
    plotArea: number;
    plotAreaUnit: string;
    facing: string;
    furnishType: string;
    videoCount: string;
    imageCount: string;
    price: number;
    monthlyRent: number;
    cityId: string;
    city: string;
    society: string;
    locality: string;
    units: {
        unit: string;
        size: string;
        price: string;
    }[],
    owner: string;
    isFavorite: boolean
}

export interface GetTopPropertiesResponse {
    success: boolean;
    properties: PropertyDetails[];
    total: number
}

export const getTopProperties = async ({cityId}: GetTopPropertiesPayload) : Promise<GetTopPropertiesResponse> => {
    try{
        const response = await axiosInstance.get<GetTopPropertiesResponse>(
      "end-user/top-properties", {
        params: {cityId}
      });

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export const getFeaturedProperties = async ({cityId}: GetTopPropertiesPayload) : Promise<GetTopPropertiesResponse> => {
    try{
        const response = await axiosInstance.get<GetTopPropertiesResponse>(
      "end-user/featured-properties", {
        params: {cityId}
      });

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface GetPropertiesCountPayload {
    page?: string;
    limit?: string;
    cityId?: string;
    search?: string;
    categoryIds?: string;
    listingTypeIds?: string;
    propertyTypeIds?: string;
    bhkTypeIds?: string;
    furnishingTypes?: string;
    constructionStatuses?: string;
    minPrice?: string;
    maxPrice?: string;
    latitude?: string;
    longitude?: string;
    radius?: string;
    sortBy?: string;
    sortOrder?: string;
    postedBy?: string
}

export interface GetPropertiesCountResponse {
    success: boolean;
    count: number
}

export const getPropertiesCountApiHandler = async ({page,limit,cityId,search,listingTypeIds, categoryIds, propertyTypeIds, bhkTypeIds, furnishingTypes, constructionStatuses, minPrice, maxPrice, latitude, longitude, radius, sortBy, sortOrder, postedBy }: GetPropertiesCountPayload) : Promise<GetPropertiesCountResponse> => {
    try{
        const response = await axiosInstance.get<GetPropertiesCountResponse>(
      "end-user/properties/count", {
        params: {cityId, search, listingTypeIds, categoryIds, propertyTypeIds, bhkTypeIds, furnishingTypes, constructionStatuses, minPrice, maxPrice, latitude, longitude, radius, sortBy, sortOrder, postedBy}
      });

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

// ──── Channel Partner Reviews ────

export interface CPReviewItem {
    id: string;
    reviewerName: string;
    reviewerProfileImage: string | null;
    rating: number;
    review: string;
    createdAt: string;
}

export interface GetCPReviewsResponse {
    averageRating: number;
    totalReviews: number;
    starDistribution: Record<string, number>;
    reviews: CPReviewItem[];
}

export interface GetCPReviewsPayload {
    page?: number;
    limit?: number;
    sortBy?: string;
}

export const getChannelPartnerReviews = async (
    cpId: string,
    { page = 1, limit = 10, sortBy = "newest" }: GetCPReviewsPayload = {}
): Promise<GetCPReviewsResponse> => {
    try {
        const response = await axiosInstance.get<GetCPReviewsResponse>(
            `end-user/channel-partners/${cpId}/reviews`,
            { params: { page, limit, sortBy } }
        );
        return response.data;
    } catch (error: any) {
        throw error.response?.data ?? error;
    }
};

export interface SubmitCPReviewPayload {
    rating: number;
    review: string;
}

export const submitChannelPartnerReview = async (
    cpId: string,
    payload: SubmitCPReviewPayload
): Promise<any> => {
    try {
        const response = await axiosInstance.post(
            `end-user/channel-partners/${cpId}/review`,
            payload
        );
        return response.data;
    } catch (error: any) {
        throw error.response?.data ?? error;
    }
};

export interface EndUserStateCityRow {
    id: string;
    name: string;
    code: string;
    state: string;
}

export interface EndUserStatesResponse {
    success: boolean;
    data: string[];
}

export interface EndUserStateCitiesResponse {
    success: boolean;
    data: EndUserStateCityRow[];
}

export const getEndUserStates = async (): Promise<string[]> => {
    try {
        const response = await axiosInstance.get<EndUserStatesResponse>("end-user/states");
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error: any) {
        throw error.response?.data ?? error;
    }
};

export const getEndUserStateCities = async (
    state: string
): Promise<EndUserStateCityRow[]> => {
    try {
        const encoded = encodeURIComponent(state);
        const response = await axiosInstance.get<EndUserStateCitiesResponse>(
            `end-user/states/${encoded}/cities`
        );
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error: any) {
        throw error.response?.data ?? error;
    }
};