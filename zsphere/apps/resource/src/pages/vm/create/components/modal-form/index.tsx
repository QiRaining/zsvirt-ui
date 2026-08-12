import { Alert, Divider } from "@zstack/design";
import { Button } from "@zstack/design";
import {
  Dialog,
  DialogContent,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogScrollArea,
  DialogBody,
} from "@zstack/design";
import { Text } from "@zstack/design";
import { Icon, type IconTypes } from "@zstack/icon";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useDebounceFn } from "ahooks";
import { ConfigProvider } from "antd";
import type { FormInstance } from "antd/es/form";
import cls from "classnames";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import "./style.module.less";
import type { IModalFormContext } from "./context";
import { ModalFormContext, useModalFormContext } from "./context";
import { translateValidateFailedLable } from "./translate";

export interface IValues {
  [name: string]: any;
}

type AlertType = "error" | "info" | "warning";

const typeToVariant = {
  error: "danger",
  info: "info",
  warning: "warning",
  success: "positive",
} as const;
type AlertTypeKey = keyof typeof typeToVariant;

export interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  alertType?: AlertType | AlertType[];
  alertMessage?: string | React.ReactNode | string[] | React.ReactNode[];
  form: FormInstance;
  children?: React.ReactChild;
  beforeOnOk?: () => Promise<any>; // 处理异步逻辑
  onOk?: (values: IValues) => void;
  onCancel?: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  icon?: IconTypes;
  iconTooltip?: React.ReactChild;
  needValidate?: boolean | ((values: any) => boolean);
  validatePassword?: (password: string) => Promise<boolean>;
  needResetFields?: boolean;
  controlledVisible?: boolean;
  resourceName?: string;
  context?: IModalFormContext;
  title?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  zIndex?: number;
  footer?: React.ReactNode;

  beforeValidateModalOpen?: () => any;

  //这俩参数是为了解决 zsv创建虚拟机，多个表单层叠后，提示校验失败的字段 的问题
  showValidateFailedFields?: boolean; //是否展示校验失败字段的Modal
  notValidateFieldsList?: string[]; //哪些字段不需要校验
}

const ModalZSV = ({
  className,
  style,
  alertType: _alertType,
  alertMessage: _alertMessage,
  form,
  beforeOnOk,
  onOk,
  onCancel,
  children,
  visible,
  setVisible,
  title,
  needValidate = false,
  beforeValidateModalOpen,
  needResetFields = true,
  controlledVisible = false,
  resourceName,
  context,
  zIndex,
  width = 600,
}: IProps) => {
  const intl = useIntl();

  const [validateFailedModalVisible, setValidateFailedModalVisible] =
    useState(false);
  const [errorFields, setErrorFields] = useState([]);

  const alertTypes = Array.isArray(_alertType) ? _alertType : [_alertType];

  let alertMessages: string[] | React.ReactNode[] = [];

  if (_alertMessage) {
    alertMessages = Array.isArray(_alertMessage)
      ? _alertMessage
      : [_alertMessage];
  }

  const modalTitle = useMemo(() => {
    return (
      <div className="modal-title">
        <div className="action-title">{title}</div>
        {resourceName ? (
          <div className="resource-name">
            <Divider type="vertical" />
            <div className="text">
              <Text>{resourceName}</Text>
            </div>
          </div>
        ) : null}
      </div>
    );
  }, [title, resourceName]);

  const validate = async () => {
    if (beforeOnOk) {
      await beforeOnOk();
    }
    if (onOk) {
      form
        .validateFields()
        .then(() => {
          const values = form.getFieldsValue(true);
          // tips：注意setVisible和onOk顺序
          if (!controlledVisible) {
            setVisible(false);
            setValidateFailedModalVisible(false);
          }
          onOk(values);
          if (needResetFields) {
            form.resetFields();
          }
        })
        .catch((errorInfo) => {
          setErrorFields(errorInfo.errorFields);
          setValidateFailedModalVisible(true);
          const path = errorInfo.errorFields[0].name;
          form.scrollToField(path);
        });
    }
  };
  const { run: runValidate } = useDebounceFn(validate, { wait: 100 });

  const runOk = async () => {
    const showValidate =
      typeof needValidate === "function"
        ? needValidate?.(form.getFieldsValue(true))
        : needValidate;
    if (showValidate) {
      if (onOk) {
        await beforeValidateModalOpen?.();
      }
    } else {
      runValidate();
    }
  };

  //const { run: runOk } = useDebounceFn(validateOnOk, { wait: 800 }) // 部分modal逻辑太长， visible：true 时间可以过长，所以这个时间适当长些

  const validateFailedContent = useMemo(() => {
    //这里的样式估计是 要改的
    return errorFields.map((t: any, index: number) => (
      <div
        key={index}
      >{`${translateValidateFailedLable(intl, t.name[0])}: ${t.errors[0]}`}</div>
    ));
  }, [errorFields]);

  const contextValue = useMemo(() => {
    const { source = {}, selectedList = [] } = context ?? {};

    return {
      source,
      selectedList,
    };
  }, [context]);

  const validateOnCancel = (e?: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (onCancel) {
      onCancel(e);
    }
    if (!controlledVisible) {
      setVisible(false);
    }
    if (needResetFields) {
      form.resetFields();
    }
  };

  return (
    <ModalFormContext.Provider value={contextValue}>
      <Dialog open={visible}>
        <DialogContent
          className={cls(className)}
          zIndex={zIndex}
          style={{ width, ...style }}
        >
          <ConfigProvider
            getPopupContainer={(trigger) =>
              (trigger?.closest('[role="dialog"]') as HTMLElement) ||
              document.body
            }
          >
            <DialogHeader className="h-12 justify-between">
              <DialogTitle>{modalTitle}</DialogTitle>
              <Icon
                type="close"
                className="h-5 w-5 cursor-pointer text-neutral-700"
                onClick={() => validateOnCancel()}
              />
            </DialogHeader>
            <DialogDivider />
            <DialogScrollArea>
              {alertMessages?.length > 0 && (
                <div className="zsv-modal-form-body-alert-container">
                  {alertMessages?.map(
                    (alertMessage, index) =>
                      alertMessage &&
                      alertTypes[index] && (
                        <Alert
                          key={index}
                          variant={
                            typeToVariant[alertTypes[index] as AlertTypeKey]
                          }
                        >
                          {alertMessage}
                        </Alert>
                      ),
                  )}
                </div>
              )}

              <DialogBody>{children}</DialogBody>
            </DialogScrollArea>
            <DialogDivider />
            <DialogFooter className="gap-2">
              <Button
                id="modal-cancel"
                variant="subtle"
                onClick={() => validateOnCancel()}
                type="button"
              >
                {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
              </Button>
              <Button
                id="modal-ok"
                variant="primary"
                onClick={runOk}
                type="button"
              >
                {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
              </Button>
            </DialogFooter>
          </ConfigProvider>
        </DialogContent>
      </Dialog>

      <DialogWeak
        title={String(
          intl.formatMessage({
            id: "please.fix.these.shit",
            defaultMessage: "Review the Following Configurations",
          }),
        )}
        type="warning"
        visible={validateFailedModalVisible}
        setVisible={setValidateFailedModalVisible}
        onConfirm={() => setValidateFailedModalVisible(false)}
        footer={
          <Button
            key="submit"
            variant="primary"
            onClick={() => setValidateFailedModalVisible(false)}
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        }
        description={<div>{validateFailedContent}</div>}
      />
    </ModalFormContext.Provider>
  );
};

ModalZSV.useModalFormContext = useModalFormContext;

export default ModalZSV;
