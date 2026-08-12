"use client";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as DrawerPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import * as React from "react";
import type { Dispatch, SetStateAction } from "react";

import { useOverlay } from "../../utils/use-overlay";

interface DrawerContextValue {
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const DrawerContext = React.createContext<DrawerContextValue | undefined>(
  undefined,
);

const DrawerVariants = cva("bg-neutral-0 fixed flex flex-col", {
  variants: {
    placement: {
      right:
        "inset-y-0 right-0 h-full w-fit min-w-1/4 " +
        "data-[state=open]:animate-in data-[state=closed]:animate-out " +
        "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right " +
        "data-[state=closed]:duration-300 data-[state=open]:duration-300",
      left:
        "inset-y-0 left-0 h-full w-fit min-w-1/4 " +
        "data-[state=open]:animate-in data-[state=closed]:animate-out " +
        "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left " +
        "data-[state=closed]:duration-300 data-[state=open]:duration-300",
      top:
        "inset-x-0 top-0 h-fit min-h-1/4 w-full " +
        "data-[state=open]:animate-in data-[state=closed]:animate-out " +
        "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top " +
        "data-[state=closed]:duration-300 data-[state=open]:duration-300",
      bottom:
        "inset-x-0 bottom-0 h-fit min-h-1/4 w-full " +
        "data-[state=open]:animate-in data-[state=closed]:animate-out " +
        "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom " +
        "data-[state=closed]:duration-300 data-[state=open]:duration-300",
    },
  },
});

const DrawerRoot = ({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => {
  // 把modal设置成false，因为需要考虑到我们边栏出现之后还会有Table Select或者别的弹窗或边栏弹出的场景
  return <DrawerPrimitive.Root {...props} modal={false} />;
};
DrawerRoot.displayname = "DrawerRoot";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerContent = DrawerPrimitive.Content;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-60 bg-neutral-800/30",
      className,
    )}
    {...props}
  />
));
DrawerOverlay.displayName = "DrawerOverlay";

interface DrawerProps extends React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Content
> {
  zIndex?: number; // 保留向后兼容
  placement?: "right" | "left" | "top" | "bottom";
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  disableAutoZIndex?: boolean; // 是否禁用自动 z-index 管理
}
const Drawer = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  DrawerProps
>(
  (
    {
      className,
      children,
      placement = "right",
      open,
      setOpen,
      zIndex: customZIndex,
      disableAutoZIndex = false,
      style: customStyle,
      ...props
    },
    ref,
  ) => {
    // 自动管理 z-index
    const { zIndex: autoZIndex } = useOverlay({
      type: "drawer",
      open: open && !disableAutoZIndex,
      customZIndex,
    });

    // 最终使用的 z-index：优先使用自定义值，其次使用自动计算值
    const finalZIndex = customZIndex ?? (disableAutoZIndex ? 60 : autoZIndex);

    return (
      <DrawerContext.Provider value={{ setOpen }}>
        <DrawerRoot open={open}>
          <DrawerPortal>
            {/*<DrawerOverlay*/}
            {/*  style={{ zIndex: finalZIndex }}*/}
            {/*  onClick={() => setOpen(false)}*/}
            {/*  forceMount*/}
            {/*/>*/}
            {/* 不使用Radix UI的overlay，因为有React Remove Scroll，会导致我们的TableSelect无法正常滚动*/}
            {/*<DialogOverlay style={{ zIndex: finalZIndex }} />*/}
            <div
              style={{ zIndex: finalZIndex }}
              className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 bg-neutral-800/30"
              data-state={open ? "open" : "closed"}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setOpen(false);
                }
              }}
            />
            <DrawerContent
              forceMount
              ref={ref}
              className={cn(DrawerVariants({ placement, className }))}
              style={{
                zIndex: finalZIndex + 1, // content 比 overlay 高一层
                ...customStyle, // 合并用户传入的 style
              }}
              onClick={(e) => {
                // 阻止冒泡，防止点击内容区域穿透到下面的内容
                e.stopPropagation();
              }}
              {...props}
            >
              {children}
            </DrawerContent>
          </DrawerPortal>
        </DrawerRoot>
      </DrawerContext.Provider>
    );
  },
);
Drawer.displayName = "Drawer";

// Drawer头部
export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /**
   * 是否显示关闭按钮
   * @default true
   */
  closable?: boolean;
  /**
   * 自定义关闭图标
   */
  closeIcon?: React.ReactNode;
  /**
   * 点击关闭按钮的回调
   */
  onClose?: () => void;
}
const DrawerHeader = (props: DrawerHeaderProps) => {
  const {
    children,
    className,
    closable = true,
    closeIcon,
    onClose,
    ...restProps
  } = props;
  const context = React.useContext(DrawerContext);

  const handleClose = () => {
    onClose?.();
    context?.setOpen(false);
  };

  return (
    <div
      className={cn(
        "border-b-solid box-border flex h-12 min-h-12 items-center justify-between border-b-1 border-b-neutral-300 px-6 text-base font-medium",
        className,
      )}
      {...restProps}
    >
      {children}
      {closable &&
        (closeIcon ? (
          <div onClick={handleClose}>{closeIcon}</div>
        ) : (
          <Icon type="close"
            className="h-5 w-5 cursor-pointer text-neutral-700 hover:opacity-80"
            onClick={handleClose}
          />
        ))}
    </div>
  );
};
// Drawer页脚
export interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}
const DrawerFooter = (props: DrawerFooterProps) => {
  const { children, className, ...restProps } = props;
  return (
    <div
      className={cn(
        "border-t-solid flex h-15 items-center border-t border-neutral-300 px-6",
        className,
      )}
      {...restProps}
    >
      {children}
    </div>
  );
};
//Drawer内容
export interface DrawerBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}
const DrawerBody = (props: DrawerBodyProps) => {
  const { children, className, ...restProps } = props;
  return (
    <div
      className={cn("flex flex-auto overflow-auto p-6 text-sm", className)}
      {...restProps}
    >
      {children}
    </div>
  );
};

export {
  Drawer,
  DrawerRoot,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
};
