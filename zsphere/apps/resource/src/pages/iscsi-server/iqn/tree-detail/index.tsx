import { useQuery } from "@apollo/client";
import { iscsiServerList } from "@zstack/virtualization-resource/src/gql/iscsi-server.gql";
import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import IscsiLunList from "./iscsi-lun";
import Overview from "./overview";

interface IProps {
  uuid: string; // iscsiTargetUuid
  setVisible: Function;
}

const IscsiServerDetail: React.FC<IProps> = ({ setVisible, uuid }) => {
  const intl = useIntl();

  const { loading, data, refetch } = useQuery(iscsiServerList, {
    variables: {
      conditions: [
        {
          key: "iscsiTarget.uuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    },
  });

  const current = useMemo<IIscsiServer>(() => {
    return data?.iscsiServerList?.list?.[0] || { uuid };
  }, [data]);

  return (
    <AutoSkeleton name="iscsi-iqn-detail" loading={loading}>
      {current ? (
        <div className="zsv-detail-container">
          <Tabs type="line" contentId="iscsi-server-iqn-detail">
            <TabPane
              tab={intl.formatMessage({
                id: "virtualization.overview",
                defaultMessage: "Overview",
              })}
              key="overview"
            >
              <Overview
                current={current}
                refetch={refetch}
                iscsiTargetUuid={uuid}
              />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "lunDevice",
                defaultMessage: "LUN",
              })}
              key="iscsi-lun"
            >
              <IscsiLunList current={{ uuid }} />
            </TabPane>
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
};

export default IscsiServerDetail;
