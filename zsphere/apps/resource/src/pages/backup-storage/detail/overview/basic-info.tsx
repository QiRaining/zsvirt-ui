import { useQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { getImageSummary } from "@zstack/virtualization-resource/src/gql/image.gql";
import { renderType } from "@zstack/virtualization-resource/src/pages/backup-storage/components/common";
import { DraggableCard, useAuth } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List, Constant } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { LongText, CopyableText } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op, BackupStorageType } from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import ModifyConfigModal from "../../action/modify-config";

interface IProps {
  detail: IBackupStorage;
  refetch: () => void;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  refetch,
  collapsed = false,
}) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const {
    uuid,
    state,
    status,
    type,
    dataNetwork,
    url,
    syncImageNetwork,
    hostname,
    username,
    sshPort,
    description,
    createDate,
  } = detail;
  const [imageCount, setImageCount] = useState(0);
  const [modifyModalVisible, setModifyModalVisible] = useState(false);

  const conditions = useMemo(() => {
    return {
      conditions: [
        {
          key: "backupStorage.uuid",
          op: Op.eq,
          value: uuid,
        },
        {
          key: "status",
          op: Op.ne,
          value: "Deleted",
        },
        {
          key: "__systemTag__",
          op: Op.ne,
          value: "remote",
        },
        {
          key: "system",
          op: Op.eq,
          value: "false",
        },
      ],
    };
  }, [uuid]);

  const { data: _summaryData, refetch: refetchImageCount } = useQuery(
    getImageSummary,
    {
      variables: conditions,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        setImageCount(data?.getImageSummary?.total);
      },
    },
  );

  useActionSubscribe({
    resourceTypeList: ["Image"],
    onFinish: () => {
      refetchImageCount?.();
    },
  });

  const { getServerTime } = useTime();

  const list: ListItem[] = useMemo(() => {
    const _list = [
      {
        label: intl.formatMessage({
          id: "enable.state",
          defaultMessage: "State",
        }),
        value: <Constant value={state as unknown as ConstantEnum} />,
      },
      {
        label: intl.formatMessage({
          id: "backupStorage.readyStatus",
          defaultMessage: "Status",
        }),
        value: <Constant value={status as unknown as ConstantEnum} />,
      },
      {
        label: intl.formatMessage({ id: "type", defaultMessage: "Type" }),
        value: renderType(type as BackupStorageType, intl),
      },
      {
        label: intl.formatMessage({
          id: "imageCount",
          defaultMessage: "Images",
        }),
        value: imageCount,
      },
      {
        label: intl.formatMessage({
          id: "dataNetwork",
          defaultMessage: "Data Network",
        }),
        value: dataNetwork || undefined,
      },
    ]
      .concat(
        type === BackupStorageType.ImageStoreBackupStorage
          ? [
              {
                label: intl.formatMessage({
                  id: "mountPath",
                  defaultMessage: "Mount Path",
                }),
                value: <Text>{url}</Text>,
              },
              {
                label: intl.formatMessage({
                  id: "imageSyncNetwork",
                  defaultMessage: "Image Sync Network",
                }),
                value: syncImageNetwork || undefined,
              },
              {
                label: intl.formatMessage({
                  id: "backupStorage.hostname",
                  defaultMessage: "Image Storage IP",
                }),
                value: <CopyableText>{hostname}</CopyableText>,
              },
              {
                label: intl.formatMessage({
                  id: "username",
                  defaultMessage: "Username",
                }),
                value: <Text>{username}</Text>,
              },
              {
                label: intl.formatMessage({
                  id: "sshPort",
                  defaultMessage: "SSH Port",
                }),
                value: <Text>{sshPort}</Text>,
              },
            ]
          : [],
      )
      .concat([
        {
          label: intl.formatMessage({
            id: "description",
            defaultMessage: "Description",
          }),
          value: <LongText value={description || undefined} />,
        },
        {
          label: intl.formatMessage({ id: "uuid", defaultMessage: "UUID" }),
          value: <CopyableText>{uuid}</CopyableText>,
        },
        {
          label: intl.formatMessage({
            id: "createTime",
            defaultMessage: "Creation Time",
          }),
          value: getServerTime(createDate!).format("YYYY-MM-DD HH:mm:ss"),
        },
        //  去除所有最后操作时间
        // {
        //   label: intl.formatMessage({ id: 'last.op.date', defaultMessage: '最后操作时间' }),
        //   value: getServerTime(lastOpDate!).format('YYYY-MM-DD HH:mm:ss')
        // }
      ]);
    return _list;
  }, [detail, intl, getServerTime, imageCount]);

  const selectedListDetail = useMemo(() => [detail], [detail]);

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
        titleActions={
          hasAuth({
            resource: "backup.storage",
            authKey: "modify.config",
            type: "action",
          })
            ? [
                {
                  icon: "edit",
                  tooltip: intl.formatMessage({
                    id: "edit.config",
                    defaultMessage: "Modify Configuration",
                  }),
                  onClick: () => setModifyModalVisible(true),
                },
              ]
            : []
        }
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      <ModifyConfigModal
        visible={modifyModalVisible}
        setVisible={setModifyModalVisible}
        selectedList={selectedListDetail}
        refetch={refetch}
      />
    </>
  );
};

export default BasicInfo;
