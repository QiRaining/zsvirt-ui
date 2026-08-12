import { useQuery } from "@apollo/client";
import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { ClusterQueryType, Op } from "@zstack/zsphere-types";
import type { NvmeServer as INvmeServer } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import AuditList from "zsv_auditing/auditing-sub-list";

import { nvmeServerList } from "../../../gql/nvme-server.gql";
import ClusterList from "../../cluster/list";
import DetailAction from "./detail-action";
import NvmeLunList from "./nvme-lun";
import Overview from "./overview";
import PrimaryStorageList from "./primary-storage";

interface IProps {
  uuid: string; //nvme server uuid
  setVisible: (visible: boolean) => void;
}

const NvmeServerDetail: React.FC<IProps> = ({ setVisible, uuid }) => {
  const intl = useIntl();

  const { loading, data, refetch } = useQuery(nvmeServerList, {
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

  const current = useMemo<INvmeServer>(() => {
    return data?.nvmeServerList?.list?.[0] || { uuid };
  }, [data, uuid]);

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

  useActionSubscribe({
    resourceTypeList: ["NvmeServer"],
    onFinish: () => {
      refetch?.();
    },
  });

  const clusterDefaultQuery = useMemo(
    () => ({
      type: ClusterQueryType.GetClusterByNvmeServer,
      conditions: [
        {
          key: "hypervisorType",
          op: Op.eq,
          value: "KVM",
        },
        {
          key: "uuid",
          op: Op.in,
          values:
            (current?.nvmeClusterRefs?.map(
              (cv) => cv?.clusterUuid,
            ) as string[]) || [],
        },
      ],
      extraConditions: [
        {
          key: "nvmeServerUuid",
          op: Op.eq,
          value: current.uuid,
        },
      ],
    }),
    [current?.uuid, current?.nvmeClusterRefs],
  );

  return (
    <AutoSkeleton name="nvme-server-detail" loading={loading}>
      {current ? (
        <div className="zsv-detail-container">
          <Tabs type="line" contentId="nvme-server-storage-detail">
            <TabPane
              tab={intl.formatMessage({
                id: "virtualization.overview",
                defaultMessage: "Overview",
              })}
              key="overview"
            >
              <DetailAction current={current} refetch={refetch} />
              <div style={{ marginTop: 8 }}>
                <Overview current={current} refetch={refetch} />
              </div>
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "lunDevice",
                defaultMessage: "LUN",
              })}
              key="nvme-lun"
            >
              <NvmeLunList current={current} position="nvmeServer" />
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
                id: "virtualization.cluster",
                defaultMessage: "Cluster",
              })}
              key="cluster"
            >
              <ClusterList
                view="sub.virtualization.nvme"
                source={current}
                defaultQuery={clusterDefaultQuery}
              />
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

export default NvmeServerDetail;
