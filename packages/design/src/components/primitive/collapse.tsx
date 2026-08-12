
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as React from "react";
import { createContext, useContext, useState } from "react";

// Context to manage collapse state
const CollapseContext = createContext({
  isExpanded: false,
  toggleExpand: () => {},
});

export function useCollapseContext() {
  return useContext(CollapseContext);
}

// Provider component
// Provider component with controlled mode support
interface CollapseProviderProps {
  children: React.ReactNode;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

function CollapseProvider({
  children,
  expanded: controlledExpanded,
  onExpandedChange,
}: CollapseProviderProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(false);

  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : uncontrolledExpanded;

  const toggleExpand = () => {
    if (isControlled) {
      onExpandedChange?.(!isExpanded);
    } else {
      setUncontrolledExpanded(!isExpanded);
    }
  };

  return (
    <CollapseContext.Provider value={{ isExpanded, toggleExpand }}>
      {children}
    </CollapseContext.Provider>
  );
}

// Root Collapse component
const Collapse = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-xs", className)} {...props} />
));
Collapse.displayName = "Collapse";

// Collapse Item component
// Collapse Item component with expanded prop support
interface CollapseItemProps extends React.HTMLAttributes<HTMLDivElement> {
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const CollapseItem = React.forwardRef<HTMLDivElement, CollapseItemProps>(
  ({ className, expanded, onExpandedChange, ...props }, ref) => (
    <CollapseProvider expanded={expanded} onExpandedChange={onExpandedChange}>
      <div ref={ref} className={cn(className)} {...props} />
    </CollapseProvider>
  ),
);
CollapseItem.displayName = "CollapseItem";

// Collapse Trigger component
const CollapseTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { toggleExpand, isExpanded } = useCollapseContext();

  return (
    <div
      ref={ref}
      onClick={toggleExpand}
      className={cn(
        "flex cursor-pointer items-center transition-colors",
        className,
      )}
      {...props}
    >
      <div className="mr-3 flex items-center">
        {isExpanded ? (
          <Icon type="arrow-ios-down" className="h-4 w-4" />
        ) : (
          <Icon type="arrow-ios-right" className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1">{props.children}</div>
    </div>
  );
});
CollapseTrigger.displayName = "CollapseTrigger";

// Collapse Content component
interface CollapseContentProps extends React.HTMLAttributes<HTMLDivElement> {
  forceRender?: boolean;
}

const CollapseContent = React.forwardRef<HTMLDivElement, CollapseContentProps>(
  ({ className, forceRender = false, ...props }, ref) => {
    const { isExpanded } = useCollapseContext();
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [height, setHeight] = React.useState<number | "auto">(
      isExpanded ? "auto" : 0,
    );

    // 合并 ref
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        (contentRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    React.useEffect(() => {
      if (isExpanded) {
        // 展开时，先设置为实际高度，然后设置为 auto
        const contentHeight = contentRef.current?.scrollHeight || 0;
        setHeight(contentHeight);
        // 动画完成后设置为 auto，以便内容变化时能自动调整
        const timer = setTimeout(() => setHeight("auto"), 200);
        return () => clearTimeout(timer);
      }
      // 折叠时，先设置为实际高度，然后设置为 0
      const contentHeight = contentRef.current?.scrollHeight || 0;
      setHeight(contentHeight);
      // 使用 requestAnimationFrame 确保浏览器渲染了当前高度后再设置为 0
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }, [isExpanded]);

    // If forceRender is true, always render with animation
    if (forceRender) {
      return (
        <div
          ref={mergedRef}
          className={cn(
            "bg-neutral-0 overflow-hidden transition-all duration-200 ease-in-out",
            className,
          )}
          style={{
            height: typeof height === "number" ? `${height}px` : height,
          }}
          {...props}
        />
      );
    }

    // 使用动画但不卸载组件
    return (
      <div
        ref={mergedRef}
        className={cn(
          "bg-neutral-0 overflow-hidden transition-all duration-200 ease-in-out",
          !isExpanded && height === 0 && "invisible",
          className,
        )}
        style={{ height: typeof height === "number" ? `${height}px` : height }}
        aria-hidden={!isExpanded}
        {...props}
      />
    );
  },
);
CollapseContent.displayName = "CollapseContent";

export {
  Collapse,
  CollapseItem,
  CollapseTrigger,
  CollapseContent,
  type CollapseContentProps,
};
