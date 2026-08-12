import { InfoPopover } from "@zstack/design";
import { Icon, type IconTypes } from "@zstack/icon";
import { useDebounceFn } from "ahooks";
import { Button, Checkbox, Divider, Modal, Tooltip } from "antd";
import { FormInstance } from "antd/es/form";
import { ModalProps } from "antd/es/modal";
import cls from "classnames";
import React, { useCallback, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../../_utils/common";
import Input from "../../../input";
import Alert from "../../alert";
import { getTooltip } from "../../field/horizontal/index";
import Form from "../../form";
import Text from "../../text";
import ConfirmModal, {
  IProps as ConfirmModalProps,
} from "../action/validate-modal";
import { useValidatePassword } from "../hooks";
import {
  IModalFormContext,
  ModalFormContext,
  useModalFormContext,
} from "./context";

import "./style.less";

export interface Item {
  [prop: string]: any;
}

export interface IValues {
  [name: string]: any;
}

type AlertType = "error" | "info" | "warning";

export interface IProps<T, S> extends ModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  alertType?: AlertType | AlertType[];
  alertMessage?: string | React.ReactNode | string[] | React.ReactNode[];
  form: FormInstance;
  children?: React.ReactChild;
  beforeOnOk?: () => Promise<any>; // 处理异步逻辑
  onOk?: (values: IValues) => void;
  onError?: (error: any) => void;
  icon?: IconTypes;
  iconTooltip?: React.ReactChild;
  needValidate?: boolean | ((values: any) => boolean);
  validatePassword?: (password: string) => Promise<boolean>;
  needResetFields?: boolean;
  controlledVisible?: boolean;
  confirmModalProps?: Omit<
    ConfirmModalProps,
    "username" | "visible" | "setVisible" | "setActionModalVisible" | "onOk"
  >;
  beforeValidateModalOpen?: () => any;
  context?: IModalFormContext<T, S>;
  needConfirm?: boolean;
  confirmType?: "checkbox" | "input";
  confirmInputText?: string;
  actionName?: string;
  confirmMessage?: string;
  confirmMessageRequredMessage?: string;
  resourceName?: string;
}

const modalCls = getBaseCls("modal");
const baseCls = getBaseCls("modal-form");
const zsvCls = getBaseCls("zsv-modal-form");

