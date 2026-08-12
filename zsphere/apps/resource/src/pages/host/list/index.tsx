import type { ITableListProps } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import React from "react";
import { HostPlainList } from "zsv_resource_shared/host/mf-index";

import { useActionConfig } from "../config";

interface IProps {
  hidenTagSearch?: boolean;
  gql?: any;
  maxSelectedCount?: number;
}

const toolbar: ITableListProps<IHost>["toolbar"] = [
  "refresh",
  "operation",
  "search",
  "setting",
  "export",
];

const HostList: React.FC<
  IProps &
    IListProps<IHost> &
    Partial<Pick<ITableListProps<IHost>, "rowSelection" | "customView">> & {
      summaryRefetch?: () => void;
    }
> = ({ ...props }) => {
  const actionConfig = useActionConfig();

  return (
    <HostPlainList actionConfig={actionConfig} toolbar={toolbar} {...props} />
  );
};

export default React.memo(HostList);
