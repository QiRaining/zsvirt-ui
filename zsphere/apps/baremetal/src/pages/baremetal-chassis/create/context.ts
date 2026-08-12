import { createContext } from "react";

interface BaremetalChassisCreateContextProps {
  source: any;
  setSource: (source: any) => void;
}

const BaremetalChassisCreateContext =
  createContext<BaremetalChassisCreateContextProps>({
    source: {},
    setSource: () => {},
  });

export default BaremetalChassisCreateContext;
