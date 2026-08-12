import { ModalSelect } from "@zstack/zsphere-components";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, VmQueryType } from "@zstack/zsphere-types";
import type { VmGroup, VmInstance } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import VmList from "zsv_resource/vm/list";

import RemoveVmConfirm from "./remove-vm-confirm";

const RemoveVmAction: React.FC<IActionWrapperProps<VmGroup>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();

  const currentVmGroupUuid = selectedList?.[0]?.uuid;
  const defaultQueryVmList = useMemo(() => {
    return {
      extraConditions: [
        { key: "vmGroupUuid", op: Op.eq, value: currentVmGroupUuid },
      ],
      type: VmQueryType.GetVmByVmGroup,
    };
  }, [currentVmGroupUuid]);

  const [value, onChange] = useState<VmInstance[]>([]);
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!confirmVisible) {
      onChange([]);
    }
  }, [confirmVisible]);

  return (
    <>
      <ModalSelect
        title={intl.formatMessage({
          id: "vmGroup.modal.title.remove.vm",
          defaultMessage: "Remove Virtual Machine",
        })}
        value={value}
        onChange={onChange}
        visible={visible}
        setVisible={setVisible}
        showSelect={false}
        onOk={() => setConfirmVisible(true)}
        selectType="checkbox"
        resourceName={selectedList?.[0]?.name}
      >
        <VmList view="select" defaultQuery={defaultQueryVmList} />
      </ModalSelect>
      <RemoveVmConfirm
        view="main"
        position="row"
        visible={confirmVisible}
        setVisible={setConfirmVisible}
        source={selectedList?.[0]}
        selectedList={value}
        refetch={refetch}
        setSelectedList={setSelectedList as () => void}
      />
    </>
  );
};

export default RemoveVmAction;
