import {
  getPropertyRatingReviewsAction,
  GetPropertyRatingReviewsPayload,
  GetPropertyRatingReviewsResponse,
} from "@/api/actions/propertyActions";
import { useQuery } from "@tanstack/react-query";

export type PropertyRatingReviewsQueryParams = Omit<
  GetPropertyRatingReviewsPayload,
  "propertyId"
> & { propertyId?: string | null };

export const usePropertyRatingReviews = (params: PropertyRatingReviewsQueryParams) => {
  const { propertyId, ...rest } = params;
  return useQuery({
    queryKey: ["property-rating-reviews", propertyId ?? null, rest],
    queryFn: () =>
      getPropertyRatingReviewsAction({
        propertyId: String(propertyId),
        ...rest,
      }),
    enabled: Boolean(propertyId),
    staleTime: 60_000,
  });
};
