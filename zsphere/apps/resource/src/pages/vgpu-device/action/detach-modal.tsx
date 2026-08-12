import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  VGpuDevice as IVGpuDevice,
  VGpuType,
  DetachVGpuFromVmInstancePayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const detachVGpuFromVmInstance = gql`
  mutation detachVGpuFromVmInstance($input: DetachVGpuFromVmInstanceInput!) {
    detachVGpuFromVmInstance(input: $input) {
      actionId
    }
  }
`;

const DetachVGpuDevice: React.FC<IActionWrapperProps<IVGpuDevice>> = ({
  visible,
  setVisible,
  selectedList = [],
  source,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    const payload: DetachVGpuFromVmInstancePayload[] = selectedList.map(
      (item) => ({
        vGpuDeviceUuid: item?.uuid,
        type: item?.type as VGpuType,
        vmInstanceUuid: source?.uuid ?? "",
      }),
    );

    doAction({
      mutation: detachVGpuFromVmInstance,
      payload,
      name: intl.formatMessage({
        id: "vgpu.detach",
        defaultMessage: "Detach vGPU",
      }),
      total: selectedList.length,
      type: "VGpuDevice",
    });
    setSelectedList?.([]);
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "vgpuDevice.modal.title.confirm.detach.vgpuDevice",
        defaultMessage: "Detach vGPU?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default DetachVGpuDevice;
