import type { Bond as IBond } from "@zstack/zsphere-types/graphql";
import { create } from "zustand";

interface IDetailStore {
  detail: IBond;
  setDetail: (value: IBond) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const useDetailStore = create<IDetailStore>((set) => ({
  detail: {} as any,
  setDetail: (detail) => set({ detail }),
  visible: false,
  setVisible: (visible) => set({ visible }),
}));
