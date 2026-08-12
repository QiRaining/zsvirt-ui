import { create } from "zustand";

export interface LoginRedirectStore {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  forceLogout?: boolean;
}

export const useLoginRedirectStore = create<LoginRedirectStore>((set) => ({
  visible: false,
  setVisible: (visible) => set({ visible }),
}));
