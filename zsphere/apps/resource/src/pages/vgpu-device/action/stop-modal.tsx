import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { PciDeviceState, VGpuType } from "@zstack/zsphere-types";
import type {
  VGpuDevice as IVGpuDevice,
  UpdatePciDeviceInput as IInput,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const updateVGPUDevice = gql`
  mutation updateVGPUDevice($input: UpdateVGPUDeviceInput!) {
    updateVGPUDevice(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IVGpuDevice>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    // 需要判断mdev设备
    const payload: IInput["payload"] = selectedList?.map(
      (item: IVGpuDevice) => {
        return {
          uuid: item.uuid,
          state: PciDeviceState.Disabled,
          isMdevDevice: item?.type === VGpuType.MdevDevice,
        };
      },
    );
    doAction({
      mutation: updateVGPUDevice,
      payload,
      name: intl.formatMessage({
        id: "stop.vgpu.device",
        defaultMessage: "Disable vGPU",
      }),
      total: selectedList.length,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
        refetch?.();
      },
    });
    setSelectedList?.([]);
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "vgpuDevice.modal.title.confirm.disable.vgpuDevice",
        defaultMessage: "Disable vGPU?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default Action;
