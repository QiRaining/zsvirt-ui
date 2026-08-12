import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { EndPointType } from "@zstack/zsphere-types";
import type {
  WeComEndPoint,
  FeiShuEndPoint,
  MicrosoftTeamsEndPoint,
  DingTalkEndPoint,
  EmailEndPoint,
  TestConnectSNSEndPointInput,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { useTestConnectEndPoint } from "../components";

const snsSnmpTestConnection = gql`
  mutation snsSnmpTestConnection($input: SNSSnmpTestConnectionInput!) {
    snsSnmpTestConnection(input: $input) {
      actionId
    }
  }
`;

const snsEmailTestConnection = gql`
  mutation snsEmailTestConnection($input: SNSEmailTestConnectionInput!) {
    snsEmailTestConnection(input: $input) {
      actionId
    }
  }
`;

const SendTestMsgAction: React.FC<
  IActionWrapperProps<
    | WeComEndPoint
    | FeiShuEndPoint
    | DingTalkEndPoint
    | MicrosoftTeamsEndPoint
    | EmailEndPoint
  >
> = ({ visible, setVisible, selectedList }) => {
  const intl = useIntl();
  const doAction = useAction();
  const [showErrorModal, setShowErroeModal] = React.useState(false);
  const { sendTestMsgToEndPoint } = useTestConnectEndPoint();

  const onOk = async () => {
    if (!selectedList || selectedList.length === 0) {
      throw new Error("selectedList 为空，数据有误，请检查");
    }

    const current = selectedList[0];

    // 邮件类型
    if (current.type === EndPointType.Email) {
      const emailEndpoint = current as EmailEndPoint;
      doAction({
        mutation: snsEmailTestConnection,
        payload: {
          platformUuid: emailEndpoint.platformUuid,
          emails: emailEndpoint.emailAddresses?.map(
            (item) => item.emailAddress,
          ),
        },
        name: intl.formatMessage({
          id: "zwatchEndpoint.test.emailServer",
          defaultMessage: "Test Email Server",
        }),
        total: 1,
      });
      return;
    }

    if (current.type === EndPointType.SNMP) {
      doAction({
        mutation: snsSnmpTestConnection,
        payload: { endpointUuid: current.uuid },
        name: intl.formatMessage({
          id: "zwatchEndpoint.test.snmpTrap",
          defaultMessage: "Test SNMP Trap Receiver",
        }),
        total: 1,
      });
      return;
    }

    const payload: TestConnectSNSEndPointInput[] = selectedList.map((item) => {
      const res: TestConnectSNSEndPointInput = {
        endpointType: item.type!,
        testMsg: intl.formatMessage({
          id: "zwatch.endpoint.alarm_test_msg",
          defaultMessage: "Alarm message test.",
        }),
        url: item.url,
      };

      if ((item as DingTalkEndPoint).secret) {
        res.secret = (item as DingTalkEndPoint).secret;
      }

      if (item.type === EndPointType.SNMP) {
        res.endpointUuid = item?.uuid;
      }

      return res;
    });

    const result = await sendTestMsgToEndPoint(payload[0]);
    if (!result || !result?.success) {
      setShowErroeModal(true);
    }
  };

  return (
    <>
      <DialogP3
        title={intl.formatMessage({
          id: "zwatch.endpoint.modal_title.confirm.send_test_msg",
          defaultMessage: "Send Test Message?",
        })}
        resourceNames={(selectedList || []).map(
          (item) => item.name ?? item.uuid,
        )}
        visible={visible}
        setVisible={setVisible}
        onConfirm={onOk}
      />
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

export default SendTestMsgAction;
