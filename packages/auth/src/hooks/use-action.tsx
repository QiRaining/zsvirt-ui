import type { ActionConfig } from "../types.ts";
import { useAuth } from "./use-auth.ts";

export const useAction = () => {
  const { hasAuth } = useAuth();

  const resolveList = (actionConfig: ActionConfig, viewKey: string) => {
    const { list, viewMap } = actionConfig;
    const viewConfig = viewMap[viewKey];

    if (!viewConfig) {
      return [];
    }

    const { activeKeys } = viewConfig;
    const allowedKeys = [...activeKeys];

    return list
      .filter((item) => allowedKeys.includes(item.key) && hasAuth(item.auth))
      .map((item) => ({
        key: item.key,
        type: "item",
        label: item.name,
        dialog: item.ActionWrapper,
        tooltip: undefined,
        disabled: false,
      }));
  };

  return {
    resolveList,
  };
};
