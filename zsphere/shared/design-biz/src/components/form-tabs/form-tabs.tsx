"use client";

import { Tabs } from "@zstack/design";
import type { TabsProps } from "@zstack/design";
import { cn } from "@zstack/utils";
import React from "react";

import {
  FORM_TABS_SIDE_CONTENT_CLASS,
  FORM_TABS_SIDE_FRAMED_ROOT_CLASS,
  FORM_TABS_SIDE_LIST_CLASS,
  FORM_TABS_SIDE_ROOT_CLASS,
  FORM_TABS_SIDE_TRIGGER_CLASS,
  FORM_TABS_TOP_LIST_CLASS,
  FORM_TABS_TOP_MARKED_LIST_CLASS,
  FORM_TABS_TOP_MARKED_ROOT_CLASS,
  FORM_TABS_TOP_ROOT_CLASS,
  FORM_TABS_TOP_TRIGGER_CLASS,
} from "./styles";

export interface ZSVFormTabsItem {
  key: string;
  title: React.ReactNode;
  titleAlarm?: React.ReactNode;
  content?: React.ReactNode | (() => React.ReactNode);
  disabled?: boolean;
  className?: string;
  noPadding?: boolean;
  titleAsChild?: boolean;
}

export interface ZSVFormTabsProps extends Omit<
  TabsProps,
  "orientation" | "tabsList" | "variant"
> {
  tabs: ZSVFormTabsItem[];
  orientation?: "top" | "side";
  showFirstTitleMarker?: boolean;
  framed?: boolean;
}

const renderTitle = (item: ZSVFormTabsItem, compact: boolean) => {
  if (compact) {
    if (item.titleAsChild) {
      return (
        <>
          {item.title}
          {item.titleAlarm ? (
            <span className="ml-1">{item.titleAlarm}</span>
          ) : null}
        </>
      );
    }

    return (
      <div className="flex h-full w-full items-center border-b border-neutral-300 px-4">
        {item.title}
        {item.titleAlarm ? (
          <span className="ml-1">{item.titleAlarm}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-[22px] items-center">
      <span>{item.title}</span>
      {item.titleAlarm ? <span className="ml-1">{item.titleAlarm}</span> : null}
    </div>
  );
};

export const ZSVFormTabs = React.forwardRef<
  React.ElementRef<typeof Tabs>,
  ZSVFormTabsProps
>(
  (
    {
      tabs,
      orientation = "top",
      showFirstTitleMarker = orientation === "top",
      framed = orientation === "side",
      rootClassName,
      listClassName,
      contentClassName,
      ...props
    },
    ref,
  ) => {
    const isSide = orientation === "side";

    return (
      <Tabs
        ref={ref}
        variant="line"
        rootClassName={cn(
          isSide && FORM_TABS_SIDE_ROOT_CLASS,
          isSide && framed && FORM_TABS_SIDE_FRAMED_ROOT_CLASS,
          !isSide && FORM_TABS_TOP_ROOT_CLASS,
          !isSide && showFirstTitleMarker && FORM_TABS_TOP_MARKED_ROOT_CLASS,
          rootClassName,
        )}
        listClassName={cn(
          isSide ? FORM_TABS_SIDE_LIST_CLASS : FORM_TABS_TOP_LIST_CLASS,
          !isSide && showFirstTitleMarker && FORM_TABS_TOP_MARKED_LIST_CLASS,
          listClassName,
        )}
        contentClassName={cn(
          isSide && FORM_TABS_SIDE_CONTENT_CLASS,
          contentClassName,
        )}
        tabsList={tabs.map((item) => ({
          value: item.key,
          label: renderTitle(item, isSide),
          content: item.content,
          disabled: item.disabled,
          noPadding: item.noPadding,
          className: cn(
            isSide ? FORM_TABS_SIDE_TRIGGER_CLASS : FORM_TABS_TOP_TRIGGER_CLASS,
            item.className,
          ),
        }))}
        {...props}
      />
    );
  },
);

ZSVFormTabs.displayName = "ZSVFormTabs";

export default ZSVFormTabs;
