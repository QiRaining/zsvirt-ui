import { useQuery } from "@apollo/client";
import {
  AuthTabs,
  type AuthTabsListItem,
  AutoSkeleton,
} from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type { BaremetalChassisQueryResp as IBaremetalChassisQueryResp } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import AuditList from "zsv_auditing/auditing-sub-list";

import { baremetalChassisList } from "../../../gql/baremetal-chassis.gql";
import DiskList from "./disk";
import Header from "./header";
import NicList from "./nic";
import Overview from "./overview";

const BaremetalChassis: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const { loading, data, refetch } = useQuery<{
    baremetalChassisList: IBaremetalChassisQueryResp;
  }>(baremetalChassisList, {
    variables: { conditions: [{ key: "uuid", value: uuid }] },
  });

  const current = useMemo(() => {
    const { list = [] } = data?.baremetalChassisList || {};
    return list?.[0] || {};
  }, [data]);

  const defaultQuery = useMemo(
    () => ({
      conditions: [{ key: "resourceUuid", op: Op.eq, value: uuid }],
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
        label: intl.formatMessage({ id: "nic", defaultMessage: "NIC" }),
        value: "nic",
        content: () => (
          <NicList
            view="sub.baremetal.chassis"
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
              conditions: [{ key: "uuid", op: Op.eq, value: uuid }],
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
        value: "audit",
        auth: {
          type: "view" as const,
          authKey: "list",
          resource: "auditing",
        },
        content: () => <AuditList view="sub" defaultQuery={defaultQuery} />,
      },
    ],
    [intl, current, refetch, uuid, defaultQuery],
  );

  return (
    <AutoSkeleton name="baremetal-chassis-detail" loading={loading}>
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

export default BaremetalChassis;
