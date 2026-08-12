import { Action } from "@zstack/zsphere-components";
import { DetailBreadcrumb, Header } from "@zstack/zsphere-components";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import useActionConfig from "../config/useActionConfig";

interface IProps {
  current: IBackupStorage;
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
        icon="server"
        title={name}
        description={description}
        actions={
          <Action
            view="virtualization.template.image.main"
            viewMap={viewMap}
            menuList={menuList}
            position="header"
            refetch={refetch}
            selectedList={memoizedSelectedList}
          />
        }
      />
    </>
  );
};

export default DetailHeader;
