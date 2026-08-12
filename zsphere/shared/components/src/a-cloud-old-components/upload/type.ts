import { Item } from "@zstack/zsphere-types";
import { UploadProps, DraggerProps } from "antd/es/upload";
import { UploadFile } from "antd/lib/upload/interface";

export type IUploadFile<T extends Item = any> = UploadFile<T> & {
  errorMessage?: string;
  validateResult?: {
    message?: string;
    type?: "error" | "success" | "loading";
  };
};

export type IUploadProps<T extends Item = any> = UploadProps<T> & {
  text?: string;
  acceptText?: string;
  checkText?: string;
  onCheck?: (index: number) => void;
  fileList?: IUploadFile<T>[];
  imageSize?: "small" | "large";
};

export type IDraggerProps<T extends Item = any> = DraggerProps & {
  text?: string;
  acceptText?: string;
  checkText?: string;
  onCheck?: (index: number) => void;
  fileList?: IUploadFile<T>[];
};
