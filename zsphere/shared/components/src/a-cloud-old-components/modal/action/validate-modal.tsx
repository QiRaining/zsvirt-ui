import { Icon, type IconTypes } from "@zstack/icon";
import { Modal } from "antd";
import { ModalProps } from "antd/es/modal";
import cls from "classnames";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../../_utils/common";
import Input from "../../../input";
import Alert from "../../alert";
import Form from "../../form";

import "./style.less";

interface IValues {
  [name: string]: any;
}

export interface IProps extends ModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  alertType?: "error" | "info" | "warning";
  alertMessage?: string | React.ReactNode;
  children?: React.ReactChild;
  onOk?: (values: IValues) => void;
  onValidate?: (values: IValues) => void;
  setActionModalVisible?: (visible: boolean) => void;
  icon?: IconTypes;
  username?: string;
  iconTooltip?: React.ReactChild;
}

const modalCls = getBaseCls("modal");
const baseCls = getBaseCls("modal-form");

const cancelButtonProps = { type: "text" as const };

const Action: React.FC<IProps> = ({
  className,
  style,
  alertType,
  alertMessage,
  onOk,
  onCancel,
  children,
  visible,
  setVisible,
  setActionModalVisible,
  icon,
  iconTooltip,
  username,
  title,
  ...rest
}) => {
  const intl = useIntl();
  const [passwordValidateResult, setPasswordValidateResult] = useState<
    "" | "error" | "warning" | "validating"
  >("");
  const [passwordValidateError, setPasswordValidateError] = useState("");

  const [form] = Form.useForm();

  const validatePasswordHandler = (errorInfo?: any) => {
    if (errorInfo) {
      setPasswordValidateResult("error");
      setPasswordValidateError(errorInfo);
    }
  };

  const passwordValidate = () => {
    setPasswordValidateResult("");
    setPasswordValidateError("");
    if (!form.getFieldValue("password")) {
      validatePasswordHandler(
        intl.formatMessage({
          id: "pleaseInputPassword",
          defaultMessage: "Enter Password",
        }),
      );
    }
  };

  const validateOnOk = async () => {
    if (onOk) {
      try {
        const values = form.getFieldsValue();
        // tips：注意setVisible和onOk顺序

        // setActionModalVisible(false)
        await onOk(values);
        form.resetFields();
      } catch (errorInfo) {
        validatePasswordHandler(errorInfo);
      }
    }
  };

  const validateOnCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (onCancel) {
      onCancel(e);
    }
    form.resetFields();
    setVisible(false);
  };

  return (
    <Modal
      className={cls(modalCls, baseCls, className)}
      style={style}
      width={600}
      open={visible}
      onCancel={validateOnCancel}
      onOk={validateOnOk}
      centered
      closeIcon={<Icon type="close" />}
      cancelButtonProps={cancelButtonProps}
      maskClosable={false}
      title={
        title ||
        intl.formatMessage({
          id: "verify.identidy",
          defaultMessage: "Identity Verification",
        })
      }
      zIndex={1003}
      {...rest}
    >
      <Alert
        className={`${baseCls}-alert`}
        type={alertType || "info"}
        message={
          alertMessage ||
          intl.formatMessage({
            id: "modal.verify.identidy.alert.info",
            defaultMessage:
              "To ensure the security of the platform resources, enter the login password to proceed.",
          })
        }
        display="strong"
      />
      <div className={`${baseCls}-body`}>
        <Form form={form}>
          <Form.Item
            style={{ marginTop: "-5px" }}
            label={intl.formatMessage({
              id: "username",
              defaultMessage: "Username",
            })}
          >
            {username}
          </Form.Item>
          <Form.Item
            name="password"
            style={{ marginBottom: "-4px" }}
            label={intl.formatMessage({
              id: "password",
              defaultMessage: "Password",
            })}
            validateStatus={passwordValidateResult}
            help={passwordValidateError}
          >
            <Input.Password style={{ width: 320 }} onBlur={passwordValidate} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default Action;
