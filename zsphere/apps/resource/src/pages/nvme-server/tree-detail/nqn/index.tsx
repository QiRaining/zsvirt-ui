import { useQuery } from "@apollo/client";
import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type { NvmeServer as INvmeServer } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { nvmeServerList } from "../../../../gql/nvme-server.gql";
import NvmeLunList from "../nvme-lun";
import Overview from "./overview";

interface IProps {
  uuid: string; // nvmeTargetUuid
  setVisible: (visible: boolean) => void;
}

const NvmeServerNqnDetail: React.FC<IProps> = ({ setVisible, uuid }) => {
  const intl = useIntl();

  const { loading, data, refetch } = useQuery(nvmeServerList, {
    variables: {
      conditions: [
        {
          key: "nvmeTarget.uuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    },
  });

  const current = useMemo<INvmeServer>(() => {
    return data?.nvmeServerList?.list?.[0] || { uuid };
  }, [data, uuid]);

  return (
    <AutoSkeleton name="nvme-server-nqn-detail" loading={loading}>
      {current ? (
        <div className="zsv-detail-container">
          <Tabs type="line" contentId="nvme-server-nqn-detail">
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
                nvmeTargetUuid={uuid}
              />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "lunDevice",
                defaultMessage: "LUN",
              })}
              key="nvme-lun"
            >
              <NvmeLunList current={{ uuid }} position="nvmeNqn" />
            </TabPane>
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
};

export default NvmeServerNqnDetail;
