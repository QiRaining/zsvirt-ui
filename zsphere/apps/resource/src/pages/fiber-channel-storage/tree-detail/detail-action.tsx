import { useActionConfig } from "@zstack/virtualization-resource/src/pages/fiber-channel-storage/config";
import { Action } from "@zstack/zsphere-components";
import type { FiberChannelStorage as IFiberChannelStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

interface IProps {
  current: IFiberChannelStorage;
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
