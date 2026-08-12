import { useActionConfig } from "@zstack/zsphere-engine/src/snmp";
import type { IOption } from "@zstack/zsphere-engine/src/snmp/useActionConfig";
import type { SnmpAgent } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

export default () => {
  const _intl = useIntl();

  const actionConfig: IOption<SnmpAgent> = React.useMemo<IOption<SnmpAgent>>(
    () => [
      {
        key: "download.mib.file",
        onClick: () => {
          const dlink = document.createElement("a");
          dlink.setAttribute("type", "hidden");
          dlink.href = "/public/CLOUD-MIB.mib";

          dlink.click();
          dlink.remove();
        },
      },
      {
        key: "disable",
        ActionWrapper: require("../action/disabled").default,
      },
      {
        key: "edit.config",
        ActionWrapper: require("../action/edit-config").default,
      },
    ],
    [],
  );

  return useActionConfig<SnmpAgent>(actionConfig);
};
