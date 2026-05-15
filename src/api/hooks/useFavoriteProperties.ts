import {
  getFavoritePropertiesAction,
  GetFavoritePropertiesResponse,
} from "@/api/actions/propertyActions";
import { useQuery } from "@tanstack/react-query";

export const FAVORITE_PROPERTIES_QUERY_KEY = "end-user-favorites";

interface UseFavoritePropertiesParams {
  page?: number;
  limit?: number;
  listingType?: "sale" | "rent";
  sort?: "newest" | "oldest" | "price_high" | "price_low";
  enabled?: boolean;
}

export function useFavoriteProperties({
  page = 1,
  limit = 20,
  listingType,
  sort,
  enabled = true,
}: UseFavoritePropertiesParams = {}) {
  const query = useQuery<GetFavoritePropertiesResponse>({
    queryKey: [FAVORITE_PROPERTIES_QUERY_KEY, page, limit, listingType ?? null, sort ?? null],
    queryFn: () =>
      getFavoritePropertiesAction({
        page,
        limit,
        listingType,
        sort,
      }),
    enabled,
    staleTime: 60_000,
  });

  return {
    ...query,
    properties: query.data?.properties ?? [],
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    currentPage: query.data?.page ?? page,
  };
}
