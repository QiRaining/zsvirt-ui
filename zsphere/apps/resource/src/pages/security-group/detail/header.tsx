import { Action, DetailBreadcrumb, Header } from "@zstack/zsphere-components";
import type { SecurityGroup } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import useActionConfig from "../config/useActionConfig";

interface IProps {
  current: SecurityGroup;
  refetch: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name = "", description } = current;
  const { list: menuList, viewMap } = useActionConfig();

  const memoizedSelectedList = useMemo(() => [current], [current]);

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="shield"
        title={name}
        description={description}
        actions={
          <Action
            view="sub.virtualization.zone"
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
