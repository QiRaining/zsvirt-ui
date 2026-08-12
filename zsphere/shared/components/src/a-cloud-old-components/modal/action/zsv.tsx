import { Icon } from "@zstack/icon";
import { Button, Checkbox, Divider, Modal } from "antd";
import cls from "classnames";
import { produce } from "immer";
import { get as _get } from "lodash-es";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { ICheckedMap, IProps, IResource } from ".";
import { getBaseCls } from "../../../_utils/common";
import Input from "../../../input";
import Alert from "../../alert";
import Form from "../../form";

import "./style.less";
import Text from "../../text";

const modalCls = getBaseCls("modal");
const baseCls = getBaseCls("modal-zsv-action");

const ZsvAction: React.FC<IProps> = ({
  className,
  style,
  name,
  itemName,
  getItemName,
  alertType: _alertType,
  alertMessage: _alertMessage,
  resourceName,
  linkedResourceName,
  resourceList,
  attachAction,
  linkedResourceMessage,
  needConfirm: _needConfirm = false,
  confirmMessage,
  confirmMessageRequredMessage,
  confirmType: _confirmType = "checkbox",
  confirmInputText,
  actionName,
  visible,
  setVisible,
  onOk,
  onOkText,
  onCancel,
  children,
  title,
  selectMessage,
  needValidate = false,
  customResourceList = null,
  hideCancelButton = false,
  validatePassword,
  controlledVisible = false,
  confirmModalProps = {},
  ...rest
}) => {
  const intl = useIntl();

  const alertTypes = Array.isArray(_alertType) ? _alertType : [_alertType];

  const confirmType = needValidate ? "input" : _confirmType; // needValidate时，需要采用input的方式

  const needConfirm = _needConfirm || needValidate; // zsv中 两者合一
  const [onOkButtonDisable, setOnOkButtonDisable] = useState<boolean>(
    needConfirm as boolean,
  );

  let alertMessages: string[] | React.ReactNode[] = [];

  if (_alertMessage)
    alertMessages = Array.isArray(_alertMessage)
      ? _alertMessage
      : [_alertMessage];

  let initChecked = false;
  let initCheckedMap: ICheckedMap = {};

  if (Array.isArray(attachAction)) {
    initCheckedMap = attachAction.reduce<ICheckedMap>((pv, cv) => {
      const { key, checked } = cv;
      if (key) {
        pv[key] = checked || false;
      }
      return pv;
    }, {});
  } else {
    initChecked = attachAction?.checked || false;
  }
  const [form] = Form.useForm();

  const [checked, setChecked] = useState<boolean>(initChecked);
  const [checkedMap, setCheckedMap] = useState<ICheckedMap>(initCheckedMap);

  useEffect(() => {
    if (visible) {
      setOnOkButtonDisable(needConfirm as boolean);
    } else if (!visible) {
      setOnOkButtonDisable(false);
    }
  }, [visible, needConfirm]);

  const validate = async () => {
    if (onOk) {
      if (needConfirm) {
        await form.validateFields();
      }

      if (!controlledVisible) {
        setVisible(false);
      }

      if (Array.isArray(attachAction)) {
        onOk(checkedMap);
        attachAction.forEach((action) => {
          if (checkedMap[action.key]) {
            action?.callback?.();
          }
        });
      } else {
        onOk(checked);
        if (checked) {
          attachAction?.callback?.();
        }
      }

      if (needConfirm) {
        form.resetFields();
      }
    } else if (!controlledVisible) {
      setVisible(false);
    }

    setChecked(initChecked);
    setCheckedMap(initCheckedMap);
  };

  // const {
  //   setValidateModalVisible,
  //   validateModalVisible,
  //   username,
  //   onConfirmOk,
  // } = useValidatePassword({ validate, validatePassword })

  const validateOnOk = async () => {
    setOnOkButtonDisable(true);

    const showValidate =
      typeof needValidate === "function"
        ? await needValidate?.(
            Array.isArray(attachAction) ? checkedMap : checked,
          )
        : needConfirm;
    if (showValidate) {
      if (onOk) {
        await form.validateFields();
        await validate();
        // setValidateModalVisible(true)
      }
    } else {
      await validate();
    }
  };

  const validateOnCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setChecked(initChecked);
    setCheckedMap(initCheckedMap);
    setOnOkButtonDisable(false);
    if (!controlledVisible) {
      setVisible(false);
    }
    if (needConfirm) {
      form.resetFields();
    }
    if (onCancel) {
      onCancel(e);
    }
  };

  const attachActionEl = useMemo(() => {
    if (Array.isArray(attachAction)) {
      return (
        <div>
          {attachAction.map((cv) => (
            <div className={`${baseCls}-attachAction`} key={cv.key}>
              <Checkbox
                checked={checkedMap[cv.key]}
                disabled={cv.disabled}
                onChange={(e) => {
                  const newCheckedMap = produce(checkedMap, (draft) => {
                    draft[cv.key] = e.target.checked;
                  });
                  setCheckedMap(newCheckedMap);
                  cv?.onChange?.(e.target.checked, newCheckedMap);
                }}
              >
                {cv.name}
              </Checkbox>
              {cv.tip && (
                <div className={`${baseCls}-attachAction-tooltip`}>
                  {cv.tip}
                </div>
              )}
            </div>
          ))}
          {needConfirm && (
            <Divider className={`${baseCls}-attachAction-divider`} />
          )}
        </div>
      );
    }
    return (
      <div>
        <div className={`${baseCls}-attachAction`}>
          <Checkbox
            checked={checked}
            disabled={attachAction?.disabled}
            onChange={(e) => {
              setChecked(e.target.checked);
              attachAction?.onChange?.(e.target.checked);
            }}
          >
            {attachAction?.name}
          </Checkbox>
          {attachAction?.tip && (
            <div className={`${baseCls}-attachAction-tooltip`}>
              {attachAction?.tip}
            </div>
          )}
        </div>
        {needConfirm && (
          <Divider className={`${baseCls}-attachAction-divider`} />
        )}
      </div>
    );
  }, [attachAction, needConfirm, checked, checkedMap]);

  const _getItemName = useCallback(
    (item: any) => {
      if (itemName) return _get(item, itemName);
      if (getItemName) return getItemName(item);
      return item?.name;
    },
    [itemName, getItemName],
  );

  return (
    <>
      <Modal
        className={cls(modalCls, baseCls, className)}
        style={style}
        width={600}
        title={title}
        open={visible}
        destroyOnClose
        onCancel={validateOnCancel}
        onOk={validateOnOk}
        centered
        closeIcon={<Icon type="close" />}
        maskClosable={false}
        footer={[
          !hideCancelButton && (
            <Button
              key="cancel"
              type="text"
              data-testid="action-wrapper-cancel"
              onClick={validateOnCancel}
              disabled={!visible}
            >
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
          ),
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
          </Button>,
        ]}
        zIndex={1002}
        {...rest}
      >
        <div className={`${baseCls}-body`}>
          {alertMessages?.length > 0 && (
            <div className={`${baseCls}-body-alert-container`}>
              {alertMessages?.map(
                (alertMessage, index) =>
                  alertMessage &&
                  alertTypes[index] && (
                    <Alert
                      type={alertTypes[index]}
                      message={alertMessage}
                      display="blockStrong"
                    />
                  ),
              )}
            </div>
          )}

          {customResourceList ?? (
            <>
              <div className={`${baseCls}-select`}>
                {selectMessage ??
                  intl.formatMessage(
                    {
                      id: "selectedCount.x",
                      defaultMessage: "Items: {total}",
                    },
                    {
                      total: (
                        <span className={`${baseCls}-select-total`}>
                          {resourceList.length}
                        </span>
                      ),
                    },
                  )}
              </div>
              <div
                className={`${baseCls}-resource`}
                style={{
                  marginBottom:
                    attachAction || linkedResourceMessage || needConfirm
                      ? "12px" //
                      : 0,
                }}
              >
                {resourceList.map((item: IResource) => (
                  <span className={`${baseCls}-item`} key={item?.uuid}>
                    <Text value={_getItemName(item)} />
                  </span>
                ))}
              </div>
            </>
          )}
          {attachAction && attachActionEl}
          <div className={`${baseCls}-confirm`}>
            {linkedResourceMessage && (
              <span className={`${baseCls}-confirm-linkedResource`}>
                {intl.formatMessage(
                  {
                    id: "associatedCount.x.and.xx",
                    defaultMessage:
                      "Affected resources: {linkedResourceMessage}",
                  },
                  {
                    linkedResourceMessage:
                      typeof linkedResourceMessage === "string"
                        ? linkedResourceMessage
                            ?.replace(/\s*/g, "")
                            ?.split(/(\d+)/)
                            ?.map((it) => {
                              if (/(\d)/.test(it)) {
                                return (
                                  <span
                                    className={`${baseCls}-confirm-linkedResource-count`}
                                  >
                                    {it}
                                  </span>
                                );
                              }
                              return it;
                            })
                        : linkedResourceMessage,
                    resourceName: linkedResourceName || resourceName,
                  },
                )}
              </span>
            )}
            {needConfirm && (
              <Form form={form}>
                {confirmType === "checkbox" ? (
                  <Form.Item
                    className={`${baseCls}-formItem`}
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
          {children}
        </div>
      </Modal>
    </>
  );
};

export default ZsvAction;
