import { useActionConfig } from "@zstack/virtualization-resource/src/pages/primary-storage/config";
import { Header, DetailBreadcrumb } from "@zstack/zsphere-components";
import { Action } from "@zstack/zsphere-components";
import type { PrimaryStorage as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

interface IProps {
  current: IPrimaryStorage;
  refetch: () => void;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name = "" } = current;

  const { list: menuList, viewMap } = useActionConfig();

  const memoizedSelectedList = useMemo(() => [current], [current]);

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="storage"
        title={name}
        actions={
          <Action
            view="virtualization.main"
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
