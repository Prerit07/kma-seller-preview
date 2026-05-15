import { createEndUserSessionAction } from "@/api/actions/authActions";
import { useSessionStore } from "@/store/useSessionStore";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

export const useCreateEndUserSession = () => {
  const sessionId = useSessionStore((state) => state.sessionId);
  const isCreatingSession = useSessionStore((state) => state.isCreatingSession);
  const hasHydrated = useSessionStore((state) => state._hasHydrated);
  const setSessionId = useSessionStore((state) => state.setSessionId);
  const setIsCreatingSession = useSessionStore(
    (state) => state.setIsCreatingSession
  );

  const mutation = useMutation({
    mutationFn: createEndUserSessionAction,
    onMutate: () => {
      setIsCreatingSession(true);
    },
    onSuccess: (response) => {
      if (response?.sessionId) {
        setSessionId(response.sessionId);
      }
    },
    onSettled: () => {
      setIsCreatingSession(false);
    },
  });
  const { mutate, isPending } = mutation;

  const initializeSession = useCallback(() => {
    // Wait for Zustand to hydrate from localStorage before deciding to create
    if (!hasHydrated) return;
    if (sessionId || isCreatingSession || isPending) return;

    mutate();
  }, [hasHydrated, isCreatingSession, isPending, mutate, sessionId]);

  return {
    ...mutation,
    sessionId,
    initializeSession,
  };
};

export const useInitializeEndUserSession = () => {
  const { initializeSession, sessionId, isPending, error } =
    useCreateEndUserSession();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return {
    sessionId,
    isInitializingSession: isPending,
    sessionInitError: error,
  };
};
