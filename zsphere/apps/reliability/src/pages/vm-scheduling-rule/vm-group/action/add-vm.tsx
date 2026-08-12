import { gql } from "@apollo/client";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, VmInstanceState, VmQueryType } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  AddVmToVmGroupPayload,
  VmGroup,
} from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import React, { useContext, useMemo } from "react";
import { useIntl } from "react-intl";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";
import VmList from "zsv_resource/vm/list";

const AddVmAction: React.FC<IActionWrapperProps<VmGroup>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const addVmToVmGroup = gql`
    mutation addVmToVmGroup($input: AddVmToVmGroupInput!) {
      addVmToVmGroup(input: $input) {
        actionId
      }
    }
  `;
  const { zoneUuid } = useContext(ZoneUuidContext);

  const defaultQueryVmList = useMemo(() => {
    return {
      conditions: [
        { key: "zoneUuid", op: Op.eq, value: zoneUuid },
        {
          key: "state",
          op: Op.in,
          values: [VmInstanceState.Running, VmInstanceState.Stopped],
        },
        { key: "hypervisorType", op: Op.ne, value: "ESX" },
      ],
      type: VmQueryType.GetVmCandidatesForAddToVmGroup,
    };
  }, [zoneUuid]);

  const currentVmGroupUuid = selectedList?.[0]?.uuid;

  const onOk = (values: IVM[]) => {
    const payload: AddVmToVmGroupPayload[] = values?.map((item) => ({
      vmUuid: item.uuid,
      vmGroupUuid: currentVmGroupUuid,
    }));

    doAction({
      mutation: addVmToVmGroup,
      payload,
      name: intl.formatMessage({ id: "add.vm", defaultMessage: "Add Virtual Machine" }),
      total: selectedList.length,
      type: "VmGroup",
      onFinish: () => {
        setSelectedList?.([]);
        bus.emit("action:refetch:VmInstance");
      },
    });
  };

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "vmGroup.modal.title.add.vm",
        defaultMessage: "Add Virtual Machine",
      })}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      selectType="checkbox"
      onOk={onOk}
      resourceName={selectedList?.[0]?.name}
    >
      <VmList view="select" defaultQuery={defaultQueryVmList} />
    </ModalSelect>
  );
};

export default AddVmAction;
