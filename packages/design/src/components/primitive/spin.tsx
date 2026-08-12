"use client";

import { cn } from "@zstack/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { Loader } from "./loader";

const spinContainerVariants = cva("relative", {
  variants: {
    fullscreen: {
      true: "fixed inset-0 z-50",
      false: "inline-block",
    },
  },
  defaultVariants: {
    fullscreen: true,
  },
});

const spinIndicatorVariants = cva("inline-flex items-center justify-center", {
  variants: {
    size: {
      small: "h-4 w-4 [&_svg]:h-4 [&_svg]:w-4",
      medium: "h-6 w-6 [&_svg]:h-6 [&_svg]:w-6",
      large: "h-8 w-8 [&_svg]:h-8 [&_svg]:w-8",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

const spinWrapperVariants = cva("flex flex-col items-center justify-center", {
  variants: {
    spinning: {
      true: "",
      false: "hidden",
    },
  },
});

const spinBlurVariants = cva("transition-all duration-300", {
  variants: {
    spinning: {
      true: "pointer-events-none opacity-40 select-none",
      false: "opacity-100",
    },
  },
});

export interface SpinProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinIndicatorVariants> {
  /**
   * 是否为加载中状态
   * @default true
   */
  spinning?: boolean;
  /**
   * 延迟显示加载效果的时间（防止闪烁，单位：毫秒）
   * @default 0
   */
  delay?: number;
  /**
   * 自定义加载指示器
   */
  indicator?: React.ReactNode;
  /**
   * 当作为包裹元素时，可以自定义描述文案
   */
  tip?: React.ReactNode;
  /**
   * 组件大小
   * @default "medium"
   */
  size?: "small" | "medium" | "large";
  /**
   * 包裹的内容
   */
  children?: React.ReactNode;
  /**
   * 是否全屏显示
   * @default true
   */
  fullscreen?: boolean;
  /**
   * 自定义加载指示器的类名
   */
  indicatorClassName?: string;
  /**
   * 自定义 tip 的类名
   */
  tipClassName?: string;
}

const DefaultIndicator = ({
  size,
}: {
  size?: "small" | "medium" | "large";
}) => {
  return (
    <Loader
      className={cn(
        "animate-duration-1000 animate-spin",
        size === "small" && "h-4 w-4",
        size === "medium" && "h-6 w-6",
        size === "large" && "h-8 w-8",
      )}
    />
  );
};

const Spin = React.forwardRef<HTMLDivElement, SpinProps>(
  (
    {
      className,
      spinning = true,
      delay = 0,
      indicator,
      tip,
      size = "medium",
      children,
      fullscreen = true,
      indicatorClassName,
      tipClassName,
      ...props
    },
    ref,
  ) => {
    const [shouldRender, setShouldRender] = React.useState(delay === 0);

    React.useEffect(() => {
      if (spinning && delay > 0) {
        const timer = setTimeout(() => {
          setShouldRender(true);
        }, delay);

        return () => clearTimeout(timer);
      } else if (spinning) {
        setShouldRender(true);
      } else {
        setShouldRender(false);
      }
    }, [spinning, delay]);

    const showSpin = spinning && shouldRender;

    // 渲染加载指示器
    const renderIndicator = () => {
      const defaultIndicator = <DefaultIndicator size={size} />;

      return (
        <div
          className={cn(spinIndicatorVariants({ size }), indicatorClassName)}
        >
          {indicator ?? defaultIndicator}
        </div>
      );
    };

    // 全屏模式
    if (fullscreen) {
      return showSpin ? (
        <div
          ref={ref}
          className={cn(
            spinContainerVariants({ fullscreen: true }),
            "flex items-center justify-center",
            className,
          )}
          {...props}
        >
          <div className={cn(spinWrapperVariants({ spinning: showSpin }))}>
            {renderIndicator()}
            {tip && (
              <div
                className={cn("mt-2 text-sm text-neutral-700", tipClassName)}
              >
                {tip}
              </div>
            )}
          </div>
        </div>
      ) : null;
    }

    // 无子元素，只渲染加载指示器
    if (!children) {
      return showSpin ? (
        <div
          ref={ref}
          className={cn(
            spinContainerVariants({ fullscreen: false }),
            className,
          )}
          {...props}
        >
          <div className={cn(spinWrapperVariants({ spinning: showSpin }))}>
            {renderIndicator()}
            {tip && (
              <div
                className={cn("mt-2 text-sm text-neutral-700", tipClassName)}
              >
                {tip}
              </div>
            )}
          </div>
        </div>
      ) : null;
    }

    // 有子元素，作为容器包裹内容
    return (
      <div
        ref={ref}
        className={cn(spinContainerVariants({ fullscreen: false }), className)}
        {...props}
      >
        {showSpin && (
          <div className="bg-neutral-0/80 rounded-inherit absolute inset-0 z-10 flex items-center justify-center">
            <div className={cn(spinWrapperVariants({ spinning: showSpin }))}>
              {renderIndicator()}
              {tip && (
                <div
                  className={cn("mt-2 text-sm text-neutral-700", tipClassName)}
                >
                  {tip}
                </div>
              )}
            </div>
          </div>
        )}
        <div className={cn(spinBlurVariants({ spinning: showSpin }))}>
          {children}
        </div>
      </div>
    );
  },
);

Spin.displayName = "Spin";

export { Spin, spinIndicatorVariants, spinContainerVariants };
