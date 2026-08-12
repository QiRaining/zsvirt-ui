import { useTime } from "@zstack/hooks";
import { Field, Card, ShareType } from "@zstack/zsphere-components";
import type { PciDevice as IPciDevic } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: IPciDevic;
}

const BasicInfo: FC<IProps> = ({ detail }) => {
  const intl = useIntl();
  const {
    uuid,
    shareType,
    pciDeviceAddress,
    vendorId,
    deviceId,
    subvendorId,
    subdeviceId,
    createDate,
    lastOpDate,
  } = detail;

  const { getServerTime } = useTime();

  return (
    <Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <Field
        label={intl.formatMessage({
          id: "shareType",
          defaultMessage: "Sharing Mode",
        })}
      >
        <ShareType type={shareType} />
      </Field>
      <Field
        copyable
        ellipsis={true}
        label={intl.formatMessage({
          id: "UUID",
          defaultMessage: "UUID",
        })}
      >
        {uuid}
      </Field>
      <Field
        ellipsis={true}
        label={intl.formatMessage({
          id: "pci.device.address",
          defaultMessage: "Device Address",
        })}
      >
        {pciDeviceAddress}
      </Field>
      <Field
        ellipsis={true}
        label={intl.formatMessage({
          id: "pci.device.vendorId",
          defaultMessage: "Vendor ID",
        })}
      >
        {vendorId}
      </Field>
      <Field
        copyable
        ellipsis={true}
        label={intl.formatMessage({
          id: "pci.device.deviceId",
          defaultMessage: "Device ID",
        })}
      >
        {deviceId}
      </Field>
      <Field
        ellipsis={true}
        label={intl.formatMessage({
          id: "pci.device.subvendorId",
          defaultMessage: "Sub-Vendor ID",
        })}
      >
        {subvendorId}
      </Field>
      <Field
        ellipsis={true}
        label={intl.formatMessage({
          id: "pci.device.subdeviceId",
          defaultMessage: "Sub-Device ID",
        })}
      >
        {subdeviceId}
      </Field>
      <Field
        label={intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        })}
      >
        {getServerTime(createDate).format("YYYY-MM-DD HH:mm:ss")}
      </Field>
      <Field
        label={intl.formatMessage({
          id: "lastOpDate",
          defaultMessage: "Last Operation Time",
        })}
      >
        {getServerTime(lastOpDate).format("YYYY-MM-DD HH:mm:ss")}
      </Field>
    </Card>
  );
};

export default BasicInfo;
