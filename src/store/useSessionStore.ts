import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionState {
  sessionId: string | null;
  isCreatingSession: boolean;
  _hasHydrated: boolean;
  setSessionId: (sessionId: string) => void;
  setIsCreatingSession: (isCreatingSession: boolean) => void;
  clearSession: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      isCreatingSession: false,
      _hasHydrated: false,
      setSessionId: (sessionId) => set({ sessionId }),
      setIsCreatingSession: (isCreatingSession) => set({ isCreatingSession }),
      clearSession: () => set({ sessionId: null, isCreatingSession: false }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "kma-end-user-session",
      partialize: (state) => ({ sessionId: state.sessionId }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
