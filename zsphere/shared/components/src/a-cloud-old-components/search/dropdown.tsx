import { Tag } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useControllableValue, useSelections, useToggle } from "ahooks";
import { Checkbox, Dropdown as AntDropDown, Input } from "antd";
import cls from "classnames";
import React, { FC, useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../_utils/common";
import { customRenderEmpty } from "../../empty";
import Text from "../text";
import { ConditionOption } from "./type";

import "./style.less";

interface ISingleProps {
  options?: ConditionOption[];
  value?: string;
  onChange?: (value: string) => void;
  initVisible?: boolean;
  defaultValue?: string;
  children?: React.ReactNode;
}

const getPopupContainer = (node: HTMLElement) => {
  if (node.closest(".zstack-table-list")) {
    return node.closest(".zstack-table-list") as HTMLElement;
  }
  return document.body;
};

export const SingleDropdown: FC<ISingleProps> = ({
  options = [],
  value,
  onChange,
  initVisible = true,
  defaultValue,
  children,
}) => {
  const [visible, { toggle: toggleVisible }] = useToggle(initVisible);
  const [selectedValue, setSelectedValue] = useControllableValue<string>(
    { value, onChange },
    { defaultValue },
  );

  const handleClick = (_value: string) => {
    toggleVisible(false);
    setSelectedValue?.(_value);
  };

  const isSelected = useCallback(
    (_value: string) => selectedValue === _value,
    [selectedValue],
  );

  return (
    <AntDropDown
      overlay={
        <div
          className={cls(
            getBaseCls("search-dropdown"),
            getBaseCls("search-dropdown-dropdown-small"),
          )}
        >
          <div className={getBaseCls("search-dropdown-menu")}>
            {options.map((item) => (
              <div
                className={cls(getBaseCls("search-dropdown-menu-item"), {
                  [getBaseCls("search-dropdown-menu-item-selected")]:
                    isSelected(item.value),
                })}
                key={item.value}
                onClick={() => handleClick(item.value)}
              >
                <span>{item.text}</span>
                {isSelected(item.value) && <Icon type="checkmark" />}
              </div>
            ))}
          </div>
        </div>
      }
      visible={visible}
      onVisibleChange={toggleVisible}
      trigger={["click"]}
      getPopupContainer={getPopupContainer}
    >
      {children}
    </AntDropDown>
  );
};

interface IMultipleProps {
  options?: ConditionOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  initVisible?: boolean;
  defaultValue?: string[];
  children?: React.ReactNode;
}

export const MultipleDropdown: FC<IMultipleProps> = ({
  options = [],
  value,
  onChange,
  initVisible = true,
  defaultValue,
  children,
}) => {
  const intl = useIntl() as any;

  const [visible, { toggle: toggleVisible }] = useToggle(initVisible);
  const [selectedValues, setSelectedValues] = useControllableValue<string[]>(
    { value, onChange },
    { defaultValue },
  );

  const list = useMemo(() => options.map((item) => item.value), [options]);
  const { toggle, isSelected, selected, noneSelected } = useSelections(
    list,
    selectedValues,
  );

  const handleOk = () => {
    if (noneSelected) {
      return;
    }
    toggleVisible(false);
    setSelectedValues?.(selected);
  };

  const handleCancel = () => {
    toggleVisible(false);
  };

  return (
    <AntDropDown
      dropdownRender={() => (
        <div className={getBaseCls("search-dropdown")}>
          <div className={getBaseCls("search-dropdown-menu")}>
            {options.map((item) => (
              <div
                className={cls(getBaseCls("search-dropdown-menu-item"))}
                key={item.value}
              >
                <Checkbox
                  style={{ flex: 1, width: 0 }}
                  checked={isSelected(item.value)}
                  onClick={() => toggle(item.value)}
                >
                  {item.text}
                </Checkbox>
              </div>
            ))}
          </div>
          <div className={getBaseCls("search-dropdown-action")}>
            <div
              className={getBaseCls("search-dropdown-action-btn")}
              onClick={handleCancel}
            >
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </div>
            <div
              className={cls(
                getBaseCls("search-dropdown-action-btn"),
                getBaseCls("search-dropdown-action-btn-ok"),
              )}
              onClick={handleOk}
            >
              {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
            </div>
          </div>
        </div>
      )}
      open={visible}
      onOpenChange={toggleVisible}
      trigger={["click"]}
      getPopupContainer={getPopupContainer}
    >
      {children}
    </AntDropDown>
  );
};

interface ISearchProps {
  options?: ConditionOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  initVisible?: boolean;
  defaultValue?: string[];
  children?: React.ReactNode;
}

export const SearchDropdown: FC<ISearchProps> = ({
  options = [],
  value,
  onChange,
  initVisible = true,
  defaultValue,
  children,
}) => {
  const intl = useIntl() as any;

  const [visible, { toggle: toggleVisible }] = useToggle(initVisible);
  const [selectedValues, setSelectedValues] = useControllableValue<string[]>(
    { value, onChange },
    { defaultValue },
  );

  const list = useMemo(() => options.map((item) => item.value), [options]);
  const { toggle, isSelected, selected, noneSelected } = useSelections(
    list,
    selectedValues,
  );

  const [searchKey, setSearchKey] = useState<string>("");
  const filteredOptions = useMemo(
    () => options.filter((item) => item.text.indexOf(searchKey.trim()) > -1),
    [options, searchKey],
  );

  const handleOk = () => {
    if (noneSelected) {
      return;
    }
    toggleVisible(false);
    setSelectedValues?.(selected);
  };

  const handleCancel = () => {
    toggleVisible(false);
  };

  return (
    <AntDropDown
      overlay={
        <div className={getBaseCls("search-dropdown")}>
          <div className={getBaseCls("search-dropdown-input")}>
            <Input
              suffix={!searchKey && <Icon type="search" />}
              placeholder={intl.formatMessage({
                id: "search",
                defaultMessage: "Search",
              })}
              allowClear
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
            />
          </div>
          <div className={getBaseCls("search-dropdown-menu")}>
            {filteredOptions.length === 0
              ? customRenderEmpty({ type: "Select" })
              : filteredOptions.map((item) => (
                  <div
                    className={cls(getBaseCls("search-dropdown-menu-item"))}
                    key={item.value}
                  >
                    <Checkbox
                      style={{ flex: 1, width: 0 }}
                      checked={isSelected(item.value)}
                      onChange={() => toggle(item.value)}
                    >
                      {item.color ? (
                        <Tag color={item.color}>{item.text}</Tag>
                      ) : (
                        <Text value={item.text} ellipsis />
                      )}
                    </Checkbox>
                    {item.count ?? <span>{item.count}</span>}
                  </div>
                ))}
          </div>
          <div className={getBaseCls("search-dropdown-action")}>
            <div
              className={getBaseCls("search-dropdown-action-btn")}
              onClick={handleCancel}
            >
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </div>
            <div
              className={cls(getBaseCls("search-dropdown-action-btn"), {
                [getBaseCls("search-dropdown-action-btn-ok")]: !noneSelected,
              })}
              onClick={handleOk}
            >
              {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
            </div>
          </div>
        </div>
      }
      visible={visible}
      onVisibleChange={toggleVisible}
      trigger={["click"]}
      getPopupContainer={getPopupContainer}
    >
      {children}
    </AntDropDown>
  );
};
