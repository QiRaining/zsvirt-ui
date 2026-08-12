import { Action } from "@zstack/zsphere-components";
import type { IActionProps } from "@zstack/zsphere-types";
import type { HostKernelInterface } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useActionConfig } from "../config";

const HostKernelInterfaceAction: React.FC<
  IActionProps<HostKernelInterface>
> = ({ view, position, selectedList, setSelectedList, refetch }) => {
  const { list, viewMap } = useActionConfig();

  return (
    <Action
      menuList={list}
      refetch={refetch}
      selectedList={selectedList}
      setSelectedList={setSelectedList}
      view={view}
      position={position}
      viewMap={viewMap}
    />
  );
};

export default HostKernelInterfaceAction;
