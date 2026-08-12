import { gql } from "@apollo/client";
import PhysicalNicList from "@zstack/virtualization-resource/src/pages/physical-nic/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { DialogP0 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  Bond as IBond,
  PhysicalNic as IPhysicalNic,
} from "@zstack/zsphere-types/graphql";
import React, { useState, useMemo, useEffect } from "react";
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
  selectedList,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [value, onChange] = useState<IPhysicalNic[]>([]);
  const current = selectedList?.[0];
  const attachedPhysicalNicUuids = useMemo(() => {
    return current?.slaves?.map((item) => item.uuid!);
  }, [current]);

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
          values: attachedPhysicalNicUuids,
        },
        {
          key: "hostUuid",
          op: Op.eq,
          value: current?.hostUuid,
        },
      ],
      sortBy: "interfaceName",
    }),
    [attachedPhysicalNicUuids, current],
  );

  const onOk = async () => {
    const uuid = current?.uuid;
    const mode = current?.mode;
    const xmitHashPolicy = current?.xmitHashPolicy;
    const slave = current?.slaves?.filter((item: IPhysicalNic) =>
      value.every((val: IPhysicalNic) => val.uuid !== item.uuid),
    );
    const slaveUuids = slave?.map((item) => item.uuid);

    const payload = current?.mode?.includes("active-backup")
      ? { uuid, slaveUuids, mode, hostUuid: current?.hostUuid }
      : { uuid, slaveUuids, mode, xmitHashPolicy, hostUuid: current?.hostUuid };

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
      <ModalSelect
        title={intl.formatMessage({
          id: "remove.physicalNic",
          defaultMessage: "Remove Physical Port",
        })}
        resourceName={current?.bondingName}
        visible={visible}
        setVisible={setVisible}
        value={value}
        onChange={onChange}
        showSelect={false}
        onOk={() => setConfirmVisible(true)}
        selectType="checkbox"
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
        resourceNames={(value as any[]).map(
          (r) => r.interfaceName ?? r.name ?? r.uuid,
        )}
        resourceType={intl.formatMessage({
          id: "physical.network.port",
          defaultMessage: "Physical Port",
        })}
        guide={intl.formatMessage({
          id: "remove",
          defaultMessage: "Remove",
        })}
      />
    </>
  );
};

export default RemoveNicFromBond;
