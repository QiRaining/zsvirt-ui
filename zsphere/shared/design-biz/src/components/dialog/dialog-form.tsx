"use client";

import {
  Dialog,
  DialogContent,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogHeaderLarge,
  DialogTitle,
  DialogScrollArea,
  DialogBody,
  DialogBanner,
  DialogPortal,
} from "@zstack/design";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useIntl } from "react-intl";

/** DialogForm context — 向后兼容旧 Modal.Form 的 context 机制 */
export interface IDialogFormContext<T = any, S = any> {
  source?: T;
  selectedList?: S[];
}

const DialogFormContext = createContext<IDialogFormContext>({
  source: {},
  selectedList: [],
});

export function useDialogFormContext<T = any, S = any>() {
  return useContext<IDialogFormContext<T, S>>(DialogFormContext);
}

export interface DialogFormProps<TValues = Record<string, unknown>> {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  /** 资源名称（可选，显示在标题后，以竖线分隔） */
  resourceName?: string;
  children: React.ReactNode;
  /** antd Form instance — form.validateFields() will be called on submit */
  form: {
    validateFields: () => Promise<TValues>;
    resetFields?: () => void;
  };
  onOk: (values: TValues) => void | Promise<void>;
  widthClassName?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  alertType?: "danger" | "warning" | "info";
  alertMessage?: React.ReactNode;
  zIndex?: number;
  dialogPortalProps?: React.ComponentPropsWithoutRef<typeof DialogPortal>;
  /** 自定义 footer，替换默认取消/确定按钮。传 null 隐藏 footer */
  footer?: React.ReactNode;
  /** 附加到 DialogContent 上的额外样式类 */
  className?: string;
  /** 确认按钮的外部 loading 状态 */
  confirmLoading?: boolean;
  /** 是否显示关闭按钮，默认 true */
  closable?: boolean;
  /** DialogBody 外层 div 内联样式 */
  bodyStyle?: React.CSSProperties;
  /** 传递给 DialogBody 的额外样式类，用于覆盖默认 padding 等 */
  bodyClassName?: string;
  /** 是否在取消/关闭时重置表单字段，默认 true。设为 false 可保留用户在表单中的输入 */
  needResetFields?: boolean;
  /** 向后兼容旧 Modal.Form 的 context，通过 DialogFormContext.Provider 注入子组件 */
  context?: IDialogFormContext;
  /** 表单校验失败时的回调，接收 errorFields */
  onValidationError?: (
    errorFields: { name: (string | number)[]; errors: string[] }[],
  ) => void;
}

export const DialogForm = <TValues,>(props: DialogFormProps<TValues>) => {
  const {
    visible,
    setVisible,
    title,
    resourceName,
    children,
    form,
    onOk,
    widthClassName = "w-150",
    cancelText,
    confirmText,
    onCancel,
    alertType,
    alertMessage,
    zIndex,
    dialogPortalProps,
    footer,
    className,
    confirmLoading,
    closable = true,
    bodyStyle,
    bodyClassName,
    context,
    needResetFields = true,
    onValidationError,
  } = props;
  const intl = useIntl();
  const [submitting, setSubmitting] = useState(false);

  const bannerBorderClass = useMemo(() => {
    const borderMap = {
      danger: "border-danger-200",
      warning: "border-alert-200",
      info: "border-info-200",
    };
    return alertType ? borderMap[alertType] : "";
  }, [alertType]);

  const handleCancel = useCallback(() => {
    if (needResetFields) {
      form.resetFields?.();
    }
    setVisible(false);
    onCancel?.();
  }, [form, setVisible, onCancel, needResetFields]);

  const handleOk = useCallback(async () => {
    try {
      setSubmitting(true);
      let values: TValues;
      try {
        values = await form.validateFields();
      } catch (errorInfo: any) {
        /* form validation error — antd Form displays field-level errors */
        onValidationError?.(errorInfo?.errorFields);
        return;
      }
      await onOk(values);
      if (needResetFields) {
        form.resetFields?.();
      }
      setVisible(false);
    } catch (error) {
      /* onOk business error — keep dialog open, log error for debugging */
      if (process.env.NODE_ENV !== "production") {
        console.error("[DialogForm] onOk error:", error);
      }
    } finally {
      setSubmitting(false);
    }
  }, [form, onOk, setVisible, needResetFields, onValidationError]);

  const displayTitle = resourceName ? `${title} - ${resourceName}` : title;

  const contextValue = useMemo(() => {
    const { source = {}, selectedList = [] } = context ?? {};
    return { source, selectedList };
  }, [context]);

  /** Header 渲染：有 resourceName 时用分隔线样式，否则按 closable 决定 */
  const renderHeader = () => {
    if (resourceName) {
      return (
        <DialogHeader className="h-12 justify-between">
          <DialogTitle className="flex w-full min-w-0 items-center font-normal">
            <span className="whitespace-nowrap">{title}</span>
            <span className="mx-2 h-4 w-px shrink-0 bg-neutral-300" />
            <span className="mr-6 min-w-0 flex-1 truncate text-sm font-normal text-neutral-600">
              {resourceName}
            </span>
          </DialogTitle>
          {closable && (
            <Icon
              className="h-5 w-5 shrink-0 cursor-pointer text-neutral-700"
              onClick={() => setVisible(false)} type="close"
            />
          )}
        </DialogHeader>
      );
    }

    if (closable) {
      return <DialogHeaderLarge title={displayTitle} setVisible={setVisible} />;
    }

    return (
      <DialogHeader>
        <DialogTitle>{displayTitle}</DialogTitle>
      </DialogHeader>
    );
  };

  return (
    <DialogFormContext.Provider value={contextValue}>
      <Dialog open={visible}>
        <DialogContent
          className={cn(widthClassName, className)}
          zIndex={zIndex}
          dialogPortalProps={dialogPortalProps}
        >
          {renderHeader()}
          <DialogDivider />
          <DialogScrollArea>
            {alertMessage && alertType && (
              <div className="px-6 pt-4">
                <DialogBanner
                  variant={alertType}
                  className={`rounded-sm border border-solid ${bannerBorderClass}`}
                >
                  {alertMessage}
                </DialogBanner>
              </div>
            )}
            {bodyStyle ? (
              <div style={bodyStyle}>
                <DialogBody className={bodyClassName}>{children}</DialogBody>
              </div>
            ) : (
              <DialogBody className={bodyClassName}>{children}</DialogBody>
            )}
          </DialogScrollArea>
          {footer === null ? null : (
            <>
              <DialogDivider />
              <DialogFooter className="gap-2">
                {footer ?? (
                  <div className="flex gap-2">
                    <Button
                      variant="subtle"
                      onClick={handleCancel}
                      type="button"
                    >
                      {cancelText ||
                        intl.formatMessage({
                          id: "cancel",
                          defaultMessage: "Cancel",
                        })}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleOk}
                      type="button"
                      loading={submitting || confirmLoading}
                      disabled={submitting || confirmLoading}
                    >
                      {confirmText ||
                        intl.formatMessage({
                          id: "ok",
                          defaultMessage: "OK",
                        })}
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DialogFormContext.Provider>
  );
};
