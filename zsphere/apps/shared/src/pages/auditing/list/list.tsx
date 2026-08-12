import { gql } from "@apollo/client";
import { Spin } from "@zstack/design";
import { TableList, useTabs } from "@zstack/zsphere-components";
import { useGetMillionSeconds } from "@zstack/zsphere-hooks";
import type { IListProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Audit as IAudit } from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import { useMount, useUpdateEffect } from "ahooks";
import { merge } from "lodash-es";
import React, { useEffect, useCallback, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  useAuditColumnConfig as _useColumnConfig,
  useQueryConfig as _useQueryConfig,
} from "../config";
import Toolbar from "./toolbar";

const queryAuditList = gql`
  query queryAuditList(
    $start: Int
    $limit: Int
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $type: String
  ) {
    queryAuditList(
      start: $start
      limit: $limit
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
    ) {
      total
      list {
        operator
        requestUuid
        responseUuid
        apiName
        clientIp
        clientBrowser
        operatorAccountUuid
        operatorAccountName
        error
        isError
        duration
        resourceType
        time
        createTime
        requestDump
        responseDump
        resourceUuid
        isValid
        resourceName
        currentResourceName
        alarmZhName
      }
    }
  }
`;

const ONE_DAYS_SECONDS = 24 * 60 * 60 * 1000;

const THREE_DAYS_SECONDS = 3 * ONE_DAYS_SECONDS;
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
  const [view, setView] = useState(() =>
    isZsv ? `virtualization.${props.view}` : props.view,
  );
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
        return {
          ...v,
          extraConditions: (v.extraConditions || []).concat([
            {
              key: "startTime",
              op: Op.eq,
              value: String(
                MillionSeconds! -
                  (view === "sub" || isZsv
                    ? SEVEN_DAYS_SECONDS
                    : THREE_DAYS_SECONDS),
              ),
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

  const toolbar = useCallback(
    () => (
      <Toolbar
        isZsv={isZsv}
        refetchAll={refetchAll}
        query={query}
        setQuery={setQuery}
        view={isZsv ? view.slice(ZSV_VIEW_PREFIX_LENGTH) : view}
        setView={(val: string) => {
          setView(`virtualization.${val}`);
          onViewChange?.(val);
        }}
      />
    ),
    [query, view, isZsv, onViewChange],
  );

  const toolbarBtns = React.useMemo(() => {
    if (view === "sub" || view === "virtualization.sub") {
      return ["search"];
    }
    return ["search", "export"];
  }, [view]);

  if (!isInit) {
    return <Spin />;
  }

  return (
    <>
      <TableList
        toolbarHandleTooltip={toolbarHandleTooltip}
        {...props}
        type="Audit"
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
    </>
  );
};

export default React.memo(List);
