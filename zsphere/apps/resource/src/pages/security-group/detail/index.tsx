import { useQuery } from "@apollo/client";
import { securityGroupList } from "@zstack/virtualization-resource/src/gql/security-group.gql";
import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op, VmNicQueryType } from "@zstack/zsphere-types";
import type { SecurityGroup } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useReducer } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import AuditList from "zsv_auditing/auditing-sub-list";

import Header from "./header";
import Overview from "./overview";
import VmNicList from "./vm-nic/list";

export default function Detail() {
  const intl = useIntl();
  const [searchParams] = useSearchParams();

  const uuid = searchParams.get("uuid") || "";
  const zoneUuid = searchParams.get("zoneUuid") || undefined;

  const { loading, data, refetch } = useQuery<{
    securityGroupList: { list: SecurityGroup[] };
  }>(securityGroupList, {
    variables: {
      conditions: [{ key: "uuid", op: Op.eq, value: uuid }],
    },
  });

  const current = useMemo(() => {
    return data?.securityGroupList?.list?.[0] as SecurityGroup;
  }, [data]);

  const defaultQueryVmNic = useMemo(() => {
    return {
      type: VmNicQueryType.VmNicInSecurityGroup,
      extraConditions: [
        { key: "securityGroupUuid", op: Op.eq, value: current?.uuid },
      ],
    };
  }, [current?.uuid]);

  const defaultQueryAudit = useMemo(
    () => ({
      conditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    }),
    [uuid],
  );

  const [nicKey, updateKey] = useReducer((x) => x + 1, 1);
  useActionSubscribe({
    resourceTypeList: ["VmNic", "securityGroupRuleList"],
    onProgress: () => {
      updateKey();
      refetch?.();
    },
  });

  return (
    <AutoSkeleton name="security-group-detail" loading={loading}>
      {current ? (
        <div className="zsv-detail-container">
          <Header current={current} refetch={refetch} />
          <Tabs type="line">
            <TabPane
              tab={intl.formatMessage({
                id: "overview",
                defaultMessage: "Overview",
              })}
              key="overview"
            >
              <Overview current={current} refetch={refetch} />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "vm.vmNic",
                defaultMessage: "VM NIC",
              })}
              key="vmnic"
              destroyInactiveTabPane
            >
              <VmNicList
                view="sub.sg"
                key={nicKey}
                source={current}
                zoneUuid={zoneUuid}
                defaultQuery={defaultQueryVmNic}
              />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "audit",
                defaultMessage: "Event",
              })}
              key="auditing"
              auth={{
                type: "view",
                authKey: "list",
                resource: "auditing",
              }}
            >
              <AuditList view="sub" defaultQuery={defaultQueryAudit} />
            </TabPane>
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
}
