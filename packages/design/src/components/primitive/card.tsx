import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as React from "react";
import { createContext, useContext, useState } from "react";

const CardContext = createContext({
  isCollapsed: false,
  toggleCollapse: () => {},
});

export function useCardContext() {
  return useContext(CardContext);
}

// 创建包含开闭状态和切换函数的 Provider
export function CardProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <CardContext.Provider value={{ isCollapsed, toggleCollapse }}>
      {children}
    </CardContext.Provider>
  );
}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardProvider>
    <div
      ref={ref}
      className={cn(
        "box-border h-min w-full rounded-xs border border-solid border-neutral-300",
        className,
      )}
      {...props}
    />
  </CardProvider>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "box-border flex h-9.5 w-full items-center justify-between bg-neutral-100 px-5",
      className,
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full truncate overflow-hidden text-sm font-medium whitespace-nowrap",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

type CardCollapseIndicatorProps = Omit<
  React.SVGProps<SVGSVGElement>,
  "color" | "ref" | "type"
>;

const CardCollapseIndicator = React.forwardRef<
  SVGSVGElement,
  CardCollapseIndicatorProps
>(({ className, ...props }, ref) => {
  const { toggleCollapse, isCollapsed } = useCardContext();
  if (isCollapsed) {
    return (
      <Icon
        type="arrow-ios-up"
        className={cn("h-4 w-4 cursor-pointer", className)}
        onClick={toggleCollapse}
        ref={ref}
        {...props}
      />
    );
  }
  return (
    <Icon
      type="arrow-ios-down"
      className={cn("h-4 w-4 cursor-pointer", className)}
      onClick={toggleCollapse}
      ref={ref}
      {...props}
    />
  );
});
CardCollapseIndicator.displayName = "CardCollapseIndicator";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed } = useCardContext();
  if (!isCollapsed) {
    return (
      <div
        ref={ref}
        className={cn("box-border px-3 py-5", className)}
        {...props}
      />
    );
  }
  return null;
});

CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardCollapseIndicator,
};
