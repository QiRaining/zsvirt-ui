import { cn } from "@zstack/utils";
import * as React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string | undefined;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ value, showCount = true, className, ...props }, ref) => {
    if (showCount) {
      return (
        <div className="box-border flex">
          <textarea
            className={cn(
              "bg-neutral-0 focus-visible:ring-theme-50 box-border flex w-full rounded-xs border px-3 text-sm " +
                "text-neutral-700 placeholder:text-neutral-500 " +
                "border border-solid border-neutral-400 focus-visible:ring-2 focus-visible:outline-none " +
                "focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 " +
                "focus-visible:border-theme-600 hover:border-theme-600 min-h-14 py-1.75 " +
                "aria-[invalid=true]:border-danger-500 aria-[invalid=true]:focus-visible:border-danger-500 aria-[invalid=true]:focus-visible:ring-danger-50 aria-[invalid=true]:hover:border-danger-500",
              className,
            )}
            ref={ref}
            value={value}
            {...props}
          />
          {showCount && (
            <div className="flex items-end justify-end">
              <div className="ml-2 text-xs text-neutral-500">
                {value?.length || 0}/256
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <textarea
        className={cn(
          "bg-neutral-0 focus-visible:ring-theme-50 flex w-full rounded-md rounded-xs border px-3 py-1.75 text-sm " +
            "text-neutral-700 placeholder:text-neutral-500 " +
            "box-border border-solid border-neutral-400 focus-visible:ring-2 focus-visible:outline-none " +
            "px-3 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 " +
            "focus-visible:border-theme-600 hover:border-theme-600 box-border min-h-14 " +
            "aria-[invalid=true]:border-danger-500 aria-[invalid=true]:focus-visible:border-danger-500 aria-[invalid=true]:focus-visible:ring-danger-50 aria-[invalid=true]:hover:border-danger-500",
          className,
        )}
        ref={ref}
        value={value}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
