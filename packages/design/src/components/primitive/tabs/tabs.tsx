"use client";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { usePersistTabState } from "@zstack/hooks";
import { cn } from "@zstack/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as React from "react";

// tabs组样式（tabs项之间间距之类）
// 响应式：支持水平滚动，隐藏滚动条
const tabsListVariants = cva(
  "scrollbar-none box-border flex flex-nowrap items-center overflow-x-auto",
  {
    variants: {
      variant: {
        line: "w-full gap-6 border-b border-solid border-neutral-300",
        // card 模式：用 after 伪元素画底线，不用 border（参考 Ant Design）
        card: "relative w-full items-end gap-2 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:bg-neutral-300 after:content-['']",
        outline: "w-fit",
      },
    },
    defaultVariants: {
      variant: "line",
    },
  },
);
// tabs项样式 line | card | outline   默认：line
// 响应式：文字不换行，不被压缩
const tabsTriggerVariants = cva(
  "hover:text-theme-600 data-[state=active]:hover:text-theme-600 relative flex shrink-0 cursor-pointer items-center bg-transparent text-sm whitespace-nowrap text-neutral-700 outline-none focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:text-neutral-500 data-[state=active]:font-medium",
  {
    variants: {
      variant: {
        line: "data-[state=active]:before:bg-theme-600 data-[state=active]:before:rounded-px data-[state=active]:text-theme-600 h-12 space-x-0.75 px-0 data-[state=active]:before:absolute data-[state=active]:before:-bottom-px data-[state=active]:before:left-0 data-[state=active]:before:h-0.75 data-[state=active]:before:w-full data-[state=active]:before:content-['']",
        // card 模式：顶左右有边框，底边框默认无；激活状态加白色底边框盖住伪元素底线
        card: "bg-neutral-0 data-[state=active]:bg-neutral-0 data-[state=active]:border-t-solid data-[state=active]:border-t-theme-600 -mb-px h-8 rounded-t-xs border-t border-r border-l border-solid border-neutral-300 px-4 py-1.5 data-[state=active]:z-10 data-[state=active]:border-t-2 data-[state=active]:border-b data-[state=active]:border-b-white data-[state=active]:pt-1.5 data-[state=active]:pb-2 data-[state=active]:text-neutral-800",
        outline:
          "hover:text-theme-600 bg-neutral-0 data-[state=active]:!text-theme-600 data-[state=active]:hover:!text-theme-600 data-[state=active]:border-theme-600 -mr-px h-8 space-x-1 border-1 border-solid border-neutral-300 px-3 py-0 first:rounded-l-xs last:mr-0 last:rounded-r-xs data-[state=active]:relative data-[state=active]:z-10",
      },
    },
    defaultVariants: {
      variant: "line",
    },
  },
);

// 根组件
const TabsRoot = TabsPrimitive.Root;

// tabsList组件 - 带滚动提示
export interface TabsListProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {
  children: React.ReactNode;
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = React.useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  // 检测滚动状态
  const updateScrollState = React.useCallback(() => {
    const el = innerRef.current;
    if (!el) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setScrollState({
      canScrollLeft: scrollLeft > 1,
      canScrollRight: scrollLeft < scrollWidth - clientWidth - 1,
    });
  }, []);

