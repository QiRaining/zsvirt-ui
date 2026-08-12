import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  Bond as IBond,
  PhysicalNic as IPhysicalNic,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const removeNic = gql`
  mutation removeNic($input: RemoveNicInput!) {
    removeNic(input: $input) {
      actionId
    }
  }
`;

const RemoveNicFromBond: React.FC<IActionWrapperProps<IBond>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    const uuid = source?.uuid;
    const mode = source?.mode;
    const xmitHashPolicy = source?.xmitHashPolicy;
    const slave = source?.slaves?.filter((item: IPhysicalNic) =>
      selectedList?.every((val: IPhysicalNic) => val.uuid !== item.uuid),
    );
    const slaveUuids = slave?.map((item: { uuid: any }) => item.uuid);

    const payload = source?.mode?.includes("active-backup")
      ? { uuid, slaveUuids, mode }
      : { uuid, slaveUuids, mode, xmitHashPolicy };

    doAction({
      mutation: removeNic,
      payload,
      name: intl.formatMessage({
        id: "remove.physicalNic",
        defaultMessage: "Remove Physical Port",
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
    <>
      <DialogP3
        title={intl.formatMessage({
          id: "confirm.remove.phsical.nic",
          defaultMessage: "Remove Physical Port?",
        })}
        visible={visible}
        setVisible={setVisible}
        bannerMessage={intl.formatMessage({
          id: "bond.modal.title.confirm.remove.nic.alertMessage.error",
          defaultMessage:
            "Removing a physical port from a bond may cause temporary network disruption on that bond. Proceed with caution.",
        })}
        onConfirm={onOk}
        resourceNames={(selectedList as any[]).map(
          (r) => r.interfaceName ?? r.name ?? r.uuid,
        )}
        resourceType={intl.formatMessage({
          id: "physical.network.port",
          defaultMessage: "Physical Port",
        })}
      />
    </>
  );
};

export default RemoveNicFromBond;
