import { createContext } from "react";

interface BaremetalInstanceCreateContextProps {
  source: any;
  setSource: (source: any) => void;
  disabledFlag: boolean;
  setDisabledFlag: (disabledFlag: boolean) => void;
}

const BaremetalInstanceCreateContext =
  createContext<BaremetalInstanceCreateContextProps>({
    source: {},
    setSource: () => {},
    disabledFlag: false,
    setDisabledFlag: () => {},
  });

export default BaremetalInstanceCreateContext;
