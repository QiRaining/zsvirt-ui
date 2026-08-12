import { Button } from "@zstack/design";
import { Upload } from "antd";
import React, { useCallback } from "react";

import style from "../style.module.less";

export interface IProps {
  accept?: string;
  onload?: (value: string) => void;
  children?: React.ReactNode;
}

export default function ImportButton({ accept, onload, children }: IProps) {
  const beforeUpload = useCallback(
    (file) => {
      if (onload) {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          if (typeof fileReader.result === "string") {
            onload(fileReader.result);
          }
        };
        fileReader.readAsText(file);
      }
      return Promise.reject();
    },
    [onload],
  );

  return (
    <Upload accept={accept} showUploadList={false} beforeUpload={beforeUpload}>
      <Button variant="link" className={style.importBtn}>
        {children}
      </Button>
    </Upload>
  );
}
