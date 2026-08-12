
import { Icon } from "@zstack/icon";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";

import { Button } from "../../primitive/button.tsx";
import { Dropdown, type DropdownItem } from "../../primitive/dropdown-menu.tsx";

export interface ActionProps<T> {
  items: DropdownItem[];
  refetch: () => void;
  selectedList: T[];
  handleClickItem?: (key: string | number) => void;
  view?: string;
  postAction?: () => void;
  trigger?: React.ReactNode;
}

type DialogComponent<T> = React.ComponentType<{
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedList: T[];
  refetch: () => void;
  view?: string;
  postAction?: () => void;
}>;

const toDropdownItem = (item: DropdownItem): DropdownItem => {
  const { key, type, label, disabled, tooltip, children } = item;

  return {
    key,
    type,
    label,
    disabled,
    tooltip,
    children: children?.map(toDropdownItem),
  };
};

const findDropdownItem = (
  items: DropdownItem[],
  key: string | number,
): DropdownItem | undefined => {
  for (const item of items) {
    if (item.key === key) {
      return item;
    }

    if (item.children) {
      const matchedItem = findDropdownItem(item.children, key);
      if (matchedItem) {
        return matchedItem;
      }
    }
  }

  return undefined;
};

export const MenuButton = <T,>({
  items,
  refetch,
  selectedList,
  handleClickItem,
  view,
  postAction,
  trigger,
}: ActionProps<T>) => {
  const [activeDialog, setActiveDialog] = useState<string | number | null>(
    null,
  );
  const pendingSelectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const intl = useIntl();
  const handleSelect = (key: string | number) => {
    if (pendingSelectTimerRef.current) {
      clearTimeout(pendingSelectTimerRef.current);
    }

    pendingSelectTimerRef.current = setTimeout(() => {
      const selectedItem = findDropdownItem(items, key);
      if (selectedItem?.dialog) {
        setActiveDialog(selectedItem.key);
      }
      handleClickItem?.(key);
      pendingSelectTimerRef.current = null;
    }, 0);
  };

  useEffect(() => {
    return () => {
      if (pendingSelectTimerRef.current) {
        clearTimeout(pendingSelectTimerRef.current);
      }
    };
  }, []);

  const setVisible = (visible: boolean) => {
    if (!visible) {
      setActiveDialog(null);
    }
  };

  const dropdownItems = useMemo(() => items.map(toDropdownItem), [items]);

  const renderDialogs = (dropdownItems: DropdownItem[]): React.ReactNode[] => {
    return dropdownItems.flatMap((item) => {
      const dialogs: React.ReactNode[] = [];

      if (item.dialog) {
        const DialogComponent = item.dialog as DialogComponent<T>;
        dialogs.push(
          <DialogComponent
            key={item.key}
            visible={activeDialog === item.key}
            setVisible={setVisible}
            selectedList={selectedList}
            refetch={refetch}
            view={view}
            postAction={postAction}
          />,
        );
      }

      if (item.children) {
        dialogs.push(...renderDialogs(item.children));
      }

      return dialogs;
    });
  };

  if (items?.length < 1) {
    return null;
  }

  return (
    <>
      <Dropdown items={dropdownItems} onSelect={({ key }) => handleSelect(key)}>
        {trigger || (
          <Button variant="secondary">
            <div className="mr-1">
              {intl.formatMessage({
                id: "more.action",
                defaultMessage: "更多操作",
              })}
            </div>
            <Icon type="arrow-ios-down" />
          </Button>
        )}
      </Dropdown>

      {renderDialogs(items)}
    </>
  );
};

MenuButton.displayName = "MenuButton";

export const Action = MenuButton;
