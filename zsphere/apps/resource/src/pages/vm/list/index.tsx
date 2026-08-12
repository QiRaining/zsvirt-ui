import type { ITableListProps } from "@zstack/zsphere-components";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useCallback } from "react";
import { VmPlainList } from "zsv_resource_shared/vm/mf-index";

import { useActionConfig } from "../config";
import useListenVncDisconnect from "../hooks/use-listen-vnc-disconnect";
import usePollingTransitionalVm from "../hooks/use-polling-transitional-vm";

const toolbar: ITableListProps<IVM>["toolbar"] = [
  "refresh",
  "operation",
  "search",
  "setting",
  "export",
];

const VMList: React.FC<Partial<ITableListProps<IVM>>> = ({ ...props }) => {
  useListenVncDisconnect();

  const { onFetchChange: onFetchChangePolling } = usePollingTransitionalVm();
  const defaultActionConfig = useActionConfig();

  const onFetchChange: ITableListProps<IVM>["onFetchChange"] = useCallback(
    (params: { list: IVM[]; total: number }) => {
      onFetchChangePolling(params);
      props.onFetchChange?.(params);
    },
    [onFetchChangePolling, props.onFetchChange],
  );

  return (
    <VmPlainList
      actionConfig={props.actionConfig || defaultActionConfig}
      toolbar={toolbar}
      {...props}
      onFetchChange={onFetchChange}
    />
  );
};

export default VMList;
