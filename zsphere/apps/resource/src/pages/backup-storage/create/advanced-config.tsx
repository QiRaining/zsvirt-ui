import { useQuery, gql } from "@apollo/client";
import type { IInputUnitProps } from "@zstack/zsphere-components";
import { Form, InputUnit } from "@zstack/zsphere-components";
import { ZSVForm } from "@zstack/zsphere-components";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import { InputNumber } from "antd";
import { includes, words } from "lodash-es";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useValidator } from "../utils";

import style from "./style.module.less";

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
      isValid
    }
  }
`;

export const parseSize = (sizeStr: string) => {
  // 不带单位的直接返回
  if (words(sizeStr)?.length < 2) {
    return parseInt(sizeStr, 10);
  }
  sizeStr = String(sizeStr).toLowerCase();
  // const unitMap = ['b', 'k', 'm', 'g', 't']
  const unit = sizeStr[sizeStr.length - 1]?.toLowerCase();
  const size = parseInt(sizeStr.split(unit)[0], 10);
  let sizeToB = 0;
  switch (unit) {
    case "b":
      sizeToB = size;
      break;
    case "k":
      sizeToB = size * 1024;
      break;
    case "m":
      sizeToB = size * 1024 * 1024;
      break;
    case "g":
      sizeToB = size * 1024 * 1024 * 1024;
      break;
    case "t":
      sizeToB = size * 1024 * 1024 * 1024 * 1024;
      break;
    default:
      sizeToB = 0;
      break;
  }
  return sizeToB;
};

interface IProps {
  form: any;
  zone?: IZone;
}

const { Item } = Form;
const { Card } = ZSVForm;

const BasicPart: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const [value, setValue] = useState<IInputUnitProps["value"]>({
    number: 1,
    unit: "GB",
  });
  const unitList: IInputUnitProps["unitList"] = ["KB", "MB", "GB", "TB"];
  const { validReservedCapacity, validBlobDownloadUploadConcurrency } =
    useValidator();

  const { data, loading } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "backupStorage",
      name: "reservedCapacity",
    },
  });

  useEffect(() => {
    if (!loading && data?.globalConfig?.value) {
      const reservedCapacity = parseSize(data?.globalConfig?.value);
      let reservedCapacityInfo;
      try {
        reservedCapacityInfo = formatStorage(Number(reservedCapacity), 2);
      } catch (e) {
        console.log("e===", e);
      }
      const [number, unit] = words(reservedCapacityInfo);
      if (includes(unitList, unit)) {
        setValue({
          number: Number(number),
          unit,
        });
        form.setFieldsValue({
          reservedCapacity: {
            number: Number(number),
            unit,
          },
        });
      }
    }
  }, [data?.globalConfig?.value]);

  return (
    <Card
      title={intl.formatMessage({
        id: "advancedSetting",
        defaultMessage: "Advanced Settings",
      })}
    >
      <Item
        name="reservedCapacity"
        label={intl.formatMessage({
          id: "backupStorag.reservedCapacity",
          defaultMessage: "Reserved Capacity for Image Storage",
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
            validator: (rule, _value) =>
              validReservedCapacity(rule, _value, {
                isValid: false,
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
                validator: (rule, _value) =>
                  validBlobDownloadUploadConcurrency(rule, _value),
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
                validator: (rule, _value) =>
                  validBlobDownloadUploadConcurrency(rule, _value),
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
    </Card>
  );
};

export default React.memo(BasicPart);
