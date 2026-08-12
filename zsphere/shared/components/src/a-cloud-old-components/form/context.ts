import { FormInstance } from "antd";
import { createContext } from "react";

export interface FormContextProps {
  isCustom: boolean;
  colon: boolean;
  hideRequiredMark: boolean;
  resource?: string;
  leval: number;
  form?: FormInstance;
}

export const FormContext = createContext<FormContextProps>({
  isCustom: false,
  colon: false,
  hideRequiredMark: false,
  leval: 0,
});

export interface FormItemContextProps {
  triggers: string[];
  isRequired: boolean;
}

export const FormItemContext = createContext<FormItemContextProps>({
  triggers: [],
  isRequired: false,
});
