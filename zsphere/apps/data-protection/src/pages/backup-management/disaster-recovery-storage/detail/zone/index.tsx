import { gql, useQuery } from "@apollo/client";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type {
  ZSVBackupStorage as IZSVBackupStorage,
  ZoneResponse,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { ZonePlainList } from "zsv_resource_shared/zone/mf-index";

import { useActionConfig, useColumnConfig } from "./config";

interface IProps {
  currentZoneUuid: string;
  current: IZSVBackupStorage;
  refetch: () => void;
}

const zoneList = gql`
  query zoneList($conditions: [Condition!], $start: Int, $limit: Int) {
    zoneList(
      conditions: $conditions
      start: $start
      limit: $limit
      replyWithCount: true
      sortDirection: asc
    ) {
      total
      list {
        clusterCount
        primaryStorageCount
        l2NetworkCount
        vmInstanceCount
        volumeCount
        uuid
        name
        description
        state
        isDefault
        createDate
      }
    }
  }
`;

const Zone: React.FC<IProps> = ({ current, currentZoneUuid }) => {
  const source: any = { current, currentZoneUuid };
  const { data, refetch } = useQuery<{ zoneList: ZoneResponse }>(zoneList, {
    variables: {
      conditions: [
        { key: "backupStorage.uuid", op: Op.eq, value: current.uuid },
      ],
    },
  });

  const columnConfig = useColumnConfig({ source: current });

  useActionSubscribe({
    resourceTypeList: ["RemoteBackupStorage", "Zone"],
    onFinish: () => refetch(),
  });

  const notInUuids = data?.zoneList?.list.map((t) => t.uuid) || [];

  if (notInUuids.length !== 0) {
    source.notInUuids = notInUuids;
  }

  return (
    <ZonePlainList
      source={source}
      actionConfig={useActionConfig()}
      columnConfig={columnConfig}
      view="sub.remoteserver"
      defaultQuery={{
        conditions: [
          { key: "backupStorage.uuid", op: Op.eq, value: current.uuid },
        ],
      }}
    />
  );
};

export default Zone;
