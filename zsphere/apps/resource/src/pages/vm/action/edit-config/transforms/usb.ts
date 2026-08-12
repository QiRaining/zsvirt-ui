import * as _ from "lodash-es";

import type { TransformContext } from "./types";

export const usbTransform = (
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
      originValues?.[`removeusb-${key}`] &&
      originValues?.[`usbDiviceUuid-${key}`],
  );
  const updateList = _.keys(originList).filter(
    (key: string) => removeList.indexOf(key) === -1,
  );
  addList.forEach((key: string) => {
    const value = _.pick(newValues, list[key]);

    if (value[`usbDivice-${key}`]?.[0]?.uuid) {
      setChangeKeys((origin) => origin.concat(key));

      payload.attachUsbDeviceToVmPayload = (
        payload.attachUsbDeviceToVmPayload ?? []
      ).concat([
        {
          attachType: value[`usbDiviceType-${key}`],
          vmInstanceUuid,
          usbDeviceUuid: value[`usbDivice-${key}`]?.[0]?.uuid,
        },
      ]);
    }
  });

  removeList.forEach((key: string) => {
    setChangeKeys((origin) => origin.concat(key));
    const value = _.pick(originValues, originList[key]);
    payload.detachUsbDeviceToVmPayload = (
      payload.detachUsbDeviceToVmPayload ?? []
    ).concat([
      {
        usbDeviceUuid: value[`usbDivice-${key}`]?.[0]?.uuid,
      },
    ]);
  });

  updateList.forEach((key: string) => {
    const value = _.pick(originValues, originList[key]);
    const newValue = _.pick(newValues, list[key]);
    if (
      value[`usbDivice-${key}`]?.[0]?.uuid !==
      newValue[`usbDivice-${key}`]?.[0]?.uuid
    ) {
      payload.detachUsbDeviceToVmPayload = (
        payload.detachUsbDeviceToVmPayload ?? []
      ).concat([
        {
          usbDeviceUuid: value[`usbDivice-${key}`]?.[0]?.uuid,
        },
      ]);

      if (newValue[`usbDivice-${key}`]?.[0]?.uuid) {
        payload.attachUsbDeviceToVmPayload = (
          payload.attachUsbDeviceToVmPayload ?? []
        ).concat([
          {
            attachType: newValue[`usbDiviceType-${key}`],
            vmInstanceUuid,
            usbDeviceUuid: newValue[`usbDivice-${key}`]?.[0]?.uuid,
          },
        ]);
      }
    }
  });
  setPayload(payload);
};
