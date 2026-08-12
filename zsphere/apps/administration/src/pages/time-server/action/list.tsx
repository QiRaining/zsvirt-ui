import { Action } from "@zstack/zsphere-components";
import type { TimeServerResult } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useMemo } from "react";

import { useActionConfig } from "../config";
import { useMnStatus } from "../hooks";

interface IProps {
  data?: TimeServerResult;
  refetch?: () => void;
}
const ActionList: FC<IProps> = ({ data, refetch }) => {
  const { mnAllRunning, mnStatusloading } = useMnStatus();

  const isNodeFailure = !mnAllRunning;
  const disabled = !mnAllRunning;
  const { list, viewMap } = useActionConfig();
  const memoizedSelectedList = useMemo(() => (data ? [data] : []), [data]);

  return (
    <Action
      view="main"
      position="header"
      menuList={list}
      viewMap={viewMap}
      selectedList={memoizedSelectedList}
      refetch={refetch}
      source={{ data, disabled, isNodeFailure, mnStatusloading }}
    />
  );
};

export default ActionList;
