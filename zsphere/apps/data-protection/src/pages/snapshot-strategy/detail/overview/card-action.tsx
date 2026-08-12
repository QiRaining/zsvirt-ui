import { Action } from "@zstack/zsphere-components";
import type { SnapshotStrategy } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";

import useActionConfig from "../../config/useActionConfig";

import style from "./style.module.less";

export interface IProps {
  current?: SnapshotStrategy;
  actionKey: string;
}

export default function CardAction({ current, actionKey }: IProps) {
  const actionConfig = useActionConfig();
  const menuList = useMemo(() => {
    const config = actionConfig.list.find((item) => item.key === actionKey);
    if (config) {
      return [{ ...config, icon: "edit" as const }];
    }
    return [];
  }, [actionConfig, actionKey]);
  const viewMap = useMemo(() => {
    return {
      "main/row": {
        extraKeys: [actionKey],
        activeKeys: [],
      },
    };
  }, [actionKey]);

  return (
    <div className={style.extra}>
      <Action
        view="main"
        position="row"
        resource="snapshot.strategy"
        menuList={menuList}
        viewMap={viewMap}
        selectedList={current ? [current] : []}
      />
    </div>
  );
}
