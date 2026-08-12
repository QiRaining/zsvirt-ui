import { VGpuType } from "@zstack/zsphere-types";
import * as _ from "lodash-es";

import type { TransformContext } from "./types";

export const gpuTransform = (
  ctx: TransformContext,
  newValues: any,
  originValues: any,
  vmInstanceUuid: string,
) => {
  const { payload, setPayload, setChangeKeys } = ctx;
  const list = _.groupBy(_.keys(newValues), (key: string) => key.split("-")[1]);
  const originList = _.groupBy(
    _.keys(originValues),
    (key: string) => key.split("-")[1],
  );

  const addList = _.difference(_.keys(list), _.keys(originList));
  const removeList = _.keys(originList).filter(
    (key: string) =>
      originValues?.[`removegpu-${key}`] &&
      originValues?.[`gpuDeviceUuid-${key}`],
  );
  const updateList = _.keys(originList).filter(
    (key: string) => removeList.indexOf(key) === -1,
  );

  addList.forEach((key: string) => {
    const value = _.pick(newValues, list[key]);
    if (value[`gpuDevice-${key}`]?.[0]?.uuid) {
      setChangeKeys((origin) => origin.concat(key));
      if (value[`gpuDeviceType-${key}`] === "gpu") {
        payload.attachPciDeviceToVMPayloads = (
          payload.attachPciDeviceToVMPayloads ?? []
        ).concat([
          {
            pciDeviceUuid: value[`gpuDevice-${key}`]?.[0]?.uuid,
            vmInstanceUuid,
          },
        ]);
      } else {
        payload.attachVGpuToVmInstancePayloads = (
          payload.attachVGpuToVmInstancePayloads ?? []
        ).concat([
          {
            vGpuDeviceUuid: value[`gpuDevice-${key}`]?.[0]?.uuid,
            vmInstanceUuid,
            type:
              value[`gpuDevice-${key}`]?.[0]?.type === "MdevDevice"
                ? VGpuType.MdevDevice
                : VGpuType.PciDevice,
          },
        ]);
      }
    }
  });

  removeList.forEach((key: string) => {
    setChangeKeys((origin) => origin.concat(key));
    const value = _.pick(originValues, originList[key]);

    if (value[`gpuDeviceType-${key}`] === "gpu") {
      payload.detachPciDeviceFromVMPayloads = (
        payload.detachPciDeviceFromVMPayloads ?? []
      ).concat([
        {
          pciDeviceUuid: value[`gpuDeviceUuid-${key}`],
          vmInstanceUuid,
        },
      ]);
    } else {
      payload.detachVGpuFromVmInstancePayloads = (
        payload.detachVGpuFromVmInstancePayloads ?? []
      ).concat([
        {
          vGpuDeviceUuid: value[`gpuDeviceUuid-${key}`],
          vmInstanceUuid,
          type:
            value[`gpuDevice-${key}`]?.[0]?.type === "MdevDevice"
              ? VGpuType.MdevDevice
              : VGpuType.PciDevice,
        },
      ]);
    }
  });

  updateList.forEach((key: string) => {
    const value = _.pick(originValues, originList[key]);
    const newValue = _.pick(newValues, list[key]);

    if (
      value[`gpuDeviceUuid-${key}`] !== newValue[`gpuDevice-${key}`]?.[0]?.uuid
    ) {
      if (value[`gpuDeviceType-${key}`] === "gpu") {
        payload.detachPciDeviceFromVMPayloads = (
          payload.detachPciDeviceFromVMPayloads ?? []
        ).concat([
          {
            pciDeviceUuid: value[`gpuDeviceUuid-${key}`],
            vmInstanceUuid,
          },
        ]);
      } else {
        payload.detachVGpuFromVmInstancePayloads = (
          payload.detachVGpuFromVmInstancePayloads ?? []
        ).concat([
          {
            vGpuDeviceUuid: value[`gpuDeviceUuid-${key}`],
            vmInstanceUuid,
            type:
              value[`gpuDevice-${key}`]?.[0]?.type === "MdevDevice"
                ? VGpuType.MdevDevice
                : VGpuType.PciDevice,
          },
        ]);
      }

      if (
        newValue[`gpuDeviceType-${key}`] === "gpu" &&
        newValue[`gpuDevice-${key}`]?.length
      ) {
        payload.attachPciDeviceToVMPayloads = (
          payload.attachPciDeviceToVMPayloads ?? []
        ).concat([
          {
            pciDeviceUuid: newValue[`gpuDevice-${key}`]?.[0]?.uuid,
            vmInstanceUuid,
          },
        ]);
      } else if (newValue[`gpuDevice-${key}`]?.length) {
        payload.attachVGpuToVmInstancePayloads = (
          payload.attachVGpuToVmInstancePayloads ?? []
        ).concat([
          {
            vGpuDeviceUuid: newValue[`gpuDevice-${key}`]?.[0]?.uuid,
            vmInstanceUuid,
            type:
              newValue[`gpuDevice-${key}`]?.[0]?.type === "MdevDevice"
                ? VGpuType.MdevDevice
                : VGpuType.PciDevice,
          },
        ]);
      }
    }
  });
  setPayload(payload);
};
