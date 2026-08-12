import { gql } from "@apollo/client";
import { DialogP0 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { UplinkGroup } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const detachL2NetworkFromHost = gql`
  mutation detachL2NetworkFromHost($input: DetachL2NetworkFromHostInput!) {
    detachL2NetworkFromHost(input: $input) {
      actionId
    }
  }
`;

const RemoveNicFromBond: React.FC<IActionWrapperProps<UplinkGroup>> = ({
  refetch,
  visible,
  selectedList,
  source,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const current = selectedList?.[0];

  const onOk = async () => {
    const payload = [
      {
        hostUuid: current?.hostUuid,
        l2NetworkUuid: source?.uuid,
      },
    ];

    doAction({
      mutation: detachL2NetworkFromHost,
      payload,
      name: intl.formatMessage({
        id: "remove.host",
        defaultMessage: "Remove Host",
      }),
      total: selectedList.length,
      type: "Bond",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP0
      title={intl.formatMessage({
        id: "confirm.remove.host",
        defaultMessage: "Disconnect Host Uplink?",
      })}
      visible={visible}
      setVisible={setVisible}
      bannerMessage={intl.formatMessage({
        id: "bond.modal.title.confirm.remove.host.alertMessage.error",
        defaultMessage:
          "1. Disconnecting the host uplink will also delete the associated bond on this host. Proceed with caution.\n2. Disconnecting the host uplink will detach the NICs of all VMs on this host. Proceed with caution.",
      })}
      onConfirm={onOk}
      resourceNames={selectedList.map((r) => r.name ?? r.uuid)}
      resourceType={intl.formatMessage({ id: "host", defaultMessage: "Host" })}
    />
  );
};

export default RemoveNicFromBond;
