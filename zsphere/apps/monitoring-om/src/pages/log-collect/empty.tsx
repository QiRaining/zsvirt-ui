import { Empty, Action } from "@zstack/zsphere-components";
import type { LogCollect } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { useActionConfig } from "./config";

import style from "./style.module.less";

interface IProps {
  list: LogCollect[];
  setInterval: (interval: number | null) => void;
  refetch: () => void;
}

const EmptyCard: React.FC<IProps> = ({ list, setInterval, refetch }) => {
  const intl = useIntl();

  const { list: menuList, viewMap } = useActionConfig();

  return (
    <div className={style["empty-card"]}>
      <div className="flex flex-col items-center gap-[20px]">
        <Empty
          type="Table"
          description={intl.formatMessage({
            id: "common.no.data",
            defaultMessage: "No Data",
          })}
        />
        <Action
          menuList={menuList}
          viewMap={viewMap}
          selectedList={list}
          refetch={refetch}
          view="virtualization.main"
          position="header"
          source={{ setInterval }}
        />
      </div>
    </div>
  );
};

export default EmptyCard;
