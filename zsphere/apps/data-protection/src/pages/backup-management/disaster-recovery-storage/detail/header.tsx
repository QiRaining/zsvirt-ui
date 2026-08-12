import { DetailBreadcrumb, Header, Action } from "@zstack/zsphere-components";
import type { ZSVBackupStorage as IZSVBackupStorage } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useActionConfig } from "../config";

export interface IProps {
  current: IZSVBackupStorage;
  refetch: () => void;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name = "", description } = current ?? {};
  const { list: menuList, viewMap } = useActionConfig();

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="slot"
        title={name}
        description={description}
        actions={
          <Action
            view="main"
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
