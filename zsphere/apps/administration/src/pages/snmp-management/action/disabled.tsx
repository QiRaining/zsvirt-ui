import { gql } from "@apollo/client";
import { DialogWeakP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { SnmpAgent } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const StopAction: React.FC<IActionWrapperProps<SnmpAgent>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const current = selectedList?.[0] || {};

  const stopSnmpAgent = gql`
    mutation stopSnmpAgent($input: StopSnmpAgentInput!) {
      stopSnmpAgent(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async () => {
    doAction({
      mutation: stopSnmpAgent,
      payload: { uuid: current?.uuid },
      name: intl.formatMessage({
        id: "stop.snmp.management",
        defaultMessage: "Disable SNMP Management",
      }),
      total: 1,
      type: "SnmpAgent",
    });
  };

  return (
    <DialogWeakP1
      type="warning"
      title={intl.formatMessage({
        id: "snmp.management.modal.title.confirm.stop",
        defaultMessage: "Disable SNMP Management？",
      })}
      visible={visible}
      setVisible={setVisible}
      onConfirm={() => {
        onOk();
      }}
      description={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "snmp.management.modal.title.confirm.stop.message",
            defaultMessage: `1. The 3rd-party platform will no longer be able to access resource monitoring data.
2. The platform will continue to push alarm messages to the SNMP trap receivers added as alarm endpoints.
3. The current SNMP configuration will be retained for easy reactivation in the future.`,
          })}
        </ReactMarkdown>
      }
    />
  );
};

export default StopAction;
