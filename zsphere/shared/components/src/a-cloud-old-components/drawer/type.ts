import { FormInstance } from "antd/es/form";

export interface IDrawerCreate {
  open: boolean;
  setOpen: (open: boolean) => void;
  children?: React.ReactNode;
}

export interface DrawerFormProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  children: React.ReactElement;
  resetForm?: boolean;
  title: string;
  className?: string;
}

export interface DrawerFormRefType {
  form: FormInstance;
  submit: (values: any) => void;
}
