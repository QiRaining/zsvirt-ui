
/**
 * @description 这个文件下面都是一些分页的基础组件，用来解决index封装好的组件没法直接用的问题
 */
("use client");
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as React from "react";
import { useState } from "react";

const PaginationRoot = ({
  className,
  ...props
}: React.ComponentProps<"nav">) => (
  <nav
    aria-label="pagination"
    className={cn("mx-auto flex w-full items-center justify-center", className)}
    {...props}
  />
);
PaginationRoot.displayName = "PaginationRoot";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(
      "!m-0 flex list-none flex-row items-center gap-1 p-0",
      className,
    )}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
} & React.ComponentProps<"button">;

const PaginationLink = ({
  className,
  isActive,
  ...props
}: PaginationLinkProps) => (
  <button
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "hover:text-theme-500 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xs bg-transparent text-center leading-none transition-all" +
        " border border-solid border-transparent disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:text-neutral-300",
      isActive
        ? "text-theme-600 border-theme-600 font-medium"
        : "text-neutral-700 hover:border-neutral-200",
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    className={cn("px-1", className)}
    {...props}
  >
    <Icon type="arrow-ios-left" />
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    className={cn("px-1", className)}
    {...props}
  >
    <Icon type="arrow-ios-right" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

interface IPaginationEllipsisProps extends React.ComponentProps<"span"> {
  direction: "left" | "right";
}

const PaginationEllipsis = ({
  className,
  direction,
  ...props
}: IPaginationEllipsisProps) => {
  const [hovering, setHovering] = useState(false);
  return (
    <span
      aria-hidden
      className={cn(
        "hover:text-theme-500 flex h-9 w-9 cursor-pointer items-center justify-center",
        className,
      )}
      onMouseOver={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
      {...props}
    >
      {hovering && direction === "left" && <Icon type="arrowhead-left" />}
      {hovering && direction === "right" && <Icon type="arrowhead-right" />}
      {!hovering && <Icon type="more-horizontal" />}
    </span>
  );
};
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
