import { Icon } from "@zstack/icon";
import { useUpdateEffect, usePersistFn } from "ahooks";
import { Input as AntInput, InputProps } from "antd";
import cls from "classnames";
import React, { FC, useState, useMemo, useRef } from "react";

import { getBaseCls, escapeQueryString } from "../../../../_utils/common";
import Input from "../../../../input";
import Dropdown from "./dropdown";
import { IContent, IDropdownRef, IOption } from "./type";

const MainContent: FC<IContent> = ({ candidate, onOk }) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<React.ComponentRef<typeof AntInput>>(null);
  const dropdownRef = useRef<IDropdownRef>(null);

  const {
    key,
    label,
    type,
    searchKey,
    loading,
    options,
    placeholder,
    showSearch,
    onSearch,
  } = candidate;

  const inputType = ["input", "fuzzy"].includes(type);
  const isInput = type === "input";
  const isFuzzy = type === "fuzzy";

  const name = useMemo(
    () => ({
      key,
      label,
      searchKey,
      type,
    }),
    [key, label, searchKey, type],
  );

  const handleInputChange: InputProps["onChange"] = (e) => {
    const _value = e.target.value.trim();
    setValue(_value);
    if (_value) {
      onSearch?.(_value);
    }
  };

  const handleInputKeyDown: InputProps["onKeyDown"] = usePersistFn((e) => {
    if (!inputType) {
      e.preventDefault();
    }
  });

  const handleInputOk = usePersistFn(() => {
    if (value) {
      const queryString = escapeQueryString(value);
      if (isInput) {
        onOk?.(name, [
          {
            key: queryString,
            label: value,
          },
        ]);
        setValue("");
      }
      if (isFuzzy) {
        if (options && options.length > 0) {
          const _name = options[0];
          const _values: IOption[] = [
            {
              key: queryString,
              label: value,
            },
          ];
          onOk?.(_name, _values);
          setValue("");
        }
      }
    }
  });

  const handleDropdownOk = usePersistFn((values: IOption[]) => {
    if (isFuzzy) {
      const _name = values[0];
      const queryString = escapeQueryString(value);
      const _values: IOption[] = [
        {
          key: queryString,
          label: value,
        },
      ];
      onOk?.(_name, _values);
    } else {
      onOk?.(name, values);
    }
    setValue("");
    dropdownRef.current?.clear?.();
  });

  const dropdownOptions = useMemo(() => {
    if (isFuzzy) {
      return value ? options : undefined;
    }
    return options;
  }, [isFuzzy, options, value]);

  useUpdateEffect(() => {
    if (inputType) {
      inputRef.current?.focus({
        cursor: "end",
      });
    }
    setValue("");
  }, [key, inputType]);

  useUpdateEffect(() => {
    if (isFuzzy) {
      dropdownRef.current?.toggleVisible?.(!!value);
    }
  }, [value, isFuzzy]);

  return (
    <Dropdown
      type={type}
      showScroll
      loading={loading}
      options={dropdownOptions}
      onOk={handleDropdownOk}
      showSearch={showSearch}
      onSearch={onSearch}
      placement="bottomRight"
      overlayClassName={
        isFuzzy
          ? getBaseCls("search-fuzzy-content-overlay")
          : getBaseCls("search-content-overlay")
      }
      ref={dropdownRef}
    >
      <div className={getBaseCls("search-content")}>
        <Input
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onPressEnter={handleInputOk}
          placeholder={placeholder}
          allowClear={inputType}
          bordered={false}
          ref={inputRef}
          className={cls({ [getBaseCls("search-input-noh")]: !inputType })}
          addonAfter={
            <div
              className={getBaseCls("search-input-icon")}
              onClick={handleInputOk}
            >
              <Icon type="search" />
            </div>
          }
        />
      </div>
    </Dropdown>
  );
};

export default MainContent;
