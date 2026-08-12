import type { IInputUnitProps } from "@zstack/zsphere-components";
import { Form, InputUnit } from "@zstack/zsphere-components";
import { BackupStorageType } from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import { InputNumber } from "antd";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useValidator } from "../../utils";

import style from "./style.module.less";

interface IProps {
  form: any;
  current?: IBackupStorage;
}

const { Item } = Form;

const BasicPart: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const {
    type,
    poolAvailableCapacity = 0,
    poolUsedCapacity = 0,
    totalCapacity = 0,
  } = current || {};

  const maxSettingCapacity = useMemo(
    () =>
      type === BackupStorageType.Ceph
        ? poolAvailableCapacity + poolUsedCapacity
        : totalCapacity,
    [current],
  );

  const [value, setValue] = useState<IInputUnitProps["value"]>({
    number: 1,
    unit: "GB",
  });
  const unitList: IInputUnitProps["unitList"] = ["KB", "MB", "GB", "TB"];
  const { validReservedCapacity, validBlobDownloadUploadConcurrency } =
    useValidator();

  return (
    <div className={style.card}>
      <div className={style.title}>
        <div className={style.rect} />
        <div className={style.text}>
          {intl.formatMessage({
            id: "advancedSetting",
            defaultMessage: "Advanced Settings",
          })}
        </div>
      </div>

      <Item
        name="reservedCapacity"
        label={intl.formatMessage({
          id: "backupStorage.reservedCapacity",
          defaultMessage: "Reserved Capacity",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "backupStorage.field.reservedCapacity.tooltip",
              defaultMessage: `### Reserved Capacity for Image Storage

The reserved storage space for an image storage when it is being used. Default is 1GB, unit is KB/MB/GB/TB.`,
            })}
          </ReactMarkdown>
        }
        rules={[
          {
            validator: (rule, value) =>
              validReservedCapacity(rule, value, {
                isValid: true,
                maxSettingCapacity,
              }),
          },
        ]}
        required
      >
        <InputUnit value={value} onChange={setValue} unitList={unitList} />
      </Item>
      <Item
        label={intl.formatMessage({
          id: "imageStorage.blob.upload.concurrency",
          defaultMessage: "Image Blob Upload Concurrency",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "backupStorage.field.blobUploadConcurrency.tooltip",
              defaultMessage: `### Image Blob Upload Concurrency

1. Specify the blob upload concurrency when you upload an image. Default: 1. Valid values: 1 to 16. Increasing blob download concurrency increases the efficiency of cloning virtual machines and creating images.

2. To set a blob upload concurrency, take the network bandwidth, storage medium, and CPU cores into consideration. A higher concurrency does not necessarily equal a higher image upload speed in some scenarios. We recommend that you set the concurrency to 2 if you use a gigabit network and 4-8 if you use a 10-gigabit network. If you use a tape library as the image storage medium, we recommend that you set the concurrency as 1.`,
            })}
          </ReactMarkdown>
        }
        required
      >
        <div className="flex items-center gap-2">
          <Item
            noStyle
            name="blobUploadConcurrency"
            rules={[
              {
                validator: (rule, value) =>
                  validBlobDownloadUploadConcurrency(rule, value),
              },
            ]}
          >
            <InputNumber className={style["width-80"]} />
          </Item>
          {intl.locale === "zh-CN"
            ? intl.formatMessage({ id: "count", defaultMessage: " " })
            : null}
        </div>
      </Item>
      <Item
        label={intl.formatMessage({
          id: "imageStorage.blob.download.concurrency",
          defaultMessage: "Image Blob Download Concurrency",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "backupStorage.field.blobDownloadConcurrency.tooltip",
              defaultMessage: `### Image Blob Download Concurrency

1. Specify the blob download concurrency when you download an image. Default: 1. Valid values: 1 to 16. Increasing blob download concurrency increases the efficiency of creating virtual machines in certain scenarios.

2. To set a blob download concurrency, take the network bandwidth, storage medium, and CPU cores into consideration. A higher concurrency does not necessarily equal a higher image download speed in some scenarios. We recommend that you set the concurrency to 2 if you use a gigabit network and 4-8 if you use a 10-gigabit network. `,
            })}
          </ReactMarkdown>
        }
        required
      >
        <div className="flex items-center gap-2">
          <Item
            noStyle
            name="blobDownloadConcurrency"
            rules={[
              {
                validator: (rule, value) =>
                  validBlobDownloadUploadConcurrency(rule, value),
              },
            ]}
          >
            <InputNumber className={style["width-80"]} />
          </Item>
          {intl.locale === "zh-CN"
            ? intl.formatMessage({ id: "count", defaultMessage: " " })
            : null}
        </div>
      </Item>
    </div>
  );
};

export default React.memo(BasicPart);
