import cls from "classnames";

import style from "./style.module.less";

export interface IProps {
  onChange?: (file: File) => void;
  accept?: string;
  className?: string;
  title?: string;
}

export default function UploadLink({
  onChange,
  className,
  accept,
  title,
}: IProps) {
  return (
    <label className={cls(style.wrapper, className)}>
      <a>{title}</a>
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
