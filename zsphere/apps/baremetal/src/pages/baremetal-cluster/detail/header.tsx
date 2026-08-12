import { DetailBreadcrumb, Header } from "@zstack/zsphere-components";
import { Action } from "@zstack/zsphere-components";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import { useActionConfig } from "../config";

interface IProps {
  current: ICluster;
  refetch: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name = "" } = current;

  const { list: menuList, viewMap } = useActionConfig();

  const memoizedSelectedList = useMemo(() => [current], [current]);

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="server-1"
        title={name!}
        actions={
          <Action
            view="main"
            viewMap={viewMap}
            menuList={menuList}
            position="header"
            refetch={refetch}
            source={current}
            selectedList={memoizedSelectedList}
          />
        }
      />
    </>
  );
};

export default DetailHeader;
