import { Action } from "@zstack/zsphere-components";
import type { IActionProps } from "@zstack/zsphere-types";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "../config/useActionConfig";

const IscsiServerAction: React.FC<IActionProps<IIscsiServer>> = ({
  view,
  position,
  selectedList,
  setSelectedList,
  refetch,
  source,
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
      source={source}
    />
  );
};

export default IscsiServerAction;
