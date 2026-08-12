import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  SnmpTrapReceiver,
  DeleteSnmpTrapReceiverPayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const DeleteAction: React.FC<IActionWrapperProps<SnmpTrapReceiver>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const deleteSnmpTrapReceiver = gql`
    mutation deleteSnmpTrapReceiver($input: DeleteSnmpTrapReceiverInput!) {
      deleteSnmpTrapReceiver(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async () => {
    const payload: DeleteSnmpTrapReceiverPayload[] =
      selectedList?.map((item) => {
        return { uuid: item.uuid };
      }) || [];
    doAction({
      mutation: deleteSnmpTrapReceiver,
      payload,
      name: intl.formatMessage({
        id: "delete.snmp.trap",
        defaultMessage: "Delete SNMP Trap Receiver",
      }),
      total: payload.length,
      type: "SnmpTrap",
    });
  };

  return (
    <DialogP3
      bannerMessage={intl.formatMessage({
        id: "snmp.trap.modal.delete.alertMessage",
        defaultMessage:
          "Deleting an SNMP trap receiver deletes the related alarm endpoint synchronously. Please exercise caution.",
      })}
      title={intl.formatMessage({
        id: "snmp.trap.modal.title.confirm.delete",
        defaultMessage: "Delete SNMP Trap Receiver?",
      })}
      resourceType={intl.formatMessage({
        id: "snmp.trap",
        defaultMessage: "SNMP Trap Receiver",
      })}
      resourceNames={(selectedList || []).map(
        (item) => (item as any).snmpAddress ?? item.name ?? item.uuid,
      )}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default DeleteAction;
