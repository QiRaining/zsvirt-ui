import { useActionConfig } from "@zstack/zsphere-engine/src/usb";
import type { UsbDevice as IUsb } from "@zstack/zsphere-types/graphql";
import SetShareTypeFromNoGroup from "zsv_administration_shared/account-information/action/set-share-type-from-noGroup";

import AttachInResourceModal from "../action/attach-in-resource-modal";
import DetachModal from "../action/detach-modal";
import ModifyDeviceNameModal from "../action/modify-device-name-modal";
import StartModal from "../action/start-modal";
import StopModal from "../action/stop-modal";
import {
  verifyStart,
  verifyStop,
  verifyAttachInCluster,
  verifyDetachInCluster,
  vmNotInCdpTask,
} from "../action/validator";

export default () => {
  return useActionConfig<IUsb>([
    {
      key: "vm.detach.usb",
      preValidators: [vmNotInCdpTask],
      ActionWrapper: DetachModal,
    },
    // 集群
    {
      key: "cluster.usb.start",
      preValidators: [verifyStart],
      ActionWrapper: StartModal,
    },
    {
      key: "cluster.usb.stop",
      preValidators: [verifyStop],
      ActionWrapper: StopModal,
    },
    {
      key: "cluster.usb.rename",
      ActionWrapper: ModifyDeviceNameModal,
    },
    {
      key: "cluster.usb.attach.vm",
      preValidators: [verifyAttachInCluster],
      ActionWrapper: AttachInResourceModal,
    },
    {
      key: "cluster.usb.detach.vm",
      preValidators: [verifyDetachInCluster],
      ActionWrapper: DetachModal,
    },
    // 物理机
    {
      key: "host.usb.rename",
      ActionWrapper: ModifyDeviceNameModal,
    },
    {
      key: "host.usb.start",
      preValidators: [verifyStart],
      ActionWrapper: StartModal,
    },
    {
      key: "host.usb.stop",
      preValidators: [verifyStop],
      ActionWrapper: StopModal,
    },
    {
      key: "host.usb.attach.vm",
      preValidators: [verifyAttachInCluster],
      ActionWrapper: AttachInResourceModal,
    },
    {
      key: "host.usb.detach.vm",
      preValidators: [verifyDetachInCluster],
      ActionWrapper: DetachModal,
    },
    {
      key: "set.shareType",
      ActionWrapper: SetShareTypeFromNoGroup,
    },
  ]);
};
