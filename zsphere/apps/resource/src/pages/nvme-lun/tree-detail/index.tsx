import { useQuery } from "@apollo/client";
import { nvmeLunList } from "@zstack/virtualization-resource/src/gql/nvme-lun.gql";
import HostList from "@zstack/virtualization-resource/src/pages/host/list";
import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type { NVMeLun as INVMeLun } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import Overview from "./overview";

interface IProps {
  uuid: string;
  zoneUuid?: string;
  setVisible?: (visible: boolean) => void;
}

const NVMeLunDetail: React.FC<IProps> = ({ setVisible, uuid, zoneUuid }) => {
  const intl = useIntl();

  const { loading, data, refetch } = useQuery(nvmeLunList, {
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

  const current = useMemo<INVMeLun>(() => {
    return {
      ...data?.nvmeLunList?.list?.[0],
      zoneUuid,
    };
  }, [data, uuid, zoneUuid]);

  const defaultQueryHostList = useMemo(() => {
    return {
      conditions: [
        {
          key: "uuid",
          op: Op.in,
          values: current?.nvmeLunHostRefs?.map((it) => it.hostUuid!) || [],
        },
      ],
    };
  }, [current?.nvmeLunHostRefs]);

  return (
    <AutoSkeleton name="nvme-lun-detail" loading={loading}>
      {current?.uuid ? (
        <div className="zsv-detail-container">
          <Tabs type="line" contentId="nvme-lun-detail">
            <TabPane
              tab={intl.formatMessage({
                id: "virtualization.overview",
                defaultMessage: "Overview",
              })}
              key="overview"
            >
              <Overview current={current} refetch={refetch} />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "virtualization.host",
                defaultMessage: "Host",
              })}
              key="host"
            >
              <HostList
                view="sub.virtualization.nvmelun"
                defaultQuery={defaultQueryHostList}
                source={current}
              />
            </TabPane>
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
};

export default NVMeLunDetail;
