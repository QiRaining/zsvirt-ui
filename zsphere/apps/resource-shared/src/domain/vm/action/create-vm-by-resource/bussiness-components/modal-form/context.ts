import { createContext, useContext } from "react";

export interface IModalFormContext<T = any, S = any> {
  source?: T;
  selectedList?: S[];
}

export const ModalFormContext = createContext<IModalFormContext>({
  source: {},
  selectedList: [],
});

export function useModalFormContext<T = any, S = any>() {
  const { ...rest } = useContext<IModalFormContext<T, S>>(ModalFormContext);

  return {
    ...rest,
  };
}
