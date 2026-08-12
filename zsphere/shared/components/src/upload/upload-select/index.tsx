import { Icon } from "@zstack/icon";
import cls from "classnames";

import Text from "../../a-cloud-old-components/text";

import style from "./style.module.less";

export interface IProps {
  value?: File;
  onChange?: (file: File | null) => void;
  accept?: string;
  className?: string;
}

export default function UploadSelect({
  value,
  onChange,
  className,
  accept,
}: IProps) {
  return (
    <label className={cls(style.wrapper, className)}>
      <div className={style.content}>
        <div className={style.text}>
          <Text value={value?.name} />
        </div>
        {value && (
          <div
            className={style.closeIcon}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onChange?.(null);
            }}
          >
            <Icon type="close-circle-fill" />
          </div>
        )}
      </div>
      <div className={style.suffixIcon}>
        <Icon type="cloud-upload" />
      </div>
      <div className={style.input}>
        <input
          accept={accept}
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && onChange) {
              onChange(file);
            }
            e.target.files = new DataTransfer().files;
          }}
        />
      </div>
    </label>
  );
}
