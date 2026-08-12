import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  sessionId: string;
}

interface UserAction {
  setSessionId: (sessionId: string) => void;
}

export const useUserStore = create<UserState & UserAction>()(
  persist(
    (set) => ({
      sessionId: "",
      setSessionId: (sessionId) => {
        set({ sessionId });
      },
    }),
    { name: "user-storage" },
  ),
);
