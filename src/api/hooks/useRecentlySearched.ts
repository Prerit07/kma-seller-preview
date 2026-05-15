import {
  getRecentlySearchedAction,
  GetRecentlySearchedResponse,
} from "@/api/actions/propertyActions";
import { useSessionStore } from "@/store/useSessionStore";
import { useQuery } from "@tanstack/react-query";

export const RECENTLY_SEARCHED_QUERY_KEY = "end-user-recently-searched";

interface UseRecentlySearchedParams {
  page?: number;
  limit?: number;
  sortBy?: "recent" | "relevance";
  enabled?: boolean;
}

export function useRecentlySearched({
  page = 1,
  limit = 10,
  sortBy = "recent",
  enabled = true,
}: UseRecentlySearchedParams = {}) {
  const sessionId = useSessionStore((state) => state.sessionId);

  const query = useQuery<GetRecentlySearchedResponse>({
    queryKey: [RECENTLY_SEARCHED_QUERY_KEY, page, limit, sortBy, sessionId ?? null],
    queryFn: () =>
      getRecentlySearchedAction({
        page,
        limit,
        sortBy,
        xSessionId: sessionId ?? undefined,
      }),
    enabled,
    staleTime: 60_000,
  });

  return {
    ...query,
    searches: query.data?.searches ?? [],
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    currentPage: query.data?.page ?? page,
  };
}
