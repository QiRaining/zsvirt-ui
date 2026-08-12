import { gql, useQuery } from "@apollo/client";
import { resourceConfigList } from "@zstack/virtualization-resource/src/gql/resource-config.gql";
import { DraggableCard, List, useAuth } from "@zstack/zsphere-components";
import { useAction, useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import {
  bus,
  formatBytesToSize,
  formatResourceName,
  parseNumber,
} from "@zstack/zsphere-utils";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import ModifySetting from "../../action/edit-advance-setting";

interface IProps {
  detail: IBackupStorage;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const _batchUpdateResourceConfig = gql`
  mutation batchUpdateResourceConfig($input: BatchUpdateResourceConfigInput!) {
    batchUpdateResourceConfig(input: $input) {
      actionId
    }
  }
`;

const Settings: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const { hasAuth } = useAuth();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState({} as any);

  const { refetch } = useQuery(resourceConfigList, {
    variables: {
      conditions: [
        {
          key: "categoryList",
          values: ["backupStorage", "imagestore"],
          op: Op.in,
        },
        {
          key: "nameList",
          values: [
            "reservedCapacity",
            "blob.upload.concurrency",
            "blob.download.concurrency",
          ],
          op: Op.in,
        },
        {
          key: "resourceUuid",
          value: detail?.uuid,
          op: Op.eq,
        },
      ],
    },
    errorPolicy: "ignore",
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      const _configList = data?.resourceConfigList?.list;
      let reservedCapacity = _configList
        ?.find(
          (it: any) =>
            it?.category === "backupStorage" && it.name === "reservedCapacity",
        )
        ?.value?.toString();
      const blobUploadConcurrency = _configList?.find(
        (it: any) =>
          it?.category === "imagestore" &&
          it.name === "blob.upload.concurrency",
      )?.value;
      const blobDownloadConcurrency = _configList?.find(
        (it: any) =>
          it?.category === "imagestore" &&
          it.name === "blob.download.concurrency",
      )?.value;
      if (reservedCapacity?.split(/[^0-9]/)?.length === 1) {
        reservedCapacity = formatBytesToSize(reservedCapacity);
      }
      setCurrent({
        reservedCapacity,
        blobUploadConcurrency,
        blobDownloadConcurrency,
      });
    },
  });

  const list = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "backupStorage.reservedCapacity",
          defaultMessage: "Reserved Capacity",
        }),
        value: current?.reservedCapacity,
      },
      {
        label: intl.formatMessage({
          id: "imageStorage.blob.upload.concurrency",
          defaultMessage: "Image Blob Upload Concurrency",
        }),
        value: intl.formatMessage(
          {
            id: "imageStorage.blob.upload.concurrency.value",
            defaultMessage: "{count}",
          },
          {
            count: current?.blobUploadConcurrency,
          },
        ),
      },
      {
        label: intl.formatMessage({
          id: "imageStorage.blob.download.concurrency",
          defaultMessage: "Image Blob Download Concurrency",
        }),
        value: intl.formatMessage(
          {
            id: "imageStorage.blob.download.concurrency.value",
            defaultMessage: "{count}",
          },
          {
            count: current?.blobDownloadConcurrency,
          },
        ),
      },
    ];
  }, [current, intl]);

  useActionSubscribe({
    resourceTypeList: ["BackupStorage"],
    onFinish: () => {
      refetch?.();
    },
  });

  useEffect(() => {
    bus.addListener("action:refetch:BackupStorage", refetch);
    return () => {
      bus.removeListener("action:refetch:BackupStorage", refetch);
    };
  }, []);

  const handleSubmit = (res: any) => {
    const { number = 1, unit = "GB" } = res?.reservedCapacity ?? {};
    const payload: any[] = [];

    // 检查 reservedCapacity 是否改变
    const newReservedCapacity = parseNumber(number, unit?.trim());
    const newReservedCapacityFormatted = formatBytesToSize(
      newReservedCapacity,
      "B",
      2,
    );
    if (newReservedCapacityFormatted !== current?.reservedCapacity) {
      payload.push({
        name: "reservedCapacity",
        category: "backupStorage",
        resourceUuid: detail?.uuid,
        value: newReservedCapacity?.toString(),
      });
    }

    // 检查 blobUploadConcurrency 是否改变
    const newBlobUploadConcurrency = String(res?.blobUploadConcurrency || "");
    const currentBlobUploadConcurrency = String(
      current?.blobUploadConcurrency || "",
    );
    if (newBlobUploadConcurrency !== currentBlobUploadConcurrency) {
      payload.push({
        name: "blob.upload.concurrency",
        category: "imagestore",
        resourceUuid: detail?.uuid,
        value: newBlobUploadConcurrency,
      });
    }

    // 检查 blobDownloadConcurrency 是否改变
    const newBlobDownloadConcurrency = String(
      res?.blobDownloadConcurrency || "",
    );
    const currentBlobDownloadConcurrency = String(
      current?.blobDownloadConcurrency || "",
    );
    if (newBlobDownloadConcurrency !== currentBlobDownloadConcurrency) {
      payload.push({
        name: "blob.download.concurrency",
        category: "imagestore",
        resourceUuid: detail?.uuid,
        value: newBlobDownloadConcurrency,
      });
    }

    // 只有当有修改时才发送请求
    if (payload.length > 0) {
      doAction({
        mutation: _batchUpdateResourceConfig,
        payload,
        name: intl.formatMessage({
          id: "update.resource.config.",
          defaultMessage: "Update Resource Configuration",
        }),
        total: payload.length,
        onFinish: () => {
          refetch?.();
        },
      });
    }
  };

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "advancedSetting",
        defaultMessage: "Advanced Settings",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
      titleActions={
        hasAuth({
          resource: "backup.storage",
          authKey: "modify.advance.settings",
          type: "action",
        })
          ? [
              {
                icon: "edit",
                tooltip: intl.formatMessage({
                  id: "modify.advance.settings",
                  defaultMessage: "Modify Advanced Settings",
                }),
                onClick: () => setVisible(true),
              },
            ]
          : []
      }
    >
      <List list={list} bordered={false} />
      <ModifySetting
        visible={visible}
        setVisible={setVisible}
        current={current}
        onSubmit={handleSubmit}
        resourceName={formatResourceName([detail], intl)}
        source={detail}
      />
    </DraggableCard>
  );
};

export default Settings;
