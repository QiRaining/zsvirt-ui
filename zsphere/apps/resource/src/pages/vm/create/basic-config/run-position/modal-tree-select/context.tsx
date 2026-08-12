import { useContext, createContext } from "react";

export interface SelectTableContextData {
  linkJump: boolean;
}

export const context = createContext<SelectTableContextData>({
  linkJump: true,
});

export const { Provider: CreateProvider, Consumer: CreateConsumer } = context;

export const useTableSelect = () => useContext(context);
