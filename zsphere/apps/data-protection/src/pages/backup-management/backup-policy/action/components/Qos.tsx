import { Form, InputUnit } from "@zstack/zsphere-components";
import { parseNumber } from "@zstack/zsphere-utils";
import { useIntl } from "react-intl";

import style from "./style.module.less";

export const networkUnitList = [
  { value: "K", displayName: "Kbps" },
  { value: "M", displayName: "Mbps" },
  { value: "G", displayName: "Gbps" },
];

export const volumeUnitList = [
  { value: "M", displayName: "MB/s" },
  { value: "G", displayName: "GB/s" },
];

export const validateRange = (lo: number, hi: number, message: string) => {
  return {
    validator: async (rule: any, value: any) => {
      if (typeof value?.number !== "number") {
        return;
      }
      const size = parseNumber(value.number, value.unit);
      if (size >= lo && size <= hi) {
        return;
      }
      throw message;
    },
  };
};

export default function Qos() {
  const intl = useIntl();

  return (
    <div className={style.field}>
      <Form.Item
        name="downloadBandwidth"
        label={intl.formatMessage({
          id: "download.bandwidth",
          defaultMessage: "Downstream Bandwidth",
        })}
        rules={[
          validateRange(
            8192,
            32212254721,
            intl.formatMessage({
              id: "backupJob.field.networkBandwidth.validator.invalid",
              defaultMessage: "Valid bandwidth: 8 Kbps–30 Gbps",
            }),
          ),
        ]}
      >
        <InputUnit
          min={0}
          unitList={networkUnitList}
          placeholder={intl.formatMessage({
            id: "not.limited",
            defaultMessage: "Unlimited",
          })}
        />
      </Form.Item>
      <Form.Item
        name="uploadBandwidth"
        label={intl.formatMessage({
          id: "upload.bandwidth",
          defaultMessage: "Upstream Bandwidth",
        })}
        rules={[
          validateRange(
            8192,
            32212254721,
            intl.formatMessage({
              id: "backupJob.field.networkBandwidth.validator.invalid",
              defaultMessage: "Valid bandwidth: 8 Kbps–30 Gbps",
            }),
          ),
        ]}
      >
        <InputUnit
          min={0}
          unitList={networkUnitList}
          placeholder={intl.formatMessage({
            id: "not.limited",
            defaultMessage: "Unlimited",
          })}
        />
      </Form.Item>
      <Form.Item
        name="diskRead"
        label={intl.formatMessage({
          id: "disk.read.speed",
          defaultMessage: "Disk Read Speed",
        })}
        rules={[
          validateRange(
            1048576,
            107374182401,
            intl.formatMessage({
              id: "backupJob.field.volumeBandwidth.validator.invalid",
              defaultMessage: "Valid disk speed: 1 MB/s–100 GB/s",
            }),
          ),
        ]}
      >
        <InputUnit
          min={0}
          unitList={volumeUnitList}
          placeholder={intl.formatMessage({
            id: "not.limited",
            defaultMessage: "Unlimited",
          })}
        />
      </Form.Item>
      <Form.Item
        name="diskWrite"
        label={intl.formatMessage({
          id: "disk.write.speed",
          defaultMessage: "Disk Write Speed",
        })}
        rules={[
          validateRange(
            1048576,
            107374182401,
            intl.formatMessage({
              id: "backupJob.field.volumeBandwidth.validator.invalid",
              defaultMessage: "Valid disk speed: 1 MB/s–100 GB/s",
            }),
          ),
        ]}
      >
        <InputUnit
          min={0}
          unitList={volumeUnitList}
          placeholder={intl.formatMessage({
            id: "not.limited",
            defaultMessage: "Unlimited",
          })}
        />
      </Form.Item>
    </div>
  );
}
