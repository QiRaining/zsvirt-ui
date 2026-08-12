import { Button, Checkbox, Form, Input, Modal, Tooltip } from "antd";
import cls from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../../_utils/common";
import Alert from "../../alert";

import "./style.less";
import { IConfirmModalProps } from "./types";

const modalCls = getBaseCls("modal");
const baseCls = getBaseCls("zsv-modal-confirm");

const cancelButtonProps = { type: "text" as const };

const Confirm: React.FC<IConfirmModalProps> = ({
  className,
  style,
  alertType,
  alertMessage,
  children,
  visible,
  onOk,
  onOkText,
  cancelable = true,
  needValidate = false, // 传值代表需要输入验证
  needConfirm: _needConfirm = false,
  confirmType: _confirmType = "checkbox",
  confirmInputText, // 传值时的自定义输入文本
  actionName, // 传值时的自定义按钮文本
  confirmMessage,
  confirmMessageRequredMessage,
  setVisible,
  tipsTitle,
  ...rest
}) => {
  const confirmType = needValidate ? "input" : _confirmType; // needValidate时，需要采用input的方式
  const needConfirm = _needConfirm || needValidate; // zsv中 两者合一
  const [onOkButtonDisable, setOnOkButtonDisable] = useState<boolean>(
    needConfirm as boolean,
  );
  const intl = useIntl();
  const [form] = Form.useForm();
  const [checked, setChecked] = useState<boolean>(false);
  useEffect(() => {
    if (visible) {
      // 如果需要确认或者校验，则按钮应该禁用
      setOnOkButtonDisable(needConfirm);
    } else {
      // 当弹窗关闭时，按钮恢复默认状态
      setOnOkButtonDisable(false);
    }
  }, [visible, needConfirm]);

  const cancelIntlText = useMemo(
    () => intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" }),
    [intl],
  );

  const validate = async () => {
    if (onOk) {
      if (needConfirm) {
        await form.validateFields();
      }
      setVisible(false);

      onOk();

      if (needConfirm) {
        form.resetFields();
      }
    }
    setChecked(false);
    setVisible(false);
  };

  const validateOnOk = async () => {
    await validate();
    setOnOkButtonDisable(true);
  };

  const validateOnCancel = (e: React.MouseEvent<HTMLElement>) => {
    setChecked(false);
    setVisible(false);
    setOnOkButtonDisable(false);
    rest?.onCancel?.(e);
    if (needConfirm) {
      form.resetFields();
    }
  };

  return (
    <Modal
      className={cls(
        modalCls,
        baseCls,
        className,
        !cancelable && `${baseCls}-not-cancelable`,
      )}
      style={style}
      width={400}
      open={visible}
      onCancel={validateOnCancel}
      onOk={validateOnOk}
      centered
      closable={false}
      cancelButtonProps={cancelButtonProps}
      maskClosable={false}
      footer={[
        <Button
          key="cancel"
          type="text"
          data-testid="action-wrapper-cancel"
          onClick={validateOnCancel}
          disabled={!visible}
        >
          {cancelIntlText}
        </Button>,
        <Tooltip
          title={
            needValidate === false && needConfirm && !checked
              ? (tipsTitle ??
                intl.formatMessage({
                  id: "please.check.acceptRisk",
                  defaultMessage: "Acknowledge the risk.",
                }))
              : ""
          }
        >
          <Button
            key="confirm"
            type="primary"
            data-testid="action-wrapper-confirm"
            onClick={validateOnOk}
            disabled={!visible || onOkButtonDisable}
            className={
              confirmType === "input" ? `${baseCls}-danger-confirm` : ""
            }
          >
            {onOkText ??
              (confirmType === "input"
                ? intl.formatMessage(
                    {
                      id: "modal.action.danger.action.on",
                      defaultMessage: "Confirm {actionName}",
                    },
                    { actionName },
                  )
                : intl.formatMessage({ id: "ok", defaultMessage: "OK" }))}
          </Button>
        </Tooltip>,
      ]}
      zIndex={1002}
      {...rest}
    >
      <div className={`${baseCls}-container`}>
        {alertMessage && (
          <Alert
            type={alertType}
            className={`${baseCls}-alert`}
            message={alertMessage}
            display="weak"
          />
        )}
        {children && (
          <div className={`${baseCls}-body`}>
            {children}
            {needConfirm && (
              <Form form={form} style={{ marginTop: 12 }}>
                {confirmType === "checkbox" ? (
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name="acceptRisk"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (rule, value) => {
                          if (value) {
                            setOnOkButtonDisable(false);
                            return Promise.resolve();
                          }
                          setOnOkButtonDisable(true);
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
                    <Checkbox
                      checked={checked}
                      onChange={(e) => {
                        setChecked(e.target.checked);
                      }}
                    >
                      {confirmMessage ??
                        intl.formatMessage({
                          id: "iUnderstand",
                          defaultMessage: "I acknowledge",
                        })}
                    </Checkbox>
                  </Form.Item>
                ) : (
                  <>
                    <div className={`${baseCls}-confirm-danger-action`}>
                      {intl.formatMessage(
                        {
                          id: "action.modal.input.confirm.for.danger.action",
                          defaultMessage:
                            "I acknowledge the above risks. To confirm to {actionName}, type {placeholderContent} here.",
                        },
                        {
                          placeholderContent: <span>{confirmInputText}</span>,
                          actionName,
                        },
                      )}
                    </div>
                    <Form.Item
                      className={`${baseCls}-formItem`}
                      name="acceptRisk"
                      rules={[
                        {
                          validator: (rule, value) => {
                            if (
                              value?.toLowerCase() ===
                              confirmInputText?.toLowerCase()
                            ) {
                              // 不区分大小写
                              setOnOkButtonDisable(false);
                              return Promise.resolve();
                            }
                            setOnOkButtonDisable(true);
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
                      <Input
                        placeholder={confirmInputText}
                        className={`${baseCls}-confirm-delete-input`}
                        onPaste={(e) => {
                          e.preventDefault();
                        }}
                      />
                    </Form.Item>
                  </>
                )}
              </Form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default Confirm;
