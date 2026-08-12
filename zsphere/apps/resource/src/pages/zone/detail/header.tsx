import { Header, DetailBreadcrumb } from "@zstack/zsphere-components";
import { Action } from "@zstack/zsphere-components";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import useActionConfig from "../config/useActionConfig";

interface IProps {
  current: IVM;
  refetch: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name = "" } = current;
  const selectedList = useMemo(() => [current], [current]);

  const { list: menuList, viewMap } = useActionConfig();

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="building"
        title={name}
        actions={
          <Action
            view="virtualization.main"
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

export default DetailHeader;
