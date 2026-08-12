import { useActionConfig } from "@zstack/zsphere-engine/src/dns";
import type { IOption } from "@zstack/zsphere-engine/src/dns/useActionConfig";
import type { Dns as IDns, L3Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import AddDns from "../../../action/add-dns";

export default (ipVersion?: 4 | 6) => {
  const _actionConfig = useMemo<IOption<IDns>>(
    () => [
      {
        key: "add.dns",
        ActionWrapper: (props) => {
          const memoizedSelectedList = useMemo(
            () => [props.source! as L3Network],
            [props.source],
          );
          return (
            <AddDns
              {...props}
              ipVersion={ipVersion}
              selectedList={memoizedSelectedList}
            />
          );
        },
        autoInjectPreValidator: false,
        preValidators: [
          (_, source: L3Network) =>
            !source.networkServices?.some(
              (ns) => ns.networkServiceType === "CentralizedDNS",
            ) && !source.isDefault,
        ],
      },
      {
        key: "delete",
        ActionWrapper: require("../action/delete").default,
        preValidators: [
          (_, source: L3Network) =>
            !source.networkServices?.some(
              (ns) => ns.networkServiceType === "CentralizedDNS",
            ) && !source.isDefault,
        ],
      },
    ],
    [ipVersion],
  );
  const actionConfig = useActionConfig<IDns>(_actionConfig);

  return useMemo(
    () => ({
      getItemName: (current: IDns) => current.dns ?? "",
      list: actionConfig.list,
      viewMap: {
        ...actionConfig.viewMap,
        "sub.share/toolbar": {
          extraKeys: [],
          activeKeys: [],
        },
      },
    }),
    [actionConfig.list, actionConfig.viewMap],
  );
};
