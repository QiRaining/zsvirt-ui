import { Action, DetailBreadcrumb, Header } from "@zstack/zsphere-components";
import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import useActionConfig from "../config/useActionConfig";

interface IProps {
  current: IBaremetalPxeServer;
  refetch: any;
}

const BaremetalPxeServerDetailHeader: React.FC<IProps> = ({
  current,
  refetch,
}) => {
  const { name = "", description } = current;
  const { list: menuList, viewMap } = useActionConfig();
  const selectedList = useMemo(() => [current], [current]);

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="server"
        title={name!}
        description={description}
        actions={
          <Action
            view="main"
            viewMap={viewMap}
            menuList={menuList}
            position="header"
            refetch={refetch}
            selectedList={selectedList}
          />
        }
      />
    </>
  );
};

export default BaremetalPxeServerDetailHeader;
