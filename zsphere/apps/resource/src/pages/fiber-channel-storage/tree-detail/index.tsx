import { useQuery } from "@apollo/client";
import { fiberChannelStorageList } from "@zstack/virtualization-resource/src/gql/fiber-channel-storage.gql";
import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type { FiberChannelStorage as IFiberChannelStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import AuditList from "zsv_auditing/auditing-sub-list";

import DetailAction from "./detail-action";
import FcLunList from "./fc-lun";
import Overview from "./overview";
import PrimaryStorageList from "./primary-storage";

const DETAIL_CONTENT_STYLE = { marginTop: 8 } as const;

interface IProps {
  uuid: string;
  setVisible: Function;
}

const FiberChannelStorageDetail: React.FC<IProps> = ({ setVisible, uuid }) => {
  const intl = useIntl();

  const { loading, data, refetch } = useQuery(fiberChannelStorageList, {
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

  const current = useMemo<IFiberChannelStorage>(() => {
    return data?.fiberChannelStorageList?.list?.[0] || { uuid };
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
    <AutoSkeleton name="fiber-channel-storage-detail" loading={loading}>
      {current ? (
        <div className="zsv-detail-container">
          <Tabs type="line" contentId="fiber-channel-storage-detail">
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
              tab={intl.formatMessage({
                id: "lunDevice",
                defaultMessage: "LUN",
              })}
              key="fc-lun"
            >
              <FcLunList current={current} />
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

export default FiberChannelStorageDetail;
