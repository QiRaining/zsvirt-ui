import { DetailBreadcrumb, Header, Action } from "@zstack/zsphere-components";
import type { Tag as ITag } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useActionConfig } from "../config";

export interface IProps {
  current: ITag;
  refetch: Function;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name = "" } = current ?? {};
  const { list: menuList, viewMap } = useActionConfig();

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="pricetag"
        title={name}
        actions={
          <Action
            view="main.virtualization"
            viewMap={viewMap}
            menuList={menuList}
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
