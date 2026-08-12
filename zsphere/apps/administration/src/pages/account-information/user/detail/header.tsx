import { DetailBreadcrumb, Header, Action } from "@zstack/zsphere-components";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "../config/useActionConfig";

interface IProps {
  current: IAccount;
  refetch: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name = "" } = current;
  const selectedList = [current];
  const { list, viewMap } = useActionConfig();
  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name: name! }]} />
      <Header.Detail
        icon="person-circle"
        title={name!}
        actions={
          <Action
            view="virtualization.main"
            menuList={list}
            viewMap={viewMap}
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
