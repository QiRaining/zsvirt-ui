import { createContext } from "react";

interface IContext {
  eptVisible?: boolean;
  setEptVisible?: (v: boolean) => void;
}

const FormContext = createContext<IContext>({ eptVisible: true });

export default FormContext;
