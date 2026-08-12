import { cloneDeep as _cloneDeep } from "lodash-es";
import { useMemo } from "react";
import type { IntlShape } from "react-intl";

import AdminZsvConfig from "./Admin.zsv";

export enum ITargetKey {
  resInventoryAuth = "resInventoryAuth",
  bizReliability = "bizReliability",
  dataProtection = "dataProtection",
  opsManagement = "opsManagement",
  sysAdminAuth = "sysAdminAuth",
}

export const useAPIAuthPrivilegeListByKey = ({
  intl,
  targetKey,
  detail,
}: {
  intl: IntlShape;
  targetKey: ITargetKey;
  detail: any;
}): any => {
  return useMemo(() => {
    const result = _cloneDeep(AdminZsvConfig.useStruct(intl));

    result.forEach((item: any) => {
      item.children.forEach((apiModule: any) => {
        apiModule.selectedAPINum = 0;

        Object.entries(apiModule.api).forEach(
          ([key, apiItem]: [string, any]) => {
            const apiPath = apiItem.api;
            if (apiPath) {
              const shortApiPath = apiPath.split(".").slice(-1)[0];

              // 检查是否在 policies 中存在匹配的API
              const matchingApi = detail?.policies.find((api: string) =>
                api.endsWith(shortApiPath),
              );

              if (matchingApi) {
                apiModule.selectedAPINum += 1;
                apiModule.api[key].selected = true; // 为匹配的API添加selected属性
              } else {
                apiModule.api[key].selected = false; // 为不匹配的API设置selected为false
              }
            }
          },
        );
      });
    });

    return result.find((item) => item.key === targetKey) || null;
  }, [detail?.policies, intl, targetKey]);
};
