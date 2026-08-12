import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface IDashboardStore {
  zoneUuid: string;
  setZoneUuid: (zoneUuid: string) => void;
}
export const useDashboardStore = create<IDashboardStore>()(
  persist(
    (set) => ({
      zoneUuid: "",
      setZoneUuid: (zoneUuid: string) => set({ zoneUuid }),
    }),
    { name: "virtualization-dashboard-store" },
  ),
);
