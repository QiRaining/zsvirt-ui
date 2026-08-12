import { createContext, useContext } from "react";

export const context = createContext<{ onBack?: () => void }>({});

export const {
  Provider: DrawerCreateProvider,
  Consumer: DrawerCreateConsumer,
} = context;

export function useDrawerCreate() {
  const { onBack } = useContext(context);
  return {
    onBack,
  };
}
