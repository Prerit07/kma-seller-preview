import axios from "axios";
import { axiosInstance } from "./axiosService";

export interface CitiesResponse {
  success: boolean;
  message: string;
  data: string[];
}

export const getCityApiHandler = async () : Promise<CitiesResponse> => {
    try{
        const response = await axiosInstance.get<CitiesResponse>(
      "users/cities");

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface PropertyListResponse {
  id: string;
  name: string;
  code: string;
}

export const getPropertyListApiHandler = async () : Promise<PropertyListResponse[]> => {
    try{
        const response = await axiosInstance.get<PropertyListResponse[]>(
      "property/listing-types");

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface PropertyCategoryResponse {
  id: string;
  name: string;
  code: string;
}

export const getPropertyCategoryApiHandler = async () : Promise<PropertyCategoryResponse[]> => {
    try{
        const response = await axiosInstance.get<PropertyCategoryResponse[]>(
      "property/categories");

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface PropertyTypePayload {
  propertyListType: string,
  propertyCategory: string,
}

export interface PropertyType {
  id: string;
  name: string;
  code: string;
}

export interface PropertyTypeResponse {
  propertyTypes: PropertyType[]
}
export const getPropertyTypeApiHandler = async ({propertyListType, propertyCategory} : PropertyTypePayload) : Promise<PropertyTypeResponse> => {
    try{
        const response = await axiosInstance.get<PropertyTypeResponse>(
      "property/master/property-types", {
        params: { 'property-listing-type': propertyListType, 'property-category': propertyCategory} 
      }); 
    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export type City = {
  id?: string;
  name: string;
  code?: string;
  state?: string;
  country?: string;
  latitude: number | string;
  longitude: number | string;
  placeId?: string;
  source: "database" | "google" | string;
};

export const getCitySearchApiHandler = async (q: string) : Promise<City[]> => {
    try{
        const response = await axiosInstance.get<City[]>(
      "property/cities/search" , {
        params: {q}
      });

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface BuildingSearchPayload {
  query: string,
  cityId?: string,
  cityName: string
}
export interface BuildingSearchResponse {
  id: string,
  name: string,
  address: string,
  source: string,
  localityName?: string,
}

export const getBuildingSearchApiHandler = async ({query,cityId, cityName}: BuildingSearchPayload) : Promise<BuildingSearchResponse[]> => {
    try{
        const response = await axiosInstance.get<BuildingSearchResponse[]>(
      "property/locations/search" , {
        params: {q: query, cityId: cityId ?? '', cityName: cityName ?? ''}
      });

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export const getLocalitySearchApiHandler = async ({query,cityId, cityName}: BuildingSearchPayload) : Promise<BuildingSearchResponse[]> => {
    try{
        const response = await axiosInstance.get<BuildingSearchResponse[]>(
      "property/localities/search" , {
        params: {q: query, cityId: cityId ?? '', cityName: cityName ?? ''}
      });

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface BhkPayload {
  societyId?: string,
  propertyTypeId?: string
}

export interface BuiltUpArea {
  id: string;
  superBuiltUpArea: number;
  carpetArea: number;
  noOfBathrooms: number;
  bhkTypeId: string;
  societyId: string;
}

export interface BhkResponse {
  id: string;
  name: string;
  code: string;
  sortOrder: number;
  builtUpAreas: BuiltUpArea[];
}

export const getBhkApiHandler = async ({societyId,propertyTypeId}: BhkPayload) : Promise<BhkResponse[]> => {
    try{
        const response = await axiosInstance.get<BhkResponse[]>(
      "property/bhk-types-and-areas" , {
        params: {societyId: societyId ?? '', propertyTypeId: propertyTypeId ?? ''}
      });

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface GetFileUploadUrlPayload {
  filename: string,
  contentType: string,
  folder: string,
  expiresIn: number
}

export interface GetFileUploadUrlResponse {
  success: boolean,
  message: string,
  data: {
    url: string,
    key: string,
    expiresIn: number,
  }

}

export const getFileUploadUrlApiHandler = async (payload: GetFileUploadUrlPayload) : Promise<GetFileUploadUrlResponse> => {
    try{
        const response = await axiosInstance.post<GetFileUploadUrlResponse>(
      "uploads/presigned-url" , payload);

    return response.data;
    }catch(error: any){
        throw error.response?.data ?? error;
    }
}

export interface UploadFileToS3Payload {
  url: string,
  file: File
}
export interface UploadFileToS3Response {
  status: number,
  statusText: string,
}

export const uploadFileToS3ApiHandler = async ({url, file}: UploadFileToS3Payload) : Promise<UploadFileToS3Response> => {
  try{
    const response = await axios.put<UploadFileToS3Response>(url, file, {
      headers: {
        "Content-Type": file.type
      }
    })
    return {status: response.status, statusText: response.statusText}
  }catch(error: any){
    throw error.response?.data ?? error
  }
}