  React.useEffect(() => {
    const el = innerRef.current;
    if (!el) {
      return;
    }

    // 初始检测
    updateScrollState();

    // 监听滚动
    el.addEventListener("scroll", updateScrollState, { passive: true });

    // 监听 resize
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  // 合并 ref
  const mergedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      (innerRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  const { canScrollLeft, canScrollRight } = scrollState;

  return (
    <div className="relative">
      {/* 左侧渐变提示 */}
      {canScrollLeft && (
        <div
          className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-16"
          style={{
            background:
              "linear-gradient(to right, var(--neutral-100) 0%, var(--neutral-0) 30%, transparent 100%)",
          }}
        />
      )}

      <TabsPrimitive.List
        ref={mergedRef}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />

      {/* 右侧渐变提示 */}
      {canScrollRight && (
        <div
          className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-16"
          style={{
            background:
              "linear-gradient(to left, var(--neutral-100) 0%, var(--neutral-0) 30%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

// tabs trigger组件
export interface TabsTriggerProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {
  value: string;
  label?: React.ReactNode;
}
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ variant, label, className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant }), className)}
    {...props}
  >
    {label}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// tabs导航页面（用户自定义插入）
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("focus-visible:outline-none", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// tabsListItem接口
export type TabsListItem = {
  value: string;
  label?: React.ReactNode;
  content?: React.ReactNode | (() => React.ReactNode); // 导航页面，支持 render function 实现懒渲染
  disabled?: boolean;
  className?: string;
  noPadding?: boolean; // 当为 true 时，该 tab 的 content 区域不应用 contentClassName 中的 padding
};

export interface TabsPrimitiveProps
  extends
    VariantProps<typeof tabsListVariants>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {}

// Tabs接口（根组件总体参数
export interface TabsProps extends TabsPrimitiveProps {
  tabsList: Array<TabsListItem>;
  forceMount?: true; // 切换页面时上一页面是否保留
  listClassName?: string;
  rootClassName?: string;
  contentClassName?: string;
  contentId?: string;
  routerTarget?: string;
}

/**
 * 解析 tab content：支持 ReactNode 和 () => ReactNode 两种形式。
 * 当 content 是 render function 时，仅在该 tab 激活后才首次调用，
 * 后续切走不卸载（配合 forceMount + hidden），实现「首次激活才渲染」的懒加载。
 *
 * render function 的返回值会被 useMemo 缓存（以 content 引用为依赖），
 * 避免父组件 re-render 时对重型子树（如列表页）反复生成新 JSX 树。
 */
function TabContentRenderer({
  content,
  isActive,
  forceMount,
}: {
  content: React.ReactNode | (() => React.ReactNode);
  isActive: boolean;
  forceMount?: true;
}) {
  // 记录是否曾经激活过（用于 forceMount 场景：激活过一次后持续保留 DOM）
  const hasBeenActiveRef = React.useRef(false);
  if (isActive) {
    hasBeenActiveRef.current = true;
  }

  const shouldRender = forceMount ? hasBeenActiveRef.current : isActive;

  // 缓存 render function 的返回值，仅在 content 引用变化时重新调用
  const rendered = React.useMemo(() => {
    if (typeof content !== "function") {
      return content;
    }
    return shouldRender ? content() : null;
  }, [content, shouldRender]);

  return <>{rendered}</>;
}

// 根据用户传参，组件内部组装tabs
const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(
  (
    {
      variant,
      tabsList,
      listClassName,
      rootClassName,
      contentClassName,
      contentId = "main-tab",
      routerTarget,
      onValueChange,
      defaultValue,
      value,
      ...props
    },
    ref,
  ) => {
    // tabs持久化
    const { onChange, activeKey } = usePersistTabState(
      contentId,
      tabsList,
      routerTarget,
    );

    const currentValue = value || activeKey;

    if (!tabsList.length) {
      return null;
    }

    return (
      <TabsRoot
        defaultValue={defaultValue}
        value={currentValue}
        ref={ref}
        className={cn("relative", rootClassName)}
        onValueChange={(value) => {
          if (onValueChange) {
            // 受控
            onValueChange?.(value);
          } else {
            onChange(value);
          }
        }}
        {...props}
      >
        <TabsList variant={variant} className={listClassName}>
          {tabsList.map((item) => (
            <TabsTrigger
              value={item.value}
              variant={variant}
              key={item.value}
              disabled={item.disabled}
              label={item.label}
              className={item.className}
            />
          ))}
        </TabsList>
        {tabsList.map((item) => (
          <TabsContent
            value={item.value}
            key={item.value}
            forceMount={props.forceMount}
            data-forcemount={props.forceMount}
            // 不清除DOM；noPadding 时仍保留 contentClassName 中的非 padding 类（如 flex 布局）
            className={cn(
              "data-[state=inactive]:hidden",
              contentClassName,
              item.noPadding && "!p-0",
            )}
          >
            <TabContentRenderer
              content={item.content}
              isActive={currentValue === item.value}
              forceMount={props.forceMount}
            />
          </TabsContent>
        ))}
      </TabsRoot>
    );
  },
);
Tabs.displayName = "Tabs";

export { Tabs, TabsRoot, TabsList, TabsTrigger, TabsContent };
