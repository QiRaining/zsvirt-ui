import { Icon } from "@zstack/icon";
import { usePersistFn } from "ahooks";
import { Input, Tooltip } from "antd";
import { InputProps } from "antd/es/input";
import classNames from "classnames";
import React, {
  DOMAttributes,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";

import "./style.less";

const noop = () => {};

const getBaseCls = (name: string) => {
  return `zstack-${name}`;
};

const baseCls = getBaseCls("input-number");

interface InputNumberProps
  extends
    Pick<InputProps, "onPressEnter" | "disabled">,
    Pick<DOMAttributes<HTMLDivElement>, "onMouseEnter" | "onMouseLeave"> {
  value?: number | string;
  defaultValue?: number | string;
  onChange?: (v: number | string) => void;
  max?: number;
  min?: number;
  showOperationBtn?: boolean;
  rangeMessage?: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string; // 用于 antd Form 滚动到错误位置,
  placeholder?: string;
}

const InputNumber: React.ForwardRefRenderFunction<any, InputNumberProps> = (
  props,
  ref,
) => {
  const inputNumberRef = useRef<any>(null);

  const intl = useIntl() as any;

  const {
    value,
    onChange: setValue = noop,
    min = 1,
    max = 10000,
    disabled = false,
    showOperationBtn = true,
    defaultValue = min,
    rangeMessage,
    className,
    style,
    id,
    onMouseEnter,
    onMouseLeave,
    ...rest
  } = props;

  const [error, setError] = useState({ msg: "", open: false });
  const [showErrorState, setShowErrorState] = useState<boolean>(false);

  const inc = usePersistFn(() => {
    if (disabled) {
      return;
    }

    const num = Number(value!);

    const newVal = Number.isNaN(num) ? min : num + 1;

    if (newVal > max) {
      return;
    }

    if (newVal < max) {
      setValue(newVal < min ? min : newVal);
      inputNumberRef.current?.focus?.();
    } else {
      setValue(max);
      inputNumberRef.current?.blur?.();
    }
  });
  const dec = usePersistFn((e: React.MouseEvent<HTMLSpanElement>) => {
    if (disabled) {
      return;
    }

    const num = Number(value!);

    const newVal = Number.isNaN(num) ? min : num - 1;

    if (newVal < min) {
      return;
    }

    if (newVal > min) {
      setValue(newVal > max ? max : newVal);
      inputNumberRef.current?.focus?.();
    } else {
      setValue(min);
      inputNumberRef.current?.blur?.();
    }
  });

  const isDisabledInc =
    disabled || (!Number.isNaN(Number(value!)) && Number(value!) >= max);
  const isDisabledDec =
    disabled || (!Number.isNaN(Number(value!)) && Number(value!) <= min);

  const incClassNames = classNames(`${baseCls}-operation`, {
    [`${baseCls}-disabled`]: isDisabledInc,
  });
  const decClassNames = classNames(`${baseCls}-operation`, {
    [`${baseCls}-disabled`]: isDisabledDec,
  });

  const inputValueOrDefaultValue = useMemo(() => {
    if ("value" in props) {
      return { value: value !== undefined ? `${value}` : "" };
    }

    return {
      defaultValue: defaultValue !== undefined ? `${defaultValue}` : "",
    };
  }, [props, value, defaultValue]);

  const onChange = usePersistFn(({ target: { value: v } }: any) => {
    if (v === "" || v === null || v === undefined) {
      setValue("");
      setShowErrorState(true);
      return;
    }

    const isNumber = /^-?\d*(\.\d*)?$/.test(v);

    if (!isNumber) {
      setShowErrorState(true);
      return;
    }

    const formatV = Number(v!);

    if (
      Number.isNaN(formatV) ||
      formatV > Number.MAX_SAFE_INTEGER ||
      formatV < Number.MIN_SAFE_INTEGER
    ) {
      setValue(v);
      setShowErrorState(true);
      return;
    }

    if (formatV > max || formatV < min) {
      setError({
        msg:
          rangeMessage ||
          `${intl.formatMessage({
            id: "quantityLimit",
            defaultMessage: "Quantity Limit",
          })}${min}-${max}`,
        open: true,
      });
      setShowErrorState(true);
      setValue(formatV);
      return;
    }

    setShowErrorState(false);
    setValue(formatV);
  });

  const numberInputProps = {
    ...rest,
    ...inputValueOrDefaultValue,
    onChange,
    disabled,
    ref: inputNumberRef,
  };

  useImperativeHandle(ref, () => inputNumberRef.current, []);

  useEffect(() => {
    let timer: any;

    if (error.open) {
      timer = setTimeout(() => {
        setError((originError) => ({ ...originError, open: false }));
      }, 2500);
    }

    return () => timer && clearTimeout(timer);
  }, [error]);

  return (
    <div
      role="none"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={classNames(baseCls, className, {
        [`${baseCls}-error`]: showErrorState,
      })}
      style={style}
      id={id}
    >
      {showOperationBtn && (
        <span className={decClassNames} onClick={dec}>
          <Icon type="minus" />
        </span>
      )}

      <Tooltip title={error.msg} open={error.open}>
        <Input {...numberInputProps} bordered={false} />
      </Tooltip>

      {showOperationBtn && (
        <span className={incClassNames} onClick={inc}>
          <Icon type="plus" />
        </span>
      )}
    </div>
  );
};

InputNumber.displayName = "InputNumber";

export default React.forwardRef<any, InputNumberProps>(InputNumber);
