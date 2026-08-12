import { gql } from "@apollo/client";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { objToUrl, Encrypt } from "@zstack/zsphere-utils";
import { Input, type ModalProps, Spin } from "antd";
import React, {
  type SetStateAction,
  useState,
  type Dispatch,
  type FC,
  useRef,
} from "react";
import { useIntl } from "react-intl";

import Form from "../a-cloud-old-components/form";

import "./style.less";

const HostWebTerminalUrl = gql`
  query HostWebTerminalUrl(
    $uuid: String!
    $username: String!
    $password: String!
    $https: Boolean!
  ) {
    getHostWebTerminalUrl(
      uuid: $uuid
      username: $username
      password: $password
      https: $https
    ) {
      url
    }
  }
`;

const Extra = () => {
  const intl = useIntl() as any;
  return (
    <div className="extra">
      {intl.formatMessage({
        id: "host.web.terminal.confirm.failed",
        defaultMessage: "Wrong username or password. Try again.",
      })}
    </div>
  );
};

interface IProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  host: any;
  getContainer?: ModalProps["getContainer"];
}

export const WebTerminalConfirmModal: FC<IProps> = ({
  visible,
  setVisible,
  host,
  ...restProps
}) => {
  const intl = useIntl() as any;
  const [form] = Form.useForm();
  const [validateFailed, setValidateFailed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);

  const setProcessingState = (nextProcessing: boolean) => {
    processingRef.current = nextProcessing;
    setProcessing(nextProcessing);
  };

  const closeModal = () => {
    if (processingRef.current) {
      return;
    }
    setValidateFailed(false);
    (form as any).resetFields?.();
    setVisible(false);
    setProcessingState(false);
  };

  const handleVisibleChange = (nextVisible: boolean) => {
    if (nextVisible) {
      setVisible(true);
      return;
    }
    closeModal();
  };

  const onOk = async () => {
    setProcessingState(true);
    const { apolloClient } = window.g_main;
    try {
      const res: { data: { getHostWebTerminalUrl: { url: string } } } =
        await apolloClient.query({
          query: HostWebTerminalUrl,
          variables: {
            uuid: host.uuid,
            username: (form as any).getFieldValue("username"),
            password: Encrypt((form as any).getFieldValue("password")),
            https: window.location.protocol === "https:",
          },
        });
      const url = res?.data?.getHostWebTerminalUrl?.url;
      if (!url) {
        setValidateFailed(true);
        throw new Error("Host web terminal URL is empty");
      }

      setValidateFailed(false);
      const id = url.split("id=")[1] as string;
      // DialogForm closes after onOk resolves. Delay opening the web terminal so
      // users do not see the closing animation when returning to this tab.
      setTimeout(() => {
        objToUrl({
          baseUrl: window.location.origin,
          paths: ["web-ssh/web-ssh"],
          querys: {
            sn: host?.hostSystemInfo?.systemSerialNumber ?? "-",
            uuid: host.uuid,
            ip: host?.managementIp ?? "-",
            title: host?.name ?? "-",
            wsId: id,
            wsPort: new URL(url).port,
          },
          openBrowser: true,
        });
      }, 500);
    } catch (error) {
      if (
        !(error instanceof Error) ||
        error.message !== "Host web terminal URL is empty"
      ) {
        setValidateFailed(false);
      }
      throw error;
    } finally {
      setProcessingState(false);
    }
  };

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={handleVisibleChange}
      onOk={onOk}
      confirmLoading={processing}
      title={intl.formatMessage({
        id: "enter.web.terminal",
        defaultMessage: "Enter Web Terminal",
      })}
      alertType="info"
      alertMessage={intl.formatMessage({
        id: "host.web.terminal.confirm.info",
        defaultMessage: "To ensure resource security, enter the host username and password to continue this operation.",
      })}
      {...restProps}
    >
      <Spin indicator={<div />} spinning={processing}>
        <Form form={form}>
          <Form.Item
            name="username"
            label={intl.formatMessage({
              id: "username",
              defaultMessage: "Username",
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "host.web.terminal.confirm.field.username",
                  defaultMessage: "Enter the username.",
                }),
              },
            ]}
          >
            <Input className="width-320" />
          </Form.Item>
          <Form.Item
            name="password"
            label={intl.formatMessage({
              id: "password",
              defaultMessage: "Password",
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "host.web.terminal.confirm.field.password",
                  defaultMessage: "Enter the password.",
                }),
              },
            ]}
            extra={validateFailed && <Extra />}
          >
            <Input.Password
              className="width-320"
              onChange={() => {
                setValidateFailed(false);
              }}
            />
          </Form.Item>
        </Form>
      </Spin>
    </DialogForm>
  );
};