const Action = <T extends Item, S extends Item>({
  className,
  style,
  alertType: _alertType,
  alertMessage: _alertMessage,
  form,
  beforeOnOk,
  onOk,
  onError,
  onCancel,
  children,
  visible,
  setVisible,
  icon,
  iconTooltip,
  title,
  needValidate = false,
  validatePassword,
  beforeValidateModalOpen,
  needResetFields = true,
  controlledVisible = false,
  confirmModalProps = {},
  context,
  needConfirm: _needConfirm = false,
  confirmType: _confirmType = "checkbox",
  confirmInputText,
  actionName,
  confirmMessage,
  confirmMessageRequredMessage,
  resourceName,

  confirmLoading,
  ...rest
}: IProps<T, S>) => {
  const intl = useIntl();
  const [innerForm] = Form.useForm();

  const confirmType = needValidate ? "input" : _confirmType; // needValidate时，需要采用input的方式
  const needConfirm = _needConfirm || needValidate; // zsv中 两者合一

  const contextValue = useMemo(() => {
    const { source = {}, selectedList = [] } = context ?? {};

    return {
      source,
      selectedList,
    };
  }, [context]);

  const validate = useCallback(async () => {
    if (beforeOnOk) {
      await beforeOnOk();
    }
    if (onOk) {
      form
        .validateFields()
        .then(() => {
          const values = form.getFieldsValue();
          // tips：注意setVisible和onOk顺序
          if (!controlledVisible) {
            setVisible(false);
          }
          onOk(values);
          if (needResetFields) form.resetFields();
        })
        .catch((errorInfo) => {
          if (onError) {
            onError(errorInfo);
          } else {
            const path = errorInfo?.errorFields?.[0]?.name;
            if (path) {
              form.scrollToField(path);
            }
          }
        });
    }
  }, [
    beforeOnOk,
    controlledVisible,
    form,
    needResetFields,
    onOk,
    setVisible,
    onError,
  ]);

  const {
    onConfirmOk,
    setValidateModalVisible,
    validateModalVisible,
    username,
  } = useValidatePassword({ validate, validatePassword });

  const { run: validateOnOk } = useDebounceFn(
    async () => {
      await innerForm.validateFields();
      const showValidate =
        typeof needValidate === "function"
          ? needValidate(form.getFieldsValue())
          : needValidate;
      if (showValidate) {
        if (onOk) {
          await beforeValidateModalOpen?.();
          setValidateModalVisible(true);
        }
      } else {
        validate();
      }
    },
    { leading: true, trailing: false, wait: 1000 },
  );

  const alertDom = useMemo(() => {
    const alertTypes = Array.isArray(_alertType) ? _alertType : [_alertType];

    let alertMessages: string[] | React.ReactNode[] = [];

    if (_alertMessage)
      alertMessages = Array.isArray(_alertMessage)
        ? _alertMessage
        : [_alertMessage];

    return (
      alertMessages?.length > 0 && (
        <div className={`${baseCls}-body-alert-container`}>
          {alertMessages?.map(
            (alertMessage, index) =>
              alertMessage &&
              alertTypes[index] && (
                <Alert
                  key={`alert-${alertTypes[index]}-${alertMessage}`}
                  type={alertTypes[index]}
                  message={alertMessage}
                  display="blockStrong"
                />
              ),
          )}
        </div>
      )
    );
  }, [_alertMessage, _alertType]);

  const validateOnCancel = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (onCancel) {
        onCancel(e);
      }
      if (!controlledVisible) {
        setVisible(false);
      }
      if (needResetFields) form.resetFields();
    },
    [controlledVisible, form, needResetFields, onCancel, setVisible],
  );

  const iconTooltipEle = useMemo(() => {
    if (!icon) {
      return;
    }

    const newIcon = (
      <span className={`${modalCls}-title-icon`}>
        <Icon type={icon} />
      </span>
    );

    const tooltipProps = getTooltip(iconTooltip);
    if (tooltipProps && tooltipProps.title && icon) {
      return <InfoPopover content={tooltipProps.title as React.ReactNode} />;
    }

    return newIcon;
  }, [iconTooltip, icon]);

  const modalTitle = useMemo(
    () => (
      <div className="modal-title">
        <div className="action-title">{title}</div>
        {icon ? iconTooltipEle : null}
        {resourceName ? (
          <div className="resource-name">
            <Divider type="vertical" />
            <div className="text">
              <Text value={resourceName} tooltipPlacement="bottom" />
            </div>
          </div>
        ) : null}
      </div>
    ),
    [icon, iconTooltipEle, title, resourceName],
  );

  const footer = useMemo(
    () => (
      <>
        <Button
          id="modal-cancel"
          key="cancel"
          type="text"
          data-testid="action-wrapper-cancel"
          onClick={validateOnCancel}
          disabled={!visible}
        >
          {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
        </Button>
        <Button
          id="modal-ok"
          key="confirm"
          type="primary"
          data-testid="action-wrapper-confirm"
          onClick={validateOnOk}
          disabled={!visible}
          className={confirmType === "input" ? `${zsvCls}-danger-confirm` : ""}
          loading={confirmLoading}
        >
          {confirmType === "input"
            ? intl.formatMessage(
                {
                  id: "modal.action.danger.action.on",
                  defaultMessage: "Confirm {actionName}",
                },
                { actionName },
              )
            : intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
        </Button>
      </>
    ),
    [actionName, confirmType, intl, validateOnCancel, validateOnOk, visible],
  );
  useEffect(() => {
    if (!visible) {
      innerForm.resetFields();
    }
  }, [innerForm, visible]);

  return (
    <ModalFormContext.Provider value={contextValue}>
      <Modal
        className={cls(modalCls, baseCls, className, zsvCls)}
        style={style}
        width={600}
        open={visible}
        onCancel={validateOnCancel}
        onOk={validateOnOk}
        centered
        closeIcon={<Icon type="close" />}
        maskClosable={false}
        title={modalTitle}
        zIndex={1002}
        footer={footer}
        {...rest}
      >
        {alertDom}
        <div className={`${baseCls}-body`}>
          <div>{children}</div>
          {needConfirm && (
            <Form form={innerForm}>
              {confirmType === "checkbox" ? (
                <Form.Item
                  className={`${zsvCls}-formItem`}
                  name="acceptRisk"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            confirmMessageRequredMessage ??
                              intl.formatMessage({
                                id: "pleaseCheckTheRiskWarningFirst",
                                defaultMessage: "Acknowledge the risk.",
                              }),
                          ),
                        );
                      },
                    },
                  ]}
                >
                  <Checkbox>
                    {confirmMessage ??
                      intl.formatMessage({
                        id: "iUnderstand",
                        defaultMessage: "I acknowledge",
                      })}
                  </Checkbox>
                </Form.Item>
              ) : (
                <>
                  {" "}
                  <div className={`${zsvCls}-confirm-danger-action`}>
                    {intl.formatMessage(
                      {
                        id: "action.modal.input.confirm.for.danger.action",
                        defaultMessage:
                          'I acknowledge the above risks. To confirm to {actionName}, type {placeholderContent} here.',
                      },
                      {
                        placeholderContent: <span>{confirmInputText}</span>,
                        actionName,
                      },
                    )}
                  </div>
                  <Form.Item
                    className={`${zsvCls}-formItem`}
                    name="acceptRisk"
                    rules={[
                      {
                        validator: (rule, value) => {
                          if (
                            value?.toLowerCase() ===
                            confirmInputText?.toLowerCase()
                          ) {
                            // 不区分大小写
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(
                              confirmMessageRequredMessage ??
                                intl.formatMessage({
                                  id: "please.input.the.riskWarning.first",
                                  defaultMessage: "Enter the correct text to acknowledge the risk.",
                                }),
                            ),
                          );
                        },
                      },
                    ]}
                  >
                    <Input placeholder={confirmInputText} />
                  </Form.Item>
                </>
              )}
            </Form>
          )}
        </div>
      </Modal>
      <ConfirmModal
        {...confirmModalProps}
        username={username}
        visible={validateModalVisible}
        setVisible={setValidateModalVisible}
        setActionModalVisible={setVisible}
        onOk={onConfirmOk} // 加逻辑校验密码
      />
    </ModalFormContext.Provider>
  );
};

Action.useModalFormContext = useModalFormContext;

export default Action;
