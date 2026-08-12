import { useQuery } from "@apollo/client";
import { TabPane, Tabs } from "@zstack/zsphere-components";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  ZSVBackupStorageQueryResp,
  ZSVBackupStorageSystemTagsQueryResp,
} from "@zstack/zsphere-types/graphql";
import qs from "qs";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";

import {
  ZSVBackupStorageList,
  ZSVBackupStorageSystemTagsList,
} from "../../../../gql/disaster-recovery-storage.gql";
import AuditList from "./audit";
import DatebaseBackup from "./datebase-backup";
import Header from "./header";
import Monitoring from "./monitoring";
import Overview from "./overview";
import VmBackup from "./vm-backup";
import ZoneList from "./zone";

interface IProps {
  location: Location;
}

const Detail: React.FC<IProps> = () => {
  const intl = useIntl();

  const { uuid = "", zoneUuid } = qs.parse(useLocation().search, {
    ignoreQueryPrefix: true,
  });

  const { data, refetch } = useQuery<
    { ZSVBackupStorageList: ZSVBackupStorageQueryResp },
    IQuery
  >(ZSVBackupStorageList, {
    variables: {
      conditions: [
        {
          key: "uuid",
          op: Op.eq,
          value: uuid as string,
        },
      ],
    },
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
  });

  const { data: tagData } = useQuery<
    { ZSVBackupStorageSystemTagsList: ZSVBackupStorageSystemTagsQueryResp },
    IQuery
  >(ZSVBackupStorageSystemTagsList, {
    variables: {
      conditions: [
        {
          key: "resourceUuid",
          value: uuid as string,
        },
        {
          key: "tag",
          op: Op.like,
          value: "backup::network::cidr::",
        },
      ],
      fields: ["tag"],
    },
  });

  const current = useMemo(() => {
    const tagInfo = tagData?.ZSVBackupStorageSystemTagsList?.list?.[0];

    return {
      ...(data?.ZSVBackupStorageList?.list?.[0] ?? ({} as any)),
      cidr: tagInfo ? tagInfo.tag?.split("cidr::")[1] : undefined,
    };
  }, [data, tagData]);

  const isRemoteBackupStorage =
    data?.ZSVBackupStorageList?.list?.[0]?.backupStorageType === "remotebackup";

  return (
    <div className="zsv-detail-container">
      <Header current={current} refetch={refetch} />
      <Tabs type="line">
        <TabPane
          tab={intl.formatMessage({
            id: "virtualization.overview",
            defaultMessage: "Overview",
          })}
          key="overview"
        >
          <Overview current={current!} refetch={refetch} />
        </TabPane>

        {!isRemoteBackupStorage && (
          <TabPane
            tab={intl.formatMessage({ id: "monitor", defaultMessage: "Monitoring" })}
            key="monitoring"
          >
            <Monitoring uuid={uuid as string} />
          </TabPane>
        )}

        <TabPane
          style={{ padding: 0 }}
          tab={intl.formatMessage({
            id: "vm.backup",
            defaultMessage: "Virtual Machine Backup",
          })}
          key="vmBackup"
        >
          <VmBackup current={current!} />
        </TabPane>
        <TabPane
          tab={intl.formatMessage({
            id: "datebase.backup",
            defaultMessage: "Platform Database Backup",
          })}
          key="datebaseBackup"
        >
          <DatebaseBackup current={current!} />
        </TabPane>

        {isRemoteBackupStorage && (
          <TabPane
            tab={intl.formatMessage({ id: "zone", defaultMessage: "Data Center" })}
            key="zone"
          >
            <ZoneList
              currentZoneUuid={zoneUuid! as string}
              current={current!}
              refetch={refetch}
            />
          </TabPane>
        )}

        <TabPane
          tab={intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
          key="auditing"
          auth={{
            type: "view",
            authKey: "list",
            resource: "auditing",
          }}
        >
          <AuditList current={current} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Detail;
