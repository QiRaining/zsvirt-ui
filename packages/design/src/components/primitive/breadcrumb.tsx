import { Icon } from "@zstack/icon";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@zstack/utils";
import * as React from "react";

import { Text } from "./text.tsx";

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(
      // list-none p-0 m-0 去除ol的默认样式
      "!m-0 flex list-none flex-wrap items-center gap-1 p-0 text-sm break-words",
      className,
    )}
    {...props}
  />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
  }
>((props, ref) => {
  const { asChild, className, ...rest } = props;
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      className={cn(
        // ! 用于覆盖全局 a 标签样式
        "hover:!text-theme-600 text-xs !text-neutral-600 no-underline transition-colors",
        className,
      )}
      {...rest}
    />
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbBackLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
  }
>((props, ref) => {
  const { asChild, className, onClick, ...rest } = props;
  const Comp = asChild ? Slot : "a";

  return (
    <span
      className="group hover:!text-theme-600 flex cursor-pointer items-center !text-neutral-600"
      onClick={onClick}
    >
      <Icon type="arrow-left" className="group-hover:!text-theme-600 mr-1 !text-neutral-600" />
      <Comp
        ref={ref}
        className={cn(
          // ! 用于覆盖全局 a 标签样式
          "group-hover:!text-theme-600 hover:!text-theme-600 text-xs !text-neutral-600 no-underline hover:!opacity-100",
          className,
        )}
        {...rest}
      />
    </span>
  );
});
BreadcrumbBackLink.displayName = "BreadcrumbBackLink";

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>((props, _ref) => {
  const { className, ...rest } = props;

  return (
    <Text
      // 因为Text自己也用了Ref，之后想个优雅的办法把它透进去
      // ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("max-w-50 text-xs font-normal text-neutral-800", className)}
      {...rest}
    />
  );
});
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("flex items-center", className)}
    {...props}
  >
    {children ?? <Icon type="arrow-ios-right" className="!text-neutral-300" />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbDivider = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div className={cn("mx-1 h-3 w-px bg-neutral-300", className)} {...props} />
);
BreadcrumbDivider.displayName = "BreadcrumbDivider";

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <Icon type="more-horizontal" className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbBackLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbDivider,
};
