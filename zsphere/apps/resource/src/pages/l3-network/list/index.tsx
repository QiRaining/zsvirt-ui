import type { ITableListProps } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { L3Network as IL3Network } from "@zstack/zsphere-types/graphql";
import type { DocumentNode } from "graphql";
import React from "react";
import { L3NetworkPlainList } from "zsv_resource_shared/l3-network/mf-index";

import { useActionConfig } from "../config";

type IListPropsWithGql = IListProps<IL3Network> & {
  gql?: DocumentNode;
};

const L3NetworkList: React.FC<
  IListPropsWithGql &
    Partial<Pick<ITableListProps<IL3Network>, "rowSelection" | "customView">>
> = ({ ...props }) => {
  const actionConfig = useActionConfig();

  return <L3NetworkPlainList actionConfig={actionConfig} {...props} />;
};

export default React.memo(L3NetworkList);
