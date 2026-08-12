import { FormProps } from "antd/lib/form";

export type AntdFormLayout = FormProps["layout"];

export interface IFormProps extends Omit<FormProps, "layout"> {
  layout?: "custom" | AntdFormLayout;
  resource?: string;
}
