import { create } from "zustand";
import { combine } from "zustand/middleware";

export const useAlarmStore = create(
  combine(
    {
      filterList: ["Normal", "Important", "Emergent"],
      resourceType: "all",
    },
    (set) => ({
      setFilterList: (list: string[]) => set({ filterList: list }),
      setResourceType: (type: string) => set({ resourceType: type }),
    }),
  ),
);
