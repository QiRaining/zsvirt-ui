import { useUpdateLldpModeAction } from "@zstack/virtualization-resource/src/pages/physical-nic/action/update-lldp-mode";
import { LLDPModeModal } from "@zstack/virtualization-resource/src/pages/physical-nic/components";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PhysicalNic as IPhysicalNic } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const UpdateModal: React.FC<IActionWrapperProps<IPhysicalNic>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  setSelectedList,
  position,
}) => {
  const intl = useIntl();
  const onFinish = usePersistFn(() => {
    refetch?.();
  });

  const updateModeAct = useUpdateLldpModeAction(onFinish);

  const closeModalAndClearSelected = usePersistFn(() => {
    setVisible(false);
    setSelectedList?.([]);
  });

  const onOk = usePersistFn(async (data) => {
    updateModeAct({
      interfaceUuids: selectedList?.map((t) => t?.uuid),
      ...data,
    });
    closeModalAndClearSelected();
  });

  const title = useMemo(
    () =>
      position === "row" ? (
        <span>
          {intl.formatMessage({
            id: "lldp.action.modal.title",
            defaultMessage: "Modify LLDP Mode",
          })}
        </span>
      ) : undefined,
    [intl, position],
  );

  return (
    <LLDPModeModal
      selectedList={selectedList}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={title}
    />
  );
};

export default UpdateModal;
