import {
  getEndUserFiltersAction,
  GetEndUserFiltersPayload,
  GetEndUserFiltersResponse,
} from "@/api/actions/propertyActions";
import { useQuery } from "@tanstack/react-query";

type EndUserFiltersQueryParams = Omit<
  GetEndUserFiltersPayload,
  "correlationId"
>;

export const END_USER_FILTERS_QUERY_KEY = "end-user-filters";

export function useEndUserFilters(
  params: EndUserFiltersQueryParams = {},
  options: { enabled?: boolean } = {}
) {
  return useQuery<GetEndUserFiltersResponse>({
    queryKey: [END_USER_FILTERS_QUERY_KEY, params],
    queryFn: () => getEndUserFiltersAction(params),
    enabled: options.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
}
