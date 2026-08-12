import { Action } from "@zstack/zsphere-components";
import type { IActionProps } from "@zstack/zsphere-types";
import type { AlarmHistories as IAlarmHistories } from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "../config/useActionConfig";

const ActionWrapper: React.FC<
  IActionProps<IAlarmHistories> & {
    getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  }
> = ({
  view,
  position,
  selectedList,
  setSelectedList,
  refetch,
  getPopupContainer,
}) => {
  const { list, viewMap, getItemName } = useActionConfig();

  return (
    <Action
      menuList={list}
      refetch={refetch}
      selectedList={selectedList}
      setSelectedList={setSelectedList as any}
      view={view}
      position={position}
      viewMap={viewMap}
      getItemName={getItemName}
      getPopupContainer={getPopupContainer}
    />
  );
};

export default ActionWrapper;
