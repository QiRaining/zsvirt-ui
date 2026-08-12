import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { backupStorageList } from "@zstack/virtualization-resource/src/gql/backup-storage.gql";
import { ModalSelect } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { BackupStorageQueryType, Op } from "@zstack/zsphere-types";
import type {
  AttachBackupStorageToZonePayload,
  BackupStorage,
} from "@zstack/zsphere-types/graphql";
import { getGQL } from "@zstack/zsphere-utils";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import BSList from "../list";
import EnterSelectModal from "./enter-select-modal";

import styles from "./style.module.less";

const attachBackupStorageToZone = gql`
  mutation attachBackupStorageToZone($input: AttachBackupStorageToZoneInput!) {
    attachBackupStorageToZone(input: $input) {
      actionId
    }
  }
`;

const _backupStorageList = getGQL(backupStorageList, ["uuid", "name"]);

const CreatBackupStorage: React.FC<IActionWrapperProps<any>> = ({
  visible,
  setVisible,
  selectedList,
  source,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  // 控制检测弹框展示
  const [checkModalVisible, setCheckModalVisible] = useState<boolean>(false);
  // 控制新增镜像存储弹框展示
  const [enterSelectModalVisible, setEnterSelectModalVisible] =
    useState<boolean>(false);
  // 控制加载镜像存储弹框展示
  const [attachModalVisible, setAttachModalVisible] = useState<boolean>(false);

  // 以下是处理未加载zone的backupStorage,
  const notAttachedZoneBackupStorageDefaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "__systemTag__",
          op: Op.notIn,
          values: ["remote", "aliyun", "onlybackup", "remotebackup"],
        },
      ],
      type: BackupStorageQueryType.NotAttachedZoneBackupStorageList,
    };
  }, []);

  const [
    getNotAttachedZoneBackupStorageList,
    { data: _notAttachedZoneBackupStorageData },
  ] = useLazyQuery(_backupStorageList, {
    variables: notAttachedZoneBackupStorageDefaultQuery,
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
    onCompleted: (data) => {
      if (data?.backupStorageList?.list?.length > 0) {
        setCheckModalVisible(true);
      } else {
        setEnterSelectModalVisible(true);
      }
    },
    onError: () => {
      setEnterSelectModalVisible(true);
    },
  });

  useEffect(() => {
    if (visible) {
      getNotAttachedZoneBackupStorageList();
    }
  }, [visible]);

  const attachBackupStorageToCurrentZone = (values: BackupStorage[]) => {
    const currentZone = selectedList?.[0] || source;
    const payload: AttachBackupStorageToZonePayload[] = values?.map((item) => {
      return {
        backupStorageUuid: item.uuid,
        zoneUuid: currentZone?.uuid,
      };
    });

    doAction({
      mutation: attachBackupStorageToZone,
      payload,
      name: intl.formatMessage({
        id: "attach.backupStorage.to.zone",
        defaultMessage: "Attach Image Storage to Current Data Center",
      }),
      total: values?.length,
      type: "BackupStorage",
      onFinish: () => {
        refetch?.();
      },
    });
    setAttachModalVisible(false);
    setCheckModalVisible(false);
    setVisible(false);
  };

  return visible ? (
    <>
      {/* 检测存在未挂载数据中心的镜像存储 */}
      <DialogBase
        title={String(
          intl.formatMessage({
            id: "backupStorage.title.modal.has.backupStorage.not.attated.zone.alert",
            defaultMessage:
              "Some image storage are not attached to a data center. Do you want to attach the image storage to the current data center?",
          }),
        )}
        visible={checkModalVisible}
        setVisible={setCheckModalVisible}
        footer={
          <>
            <Button
              onClick={() => {
                setCheckModalVisible(false);
                setEnterSelectModalVisible(false);
                setAttachModalVisible(false);
                setVisible(false);
              }}
              variant="link"
            >
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setCheckModalVisible(false);
                setEnterSelectModalVisible(true);
                setVisible(true);
              }}
            >
              {intl.formatMessage({
                id: "add.new.backupStorage",
                defaultMessage: "Add New Image Storage",
              })}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setCheckModalVisible(false);
                setAttachModalVisible(true);
                setVisible(true);
              }}
            >
              {intl.formatMessage({ id: "attach", defaultMessage: "Attach" })}
            </Button>
          </>
        }
      >
        <></>
      </DialogBase>

      {/* 新增镜像存储 */}
      <EnterSelectModal
        visible={enterSelectModalVisible}
        setVisible={setEnterSelectModalVisible}
        onCancel={() => {
          setEnterSelectModalVisible(false);
          setVisible(false);
        }}
        view=""
        selectedList={selectedList || []}
        position="header"
        source={selectedList?.[0] || source}
      />

      <ModalSelect
        title={intl.formatMessage({
          id: "backupStorage.modal.title.select.backupStorage",
          defaultMessage: "Select Image Storage",
        })}
        visible={attachModalVisible}
        setVisible={setAttachModalVisible}
        destroyOnClose
        showSelect={false}
        selectType="checkbox"
        onCancel={() => {
          setAttachModalVisible(false);
          setCheckModalVisible(false);
          setVisible(false);
        }}
        onOk={attachBackupStorageToCurrentZone}
      >
        <BSList
          view="select"
          defaultQuery={notAttachedZoneBackupStorageDefaultQuery}
        />
      </ModalSelect>
    </>
  ) : null;
};

export default CreatBackupStorage;
