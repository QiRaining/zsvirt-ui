import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import { Op } from "@zstack/zsphere-types";
import type { FC } from "react";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { useColumnConfig, useQueryConfig } from "./config";

import styles from "./style.module.less";

interface IProps {
  uuid: string;
  snapshotType?: string;
}

const queryVolumeSnapshotList = gql`
  query queryVolumeSnapshotList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    volumeSnapshotList(
      start: $start
      limit: $limit
      conditions: $conditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        description
        volumeUuid
        volumeType
        size
        state
        status
        type
        groupUuid
        format
        primaryStorageInstallPath
        primaryStorageUuid
        createDate
        lastOpDate
        latest
        current
        actualSize
        primaryStorage {
          type
        }
        volume {
          uuid
          size
          name
          rootImageUuid
          diskOfferingUuid
          primaryStorage {
            uuid
            type
            name
          }
          vmInstanceUuid
          isShareable
          vmInstance {
            uuid
            name
            state
            type
            zoneUuid
          }
        }
        snapshotType
        group {
          uuid
          name
          description
          snapshotCount
          totalSize
          vmInstanceUuid
          vmInstance {
            uuid
            name
            state
            type
            rootVolumeUuid
            attachedShareableVolumeUuidList
            haveScsiLun
            zoneUuid
            allVolumes {
              uuid
              lastAttachDate
              isShareable
            }
            primaryStorage {
              type
            }
            host {
              uuid
              name
              state
              status
              clusterUuid
            }
          }
          volumeSnapshotRefs {
            volumeName
            volumeUuid
            volumeType
            volumeLastAttachDate
            volumeSnapshotUuid
          }
          snapshotType
          createDate
          lastOpDate
        }
      }
    }
  }
`;

const List: FC<IProps> = ({ uuid, snapshotType }) => {
  const intl = useIntl();

  const defaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: snapshotType === "Group" ? "groupUuid" : "uuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    };
  }, [snapshotType, uuid]);
  const columnConfig = useColumnConfig();
  const queryConfig = useQueryConfig(defaultQuery);

  return (
    <div className={styles["information-content"]}>
      <div className={styles.title}>
        {intl.formatMessage({
          id: "snapshot.information",
          defaultMessage: "Snapshot Info",
        })}
      </div>
      <TableList
        columnConfig={columnConfig}
        queryConfig={queryConfig}
        gql={queryVolumeSnapshotList}
        type="snapshotList"
        view="main"
        fetchPolicy="no-cache"
        rowSelection={false}
        toolbar={["refresh", "search"]}
        defaultQuery={defaultQuery}
        resource="snapshot"
      />
    </div>
  );
};

export default List;
