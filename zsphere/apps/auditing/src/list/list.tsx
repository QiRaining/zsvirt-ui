import { TableList, useTabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import type { IListProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Audit as IAudit } from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import { useMount, useUpdateEffect } from "ahooks";
import { merge } from "lodash-es";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  useColumnConfig as _useColumnConfig,
  useQueryConfig as _useQueryConfig,
} from "../config-from-origin";
import { queryAuditList } from "../gql/audit.gql";
import Toolbar from "./toolbar";
import useGetMillionSeconds from "./useGetMillionSeconds";

const ONE_DAYS_SECONDS = 24 * 60 * 60 * 1000;

const SEVEN_DAYS_SECONDS = 7 * ONE_DAYS_SECONDS;

const ZSV_VIEW_PREFIX_LENGTH = "virtualization.".length;

const List: React.FC<
  IListProps<IAudit> & {
    isZsv?: boolean;
    onViewChange?: (view: string) => void;
  }
> = ({
  useColumnConfig = _useColumnConfig,
  useQueryConfig = _useQueryConfig,
  isZsv,
  onViewChange,
  ...props
}) => {
  const intl = useIntl();
  const { equal: isInAuditTab } = useTabs();
  const [view, setView] = useState(() => `virtualization.${props.view}`);
  const columnConfig = useColumnConfig(view);
  const { MillionSeconds, getMillionSeconds } = useGetMillionSeconds();

  const [query, setQuery] = useState<IQuery>(() =>
    merge({}, props?.defaultQuery, {
      start: 0,
      limit: 20,
      extraConditions: [
        {
          key: "auditType",
          value:
            view === "main.login" || view === "virtualization.main.login"
              ? "Login"
              : "Resource",
          op: Op.eq,
        },
      ],
    }),
  );
  const queryConfig = useQueryConfig({ view, defaultQuery: query });

  useUpdateEffect(() => {
    if (isInAuditTab) {
      getMillionSeconds();
    }
  }, [isInAuditTab]);

  const refetchAll = (newQuery: IQuery) => {
    setQuery(merge({}, newQuery, { type: genUuid() }));
  };

  const toolbarHandleTooltip = (
    <ReactMarkdown>
      {intl.formatMessage({
        id: "auditing.tab.auditing.tooltip",
        defaultMessage: `### Event

By default, all event records on the platform are displayed. If you have customized the event retention period in system parameters, only events within that retention period will be displayed here.`,
      })}
    </ReactMarkdown>
  );

  const [isInit, setInit] = useState<boolean>(false);

  useMount(() => {
    getMillionSeconds();
  });

  // for zsv, use react-router to cache the component, so the data needs to be refreshed when query is changed.
  useEffect(() => {
    if (isZsv && props.defaultQuery) {
      refetchAll({
        conditions: props.defaultQuery.conditions,
        extraConditions: query.extraConditions,
      });
    }
  }, [props.defaultQuery]);

  useEffect(() => {
    if (!isInit && MillionSeconds) {
      setQuery((v) => {
        const timeOffset =
          view === "sub" || view === "virtualization.sub"
            ? ONE_DAYS_SECONDS
            : SEVEN_DAYS_SECONDS;

        return {
          ...v,
          extraConditions: (v.extraConditions || []).concat([
            {
              key: "startTime",
              op: Op.eq,
              value: String(MillionSeconds - timeOffset),
            },
            {
              key: "endTime",
              op: Op.eq,
              value: String(MillionSeconds),
            },
          ]),
        };
      });
      setInit(true);
    }
  }, [MillionSeconds, isInit, view]);

  const toolbar = useMemo(() => {
    return () => (
      <Toolbar
        isZsv={true}
        refetchAll={refetchAll}
        query={query}
        setQuery={setQuery}
        view={view.slice(ZSV_VIEW_PREFIX_LENGTH)}
        setView={(val: string) => {
          setView(`virtualization.${val}`);
          onViewChange?.(val);
        }}
      />
    );
  }, [query, view, onViewChange]);

  const toolbarBtns = React.useMemo(() => {
    if (view === "sub" || view === "virtualization.sub") {
      return ["search"];
    }
    return ["search", "export"];
  }, [view]);

  return (
    <AutoSkeleton name="auditing-list" loading={!isInit}>
      <TableList
        toolbarHandleTooltip={toolbarHandleTooltip}
        {...props}
        type="Audit"
        rowKey="requestUuid"
        rowSelection={false}
        defaultQuery={query}
        renderMiddleToolbar={toolbar}
        fetchPolicy="network-only"
        toolbar={toolbarBtns as any}
        gql={queryAuditList}
        resource="auditing"
        columnConfig={columnConfig}
        queryConfig={queryConfig}
        view={view}
        allGqlKeysWhenExport
      />
    </AutoSkeleton>
  );
};

export default React.memo(List);
