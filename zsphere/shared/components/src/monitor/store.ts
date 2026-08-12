import { create } from "zustand";

import { IBusinessMonitorStoreProps } from "./type";

export const monitorStore = create<IBusinessMonitorStoreProps>((set) => ({
  setStartTime: (startTime) => set({ startTime }),
  setEndTime: (endTime) => set({ endTime }),
  interval: 12000,
  setInterval: (interval) => set({ interval }),
  startInterval: () =>
    set((state: IBusinessMonitorStoreProps) => ({
      interval: state.lastInterval || 12000,
    })),
  stopInterval: () =>
    set((state: IBusinessMonitorStoreProps) => ({
      lastInterval: state.interval!,
      interval: null,
    })),
  increaseTime: () =>
    set((state: IBusinessMonitorStoreProps) => {
      const { startTime, endTime, interval } = state;
      if (startTime && endTime && interval) {
        return {
          startTime: startTime + interval,
          endTime: endTime + interval,
        };
      }
      return {};
    }),
}));
