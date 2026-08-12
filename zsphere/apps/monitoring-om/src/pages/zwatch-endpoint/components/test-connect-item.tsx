import { gql, useMutation } from "@apollo/client";
import { Button } from "@zstack/design";
import { Form, Input } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { EndPointType } from "@zstack/zsphere-types";
import type {
  TestConnectSNSEndPointInput,
  TestConnectSNSEndPointOutput,
} from "@zstack/zsphere-types/graphql";
import { isUrl } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd";
import { message } from "antd";
import { debounce } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

type PropsType = {
  form: FormInstance;
  type: EndPointType;
  onChange?: (status: "success" | "failed") => void;
};

const { Item } = Form;

const testConnectSNSEndPoint = gql`
  mutation testConnectSNSEndPoint($input: TestConnectSNSEndPointInput!) {
    testConnectSNSEndPoint(input: $input) {
      success
      error
    }
  }
`;

// 支持测试连接的通知对象
export const supportedTestConnectEndPointType = [
  EndPointType.DingTalk,
  EndPointType.MicrosoftTeams,
  EndPointType.WeCom,
  EndPointType.FeiShu,
  EndPointType.SNMP,
  EndPointType.Email,
];

export const useTestConnectEndPoint = () => {
  const intl = useIntl();
  const [sendTestConnectionMsg] = useMutation<
    {
      testConnectSNSEndPoint: TestConnectSNSEndPointOutput;
    },
    { input: TestConnectSNSEndPointInput }
  >(testConnectSNSEndPoint);

  const sendTestMsgToEndPoint = React.useCallback(
    async (params: TestConnectSNSEndPointInput) => {
      try {
        message.loading(
          intl.formatMessage({
            id: "zwatch.endpoint.send_test_msg.loading",
            defaultMessage: "Send test message ongoing.",
          }),
          0,
        );

        const result = await sendTestConnectionMsg({
          variables: {
            input: params,
          },
        });

        message.destroy();

        if (result.data?.testConnectSNSEndPoint.success) {
          message.success(
            intl.formatMessage({
              id: "zwatch.endpoint.send_test_msg.success",
              defaultMessage: "Send test message succeeded.",
            }),
            3,
          );
        } else {
        }

        return result.data?.testConnectSNSEndPoint;
      } catch {
        message.destroy();
      }
    },
    [intl, sendTestConnectionMsg],
  );

  return { sendTestMsgToEndPoint };
};

export const TestConnectFormItems = ({
  type: endpointType,
  form,
  onChange,
}: PropsType) => {
  const { sendTestMsgToEndPoint } = useTestConnectEndPoint();
  const [showErrorModal, setShowErroeModal] = React.useState(false);
  const intl = useIntl();

  const [testConnectionStatus, setTestConnectionStatus] = React.useState<
    "ready" | "disabled" | "failed"
  >("disabled");

  const rootFieldName = `add${endpointType}`;

  const handleTestConnect = debounce(async () => {
    const values = form.getFieldValue(rootFieldName);
    const params: TestConnectSNSEndPointInput = {
      endpointType,
      testMsg: intl.formatMessage({
        id: "zwatch.endpoint.alarm_test_msg",
        defaultMessage: "Alarm message test.",
      }),
      url: values.url,
    };

    if ([EndPointType.DingTalk, EndPointType.FeiShu].includes(endpointType)) {
      params.secret = values.secret;
    }

    setTestConnectionStatus("disabled");

    try {
      const result = await sendTestMsgToEndPoint(params);
      if (!result || !result?.success) {
        setShowErroeModal(true);
      }

      setTestConnectionStatus(result?.success ? "ready" : "failed");
      onChange?.(result?.success ? "success" : "failed");
    } catch {
      setTestConnectionStatus("failed");
      onChange?.("failed");
    }
  }, 250);

  return (
    <>
      <Item
        name={[rootFieldName, "url"]}
        label={intl.formatMessage({
          id: "address",
          defaultMessage: "Address",
        })}
        required
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zwatch.endpoint.webhook_url_tip",
              defaultMessage: `### Address
Enter the Webhook address generated on the endpoint platform.`,
            })}
          </ReactMarkdown>
        }
        rules={[
          {
            validator(rule, value: string) {
              if (!value) {
                return Promise.reject(
                  intl.formatMessage({
                    id: "zwatchEndpoint.field.address.validator.required",
                    defaultMessage: "This field is required.",
                  }),
                );
              }
              if (!isUrl(value)) {
                return Promise.reject(
                  intl.formatMessage({
                    id: "zwatchEndpoint.field.address.validator.format",
                    defaultMessage: "Invalid address.",
                  }),
                );
              }
              setTestConnectionStatus(value ? "ready" : "disabled");
              return Promise.resolve();
            },
          },
        ]}
      >
        <div className="flex items-center">
          <Input className={style["width-400"]} />
          <Button
            size="sm"
            variant="link"
            disabled={testConnectionStatus === "disabled"}
            onClick={handleTestConnect}
          >
            {intl.formatMessage({
              id: "send.testMsg",
              defaultMessage: "Send Test Message",
            })}
          </Button>
        </div>
      </Item>
      <DialogBase
        title={intl.formatMessage({
          id: "zwatch.endpoint.send_test_msg.failed_modal_title",
          defaultMessage: "Sending test message failed.",
        })}
        visible={showErrorModal}
        setVisible={setShowErroeModal}
        footer={
          <Button
            key="submit"
            variant="primary"
            onClick={() => setShowErroeModal(false)}
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        }
      >
        {intl.formatMessage({
          id: "zwatch.endpoint.send_test_msg.failed_modal_content",
          defaultMessage: "Failed to send the test message. Check your configurations and try again.",
        })}
      </DialogBase>
    </>
  );
};
