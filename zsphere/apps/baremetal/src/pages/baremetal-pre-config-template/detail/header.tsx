import { Header, DetailBreadcrumb, Action } from "@zstack/zsphere-components";
import type { IAM2VirtualIDGroupVO as IGroup } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import useActionConfig from "../config/useActionConfig";

interface IProps {
  current: IGroup;
  refetch: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name = "", description } = current;
  const { list, viewMap } = useActionConfig();
  const selectedList = useMemo(() => [current], [current]);

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="file-text"
        title={name!}
        description={description}
        actions={
          <Action
            viewMap={viewMap}
            view="main"
            menuList={list}
            refetch={refetch}
            position="header"
            selectedList={selectedList}
          />
        }
      />
    </>
  );
};

export default DetailHeader;
