import type { ITableListProps } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type {
  PrimaryStorage,
  Volume as IVolume,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { VolumePlainList } from "zsv_resource_shared/volume/mf-index";

import useActionConfig from "../config/useActionConfig";

const VolumeList: React.FC<
  IListProps<IVolume> & {
    source?: any;
    primaryStorage?: PrimaryStorage;
  } & Partial<Pick<ITableListProps<IVolume>, "rowSelection" | "customView">>
> = ({ ...props }) => {
  const actionConfig = useActionConfig(props?.source);

  return <VolumePlainList actionConfig={actionConfig} {...props} />;
};

export default React.memo(VolumeList);
