import { useTime } from "@zstack/hooks";
import { Field, Card } from "@zstack/zsphere-components";
import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: IBaremetalPxeServer;
  refetch: any;
}

const BasicInfo: FC<IProps> = ({ detail }) => {
  const intl = useIntl();
  // const [visible, setVisible] = useState<boolean>(false)

  const { getServerTime } = useTime();

  return (
    <>
      <Card
        title={intl.formatMessage({
          id: "info.basic",
          defaultMessage: "Basic Info",
        })}
      >
        <Field
          label={intl.formatMessage({
            id: "baremetal.pxeservice.hostname",
            defaultMessage: "Deployment Server IP",
          })}
        >
          {detail?.hostname}
        </Field>
        <Field
          label={intl.formatMessage({
            id: "baremetal.pxeservice.sshPort",
            defaultMessage: "SSH Port",
          })}
        >
          {detail?.sshPort}
        </Field>
        <Field
          label={intl.formatMessage({
            id: "baremetal.pxeservice.storagePath",
            defaultMessage: "Storage Path",
          })}
        >
          {detail?.storagePath}
        </Field>
        <Field
          label={intl.formatMessage({
            id: "totalCapacity",
            defaultMessage: "Total Capacity",
          })}
        >
          {formatStorage(Number(detail?.totalCapacity || 0))}
        </Field>
        <Field
          label={intl.formatMessage({
            id: "availableCapacity",
            defaultMessage: "Physical Available",
          })}
        >
          {formatStorage(Number(detail?.availableCapacity || 0))}
        </Field>
        <Field
          label={intl.formatMessage({
            id: "dhcpInterface",
            defaultMessage: "DHCP Listening NIC",
          })}
        >
          {detail?.dhcpInterface}
        </Field>
        <Field
          label={intl.formatMessage({
            id: "dhcpRangeBegin",
            defaultMessage: "DHCP Start IP",
          })}
        >
          {detail?.dhcpRangeBegin}
        </Field>
        <Field
          label={intl.formatMessage({
            id: "dhcpRangeEnd",
            defaultMessage: "DHCP End IP",
          })}
        >
          {detail?.dhcpRangeEnd}
        </Field>
        <Field
          label={intl.formatMessage({
            id: "create.dates",
            defaultMessage: "Creation Time",
          })}
        >
          {getServerTime(detail?.createDate).format("YYYY-MM-DD HH:mm:ss")}
        </Field>
        <Field
          label={intl.formatMessage({
            id: "last.op.date",
            defaultMessage: "Last Operation Time",
          })}
        >
          {getServerTime(detail?.lastOpDate).format("YYYY-MM-DD HH:mm:ss")}
        </Field>
      </Card>
      {/* <Action visible={visible} setVisible={setVisible} refetch={refetch} detail={detail} /> */}
    </>
  );
};

export default BasicInfo;
