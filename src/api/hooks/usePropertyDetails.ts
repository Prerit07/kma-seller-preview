import {
  getEndUserPropertyDetailsAction,
  GetEndUserPropertyDetailsResponse,
} from "@/api/actions/propertyActions";
import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/store/useSessionStore";

interface UsePropertyDetailsParams {
  id?: string | null;
  enabled?: boolean;
}

export const usePropertyDetails = ({
  id,
  enabled = true,
}: UsePropertyDetailsParams) => {
  const sessionId = useSessionStore((s) => s.sessionId);
  const hasHydrated = useSessionStore((s) => s._hasHydrated);

  // Check if user is logged in (no need to wait for session)
  const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("user");

  // Wait for session to be ready before fetching (unless logged in — they have unlimited views)
  const sessionReady = isLoggedIn || (hasHydrated && !!sessionId);

  return useQuery<GetEndUserPropertyDetailsResponse>({
    queryKey: ["end-user-property-details", id ?? null, sessionId],
    queryFn: () => getEndUserPropertyDetailsAction({ id: String(id), sessionId: sessionId ?? undefined }),
    enabled: Boolean(id) && enabled && sessionReady,
    staleTime: 60_000,
    retry: (failureCount, error: unknown) => {
      // Don't retry if it's a view limit error
      if (
        error &&
        typeof error === "object" &&
        "requiresLogin" in error &&
        (error as { requiresLogin?: boolean }).requiresLogin === true
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
