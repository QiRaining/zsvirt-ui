import * as _ from "lodash-es";

import type { TransformContext } from "./types";

export const pcieTransform = (
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
      originValues?.[`removepcie-${key}`] &&
      originValues?.[`pcieDeviceUuid-${key}`],
  );
  const updateList = _.keys(originList).filter(
    (key: string) => removeList.indexOf(key) === -1,
  );

  addList.forEach((key: string) => {
    const value = _.pick(newValues, list[key]);
    if (value[`pcieDevice-${key}`]?.[0]?.uuid) {
      setChangeKeys((origin) => origin.concat(key));
      payload.attachPciDeviceToVMPayloads = (
        payload.attachPciDeviceToVMPayloads ?? []
      ).concat([
        {
          pciDeviceUuid: value[`pcieDevice-${key}`]?.[0]?.uuid,
          vmInstanceUuid,
        },
      ]);
    }
  });

  removeList.forEach((key: string) => {
    setChangeKeys((origin) => origin.concat(key));
    const value = _.pick(originValues, originList[key]);
    payload.detachPciDeviceFromVMPayloads = (
      payload.detachPciDeviceFromVMPayloads ?? []
    ).concat([
      {
        pciDeviceUuid: value[`pcieDeviceUuid-${key}`],
        vmInstanceUuid,
      },
    ]);
  });

  updateList.forEach((key: string) => {
    const value = _.pick(originValues, originList[key]);
    const newValue = _.pick(newValues, list[key]);

    if (
      value[`pcieDeviceUuid-${key}`] !==
      newValue[`pcieDevice-${key}`]?.[0]?.uuid
    ) {
      payload.detachPciDeviceFromVMPayloads = (
        payload.detachPciDeviceFromVMPayloads ?? []
      ).concat([
        {
          pciDeviceUuid: value[`pcieDeviceUuid-${key}`],
          vmInstanceUuid,
        },
      ]);

      if (newValue[`pcieDevice-${key}`]?.[0]?.uuid) {
        payload.attachPciDeviceToVMPayloads = (
          payload.attachPciDeviceToVMPayloads ?? []
        ).concat([
          {
            pciDeviceUuid: newValue[`pcieDevice-${key}`]?.[0]?.uuid,
            vmInstanceUuid,
          },
        ]);
      }
    }
  });
  setPayload(payload);
};
