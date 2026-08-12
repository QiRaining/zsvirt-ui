import { InputNumber, Tooltip } from "antd";
import cls from "classnames";
import React, { FC, useEffect, useState } from "react";

import { getBaseCls } from "../../_utils/common";
import TooltipWarpper from "../form/form-item/tooltip";
import Select from "../select";

import "./style.less";
import type { IInputUnitProps, ValueProps } from "./type";

const { Option: SelectOption } = Select;

const InputUnit: FC<IInputUnitProps> = ({
  value,
  unitList,
  onChange,
  prefix,
  suffix,
  inputWidth = 80,
  selectWidth = 100,
  id,
  tooltip,
  disabled,
  className,
  onMouseEnter,
  onMouseLeave,
  ...restProps
}) => {
  const [state, setState] = useState<ValueProps | undefined>(value);

  useEffect(() => {
    // 使用值比较而非引用比较，避免无限循环
    if (value?.number !== state?.number || value?.unit !== state?.unit) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/4b9b37db-f562-4bbc-b98c-1ef6af7e404a",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "input-unit/index.tsx:useEffect",
            message: "InputUnit useEffect triggered",
            data: {
              valueNumber: value?.number,
              valueUnit: value?.unit,
              stateNumber: state?.number,
              stateUnit: state?.unit,
              valueChanged: true,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            hypothesisId: "F",
            runId: "post-fix-2",
          }),
        },
      ).catch(() => {});
      // #endregion
      setState(value);
    }
  }, [value?.number, value?.unit]);

  const handleInputChange = (_value?: string | number | null) => {
    const newState = {
      number: _value as number,
      unit: state?.unit,
    };
    setState(newState);
    onChange?.(newState);
  };

  const handleSelectChange = (_value: string) => {
    const newState = {
      number: state?.number,
      unit: _value,
    };
    setState(newState);
    onChange?.(newState);
  };

  const renderUnitSelect = () => {
    if (!unitList) {
      return state?.unit ? (
        <span style={{ marginLeft: 8 }}>{state?.unit}</span>
      ) : null;
    }

    return (
      <Select
        onChange={handleSelectChange}
        value={state?.unit}
        style={{ width: selectWidth, marginLeft: 4 }}
        disabled={disabled}
      >
        {unitList.map((item) => {
          if (typeof item === "string") {
            return (
              <SelectOption value={item} key={item}>
                {item}
              </SelectOption>
            );
          }

          return (
            <SelectOption
              value={item.value}
              key={item.value}
              disabled={item.disabled}
            >
              {item.disabled && item.tooltip ? (
                <Tooltip title={item.tooltip}>{item.displayName}</Tooltip>
              ) : (
                item.displayName
              )}
            </SelectOption>
          );
        })}
      </Select>
    );
  };

  const inputNumberElement = (
    <InputNumber
      className={cls({
        [getBaseCls("disabled-input-number")]: disabled,
      })}
      value={state?.number}
      onChange={handleInputChange}
      disabled={disabled}
      style={{ width: inputWidth }}
      {...restProps}
    />
  );

  return (
    <div
      style={{ display: "flex" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      id={id}
      role="none"
    >
      {prefix}
      {tooltip ? (
        <TooltipWarpper tooltip={tooltip}>{inputNumberElement}</TooltipWarpper>
      ) : (
        inputNumberElement
      )}
      {renderUnitSelect()}
      {suffix}
    </div>
  );
};

InputUnit.displayName = "InputUnit";

export default InputUnit;
export type { IInputUnitProps, ValueProps };
