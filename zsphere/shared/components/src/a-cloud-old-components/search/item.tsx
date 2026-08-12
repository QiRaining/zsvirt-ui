import { useToggle, useUpdateEffect } from "ahooks";
import { Input } from "antd";
import cls from "classnames";
import { includes } from "lodash-es";
import React, { FC, useState, KeyboardEvent } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../_utils/common";
import Tag from "../tag";
import { SingleDropdown, MultipleDropdown, SearchDropdown } from "./dropdown";
import { ConditionOption, ConditionType } from "./type";

import "./style.less";

interface IProps {
  type: ConditionType;
  label: string;
  oKey?: string;
  options?: ConditionOption[];
  showLabel?: boolean;
  className?: string;
  initText?: string;
  onChange?: (value: string | string[]) => void;
  onRemove?: () => void;
  onInput?: (hasValue: boolean) => void;
}

const Item: FC<IProps> = ({
  type,
  label,
  oKey,
  options = [],
  showLabel = true,
  className,
  initText,
  onChange,
  onRemove,
  onInput,
  ...restProps
}) => {
  const intl = useIntl();

  const [editing, { toggle: toggleEditing }] = useToggle(!initText);
  const [value, setValue] = useState<string>(initText ?? "");
  const [values, setValues] = useState<string[]>();
  const [text, setText] = useState<string>(initText ?? "");

  const finishEdit = () => {
    if (value || values) {
      toggleEditing(false);
    }
  };

  const handleInputKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Backspace":
      case "Escape":
        if (!text) {
          onRemove?.();
        }
        break;
    }
    onInput?.(!!text);
  };

  const handleInputChange = (_value: string) => {
    setValue(_value);
    setText(_value);
  };

  const handleSingleSelectChange = (_value: string) => {
    setValue(_value);
    const _option = options.find((item) => item.value === _value)!;
    const _text = _option.text;
    setText(_text);
    toggleEditing(false);
  };

  const handleMultipleSelectChange = (_values: string[]) => {
    setValues(_values);
    const _options = options.filter((item) => includes(_values, item.value));
    const _text = _options.map((item) => item.text).join("，");
    setText(_text);
    toggleEditing(false);
  };

  useUpdateEffect(() => {
    if (!editing) {
      if (value) {
        onChange?.(value);
      }
      if (values) {
        onChange?.(values);
      }
    }
  }, [editing, value]);

  const renderInput = () => {
    const dropdownInput = (
      <Input
        value={text}
        onKeyUp={handleInputKeyUp}
        bordered={false}
        placeholder={intl.formatMessage({
          id: "pleaseSelect",
          defaultMessage: "Select",
        })}
        autoFocus
      />
    );
    switch (type) {
      case "input": {
        let placeholder = intl.formatMessage({
          id: "pleaseInput",
          defaultMessage: "Enter",
        });
        if (!showLabel) {
          placeholder = intl.formatMessage(
            {
              id: "defaultSearchItem",
              defaultMessage: "Default {item}",
            },
            {
              item: label,
            },
          );
        }
        return (
          <Input
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onPressEnter={finishEdit}
            onBlur={finishEdit}
            onKeyUp={handleInputKeyUp}
            bordered={false}
            placeholder={placeholder}
            autoFocus
          />
        );
      }
      case "singleSelect":
        return (
          <SingleDropdown
            options={options}
            value={value}
            onChange={handleSingleSelectChange}
          >
            {dropdownInput}
          </SingleDropdown>
        );
      case "multipleSelect":
        return (
          <MultipleDropdown
            options={options}
            value={values}
            onChange={handleMultipleSelectChange}
          >
            {dropdownInput}
          </MultipleDropdown>
        );
      case "searchSelect":
        return (
          <SearchDropdown
            options={options}
            value={values}
            onChange={handleMultipleSelectChange}
          >
            {dropdownInput}
          </SearchDropdown>
        );
    }
  };

  return editing ? (
    <div
      className={cls(getBaseCls("search-box-left-part-input-wrap"), className)}
      {...restProps}
    >
      {showLabel && <span>{label}：</span>}
      {renderInput()}
    </div>
  ) : (
    <Tag closable onClose={onRemove} onClick={() => toggleEditing(true)}>
      {label}：{text}
    </Tag>
  );
};

export default Item;
