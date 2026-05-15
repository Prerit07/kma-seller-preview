import {
  getSimilarPropertiesAction,
  GetSimilarPropertiesResponse,
  SimilarProperty,
} from "@/api/actions/propertyActions";
import { useQuery } from "@tanstack/react-query";

interface UseSimilarPropertiesParams {
  cityId?: string | null;
  propertyTypeId?: string | null;
  limit?: number;
  enabled?: boolean;
}

export const useSimilarProperties = ({
  cityId,
  propertyTypeId,
  limit = 10,
  enabled = true,
}: UseSimilarPropertiesParams) => {
  return useQuery<
    GetSimilarPropertiesResponse,
    unknown,
    SimilarProperty[]
  >({
    queryKey: ["end-user-properties-similar", cityId ?? null, propertyTypeId ?? null, limit],
    queryFn: () =>
      getSimilarPropertiesAction({
        cityId: String(cityId),
        ...(propertyTypeId ? { propertyTypeId: String(propertyTypeId) } : {}),
        limit,
      }),
    select: (response) => response?.properties ?? [],
    enabled: Boolean(cityId) && enabled,
    staleTime: 60_000,
  });
};
