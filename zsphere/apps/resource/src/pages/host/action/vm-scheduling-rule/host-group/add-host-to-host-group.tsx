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
} from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import React, { useContext, useMemo } from "react";
import { useIntl } from "react-intl";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";

import HostList from "../../../list";

const AddHostAction: React.FC<IActionWrapperProps<Host>> = ({
  source,
  visible,
  setVisible,
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
        hostGroupUuid: source?.hostGroup?.uuid || source?.uuid,
      }),
    );

    doAction({
      mutation: addHostToHostGroup,
      payload,
      name: intl.formatMessage({
        id: "add.host",
        defaultMessage: "Add Host",
      }),
      total: selectedHostList?.length,
      onFinish: () => {
        setSelectedList?.([]);
        bus.emit("action:refetch:HostVO");
      },
    });
  };

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "hostGroup.modal.title.add.host",
        defaultMessage: "Add Host",
      })}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      selectType="checkbox"
      onOk={onOk}
      resourceName={source?.name}
    >
      <HostList view="select" defaultQuery={defaultQueryHostList} />
    </ModalSelect>
  );
};

export default AddHostAction;
