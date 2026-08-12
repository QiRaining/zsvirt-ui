"use client";

import { Button, type ButtonProps } from "@zstack/design";
import { cn } from "@zstack/utils";
import React from "react";

import { ZSVFormTabs } from "./form-tabs";
import type { ZSVFormTabsItem, ZSVFormTabsProps } from "./form-tabs";

export interface ZSVHardwareTabsItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  descriptionTitle?: string;
  descriptionMuted?: boolean;
  hasError?: boolean;
  canDelete?: boolean;
  deleteIcon?: React.ReactNode;
  deleteLabel?: string;
  onDelete?: () => void;
  content?: React.ReactNode | (() => React.ReactNode);
}

export interface ZSVHardwareTabsProps extends Omit<
  ZSVFormTabsProps,
  "tabs" | "orientation" | "framed" | "rootClassName" | "listClassName"
> {
  items: ZSVHardwareTabsItem[];
  activeKey: string;
  hardwareTitle: React.ReactNode;
  configTitle: React.ReactNode;
  addAction?: React.ReactNode;
  onActiveKeyChange: (key: string) => void;
}

const HARDWARE_PANEL_CLASS =
  "mb-6 flex max-h-80 w-[754px] flex-col overflow-hidden rounded-xs border border-neutral-300";
const HARDWARE_HEADER_CLASS =
  "flex h-9 w-full flex-row items-center justify-between border-b border-neutral-300 bg-neutral-100";
const HARDWARE_HEADER_LEFT_CLASS =
  "flex h-full w-80 shrink-0 flex-row items-center justify-between border-r border-neutral-300 px-[11px] py-[7px]";
const HARDWARE_HEADER_RIGHT_CLASS =
  "flex h-full w-[432px] flex-row items-center px-[11px] py-[7px]";
const HARDWARE_HEADER_TITLE_CLASS = "flex items-center gap-1 text-neutral-700";
const HARDWARE_TABS_ROOT_CLASS =
  "!h-[284px] [&>div:first-child]:!w-80 [&>div:first-child]:!shrink-0";
const HARDWARE_TABS_LIST_CLASS = "!w-80 !overflow-x-hidden";
const HARDWARE_TAB_CONTENT_CLASS =
  "!h-[284px] !flex-1 !overflow-y-auto !py-5 !pr-0.5 !pl-5";
const HARDWARE_TAB_TRIGGER_CLASS =
  "!h-9 !w-full !justify-start !overflow-hidden !p-0 data-[state=active]:text-neutral-700";
const HARDWARE_ITEM_CLASS =
  "box-border flex h-9 w-full max-w-full flex-row items-center justify-between overflow-hidden border-b border-r border-neutral-300 px-3 py-2";
const HARDWARE_ACTIVE_ITEM_CLASS = `${HARDWARE_ITEM_CLASS} bg-[var(--color-50)]`;
const HARDWARE_ERROR_ITEM_CLASS = `${HARDWARE_ITEM_CLASS} !bg-danger-50`;
const HARDWARE_ITEM_NAME_CLASS = "flex w-1/2 min-w-0 items-center";
const HARDWARE_ITEM_TITLE_CLASS =
  "ml-2.5 overflow-hidden text-ellipsis whitespace-nowrap text-neutral-700";
const HARDWARE_ITEM_ERROR_TITLE_CLASS =
  "ml-2.5 overflow-hidden text-ellipsis whitespace-nowrap text-danger-500";
const HARDWARE_ITEM_INFO_CLASS =
  "flex w-1/2 min-w-0 items-center justify-between text-neutral-700";
const HARDWARE_ITEM_INFO_TEXT_CLASS =
  "max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap text-neutral-700";
const HARDWARE_ITEM_INFO_NONE_CLASS =
  "max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap text-neutral-500";
const HARDWARE_ITEM_DELETE_CLASS =
  "shrink-0 cursor-pointer border-0 bg-transparent p-0 text-neutral-600";

const renderHardwareItem = (
  item: ZSVHardwareTabsItem,
  active: boolean,
): React.ReactNode => (
  <div
    className={
      item.hasError
        ? HARDWARE_ERROR_ITEM_CLASS
        : active
          ? HARDWARE_ACTIVE_ITEM_CLASS
          : HARDWARE_ITEM_CLASS
    }
  >
    <div className={HARDWARE_ITEM_NAME_CLASS}>
      {item.icon}
      <span
        className={
          item.hasError
            ? HARDWARE_ITEM_ERROR_TITLE_CLASS
            : HARDWARE_ITEM_TITLE_CLASS
        }
      >
        {item.label}
      </span>
    </div>
    <div className={HARDWARE_ITEM_INFO_CLASS}>
      <span
        className={
          item.descriptionMuted
            ? HARDWARE_ITEM_INFO_NONE_CLASS
            : HARDWARE_ITEM_INFO_TEXT_CLASS
        }
        title={item.descriptionTitle}
      >
        {item.description}
      </span>
      {item.canDelete ? (
        <button
          aria-label={item.deleteLabel}
          className={HARDWARE_ITEM_DELETE_CLASS}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            item.onDelete?.();
          }}
        >
          {item.deleteIcon}
        </button>
      ) : null}
    </div>
  </div>
);

export const ZSVHardwareTabs: React.FC<ZSVHardwareTabsProps> = ({
  items,
  activeKey,
  hardwareTitle,
  configTitle,
  addAction,
  onActiveKeyChange,
  contentClassName,
  ...tabsProps
}) => {
  const tabs: ZSVFormTabsItem[] = items.map((item) => ({
    key: item.key,
    className: HARDWARE_TAB_TRIGGER_CLASS,
    titleAsChild: true,
    title: renderHardwareItem(item, item.key === activeKey),
    content: item.content,
  }));

  return (
    <div className={HARDWARE_PANEL_CLASS}>
      <div className={HARDWARE_HEADER_CLASS}>
        <div className={HARDWARE_HEADER_LEFT_CLASS}>
          <div className={HARDWARE_HEADER_TITLE_CLASS}>{hardwareTitle}</div>
          {addAction}
        </div>
        <div className={HARDWARE_HEADER_RIGHT_CLASS}>
          <div className={HARDWARE_HEADER_TITLE_CLASS}>{configTitle}</div>
        </div>
      </div>
      <ZSVFormTabs
        contentClassName={cn(HARDWARE_TAB_CONTENT_CLASS, contentClassName)}
        framed={false}
        listClassName={HARDWARE_TABS_LIST_CLASS}
        orientation="side"
        rootClassName={HARDWARE_TABS_ROOT_CLASS}
        tabs={tabs}
        value={activeKey}
        onValueChange={onActiveKeyChange}
        {...tabsProps}
      />
    </div>
  );
};

export const ZSVHardwareTabsAddButton: React.FC<ButtonProps> = ({
  className,
  ...props
}) => (
  <Button
    className={cn(
      "!inline-flex !h-5 !items-center !gap-0 !px-0 !leading-5 [&_svg]:shrink-0",
      className,
    )}
    variant="link"
    {...props}
  />
);
