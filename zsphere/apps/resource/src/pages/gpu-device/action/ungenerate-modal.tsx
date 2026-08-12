import { unGenerateSriovPciDevice } from "@zstack/virtualization-resource/src/gql/gpu-device.gql";
import { unGenerateMdevDevice } from "@zstack/virtualization-resource/src/gql/vgpu-device.gql";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PciDevice as IPciDevice } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const DeleteAction: React.FC<IActionWrapperProps<IPciDevice>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const mutation =
    selectedList?.[0]?.vendorId === "1002"
      ? unGenerateSriovPciDevice
      : unGenerateMdevDevice;

  // 还原AMD数量？
  const onOk = () => {
    const payload = {
      pciDeviceUuid: selectedList![0].uuid,
    };
    doAction({
      mutation,
      payload,
      name: intl.formatMessage({
        id: "pci.device.mdev.ungenerate",
        defaultMessage: "Ungenerate",
      }),
      type: "PciDevice",
      total: selectedList.length,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "gpuDevice.modal.title.confirm.virtualRestore",
        defaultMessage: "Ungenerate?",
      })}
      resourceNames={(selectedList || []).map((item) => item.name ?? item.uuid)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default DeleteAction;
