import * as _ from "lodash-es";

import type { TransformContext } from "./types";

export const cdromTransform = (
  ctx: TransformContext,
  generateArrayPayload: (payloadName: string, _payload: any) => void,
  newValues: any,
  originValues: any,
  vmInstanceUuid: string,
) => {
  const { payload, setPayload, setChangeKeys } = ctx;
  const list = _.groupBy(_.keys(newValues), (key: string) => key.split("-")[1]);
  const originCdromList = _.groupBy(
    _.keys(originValues),
    (key: string) => key.split("-")[1],
  );

  const addList = _.difference(_.keys(list), _.keys(originCdromList));
  const removeList = _.keys(originCdromList).filter(
    (key: string) =>
      originValues?.[`removecdrom-${key}`] &&
      originValues?.[`cdRomListUuid-${key}`],
  );
  const updateList = _.keys(originCdromList).filter(
    (key: string) => removeList.indexOf(key) === -1,
  );

  addList.forEach((key: string) => {
    const value = _.pick(newValues, list[key]);
    if (value[`cdRomName-${key}`]) {
      setChangeKeys((origin) => origin.concat(key));

      payload.createVmCdRomPayload = (
        payload.createVmCdRomPayload ?? []
      ).concat([
        {
          name: `cdrom-create-for-vm-${vmInstanceUuid}-${key}`,
          vmInstanceUuid,
          isoUuid: value[`cdRomList-${key}`]?.[0]?.uuid ?? null,
        },
      ]);
    }
  });

  removeList.forEach((key: string) => {
    setChangeKeys((origin) => origin.concat(key));
    const value = _.pick(originValues, originCdromList[key]);
    payload.deleteCdRomPayload = (payload.deleteCdRomPayload ?? []).concat([
      {
        uuid: value[`cdRomListUuid-${key}`],
      },
    ]);
  });

  updateList.forEach((key: string) => {
    const value = _.pick(newValues, list[key]);
    const newIsoUuid = value[`cdRomList-${key}`]?.[0]?.uuid;
    const originValue = _.pick(originValues, originCdromList[key]);
    const originalIsoUuid = originValue[`cdRomList-${key}`]?.[0]?.uuid;
    const wasGuestToolsAttached = originalIsoUuid?.startsWith("GuestTools-");
    const updateKeys: string[] = [];
    _.keys(value).forEach((_key: string) => {
      if (!_.isEqual(value[_key], originValue[_key])) {
        updateKeys.push(_key);
      }
    });

    updateKeys.forEach((_key: string) => {
      switch (_key.split("-")[0]) {
        case "cdRomList":
          if (newIsoUuid !== originalIsoUuid) {
            if (wasGuestToolsAttached) {
              generateArrayPayload("detachGuestToolsIsoFromVmPayload", {
                uuid: vmInstanceUuid,
              });
            } else if (originalIsoUuid) {
              generateArrayPayload("detachIsoFromVmInstancePayload", {
                vmInstanceUuid,
                isoUuid: originalIsoUuid,
              });
            }
            if (newIsoUuid) {
              generateArrayPayload("attachIsoToVmInstancePayload", {
                vmInstanceUuid,
                isoUuid: newIsoUuid,
              });
            }
          }
          break;
      }
    });
  });
  setPayload(payload);
};
