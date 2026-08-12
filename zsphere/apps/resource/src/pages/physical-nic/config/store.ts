import type { PhysicalNic } from "@zstack/zsphere-types/graphql";
import { create } from "zustand";

interface IStore {
  detail: PhysicalNic;
  setDetail: (detail: PhysicalNic) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const useNicStrore = create<IStore>((set) => ({
  detail: {},
  setDetail: (detail) => set({ detail }),
  visible: false,
  setVisible: (visible) => set({ visible }),
}));
