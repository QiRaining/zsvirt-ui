import { useQuery } from "@apollo/client";
import { iscsiServerList } from "@zstack/virtualization-resource/src/gql/iscsi-server.gql";
import IscsiLunList from "@zstack/virtualization-resource/src/pages/iscsi-server/tree-detail/iscsi-lun";
import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/iscsi-server/tree-detail/primary-storage";
import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import AuditList from "zsv_auditing/auditing-sub-list";

import Cluster from "./cluster";
import DetailAction from "./detail-action";
import Overview from "./overview";

const OVERVIEW_CONTAINER_STYLE = { marginTop: 8 } as const;

interface IProps {
  uuid: string;
  setVisible: Function;
}

const IscsiServerDetail: React.FC<IProps> = ({ setVisible, uuid }) => {
  const intl = useIntl();

  const { loading, data, refetch } = useQuery(iscsiServerList, {
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

  const current = useMemo<IIscsiServer>(() => {
    return data?.iscsiServerList?.list?.[0] || { uuid };
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
    <AutoSkeleton name="iscsi-server-detail" loading={loading}>
      {current ? (
        <div className="zsv-detail-container">
          <Tabs type="line" contentId="iscsi-server-detail">
            <TabPane
              tab={intl.formatMessage({
                id: "virtualization.overview",
                defaultMessage: "Overview",
              })}
              key="overview"
            >
              <DetailAction current={current} refetch={refetch} />
              <div style={OVERVIEW_CONTAINER_STYLE}>
                <Overview current={current} refetch={refetch} />
              </div>
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "lunDevice",
                defaultMessage: "LUN",
              })}
              key="iscsi-lun"
            >
              <IscsiLunList current={current} />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "virtualization.dataStorage",
                defaultMessage: "Data Storage",
              })}
              key="primary-storage"
            >
              <PrimaryStorageList current={current} />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "cluster",
                defaultMessage: "Cluster",
              })}
              key="cluster"
            >
              <Cluster current={current} />
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
