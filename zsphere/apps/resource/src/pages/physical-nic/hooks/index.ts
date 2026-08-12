import type { PhysicalNic } from "@zstack/zsphere-types/graphql";
import { create } from "zustand";

interface IDetailStore {
  detail: PhysicalNic;
  setDetail: (value: PhysicalNic) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const useDetailStore = create<IDetailStore>((set) => ({
  detail: {} as any,
  setDetail: (detail) => set({ detail }),
  visible: false,
  setVisible: (visible) => set({ visible }),
}));
