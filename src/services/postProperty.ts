import { axiosInstance } from "./axiosService";
import { PropertyCategoryResponse, PropertyListResponse, PropertyType } from "./masterService";


interface BHK {
    id?: string;
    name?: string;
    buildUpAreaSqFt?: number | null;
    carpetAreaSqFt?: number | null;
    noOfBathrooms?: number | null;
    noOfBedrooms?: number | null;
    balconies?: number | null;
}

interface Society {
    id?: string;
    name: string;
    localityName?: string;
    address?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number | null;
  };

interface City {
    id?: string;
    name: string;
    state?: string;
    latitude?: number | null;
    longitude?: number | null;
    code?: number | null;
  };

interface Locality {
    id?: string;
    name: string;
    sector?: string;
    latitude?: number | null;
    longitude?: number | null;
  };

export interface Step1PostPropertyPayload {
  propertyId?: string;

  listingTypeId: string;
  categoryId: string;
  propertyTypeId: string;

  city: string | City;
  society: string | Society;
  locality: string | Locality;

  bhk: BHK;
  transactionType: string | null;
  constructionStatus: string | null;
  ageOfProperty: number;
  possessionBy?: string | null;
  possessionTime: string | null;
  possessionStatus?: string | null;
  possessionDate?: string | null;

  facing: string;
  status: string;

  plotArea: number | string | null;
  plotAreaUnit: string | null;
  plotLength: number | string | null;
  plotLengthUnit?: string | null;
  plotWidth: number | string | null;
  plotWidthUnit?: string | null;
  plotFacingRoadWidth: string | null;

  locationHub?: string | null;
  otherLocationHub?: string | null;

  zoneType?: string | null;
  propertyCondition?: string | null;
  wallConstructionStatus?: string | null;
  ownership?: string | null;

  builtUpArea?: number | null;
  builtUpAreaUnit?: string | null;
  carpetArea?: number | null;
  carpetAreaUnit?: string | null;

  suitableFor?: string[] | null;
  entranceWidth?: number | null;
  entranceWidthUnit?: string | null;
  ceilingHeight?: number | null;
  ceilingHeightUnit?: string | null;

  locatedNear?: string[] | null;
  plotLandType?: string | null;
  noOfOpenSides?: number | null;
  constructionDone?: string | null;
  constructionTypeOptions?: string[] | null;
}

export interface Step1PostPropertyResponse {
  id: string,
  status: string,
  completionStep: string,
}

