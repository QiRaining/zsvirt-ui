import { Action, DetailBreadcrumb, Header } from "@zstack/zsphere-components";
import React, { useMemo } from "react";

import useActionConfig from "../config/useActionConfig";

interface IProps {
  current: any;
  refetch?: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name = "" } = current;
  const { list: menuList, viewMap } = useActionConfig();
  const selectedList = useMemo(() => [current], [current]);

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="editor"
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
