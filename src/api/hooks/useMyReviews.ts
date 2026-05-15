import {
  getMyReviewsAction,
  GetMyReviewsResponse,
} from "@/api/actions/propertyActions";
import { useQuery } from "@tanstack/react-query";

export const MY_REVIEWS_QUERY_KEY = "end-user-my-reviews";

interface UseMyReviewsParams {
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest";
  enabled?: boolean;
}

export function useMyReviews({
  page = 1,
  limit = 10,
  sortBy = "newest",
  enabled = true,
}: UseMyReviewsParams = {}) {
  const query = useQuery<GetMyReviewsResponse>({
    queryKey: [MY_REVIEWS_QUERY_KEY, page, limit, sortBy],
    queryFn: () =>
      getMyReviewsAction({
        page,
        limit,
        sortBy,
      }),
    enabled,
    staleTime: 60_000,
  });

  return {
    ...query,
    reviews: query.data?.reviews ?? [],
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    currentPage: query.data?.page ?? page,
    limit: query.data?.limit ?? limit,
  };
}
