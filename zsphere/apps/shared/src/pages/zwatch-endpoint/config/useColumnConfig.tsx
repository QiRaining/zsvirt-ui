import { Text } from "@zstack/design";
import { Link, ResourceName } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/zwatch-endpoint";
import { EndPointState, EndPointType } from "@zstack/zsphere-types";
import type {
  EndPoint as IEndPoint,
  EndPointEmailAddress as IEndPointEmailAddress,
  EndPointSmsAddress as IEndPointSmsAddress,
} from "@zstack/zsphere-types/graphql";
import { useCallback } from "react";
import { useIntl } from "react-intl";

export function useRenderType() {
  const intl = useIntl();

  return useCallback(
    (type: string) => {
      let name = "";
      switch (type) {
        case "HTTP":
          name = "HTTP";
          break;
        case "DingTalk":
          name = intl.formatMessage({
            id: "dingTalk",
            defaultMessage: "DingTalk",
          });
          break;
        case "SYSTEM_HTTP":
          name = intl.formatMessage({
            id: "systemHttp",
            defaultMessage: "System",
          });
          break;
        case "Email":
          name = intl.formatMessage({
            id: "email",
            defaultMessage: "Email",
          });
          break;
        case "AliyunSms":
          name = intl.formatMessage({
            id: "aliyunSms",
            defaultMessage: "SMS",
          });
          break;
        case "SNMP":
          name = intl.formatMessage({
            id: "snmp.trap.receiver",
            defaultMessage: "SNMP Trap Receiver",
          });
          break;
        case "WeCom":
          name = intl.formatMessage({
            id: "wecom",
            defaultMessage: "WeCom",
          });
          break;
        case "FeiShu":
          name = intl.formatMessage({ id: "feishu", defaultMessage: "Lark" });
          break;
        default:
          name = type;
          break;
      }
      return name;
    },
    [intl],
  );
}

export default (endPointTypeMap?: any) => {
  const intl = useIntl();
  const renderType = useRenderType();

  return useColumnConfig([
    {
      key: "name",
      render: (value: any) => {
        let name = value?.name;
        if (value?.type === "SYSTEM_HTTP") {
          name = intl.formatMessage({
            id: "system.alarm.zwatchEndpoint",
            defaultMessage: "System Endpoint",
          });
        }
        return (
          <ResourceName
            value={name}
            link={{
              uuid: value?.uuid,
              microAppName: "virtualization-monitoring-om",
              to: "/zwatch-endpoint",
            }}
          />
        );
      },
    },
    {
      key: "type",
      formatter: (value: IEndPoint) => {
        const typeName = renderType(value?.type || "");
        return <Text>{typeName}</Text>;
      },
      filters: endPointTypeMap
        ? [...endPointTypeMap.keys()].map((type) => {
            return { text: renderType(type), value: type };
          })
        : undefined,
    },
    {
      key: "state",
      filterOptions: EndPointState,
    },
    {
      key: "url",
      formatter: ({ type, url, emailAddresses, receivers, platform }: any) => {
        if (type === "SYSTEM_HTTP") {
          return intl.formatMessage({
            id: "platform",
            defaultMessage: "Platform",
          });
        }
        if (type === EndPointType.Email) {
          const addressList: string[] = [];
          emailAddresses?.forEach((address: IEndPointEmailAddress) => {
            addressList.push(address.emailAddress!);
          });
          return addressList.join(",");
        }
        if (type === EndPointType.AliyunSms) {
          const receiverList: string[] = [];
          receivers?.forEach((receiver: IEndPointSmsAddress) => {
            receiverList.push(receiver.phoneNumber!);
          });
          return receiverList.join(",");
        }
        if (type === EndPointType.SNMP) {
          return `${platform?.snmpAddress}:${platform?.snmpPort}`;
        }
        return url;
      },
    },
    {
      key: "owner",
      render: (value: IEndPoint) => {
        return (
          <Link.Owner uuid={value?.owner?.uuid ?? 0} type={value?.owner?.type}>
            {value?.owner?.name}
          </Link.Owner>
        );
      },
    },
  ]);
};
