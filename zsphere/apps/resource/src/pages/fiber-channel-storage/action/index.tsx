import type { IActionProps } from "@zstack/zsphere-components";
import { Action } from "@zstack/zsphere-components";
import type { IActionProps as IProps } from "@zstack/zsphere-types";
import type { FiberChannelStorage as IFiberChannelStorage } from "@zstack/zsphere-types/graphql";
import React from "react";

const menuList: IActionProps<IFiberChannelStorage>["menuList"] = [
  {
    key: "attach",
    name: "加载",
  },
  {
    key: "detach",
    name: "卸载",
  },
];

const FiberChannelStorageAction: React.FC<IProps<IFiberChannelStorage>> = ({
  view,
  selectedList,
  setSelectedList,
  refetch,
}) => {
  return (
    <>
      <Action
        view={view}
        refetch={refetch}
        menuList={menuList}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
      />
    </>
  );
};

export default FiberChannelStorageAction;
