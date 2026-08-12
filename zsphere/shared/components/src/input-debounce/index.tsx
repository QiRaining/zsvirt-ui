import { useDebounceFn, usePersistFn } from "ahooks";
import { Input as AntInput } from "antd";
import { InputProps, PasswordProps } from "antd/es/input";
import React, { useEffect, useState } from "react";

import TextArea, { IProps as ITextAreaProps } from "../textarea";

// 泛型支持 value/onChange 的 props
function useDebounce<
  T extends { value?: any; onChange?: (e: React.ChangeEvent<any>) => void },
>(props: T): { value: any; onChange: (e: React.ChangeEvent<any>) => void } {
  const [value, onChange] = useState<any>(props.value);

  const { run } = useDebounceFn((v) => props.onChange?.(v), {
    wait: 200,
  });

  const changeHandle = usePersistFn((e) => {
    const v = e.target.value;

    if ("onChange" in props) {
      run(v);
    }

    onChange(v);
  });

  useEffect(() => {
    if (props.value !== value) {
      onChange(props.value);
    }
  }, [props.value]);

  return {
    value,
    onChange: changeHandle,
  };
}

const InputDebounce: React.FC<InputProps> = React.forwardRef((props, ref) => {
  const { value, onChange } = useDebounce(props as any);

  return (
    <AntInput {...props} value={value} onChange={onChange} ref={ref as any} />
  );
});

const PasswordDebounce: React.FC<PasswordProps> = (props) => {
  const { value, onChange } = useDebounce(props as any);

  return <AntInput.Password {...props} value={value} onChange={onChange} />;
};

export { InputDebounce, PasswordDebounce };
