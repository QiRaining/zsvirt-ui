import { gql, useQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import type { ListItem } from "@zstack/zsphere-components";
import { List, ResourceName, DraggableCard } from "@zstack/zsphere-components";
import { LeftNavType } from "@zstack/zsphere-types";
import type { ZSVBackupStorage as IZSVBackupStorage } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

export interface IProps {
  detail: IZSVBackupStorage;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const getZoneList = gql`
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

const ConfigInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();

  const { data: zoneListData } = useQuery(getZoneList, {
    fetchPolicy: "no-cache",
    variables: {
      conditions: [
        {
          key: "uuid",
          value: detail?.attachedZoneRefUuids?.[0],
        },
      ],
    },
  });

  const currentZoneName = zoneListData?.zoneList?.list?.[0]?.name;

  const resourceNameProps = {
    value: currentZoneName,
    link: {
      uuid: detail?.attachedZoneRefUuids?.[0],
      to: "/zone",
      microAppName: "virtualization-resource",
      leftnav: LeftNavType.ClusterHost,
      keepState: false,
    },
  };

  const list = React.useMemo<Array<ListItem>>(() => {
    const itemList: Array<ListItem> = [
      {
        label: intl.formatMessage({
          id: "backupStorage.ip",
          defaultMessage: "Backup Storage IP",
        }),
        value: <Text>{detail.hostname}</Text>,
      },
      {
        label: intl.formatMessage({
          id: "ssh.port",
          defaultMessage: "SSH Port",
        }),
        value: <Text>{detail.sshPort}</Text>,
      },
      {
        label: intl.formatMessage({
          id: "username",
          defaultMessage: "Username",
        }),
        value: <Text>{detail.username}</Text>,
      },
      // {
      //   label: intl.formatMessage({
      //     id: 'backup.mode',
      //     defaultMessage: '存储方式'
      //   }),
      //   value: 'todo'
      // },
      // {
      //   label: intl.formatMessage({
      //     id: 'free.drive',
      //     defaultMessage: '空闲硬盘'
      //   }),
      //   value: 'todo'
      // },
      {
        label: intl.formatMessage({
          id: "backupStorage.url",
          defaultMessage: "Backup Storage Path",
        }),
        value: <Text>{detail.url}</Text>,
      },
      {
        label: intl.formatMessage({
          id: "backupStorage.network",
          defaultMessage: "Backup Network",
        }),
        value: <Text>{detail.cidr}</Text>,
      },
      {
        label: intl.formatMessage({
          id: "zone",
          defaultMessage: "Data Center",
        }),
        value: <ResourceName {...resourceNameProps} />,
      },
    ];
    if (detail.backupStorageType === "remotebackup") {
      itemList.pop();
    }
    return itemList;
  }, [intl, detail, resourceNameProps]);

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "config.info",
          defaultMessage: "Configurations",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
    </>
  );
};

export default ConfigInfo;
