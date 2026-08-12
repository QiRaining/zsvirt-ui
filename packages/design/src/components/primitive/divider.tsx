import { cn } from "@zstack/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

const dividerVariants = cva("list-none p-0 text-sm text-neutral-700", {
  variants: {
    type: {
      horizontal:
        "clear-both flex w-full min-w-full border-t border-b-0 border-neutral-300",
      vertical:
        "relative top-[-0.06em] inline-block h-[0.9em] border-r-0 border-l border-neutral-300 align-middle",
    },
    dashed: {
      true: "border-dashed",
      false: "border-solid",
    },
    orientation: {
      left: "",
      right: "",
      center: "",
    },
    withText: {
      true: "flex items-center border-t-0 whitespace-nowrap",
      false: "",
    },
    plain: {
      true: "font-normal",
      false: "font-medium",
    },
  },
  compoundVariants: [
    {
      type: "vertical",
      class: "my-0 h-[0.9em] border-t-0",
    },
    {
      type: "horizontal",
      withText: true,
      class: "border-t-0",
    },
  ],
  defaultVariants: {
    type: "horizontal",
    dashed: false,
    orientation: "center",
    plain: false,
  },
});

export interface DividerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  children?: React.ReactNode;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      className,
      type = "horizontal",
      dashed,
      orientation = "center",
      plain,
      children,
      ...props
    },
    ref,
  ) => {
    const withText = !!children && type === "horizontal";

    return (
      <div
        ref={ref}
        className={cn(
          dividerVariants({
            type,
            dashed,
            orientation: withText ? orientation : undefined,
            withText,
            plain,
            className,
          }),
          withText &&
            "before:relative before:top-1/2 before:translate-y-1/2 before:transform before:border-t before:border-neutral-300 before:content-[''] after:relative after:top-1/2 after:translate-y-1/2 after:transform after:border-t after:border-neutral-300 after:content-['']",
          withText && orientation === "left" && "before:w-[5%] after:w-[95%]",
          withText && orientation === "right" && "before:w-[95%] after:w-[5%]",
          withText && orientation === "center" && "before:w-1/2 after:w-1/2",
        )}
        {...props}
      >
        {withText && (
          <span
            className={cn(
              "inline-block px-2",
              plain ? "font-normal" : "font-medium",
            )}
          >
            {children}
          </span>
        )}
      </div>
    );
  },
);

Divider.displayName = "Divider";

export { Divider, dividerVariants };
