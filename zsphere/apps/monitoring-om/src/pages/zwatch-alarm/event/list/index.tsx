import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { ZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import { mergeWith } from "lodash-es";
import React, { useMemo } from "react";

import { zwatchAlarmList } from "../../../../gql/zwatch-alarm.gql";
import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

import style from "./style.module.less";

export default (props: IListProps<ZWatchAlarmVO>) => {
  const columnConfig = useColumnConfig();
  const actionConfig = useActionConfig();
  const queryConfig = useQueryConfig(props.defaultQuery);

  const defaultQuery = useMemo(() => {
    return mergeWith({}, props.defaultQuery, (objValue, srcValue) => {
      if (Array.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    });
  }, [props.defaultQuery]);

  return (
    <div className={style.eventTable}>
      <TableList
        columnConfig={columnConfig}
        actionConfig={actionConfig}
        queryConfig={queryConfig}
        gql={zwatchAlarmList}
        type="ZWatchAlarmVO"
        resource="zwatch.alarm.event"
        {...props}
        defaultQuery={defaultQuery}
      />
    </div>
  );
};
