import { useQuery } from "@apollo/client";
import {
  AuthTabs,
  type AuthTabsListItem,
  AutoSkeleton,
} from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import ZWatchAlarmInDetailTab from "zsv_shared/zwatch-alarm/alarm-tab";

import { baremetalInstance } from "../../../gql/baremetal-instance.gql";
import Audit from "./audit";
import DiskList from "./disk";
import Header from "./header";
import Monitoring from "./monitoring";
import NicList from "./nic";
import Overview from "./overview";

const BaremetalInstanceDetail: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const {
    loading,
    data,
    refetch: baremetalRefetch,
  } = useQuery(baremetalInstance, {
    fetchPolicy: "cache-and-network",
    variables: {
      uuid,
    },
  });

  const refetch = () => {
    baremetalRefetch();
  };
  const current = data?.baremetalInstance || {};

  useActionSubscribe({
    resourceTypeList: ["Tag"],
    onFinish: () => {
      refetch();
    },
  });

  const zWatchAlarmDefaultQuery = useMemo(
    () => ({
      extraConditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    }),
    [uuid],
  );

  const tabsList: AuthTabsListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
        value: "overview",
        content: () => <Overview current={current} refetch={refetch} />,
      },
      {
        label: intl.formatMessage({ id: "monitor", defaultMessage: "Monitoring" }),
        value: "monitoring",
        content: () => <Monitoring uuid={uuid} />,
      },
      {
        label: intl.formatMessage({ id: "nic", defaultMessage: "NIC" }),
        value: "nic",
        content: () => (
          <NicList
            view="main"
            defaultQuery={{
              conditions: [{ key: "uuid", op: Op.eq, value: uuid }],
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({ id: "disk", defaultMessage: "Disk" }),
        value: "disk",
        content: () => (
          <DiskList
            view="main"
            defaultQuery={{
              conditions: [
                { key: "chassisUuid", op: Op.eq, value: current?.chassisUuid },
              ],
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "alarm.tabName",
          defaultMessage: "Alarm",
        }),
        value: "zwatch.alarm",
        content: () => (
          <ZWatchAlarmInDetailTab
            source={current}
            view="sub.vm.instance"
            defaultQuery={zWatchAlarmDefaultQuery}
            nameSpace="ZStack/BaremetalVM"
          />
        ),
      },
      {
        label: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
        value: "audit",
        auth: {
          type: "view" as const,
          resource: "auditing",
          authKey: "list",
        },
        content: () => <Audit current={current} />,
      },
    ],
    [intl, current, refetch, uuid, zWatchAlarmDefaultQuery],
  );

  return (
    <AutoSkeleton name="baremetal-instance-detail" loading={loading}>
      {current?.uuid ? (
        <div className="main-list">
          <Header current={current} refetch={refetch} />
          <AuthTabs
            variant="line"
            tabsList={tabsList}
            contentId="main-tab"
            rootClassName="flex flex-col flex-1"
            listClassName="pl-6"
            contentClassName="p-6 flex-1 flex min-w-0 flex-col"
          />
        </div>
      ) : null}
    </AutoSkeleton>
  );
};

export default React.memo(BaremetalInstanceDetail);
