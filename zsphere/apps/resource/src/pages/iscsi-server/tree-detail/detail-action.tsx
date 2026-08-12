import { useActionConfig } from "@zstack/virtualization-resource/src/pages/iscsi-server/config";
import { Action } from "@zstack/zsphere-components";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

interface IProps {
  current: IIscsiServer;
  refetch: any;
}

const DetailAction: React.FC<IProps> = ({ current, refetch }) => {
  const selectedList = useMemo(() => [current], [current]);
  const { list: menuList, viewMap } = useActionConfig();

  return (
    <>
      <Action
        view="sub.virtualization.data.storage"
        viewMap={viewMap}
        menuList={menuList}
        position="header"
        refetch={refetch}
        selectedList={selectedList}
      />
    </>
  );
};

export default DetailAction;
