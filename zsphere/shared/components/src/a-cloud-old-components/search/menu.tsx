import { useToggle } from "ahooks";
import { Menu as AntMenu, Dropdown, DropDownProps, Input } from "antd";
import React, {
  FC,
  KeyboardEvent,
  useCallback,
  useMemo,
  useState,
} from "react";

import Text from "../text";
import { ISelectedCondition } from "./box";
import Item from "./item";

import "./style.less";
import { Condition } from "./type";

interface IProps {
  originConditions: Condition[];
  options: Condition[];
  onSelect?: (value: string, initText?: string) => void;
  onNameChange?: (value: string, item: ISelectedCondition) => void;
  isDefaultSearch?: boolean;
}

const Menu: FC<IProps> = ({
  options,
  onSelect,
  onNameChange,
  originConditions,
  isDefaultSearch = true,
}) => {
  const [visible, { toggle: toggleVisible }] = useToggle(false);
  const [trigger, setTrigger] = useState<DropDownProps["trigger"]>(["click"]);
  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Backspace":
        case "Escape":
          toggleVisible(false);
          break;
      }
    },
    [toggleVisible],
  );

  const handleMenuClick = (e: any) => {
    const key = e.key as string;
    onSelect?.(key);
    toggleVisible(false);
  };

  const getPopupContainer = (node: HTMLElement) => {
    if (node.closest(".zstack-table-list")) {
      return node.closest(".zstack-table-list") as HTMLElement;
    }
    return document.body;
  };

  const renderTrigger = useMemo(() => {
    const defaultOption =
      originConditions.find((it) => it.key === "name") || originConditions[0];
    const isDefault =
      options.some((cv) => cv.key === defaultOption.key) &&
      originConditions.length === options.length;
    if (isDefault && isDefaultSearch) {
      return (
        <Item
          type={defaultOption.type}
          label={defaultOption.label}
          showLabel={false}
          onChange={(val) => {
            onNameChange?.(val as string, defaultOption);
            onSelect?.(defaultOption.key, val as string);
            setTrigger(["click"]);
          }}
          onInput={(hasValue) => {
            if (hasValue) {
              toggleVisible(false);
              setTrigger([]);
            } else {
              setTrigger(["click"]);
            }
          }}
        />
      );
    }
    return <Input bordered={false} value="" onKeyDown={handleInputKeyDown} />;
  }, [
    handleInputKeyDown,
    isDefaultSearch,
    onNameChange,
    onSelect,
    options,
    originConditions,
    toggleVisible,
  ]);

  return (
    <Dropdown
      dropdownRender={() => (
        <AntMenu
          {...({ onClick: handleMenuClick } as any)}
          style={{
            minWidth: 120,
            maxWidth: 400,
            maxHeight: 320,
            overflow: "auto",
            display: "inline-block",
          }}
          items={options.map((t) => {
            return { lable: t.label, key: t.key, value: t.label };
          })}
        />
      )}
      open={visible}
      onOpenChange={toggleVisible}
      trigger={trigger}
      getPopupContainer={getPopupContainer}
    >
      {renderTrigger}
    </Dropdown>
  );
};

export default Menu;

// options.map((item) => (
//   // pre-wrap 是为了触发Text tooltip
//   <AntMenu.Item key={item.key} style={{ whiteSpace: "pre-wrap" }}>
//     <Text value={item.label}>{item.label}</Text>
//   </AntMenu.Item>
// ));
