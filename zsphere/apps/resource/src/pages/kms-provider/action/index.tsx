import { Action } from "@zstack/zsphere-components";
import type { IActionProps } from "@zstack/zsphere-types";
import type { KmsProvider } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useActionConfig } from "../config";

const KmsProviderAction: React.FC<IActionProps<KmsProvider>> = ({
  view,
  position,
  selectedList,
  setSelectedList,
  refetch,
}) => {
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

export default KmsProviderAction;
