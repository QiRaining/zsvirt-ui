import { createContext } from "react";

interface ProtectedResourceContextType {
  store: any;
  setStore: (store: any) => void;
}

const ProtectedResourceContext = createContext<ProtectedResourceContextType>({
  store: {},
  setStore: () => {},
});

export default ProtectedResourceContext;
