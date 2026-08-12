import { gql, useQuery } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { resourceConfigList } from "@zstack/virtualization-resource/src/gql/resource-config.gql";
import {
  AuthHander,
  List,
  useAction,
  useAuth,
} from "@zstack/zsphere-components";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type {
  BatchUpdateResourceConfigPayload,
  BackupStorage as IBackupStorage,
} from "@zstack/zsphere-types/graphql";
import {
  bus,
  formatBytesToSize,
  formatResourceName,
  parseNumber,
} from "@zstack/zsphere-utils";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import ModifySetting from "../../action/edit-advance-setting";

import style from "./style.module.less";

interface IProps {
  detail: IBackupStorage;
}

const _batchUpdateResourceConfig = gql`
  mutation batchUpdateResourceConfig($input: BatchUpdateResourceConfigInput!) {
    batchUpdateResourceConfig(input: $input) {
      actionId
    }
  }
`;

const modifyAdvanceSettingsAuth = {
  type: "action" as const,
  authKey: "modify.advance.settings",
  resource: "backup.storage",
};
const AvanceSetting: React.FC<IProps> = ({ detail }) => {
  const intl = useIntl();
  const doAction = useAction();
  const { hasAuth } = useAuth();

  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState({} as any);

  const { data: _data, refetch } = useQuery(resourceConfigList, {
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

  const list = React.useMemo(() => {
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
    const payload: BatchUpdateResourceConfigPayload[] = [];

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
        onFinish: (_result: IActionResult) => {
          refetch?.();
        },
      });
    }
  };

  return (
    <div className={style.container}>
      <div className={style.toolbar}>
        <span>
          {intl.formatMessage({
            id: "advancedSetting",
            defaultMessage: "Advanced Settings",
          })}
        </span>
        {hasAuth(modifyAdvanceSettingsAuth) && (
          <AuthHander {...modifyAdvanceSettingsAuth}>
            <span className={style.action} onClick={() => setVisible(true)}>
              <Icon type="edit" />
              {intl.formatMessage({ id: "modify", defaultMessage: "Edit" })}
            </span>
          </AuthHander>
        )}
      </div>
      <List list={list} />
      <ModifySetting
        visible={visible}
        setVisible={setVisible}
        current={current}
        onSubmit={(res: any) => handleSubmit(res)}
        resourceName={formatResourceName([detail], intl)}
      />
    </div>
  );
};

export default AvanceSetting;
