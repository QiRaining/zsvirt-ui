import { Action } from "@zstack/zsphere-components";
import type { NvmeServer as INvmeServer } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import useActionConfig from "../config/useActionConfig";

interface IProps {
  current: INvmeServer;
  refetch: any;
}

const DetailAction: React.FC<IProps> = ({ current, refetch }) => {
  const selectedList = useMemo(() => [current], [current]);
  const { list: menuList, viewMap } = useActionConfig();

  return (
    <>
      <Action
        view="sub.virtualization.zone"
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
