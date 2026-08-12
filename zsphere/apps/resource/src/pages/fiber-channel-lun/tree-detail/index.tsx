import { useQuery } from "@apollo/client";
import { fiberChannelLunList } from "@zstack/virtualization-resource/src/gql/fiber-channel-lun.gql";
import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type { FiberChannelLun as IFiberChannelLun } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import AuditList from "zsv_auditing/auditing-sub-list";

import DetailAction from "./detail-action";
import HostList from "./host";
import Overview from "./overview";
import VMList from "./vm";

const DETAIL_CONTENT_STYLE = { marginTop: 8 } as const;

interface IProps {
  uuid: string;
  setVisible: Function;
}

const IscsiServerDetail: React.FC<IProps> = ({ setVisible, uuid }) => {
  const intl = useIntl();

  const { loading, data, refetch } = useQuery(fiberChannelLunList, {
    variables: {
      conditions: [
        {
          key: "uuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    },
  });

  const current = useMemo<IFiberChannelLun>(() => {
    return data?.fiberChannelLunList?.list?.[0] || { uuid };
  }, [data]);

  const defaultQuery = useMemo(
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

  return (
    <AutoSkeleton name="fiber-channel-lun-detail" loading={loading}>
      {current ? (
        <div className="zsv-detail-container">
          <Tabs type="line" contentId="fiber-channel-lun-detail">
            <TabPane
              tab={intl.formatMessage({
                id: "virtualization.overview",
                defaultMessage: "Overview",
              })}
              key="overview"
            >
              <DetailAction current={current} refetch={refetch} />
              <div style={DETAIL_CONTENT_STYLE}>
                <Overview current={current} refetch={refetch} />
              </div>
            </TabPane>
            <TabPane
              tab={intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })}
              key="vm"
            >
              <VMList current={current} />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({ id: "host", defaultMessage: "Host" })}
              key="host"
            >
              <HostList current={current} />
            </TabPane>

            <TabPane
              tab={intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
              key="auditing"
              auth={{
                type: "view",
                authKey: "list",
                resource: "auditing",
              }}
            >
              <AuditList view="sub" defaultQuery={defaultQuery} />
            </TabPane>
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
};

export default IscsiServerDetail;
