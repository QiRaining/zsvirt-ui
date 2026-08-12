"use client";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";

import { useOverlay } from "../../utils/use-overlay";
import { SmartTip } from "../biz/smart-tip";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "focus:bg-accent flex cursor-pointer items-center justify-between rounded-xs px-3 py-1.5 text-sm outline-none select-none" +
        " data-[state=open]:bg-accent data-[disabled]:cursor-not-allowed data-[disabled]:text-neutral-500 data-[highlighted]:bg-neutral-100",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <Icon type="arrow-ios-right" className="ml-atuo" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "bg-neutral-0 z-5000 overflow-hidden rounded-xs border border-solid border-transparent shadow-[0px_4px_8px_0px_rgba(0,0,0,0.12)] " +
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 " +
        "data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 " +
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 " +
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 py-1",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

interface DropdownMenuContentProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
> {
  open?: boolean;
  zIndex?: number;
  disableAutoZIndex?: boolean;
}

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(
  (
    {
      className,
      sideOffset = 4,
      open = true,
      zIndex: customZIndex,
      disableAutoZIndex = false,
      ...props
    },
    ref,
  ) => {
    // 自动管理 z-index
    const { zIndex: autoZIndex } = useOverlay({
      type: "popover",
      open: open && !disableAutoZIndex,
      customZIndex,
    });

    // 最终使用的 z-index：优先使用自定义值，其次使用自动计算值
    const finalZIndex = customZIndex ?? (disableAutoZIndex ? 1030 : autoZIndex);

    return (
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          align={"end"}
          className={cn(
            "bg-neutral-0 text-popover-foreground overflow-hidden rounded-xs border border-solid border-transparent shadow-[0px_4px_8px_0px_rgba(0,0,0,0.12)] " +
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 " +
              "data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 " +
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 " +
              "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 py-1",
            className,
          )}
          {...props}
          style={{ ...props.style, zIndex: finalZIndex }}
        />
      </DropdownMenuPrimitive.Portal>
    );
  },
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer items-center rounded-xs px-3 py-1.5 text-sm outline-none select-none " +
        "transition-colors data-[disabled]:cursor-not-allowed data-[highlighted]:bg-neutral-100 " +
        " data-[disabled]:text-neutral-500",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center rounded-xs py-1.5 pr-2 pl-8 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:text-neutral-500",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Icon type="checkmark" className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center rounded-xs py-1.5 pr-2 pl-8 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:text-neutral-500",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <div className="h-2 w-2 rounded-full" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-neutral-300", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// 基础属性接口
interface DropdownItem {
  key: string | number;
  label?: React.ReactNode;
  disabled?: boolean;
  tooltip?: React.ReactNode;
  type?: "item" | "group" | "separator";
  children?: DropdownItem[];
  [key: string]: unknown;
}

interface DropDownProps {
  items: DropdownItem[];
  children: React.ReactNode;
  onSelect: (event: DropdownItem) => void;
  align?: "start" | "center" | "end";
  className?: string;
}

const Dropdown = (props: DropDownProps) => {
  const { items, children, onSelect, align, className } = props;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [minWidth, setMinWidth] = useState<number>(0);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    //
    // 规范，下拉面板宽度不能小于呼出它的组件
    if (triggerRef.current) {
      setMinWidth(triggerRef.current.offsetWidth);
    }
  }, []);
  const renderItem = (item: DropdownItem) => {
    if (item.children && item.children.length > 0) {
      return (
        <DropdownMenuSub key={item.key}>
          <DropdownMenuSubTrigger
            disabled={item.disabled}
            data-testid={item.key}
          >
            {item.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {renderContent(item.children)}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      );
    }
    if (item.tooltip) {
      return (
        <SmartTip
          key={item.key}
          content={item.tooltip}
          popoverTriggerMode="hover"
          infoIconMode="replace"
          zIndex={6000}
        >
          <DropdownMenuItem
            key={`${item.key}-item`}
            onSelect={() => onSelect(item)}
            disabled={item.disabled}
            data-testid={item.key}
          >
            {item.label}
          </DropdownMenuItem>
        </SmartTip>
      );
    }
    return (
      <DropdownMenuItem
        key={item.key}
        onSelect={() => onSelect(item)}
        disabled={item.disabled}
        data-testid={item.key}
      >
        {item.label}
      </DropdownMenuItem>
    );
  };

  const renderContent = (items: DropdownItem[]) => {
    return items.map((item, index) => {
      const isLastItem = index === items.length - 1;

      const renderSeparator = () =>
        !isLastItem && <DropdownMenuSeparator key={`separator-${index}`} />;

      switch (item.type) {
        case "separator":
          return <DropdownMenuSeparator key={`separator-${index}`} />;

        case "group":
          return (
            <React.Fragment key={`group-${item.key}`}>
              <DropdownMenuGroup>
                {item.children?.map(renderItem)}
              </DropdownMenuGroup>
              {renderSeparator()}
            </React.Fragment>
          );

        default:
          return renderItem(item);
      }
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild ref={triggerRef}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={className}
        style={{ minWidth: `${minWidth}px` }}
        align={align}
        open={open}
      >
        {renderContent(items)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export {
  Dropdown,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  type DropDownProps,
  type DropdownItem,
};