export const step1PostPropertyCreateApiHandler = async (paylaod: Step1PostPropertyPayload) : Promise<Step1PostPropertyResponse> => {
    try{
        const response = await axiosInstance.post<Step1PostPropertyResponse>(
      "property/step-1", paylaod);

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface Step1DetailsPayload {
    propertyId : string;
}

export interface Step1DetailsResponse {
    propertyId: string;
    listingType: PropertyListResponse;
    category: PropertyCategoryResponse;
    propertyType: PropertyType;
    bhk: BHK;
    ageOfProperty: number;
    facing: string;
    status: "draft" | "published" | "archived" | string;
    city: City;
    society: Society;
    locality: Locality;
    transactionType: string | null;
    constructionStatus: string | null;
    possessionBy: string | null;
    possessionTime: string | null;
    plotArea: number | null;
    plotAreaUnit: string | null;
    plotLength: number | null;
    plotWidth: number | null;
    plotFacingRoadWidth: number | null;
    createdAt: string;
    updatedAt: string; 
    completionStep: number;
    progressPercentage: number;

    
    
    possessionStatus?: string | null;
    possessionDate?: string | null;

    plotWidthUnit?: string | null;

    locationHub?: string | null;
    otherLocationHub?: string | null;

    zoneType?: string | null;
    propertyCondition?: string | null;
    wallConstructionStatus?: string | null;
    ownership?: string | null;

    builtUpArea?: number | null;
    builtUpAreaUnit?: string | null;
    carpetArea?: number | null;
    carpetAreaUnit?: string | null;

    suitableFor?: string[] | null;
    entranceWidth?: number | null;
    entranceWidthUnit?: string | null;
    ceilingHeight?: number | null;
    ceilingHeightUnit?: string | null;

    locatedNear?: string[] | null;
    plotLandType?: string | null;
    noOfOpenSides?: number | null;
    constructionDone?: string | null;
    constructionTypeOptions?: string[] | null;
}

export const step1PostPropertyDetailsApiHandler = async (propertyId: string) : Promise<Step1DetailsResponse> => {
    try{
        const response = await axiosInstance.get<Step1DetailsResponse>(
      `property/step-1/${propertyId}`,);

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface Step2PostPropertyPayload {
  propertyId?: string | null;

  // Floor & Unit Details
  floorNumber?: number | null;
  totalFloors?: number | null;
  flatNumber?: string | null;
  towerBlock?: string | null;
  propertyAreaAcre?: number | null;

  // Rental Details
  tenantType?: string | null;
  companyOccupancy?: string | null;
  rentAvailability?: string | null;
  availableFromDate?: string | null;
  monthlyRent?: number | null;
  maintenanceType?: string | null;
  maintenanceChargeAmount?: number | null;
  securityDepositType?: string | null;
  securityDepositAmount?: number | null;
  lockInType?: string | null;
  lockInMonths?: number | null;
  brokerageType?: string | null;
  brokerageAmount?: number | null;
  isBrokerageNegotiable?: boolean | null;
  isRentNegotiable?: boolean | null;

  // Additional Charges & Utilities
  dgUpsChargeIncluded?: string | null;
  electricityChargeIncluded?: string | null;
  waterChargeIncluded?: string | null;
  taxGovtChargeIncluded?: string | null;
  expectedRentIncrease?: string | null;

  // Pre-Leased / Investment Info
  isPreLeasedRented?: string | null;
  currentRentPerMonth?: number | null;
  leaseYears?: number | null;

  // Pricing & Plot Details
  price?: number | null;
  plotArea?: number | null;
  plotAreaUnit?: string | null;
  plotNumber?: string | null;
  houseNumber?: string | null;
  villaNumber?: string | null;
  plotPrice?: number | null;

  // Property Transaction & Status
  transactionType?: string | null;
  possessionStatus?: string | null;
  possessionDate?: string | null;
  ageOfProperty?: number | null;
  brokerage?: string | null;
  loanAvailable?: string | null;
  facing?: string | null;
  boundaryWall?: string | null;
  noOfOpenSides?: number | null;
  floorsAllowedForConstruction?: number | null;
  constructionDone?: string | null;
  constructionType?: string | null;
  cornerProperty?: string | null;
  propertyDescription?: string | null;

  // Structural / Facilities Info
  noOfStaircases?: number | null;
  privateParking?: number | null;
  privateWashrooms?: number | null;
  publicParking?: number | null;
  publicWashrooms?: number | null;
  expectedReturnOnInvestment?: number | null;
  isLiftAvailable?: boolean | null
}


export interface Step2PostPropertyResponse {
  id: string,
  status: string,
  completionStep: string,
}

export const step2PostPropertyCreateApiHandler = async (paylaod: Step2PostPropertyPayload) : Promise<Step2PostPropertyResponse> => {
    try{
        const response = await axiosInstance.post<Step2PostPropertyResponse>(
      "property/step-2", paylaod);

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface Step2DetailsResponse {
  propertyId: string | null;
  floorNumber: number | null;
  totalFloors: number | null;
  flatNumber: string | null;
  towerBlock: string | null;
  propertyAreaAcre: number | null;
  tenantType: string | null;
  companyOccupancy: string | null;
  rentAvailability: string | null;
  availableFromDate: string | null;
  monthlyRent: number | null;
  maintenanceType: string | null;
  maintenanceChargeAmount: number | null;
  securityDepositType: string | null;
  securityDepositAmount: number | null;
  lockInType: string | null;
  lockInMonths: number | null;
  brokerageType: string | null;
  brokerageAmount: number | null;
  isBrokerageNegotiable: boolean | null;
  price: number | null;
  plotArea: number | null;
  plotAreaUnit: string | null;
  plotNumber: string | null;
  houseNumber: string | null;
  villaNumber: string | null;
  transactionType: string | null;
  possessionStatus: string | null;
  ageOfProperty: string | null;
  possessionDate: string | null;
  plotPrice: number | null;
  brokerage: string | null;
  loanAvailable: string | null;
  facing: string | null;
  boundaryWall: string | null;
  noOfOpenSides: number | null;
  floorsAllowedForConstruction: number | null;
  constructionDone: string | null;
  constructionType: string | null;
  cornerProperty: string | null;
  propertyDescription: string | null;
  status: string | null;
  completionStep: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  progressPercentage: number;

  noOfStaircases: string | null,
  privateParking: string | null,
  publicParking: string | null,
  isRentNegotiable: boolean | null,
  dgUpsChargeIncluded: string | null,
  electricityChargeIncluded: string | null,
  waterChargeIncluded: string | null,
  expectedRentIncrease: string | null,
  taxGovtChargeIncluded: string | null,
  isPreLeasedRented: string | null,
  leaseYears: string | null,
  currentRentPerMonth: string | null,
  privateWashrooms: string | null,
  publicWashrooms: string | null,
  expectedReturnOnInvestment: number | null,
  isLiftAvailable: boolean | null,
}


export const step2PostPropertyDetailsApiHandler = async (propertyId: string) : Promise<Step2DetailsResponse> => {
    try{
        const response = await axiosInstance.get<Step2DetailsResponse>(
      `property/step-2/${propertyId}`,);

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface Step3PostPropertyPayload {
  propertyId: string | null;
  additionalRooms: string[] | null;
  reservedParkingCovered: number | null;
  reservedParkingOpen: number | null;
  powerBackup: string | null;
  furnishType: string | null;
  furnishingsCounts?: {
    item: string | null;
    count: number | null;
  }[] | null;
  amenities?: string[] | null;
  propertyDescription?: string | null;
  waterSource?: string | null;
  isLiftAvailable?: boolean | null;
  minNumberOfSeats?: string | null,
  maxNumberOfSeats?: string | null,
  numberOfCabins?: string | null,
  numberOfMeetingRooms?: string | null,
  privateWashrooms?: string | null,
  publicWashrooms?: string | null,
  conferenceRoom?: string | null,
  receptionArea?: string | null,
  privateParking?: string | null,
  publicParking?: string | null,
}

export interface Step3PostPropertyResponse {
  message: string;
}

export const step3PostPropertyCreateApiHandler = async (paylaod: Step3PostPropertyPayload) : Promise<Step3PostPropertyResponse> => {
    try{
        const response = await axiosInstance.post<Step3PostPropertyResponse>(
      "property/step-3", paylaod);

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface Step3DetailsResponse {
  propertyId: string | null;
  additionalRooms: string[] | null;
  reservedParkingCovered: number | null;
  reservedParkingOpen: number | null;
  powerBackup: string | null;
  furnishType: string | null;
  furnishingsCounts: {
    item: string | null;
    count: number | null;
  }[] | null;
  amenities: string[] | null;
  waterSource: string | null;
  isLiftAvailable: boolean | null;
  propertyDescription: string | null;
  status: string | null;
  completionStep: number | null;
  progressPercentage: number | null;
  minNumberOfSeats?: string | null,
  maxNumberOfSeats?: string | null,
  numberOfCabins?: string | null,
  numberOfMeetingRooms?: string | null,
  privateWashrooms?: string | null,
  publicWashrooms?: string | null,
  conferenceRoom?: string | null,
  receptionArea?: string | null,
  privateParking?: string | null,
  publicParking?: string | null,
}

export const step3PostPropertyDetailsApiHandler = async (propertyId: string) : Promise<Step3DetailsResponse> => {
    try{
        const response = await axiosInstance.get<Step3DetailsResponse>(
      `property/step-3/${propertyId}`,);

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface Step4PostPropertyPayload {

}

export interface Step4PostPropertyResponse {
  completionStep: number,
  progressPercentage: number,
  status: string
}

export const step4PostPropertyCreateApiHandler = async (paylaod: Step4PostPropertyPayload) : Promise<Step4PostPropertyResponse> => {
    try{
        const response = await axiosInstance.post<Step4PostPropertyResponse>(
      "property/step-4", paylaod);

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface Step4DetailsResponse {
  propertyId: string;
  photos: Array<{
    view: string | null;
    fileKey: string;
    isCoverImage: boolean;
  }>;
  videos: Array<{
    fileKey?: string | null;
    format?: string | null;
  }>;
  status: string;
  completionStep: number;
  progressPercentage: number;
}
export const step4PostPropertyDetailsApiHandler = async (propertyId: string) : Promise<Step4DetailsResponse> => {
    try{
        const response = await axiosInstance.get<Step4DetailsResponse>(
      `property/step-4/${propertyId}`,);

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface resetAPIPayload {
  propertyId?: string | null
}

export interface resetAPIResponse {
  completionStep: string
  id: string
  progressPercentage: string
  status: string
}

export const resetPostPropertyApiHandler = async (paylaod: resetAPIPayload) : Promise<resetAPIResponse> => {
    try{
        const response = await axiosInstance.post<resetAPIResponse>(
      "property/reset", paylaod);

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}


export interface ProeprtyListApiPayload {
page: number,
limit: number,
categoryIds?: string | null,
propertyTypeIds?: string | null,
listingTypeIds?: string | null,
furnishingTypes?: string | null,
projectStatuses?: string | null,
statuses?: string | null,
minPrice?: string | null,
maxPrice?: string | null,
search?: string,
sortBy?: string,
sortOrder?: string,
}

export interface ListingItem {
  id: string;
  title: string;
  status: string;

  photos: {
    fileKey: string,
    isCoverImage: boolean,
    view: string;
  }[]

  listingType: {
    id: string;
    name: string;
    code: string;
  };

  category: {
    id: string;
    name: string;
    code: string;
  };

  propertyType: {
    id: string;
    name: string;
    code: string;
  };

  bhkTypeName: string | null;
  furnishingType: string | null;
  constructionStatus: string | null;

  price: number | null;
  monthlyRent: number | null;

  priceSource: string;

  mediaCounts: {
    photos: number;
    videos: number;
  };

  coverPhotoKey: string;
  address: string;

  area: number | null;
  areaUnit: string;

  completionStep: number;
  progressPercentage: number;

  createdAt: string;  // ISO Date
  updatedAt: string;  // ISO Date
}

export interface PropertyListApiResponse {
  items: ListingItem[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
  },
  summary: {
    total: number,
    byStatus: {
      draft: number,
      pending_review: number,
      approved: number,
      rejected: number,
      active: number,
      inactive: number,
      sold: number,
      rented: number
    }
  }
}

export const propertyListApiPayload = async (paylaod: ProeprtyListApiPayload) : Promise<PropertyListApiResponse> => {
    try{
        const response = await axiosInstance.get<PropertyListApiResponse>(
      "property/listings",{
        params: paylaod
      });
    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}


export interface GetPropertyDetailsResponse {
  id: string;
  title: string;

  status: "pending_review" | "active" | "inactive" | string;

  area: number | null;
  areaUnit: "sq_ft" | "sq_yd" | "sq_m" | string;

  category: string;
  isVerified: string;
  expiresAt: string;
  rejectionReason: string;

  constructionStatus: string | null;
  furnishingType: string | null;

  verificationStatus: string; 
  comments: string;

  photos: {
    fileKey: string;
    view: string | null;
    isCoverImage: boolean;
    url?: string;
  }[];

  videos: {
    fileKey?: string;
    url?: string;
    view?: string;
  }[];

  price: number | null;
  monthlyRent: number | null;

  possessionDate: string | null;

  createdOn: string;      // YYYY-MM-DD
  lastAddedOn: string;    // YYYY-MM-DD

  completionStep: number;
  progressPercentage: number;

}

export const getPropertyDetailsApiHandler = async (id: string) : Promise<GetPropertyDetailsResponse> => {
    try{
        const response = await axiosInstance.get<GetPropertyDetailsResponse>(
      "property/" + id);
    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}


export interface GetUserCurrentCityPayload {
  latitude: string,
  longitude: string
}

export interface GetUserCurrentCityResponse {
  message: string,
  data: City[],
  success: boolean
}

export const gerUserCurrentCityApiHandler = async (latitude: string,longitude: string) : Promise<GetUserCurrentCityResponse> => {
    try{
        const response = await axiosInstance.get<GetUserCurrentCityResponse>(
      "users/auto-detect-city", {
        params: {latitude, longitude}
      });
    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

interface aggrement {
  id: string;
  userId: string;
  envelopeId: string;
  status: string;
  completedAt: string;
  returnUrl: string;
}

export interface GetUserAggrementResponse {
  success: boolean;
  message: string;
  data: aggrement[]
}

export const getUserAggrementApiHandler = async () : Promise<GetUserAggrementResponse> => {
    try{
        const response = await axiosInstance.get<GetUserAggrementResponse>(
      "users/agreements");
    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}


export interface GetFurnishingResponse {
  icon: string,
  name: string
}

export const getFurnishingList = async () : Promise<GetFurnishingResponse[]> => {
    try{
        const response = await axiosInstance.get<GetFurnishingResponse[]>(
      "property/furnishings");
    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface GetAmenitiesResponse {
  icon: string,
  name: string
}

export const getAmenitiesList = async () : Promise<GetAmenitiesResponse[]> => {
    try{
        const response = await axiosInstance.get<GetAmenitiesResponse[]>(
      "property/amenities");
    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface DeactivatePropertyPaylaod {
  propertyId: string;
  deactivationReason: string;
}
export interface DeactivatePropertyResponse {
  "success": boolean,
  "message": string,
  "propertyId": string,
  "status": string,
  "deactivationReason": string,
  "deactivatedOn": string
}

export const deActivatePropertyApiHandler = async (paylaod: DeactivatePropertyPaylaod) : Promise<DeactivatePropertyResponse> => {
    try{
        const response = await axiosInstance.post<DeactivatePropertyResponse>(
      "property/deactivate", paylaod);
    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface RepostPropertyPaylaod {
  propertyId: string;
}

export interface RepostPropertyResponse {
  "success": boolean,
  "message": string,
  "propertyId": string,
  "status": string,
}

export const repostPropertyApiHandler = async (paylaod: RepostPropertyPaylaod) : Promise<RepostPropertyResponse> => {
    try{
        const response = await axiosInstance.post<RepostPropertyResponse>(
      "property/repost", paylaod);
    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface GeneratePropertyDescriptionPayload {
  propertyId: string
}

export interface GeneratePropertyDescriptionResponse {
  success: boolean;
  description: string;
  propertyId: string;
}
export const generatePropertyDescriptionApiHandler = async (paylaod: GeneratePropertyDescriptionPayload) : Promise<GeneratePropertyDescriptionResponse> => {
    try{
        const response = await axiosInstance.post<GeneratePropertyDescriptionResponse>(
      "property/generate-description", paylaod);
    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface GetVerifyPropertyLinkPayload {
  propertyId: string
}

export interface GetVerifyPropertyLinkResponse {
  success: boolean;
  message: string;
  verificationRequestId: string;
  verificationToken: string;
  verificationLink: string

}
export const getVerifyPropertyLinkAPiHandler = async (paylaod: GetVerifyPropertyLinkPayload) : Promise<GetVerifyPropertyLinkResponse> => {
    try{
        const response = await axiosInstance.post<GetVerifyPropertyLinkResponse>(
      "property/request-verification", paylaod);
    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface GetPropertyPhotoTypeListResponse {
  id: string;
  name: string;
  displayOrder: number
}

export const getPropertyPhotoTypeListApiHandler = async () : Promise<GetPropertyPhotoTypeListResponse[]> => {
    try{
        const response = await axiosInstance.get<GetPropertyPhotoTypeListResponse[]>(
      "property/rooms");
    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface SubmitPropertyVerificationPayload {
  verificationToken: string;
  livePhotos: { fileKey: string, view: string}[],
  liveVideos: { fileKey: string, view: string}[],
  latitude: string,
  longitude: string
}

export interface SubmitPropertyVerificationResponse {
  success: boolean;
  message: string;
  verificationRequestId: string
}

export const submitPropertyVerificationApiHandler = async (paylaod: SubmitPropertyVerificationPayload) : Promise<SubmitPropertyVerificationResponse> => {
    try{
        const response = await axiosInstance.post<SubmitPropertyVerificationResponse>(
      "property-verification/submit-media", paylaod);
    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}
