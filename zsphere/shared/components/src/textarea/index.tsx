import { Input } from "antd";
import type { TextAreaProps } from "antd/lib/input";
import React, { useMemo } from "react";

import { getBaseCls } from "../_utils/common";
import { useDebounce } from "../input/hooks";

import "./style.less";

const { TextArea } = Input;

export interface IProps extends Omit<TextAreaProps, "value" | "onChange"> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  length?: number; // 自定义显示当前输入个数，而不是字符串长度
  lengthFormat?: (value: string | number) => number; // 转换value成所对应的length
  isShowLimit?: boolean; // 是否显示输入限制信息
  maxLength?: number;
  limit?: number; // 自定义显示输入个数限制，而不是输入字符限制
  className?: string;
  rows?: number;
  style?: React.CSSProperties;
}

const ZTextArea = ({
  className,
  limit,
  length,
  maxLength,
  isShowLimit,
  lengthFormat,
  style,
  value: propValue,
  onChange: propOnChange,
  // autoSize,
  ...rest
}: IProps) => {
  // 取出maxLength否则会阻止用户输入
  const { value, onChange } = useDebounce({
    value: propValue,
    onChange: propOnChange,
  });

  const valueLength = useMemo(() => {
    if (!value) return 0;

    if (lengthFormat) {
      return lengthFormat(value as string);
    }

    return String(value)?.length;
  }, [value, lengthFormat]);

  const showLength = length || valueLength;
  const showLimit = limit || maxLength;

  const cls = `${className} ${getBaseCls("textarea-wrap")}`;

  return (
    <div className={cls}>
      <TextArea
        {...rest}
        //
        // autoSize={autoSize ?? { minRows: rows ?? 3}}
        style={{ minHeight: 76, ...style }}
        value={value}
        onChange={onChange}
      />
      {isShowLimit && (
        <span>
          {showLength}/{showLimit}
        </span>
      )}
    </div>
  );
};

export default ZTextArea;
