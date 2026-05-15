import {
  EndUserPropertySummary,
  getEndUserPropertiesAction,
  getEndUserPropertiesCountAction,
  GetEndUserPropertiesCountResponse,
  GetEndUserPropertiesPayload,
  GetEndUserPropertiesResponse,
} from "@/api/actions/propertyActions";
import { useQuery } from "@tanstack/react-query";

interface UseEndUserPropertiesOptions {
  enabled?: boolean;
}

type EndUserPropertiesQueryParams = Omit<
  GetEndUserPropertiesPayload,
  "correlationId"
>;

export const useEndUserProperties = (
  params: EndUserPropertiesQueryParams = {},
  options: UseEndUserPropertiesOptions = {}
) => {
  return useQuery<
    GetEndUserPropertiesResponse | EndUserPropertySummary[],
    unknown,
    EndUserPropertySummary[]
  >({
    queryKey: ["end-user-properties", params],
    queryFn: () => getEndUserPropertiesAction(params),
    select: (response) => {
      if (Array.isArray(response)) {
        return response;
      }
      return response?.properties ?? response?.data ?? [];
    },
    enabled: options.enabled ?? true,
    staleTime: 60_000,
  });
};

export const useEndUserPropertiesCount = (
  params: EndUserPropertiesQueryParams = {},
  options: UseEndUserPropertiesOptions = {}
) => {
  return useQuery<GetEndUserPropertiesCountResponse, unknown, number>({
    queryKey: ["end-user-properties-count", params],
    queryFn: () => getEndUserPropertiesCountAction(params),
    select: (response) => response?.count ?? 0,
    enabled: options.enabled ?? true,
    staleTime: 60_000,
  });
};

