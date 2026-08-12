import React from "react";
import { createStore, useStore as useStore_, StoreApi } from "zustand";

export interface IStoreValue {
  currentRow?: any;
  detailVisible: boolean;
  renderDetail?: boolean;
}

export interface IStore extends IStoreValue {
  actions: {
    showDetail: (row: any) => void;
    hideDetail: () => void;
  };
}

const StoreContext = React.createContext<StoreApi<IStore> | null>(null);

export interface IStoreProviderProps {
  initialValue?: Partial<IStoreValue>;
  children: React.ReactNode;
}

export function StoreProvider({ children, initialValue }: IStoreProviderProps) {
  const [store] = React.useState(() =>
    createStore<IStore>((set) => ({
      detailVisible: false,
      ...initialValue,
      actions: {
        showDetail: (row) => set({ detailVisible: true, currentRow: row }),
        hideDetail: () => set({ detailVisible: false }),
      },
    })),
  );

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useStore<T>(selector: (state: IStore) => T) {
  const store = React.useContext(StoreContext);
  if (!store) {
    throw new Error("missing table list store context");
  }
  return useStore_(store, selector);
}
