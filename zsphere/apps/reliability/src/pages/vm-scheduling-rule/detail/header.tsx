import { Header, DetailBreadcrumb, Action } from "@zstack/zsphere-components";
import type { VmGroup } from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "../config/useActionConfig";

interface IProps {
  current: VmGroup;
  refetch: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { list: menuList, viewMap } = useActionConfig();
  const { name } = current;

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name: name! }]} />
      <Header.Detail
        icon="deploy"
        title={name!}
        actions={
          <Action
            view="virtualization.main"
            menuList={menuList}
            viewMap={viewMap}
            position="header"
            refetch={refetch}
            selectedList={[current]}
          />
        }
      />
    </>
  );
};

export default DetailHeader;
