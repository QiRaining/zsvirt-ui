"use client";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { DialogProps } from "@radix-ui/react-dialog";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { useOverlay } from "../../utils/use-overlay";

// 创建 Context 用于传递 open 状态
const DialogContext = React.createContext<{ open?: boolean }>({});

const Dialog: React.FC<DialogProps> = ({ open, ...props }) => {
  const contextValue = React.useMemo(() => ({ open }), [open]);

  // 把modal设置成false，因为需要考虑到我们弹窗之后还会有Table Select的场景
  return (
    <DialogContext.Provider value={contextValue}>
      <DialogPrimitive.Root modal={false} open={open} {...props} />
    </DialogContext.Provider>
  );
};

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-neutral-800/30",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DialogContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  zIndex?: number; // 保留向后兼容，如果传入则使用传入的值
  dialogPortalProps?: React.ComponentPropsWithoutRef<typeof DialogPortal>;
  disableAutoZIndex?: boolean; // 是否禁用自动 z-index 管理
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      children,
      zIndex: customZIndex,
      dialogPortalProps,
      disableAutoZIndex = false,
      onInteractOutside,
      style,
      ...props
    },
    ref,
  ) => {
    // 从 Context 中获取 open 状态
    const { open = true } = React.useContext(DialogContext);
    const openedAtRef = React.useRef<number | null>(null);

    React.useLayoutEffect(() => {
      openedAtRef.current = open ? Date.now() : null;
    }, [open]);

    // 自动管理 z-index
    const { zIndex: autoZIndex } = useOverlay({
      type: "dialog",
      open: open && !disableAutoZIndex,
      customZIndex,
    });

    // 最终使用的 z-index：优先使用自定义值，其次使用自动计算值
    const finalZIndex = customZIndex ?? (disableAutoZIndex ? 50 : autoZIndex);

    // 自动管理容器（可选功能，默认不启用以保持向后兼容）
    // const container = useContainer({
    //   id: overlayId,
    //   zIndex: finalZIndex,
    //   visible: open,
    //   disableContainer: true, // 暂时禁用独立容器
    // });

    // 合并用户传入的 style，确保 zIndex 不被覆盖
    const mergedStyle: React.CSSProperties = {
      ...style,
      zIndex: finalZIndex + 1, // content 比 overlay 高一层，不可覆盖
    };

    const handleInteractOutside: React.ComponentPropsWithoutRef<
      typeof DialogPrimitive.Content
    >["onInteractOutside"] = (event) => {
      const openedAt = openedAtRef.current;
      if (open && (!openedAt || Date.now() - openedAt < 250)) {
        event.preventDefault();
        return;
      }

      onInteractOutside?.(event);
    };

    return (
      <DialogPortal {...dialogPortalProps}>
        {/* 不使用Radix UI的overlay，因为有React Remove Scroll，会导致我们的TableSelect无法正常滚动*/}
        {/*<DialogOverlay style={{ zIndex: finalZIndex }} />*/}
        <div
          role="presentation"
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 bg-neutral-800/30"
          style={{ zIndex: finalZIndex }}
          data-state={open ? "open" : "closed"}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
              "border border-solid border-transparent " +
              "bg-neutral-0 max-h-[80vh] rounded-xs shadow-lg duration-200 " +
              "data-[state=open]:animate-in data-[state=closed]:animate-out " +
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 " +
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className,
          )}
          style={mergedStyle}
          onInteractOutside={handleInteractOutside}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const dialogHeaderVariants = cva("flex flex-row items-center", {
  variants: {
    variant: {
      primary: "align-center px-6",
      secondary: "",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export interface DialogHeaderProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogHeaderVariants> {}

const DialogHeader = ({ className, variant, ...props }: DialogHeaderProps) => (
  <div className={dialogHeaderVariants({ variant, className })} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const dialogFooterVariants = cva(
  "flex flex-row items-center justify-end gap-2",
  {
    variants: {
      variant: {
        primary: "px-6 py-3.5",
        secondary: "",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface DialogFooterProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogFooterVariants> {}
const DialogFooter = ({ className, variant, ...props }: DialogFooterProps) => (
  <div className={dialogFooterVariants({ variant, className })} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const dialogTitleVariants = cva("!m-0 leading-6 text-neutral-800", {
  variants: {
    variant: {
      normal: "text-base",
      weak: "text-sm",
    },
  },
  defaultVariants: {
    variant: "normal",
  },
});

export interface DialogTitleProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>,
    VariantProps<typeof dialogTitleVariants> {}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={dialogTitleVariants({ variant, className })}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const dialogBannerVariants = cva(
  "align-center flex min-h-9 flex-row items-center border border-solid px-3 py-1.5",
  {
    variants: {
      variant: {
        danger: "bg-danger-50 border-danger-200",
        warning: "bg-alert-50 border-alert-200",
        info: "bg-info-50 border-info-200",
      },
    },
    defaultVariants: {
      variant: "danger",
    },
  },
);

export interface DialogBannerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogBannerVariants> {
  children: React.ReactNode;
}

const DialogBanner = ({
  children,
  variant = "danger",
  className,
  ...props
}: DialogBannerProps) => {
  return (
    <div className={dialogBannerVariants({ variant, className })} {...props}>
      <div className="flex flex-row text-sm leading-5.5 text-neutral-700">
        {variant === "danger" && (
          <Icon
            type="alert-triangle-fill"
            className="text-danger-500 mr-2 min-h-4 min-w-4 translate-y-0.5"
          />
        )}
        {variant === "warning" && (
          <Icon
            type="alert-triangle-fill"
            className="text-alert-500 mr-2 min-h-4 min-w-4 translate-y-0.5"
          />
        )}
        {variant === "info" && (
          <Icon
            type="info-fill"
            className="text-info-500 mr-2 min-h-4 min-w-4 translate-y-0.5"
          />
        )}
        <div className="flex flex-col">{children}</div>
      </div>
    </div>
  );
};

export type DialogDividerProps = React.HTMLAttributes<HTMLDivElement>;

const DialogDivider = ({ ...props }: DialogDividerProps) => {
  return <div className={cn("h-px w-full bg-neutral-300")} {...props} />;
};

export interface DialogScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// 去除顶部header和底部footer的高度48+60，以及两个分割线的高度，1+1，一共是110
const DialogScrollArea = ({
  className,
  children,
  ...props
}: DialogScrollAreaProps) => (
  <div
    className={cn("max-h-[calc(80vh-110px)] overflow-auto", className)}
    {...props}
  >
    {children}
  </div>
);

const dialogBodyVariants = cva("", {
  variants: {
    variant: {
      primary: "box-border h-min px-6 pt-6 pb-10",
      secondary: "pt-2 pb-5 pl-6",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export interface DialogBodyProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogBodyVariants> {
  children: React.ReactNode;
}

const DialogBody = ({ children, variant, className }: DialogBodyProps) => {
  return (
    <div className={cn(dialogBodyVariants({ variant, className }))}>
      {children}
    </div>
  );
};

export interface DialogHeaderLargeProps {
  title: string;
  setVisible: (visible: boolean) => void;
}

const DialogHeaderLarge = ({ title, setVisible }: DialogHeaderLargeProps) => {
  return (
    <DialogHeader className="h-12 justify-between">
      <DialogTitle>{title}</DialogTitle>
      <Icon type="close"
        className="h-5 w-5 cursor-pointer text-neutral-700"
        onClick={() => setVisible(false)}
      />
    </DialogHeader>
  );
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogHeaderLarge,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBanner,
  DialogDivider,
  DialogBody,
  DialogScrollArea,
};
