import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { isEmpty as _isEmpty } from "lodash-es";

// 停止
export const verifyStop = (current: IZone) => {
  return ["Enabled"].indexOf(current.state || "") >= 0;
};

// 启用
export const verifyStart = (current: IZone) => {
  return ["Disabled"].indexOf(current.state || "") >= 0;
};

// 加载
export const verifyAttach = (selectedList: IZone[]) => {
  return selectedList.length === 0;
};

export const verifyUninstall = (selectedList: IZone[], source: any) => {
  const {
    current: { attachedZoneUuids },
    currentZoneUuid,
  } = source;
  const currentZone = selectedList.find((it) => it.uuid === currentZoneUuid);
  if (selectedList.length === attachedZoneUuids.length) {
    return false;
  }
  return _isEmpty(currentZone);
};
