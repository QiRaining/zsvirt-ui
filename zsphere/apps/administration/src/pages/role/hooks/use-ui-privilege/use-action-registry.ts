import { useMemo } from "react";
import { useIntl } from "react-intl";

import getActionAuth from "../useActionAuth";
import getCustomActionAuth from "../useCustomActionAuth";
import type { ActionConfig, SubActionConfig } from "./types";

interface ActionRegistry {
  actionConfig: ActionConfig;
  subActionConfig: SubActionConfig;
  customActionConfig: ActionConfig;
}

/**
 * Memoized wrapper for action auth configs.
 * Avoids rebuilding 1500+ lines of config objects on every render.
 */
export function useActionRegistry(): ActionRegistry {
  const intl = useIntl();

  return useMemo(() => {
    const { actionConfig, subActionConfig } = getActionAuth(intl);
    const { customActionConfig } = getCustomActionAuth(intl);
    return { actionConfig, subActionConfig, customActionConfig };
  }, [intl]);
}
