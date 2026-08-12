import type { ITableListProps } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { L2Network as IL2Network } from "@zstack/zsphere-types/graphql";
import React from "react";
import { L2NetworkPlainList } from "zsv_resource_shared/l2-network/mf-index";

import { useActionConfig } from "../config";

const L2NetworkList: React.FC<
  IListProps<IL2Network> &
    Partial<Pick<ITableListProps<IL2Network>, "rowSelection" | "customView">>
> = ({ ...props }) => {
  const actionConfig = useActionConfig();

  return <L2NetworkPlainList actionConfig={actionConfig} {...props} />;
};

export default React.memo(L2NetworkList);
