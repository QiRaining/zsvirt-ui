import { Icon } from "@zstack/icon";
import { Input as AntInput } from "antd";
import { InputProps } from "antd/es/input";
import { PasswordProps } from "antd/es/input/Password";
import { SearchProps } from "antd/es/input/Search";
import React from "react";

import { useDebounce } from "./hooks";

interface InputRef {
  blur: () => void;
  focus: (option?: {
    preventScroll?: boolean;
    cursor?: "start" | "end" | "all";
  }) => void;
}

const InternalInput: React.ForwardRefRenderFunction<InputRef, InputProps> = (
  props,
  ref,
) => {
  const { value, onChange } = useDebounce({
    value: props.value,
    onChange: props.onChange,
  });

  return (
    <AntInput {...props} value={value} onChange={onChange} ref={ref as any} />
  );
};
const InternalInputPassword: React.ForwardRefRenderFunction<
  InputRef,
  PasswordProps & React.RefAttributes<unknown>
> = (props, ref) => {
  const { value, onChange } = useDebounce({
    value: props.value,
    onChange: props.onChange,
  });

  return (
    <AntInput.Password
      iconRender={(visibles) => (visibles ? <Icon type="eye" /> : <Icon type="eye-off" />)}
      {...props}
      value={value}
      onChange={onChange}
      ref={ref as any}
    />
  );
};

const InternalInputSearch: React.ForwardRefRenderFunction<
  InputRef,
  SearchProps & {
    value?: string | number | readonly string[];
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
> = (props, ref) => {
  const { value, onChange } = useDebounce(props);

  return (
    <AntInput.Search
      {...props}
      value={value}
      onChange={onChange}
      ref={ref as any}
    />
  );
};

const InternalInputForward = React.forwardRef(InternalInput);
const InternalInputPasswordForward = React.forwardRef(InternalInputPassword);

const InternalInputSearchForward = React.forwardRef(InternalInputSearch);

type InternalInputForward = typeof InternalInputForward;

export interface IInput extends InternalInputForward {
  Group: typeof AntInput.Group;
  Search: typeof InternalInputSearchForward;
  Password: typeof InternalInputPasswordForward;
}

const Input: IInput = InternalInputForward as IInput;

Input.Group = AntInput.Group;
Input.Search = InternalInputSearchForward;
Input.Password = InternalInputPasswordForward;

export default Input;
