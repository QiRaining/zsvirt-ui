"use client";

import { Icon } from "@zstack/icon";
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={1500}>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        indicator,
        ...props
      }) {
        return (
          <Toast
            key={id}
            variant={indicator === "error" ? "destructive" : "default"}
            {...props}
          >
            <div className="flex w-full flex-1 space-x-1">
              <div className="flex items-center space-x-2">
                {indicator === "success" && (
                  <Icon type="checkmark-circle-fill" className="text-positive-500" />
                )}
                {indicator === "error" && (
                  <Icon type="close-circle-fill" className="text-danger-500" />
                )}
                {title && <ToastTitle>{title}</ToastTitle>}
              </div>
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {/*{action}*/}
            {/*<ToastClose />*/}
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
