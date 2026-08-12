import { gql } from "@apollo/client";
import PhysicalNicList from "@zstack/virtualization-resource/src/pages/physical-nic/list";
import { ModalSelect, Title } from "@zstack/zsphere-components";
import { DialogP0 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  UplinkGroup,
  PhysicalNic as IPhysicalNic,
} from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React, { useState, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

const updateVirtualSwitchUplinkGroup = gql`
  mutation updateVirtualSwitchUplinkGroup(
    $input: UpdateVirtualSwitchUplinkGroupActionInput!
  ) {
    updateVirtualSwitchUplinkGroup(input: $input) {
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
  const [value, onChange] = useState<IPhysicalNic[]>([]);
  const current = selectedList?.[0];

  const currentSlaves: string[] = current?.physicalNic?.uuid
    ? ([current?.physicalNic.uuid] as string[])
    : (current?.bond?.slaves?.map((it: any) => it.uuid) as string[]);

  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      onChange([]);
    }
  }, [visible]);

  const defaultQuery: IQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "uuid",
          op: Op.in,
          values: currentSlaves,
        },
        {
          key: "hostUuid",
          op: Op.eq,
          value: current?.hostUuid,
        },
      ],
      sortBy: "interfaceName",
    }),
    [currentSlaves, current],
  );

  const onOk = async () => {
    const selectedSlaveUuids = value?.map((it) => it.uuid);

    doAction({
      mutation: updateVirtualSwitchUplinkGroup,
      payload: {
        uuid: source?.uuid,
        hostUuid: current.hostUuid,
        slaveUuids: _.difference(currentSlaves, selectedSlaveUuids),
      },
      name: intl.formatMessage({
        id: "remove.physicalNic",
        defaultMessage: "Remove Physical Port",
      }),
      total: selectedList.length,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <>
      <ModalSelect
        title={
          <Title
            title={intl.formatMessage({
              id: "remove.physicalNic",
              defaultMessage: "Remove Physical Port",
            })}
            resourceName={source?.physicalInterface}
          />
        }
        visible={visible}
        setVisible={setVisible}
        value={value}
        onChange={onChange}
        showSelect={false}
        onOk={() => setConfirmVisible(true)}
        selectType="checkbox"
        alertType="warning"
        alertMessage={intl.formatMessage({
          id: "uplinkGroup.modal.remove.physical.nic.alertMessage",
          defaultMessage: "Cannot Remove. At least one physical port must remain on the host.",
        })}
      >
        <PhysicalNicList view="select.bond" defaultQuery={defaultQuery} />
      </ModalSelect>
      <DialogP0
        title={intl.formatMessage({
          id: "confirm.remove.phsical.nic",
          defaultMessage: "Remove Physical Port?",
        })}
        visible={confirmVisible}
        setVisible={setConfirmVisible}
        bannerMessage={intl.formatMessage({
          id: "bond.modal.title.confirm.remove.nic.alertMessage.error",
          defaultMessage:
            "Removing a physical port from a bond may cause temporary network disruption on that bond. Proceed with caution.",
        })}
        onConfirm={onOk}
        resourceNames={(value as any[]).map((r) => r.name ?? r.uuid)}
        resourceType={intl.formatMessage({
          id: "physical.network.port",
          defaultMessage: "Physical Port",
        })}
      />
    </>
  );
};

export default RemoveNicFromBond;
