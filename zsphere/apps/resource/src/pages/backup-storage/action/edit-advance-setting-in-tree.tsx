import { gql, useLazyQuery } from "@apollo/client";
import { resourceConfigList } from "@zstack/virtualization-resource/src/gql/resource-config.gql";
import { useAction } from "@zstack/zsphere-hooks";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  BackupStorage,
  BatchUpdateResourceConfigPayload,
} from "@zstack/zsphere-types/graphql";
import {
  bus,
  formatBytesToSize,
  parseNumber,
  formatResourceName,
} from "@zstack/zsphere-utils";
import React, { useLayoutEffect, useState } from "react";
import { useIntl } from "react-intl";

import ModifySetting from "./edit-advance-setting";

interface IProps {
  detail: BackupStorage;
}

const _batchUpdateResourceConfig = gql`
  mutation batchUpdateResourceConfig($input: BatchUpdateResourceConfigInput!) {
    batchUpdateResourceConfig(input: $input) {
      actionId
    }
  }
`;

const AvanceSetting: React.FC<IActionWrapperProps<BackupStorage> & IProps> = ({
  detail,
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const [current, setCurrent] = useState({} as any);

  const [getResourceConfigList, { data: _data, refetch }] = useLazyQuery(
    resourceConfigList,
    {
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
              it?.category === "backupStorage" &&
              it.name === "reservedCapacity",
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
        if (reservedCapacity?.split(/[^0-9.]/)?.length === 1) {
          reservedCapacity = formatBytesToSize(reservedCapacity);
        }
        setCurrent({
          reservedCapacity,
          blobUploadConcurrency,
          blobDownloadConcurrency,
        });
      },
    },
  );

  useLayoutEffect(() => {
    if (visible) {
      getResourceConfigList();
    }
  }, [visible]);

  useActionSubscribe({
    resourceTypeList: ["BackupStorage"],
    onFinish: () => {
      refetch?.();
    },
  });

  const handleSubmit = (res: any) => {
    const { number = 1, unit = "GB" } = res?.reservedCapacity ?? {};
    const payload: BatchUpdateResourceConfigPayload[] = [];
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

    const newBlobUploadConcurrency = String(res?.blobUploadConcurrency || "");
    if (newBlobUploadConcurrency !== current?.blobUploadConcurrency) {
      payload.push({
        name: "blob.upload.concurrency",
        category: "imagestore",
        resourceUuid: detail?.uuid,
        value: newBlobUploadConcurrency,
      });
    }

    const newBlobDownloadConcurrency = String(
      res?.blobDownloadConcurrency || "",
    );
    if (newBlobDownloadConcurrency !== current?.blobDownloadConcurrency) {
      payload.push({
        name: "blob.download.concurrency",
        category: "imagestore",
        resourceUuid: detail?.uuid,
        value: newBlobDownloadConcurrency,
      });
    }
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
          bus.emit("action:refetch:BackupStorage");
        },
      });
    }
  };

  return (
    <ModifySetting
      visible={visible}
      setVisible={setVisible}
      current={current}
      source={detail}
      onSubmit={(res: any) => handleSubmit(res)}
      resourceName={formatResourceName([detail], intl)}
    />
  );
};

export default AvanceSetting;
