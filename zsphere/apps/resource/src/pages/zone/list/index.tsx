import type { ITableListProps } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { ZonePlainList } from "zsv_resource_shared/zone/mf-index";

import { useActionConfig } from "../config";

const ZoneList = ({
  ...props
}: IListProps<IZone> & Pick<ITableListProps<IZone>, "rowSelection">) => {
  const actionConfig = useActionConfig();
  return <ZonePlainList actionConfig={actionConfig} {...props} />;
};

export default ZoneList;
