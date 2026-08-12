import { useAuth } from "@zstack/zsphere-components";
import { getMenuList } from "@zstack/zsphere-config";
import { usePersistFn } from "ahooks";
import { useIntl } from "react-intl";

import type { ResourceType } from "./constant";

export function useGetResourceTypeLabel() {
  const intl = useIntl();
  const menuList = getMenuList();
  const { hasAuth } = useAuth();

  type Result = { label: string; value: string };
  function getResourceTypeLabel(param: string): Result;
  function getResourceTypeLabel(param: ResourceType): Result | null;
  function getResourceTypeLabel(param: ResourceType) {
    let resourceType: string;
    if (typeof param === "string") {
      resourceType = param;
    } else if (hasAuth(param.auth)) {
      resourceType = param.value;
    } else {
      return null;
    }
    const i18nKey = menuList.find((item) =>
      item.resourceType?.includes(resourceType),
    )?.i18nKey;
    const label = i18nKey ? intl.formatMessage({ id: i18nKey }) : resourceType;
    return { label, value: resourceType };
  }

  return usePersistFn(getResourceTypeLabel);
}
