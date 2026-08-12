import { useActionConfig } from "@zstack/virtualization-resource/src/pages/iscsi-lun/config";
import { Action } from "@zstack/zsphere-components";
import type { IscsiLun as IIscsiLun } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

interface IProps {
  current: IIscsiLun;
  refetch: any;
}

const DetailAction: React.FC<IProps> = ({ current, refetch }) => {
  const selectedList = useMemo(() => [current], [current]);
  const { list: menuList, viewMap } = useActionConfig();

  return (
    <>
      <Action
        view="sub.virtualization.iqn"
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
