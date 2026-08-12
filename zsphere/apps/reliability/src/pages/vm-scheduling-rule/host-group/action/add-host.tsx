import { gql } from "@apollo/client";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  Op,
  HostQueryType,
  HostState,
  HostStatus,
} from "@zstack/zsphere-types";
import type {
  AddHostToHostGroupPayload,
  Host,
  HostGroup,
} from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import React, { useContext, useMemo } from "react";
import { useIntl } from "react-intl";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";
import HostList from "zsv_resource/host/list";

const AddHostAction: React.FC<IActionWrapperProps<HostGroup>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const addHostToHostGroup = gql`
    mutation addHostToHostGroup($input: AddHostToHostGroupInput!) {
      addHostToHostGroup(input: $input) {
        actionId
      }
    }
  `;
  const { zoneUuid = "" } = useContext(ZoneUuidContext);

  const currentHostGroupUuid = selectedList?.[0]?.uuid;
  const defaultQueryHostList = useMemo(() => {
    return {
      conditions: [
        { key: "zoneUuid", op: Op.eq, value: zoneUuid },
        { key: "state", op: Op.eq, value: HostState.Enabled },
        { key: "status", op: Op.eq, value: HostStatus.Connected },
        { key: "hypervisorType", op: Op.ne, value: "ESX" },
      ],
      type: HostQueryType.GetHostCandidatesForAddToHostGroup,
    };
  }, [zoneUuid]);

  const onOk = (selectedHostList: Host[]) => {
    const payload: AddHostToHostGroupPayload[] = selectedHostList?.map(
      (item) => ({
        hostUuid: item.uuid,
        hostGroupUuid: currentHostGroupUuid,
      }),
    );
    doAction({
      mutation: addHostToHostGroup,
      payload,
      name: intl.formatMessage({
        id: "add.host",
        defaultMessage: "Add Host",
      }),
      total: selectedList?.length,
      type: "HostGroup",
      onFinish: () => {
        setSelectedList?.([]);
        bus.emit("action:refetch:HostVO");
        setVisible(false);
      },
    });
  };

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "select.host",
        defaultMessage: "Select Host",
      })}
      visible={visible}
      selectType="checkbox"
      showSelect={false}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={selectedList?.[0]?.name}
    >
      <HostList view="select" defaultQuery={defaultQueryHostList} />
    </ModalSelect>
  );
};

export default AddHostAction;
