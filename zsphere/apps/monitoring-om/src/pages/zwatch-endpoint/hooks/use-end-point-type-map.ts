import { useAuth } from "@zstack/zsphere-components";
import { EndPointType } from "@zstack/zsphere-types";
import { useMemo } from "react";
import { useIntl } from "react-intl";

/**
 * 统一处理通知对象类型
 * @param hasSystem 返回Map数据中是否包含SYSTEM_HTTP项，默认true
 */
const useEndPointTypeMap = ({
  hasSystem = true,
}: {
  hasSystem?: boolean;
} = {}): Map<EndPointType, string> => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const authMap: {
    [key in Partial<EndPointType>]: {
      type: "block";
      resource: "zwatch.endpoint";
      authKey: string;
    };
  } = {
    [EndPointType.DingTalk]: {
      type: "block",
      resource: "zwatch.endpoint",
      authKey: "DingTalk",
    },
    [EndPointType.FeiShu]: {
      type: "block",
      resource: "zwatch.endpoint",
      authKey: "FeiShu",
    },
    [EndPointType.MicrosoftTeams]: {
      type: "block",
      resource: "zwatch.endpoint",
      authKey: "MicrosoftTeams",
    },
    [EndPointType.WeCom]: {
      type: "block",
      resource: "zwatch.endpoint",
      authKey: "WeCom",
    },
    [EndPointType.SNMP]: {
      type: "block",
      resource: "zwatch.endpoint",
      authKey: "snmp.trap",
    },
  };

  return useMemo(() => {
    const map = new Map([
      [
        EndPointType.Email,
        intl.formatMessage({ id: "email", defaultMessage: "Email" }),
      ],
      [
        EndPointType.DingTalk,
        intl.formatMessage({ id: "dingTalk", defaultMessage: "DingTalk" }),
      ],
      [
        EndPointType.FeiShu,
        intl.formatMessage({ id: "feiShu", defaultMessage: "Lark" }),
      ],
      [
        EndPointType.WeCom,
        intl.formatMessage({ id: "weCom", defaultMessage: "WeCom" }),
      ],
      [
        EndPointType.AliyunSms,
        intl.formatMessage({ id: "aliyunSms", defaultMessage: "SMS" }),
      ],
      [
        EndPointType.HTTP,
        intl.formatMessage({
          id: "httpApplication",
          defaultMessage: "HTTP Application",
        }),
      ],
      [
        EndPointType.MicrosoftTeams,
        intl.formatMessage({
          id: "microsoftTeams",
          defaultMessage: "MicrosoftTeams",
        }),
      ],
      [
        EndPointType.SNMP,
        intl.formatMessage({
          id: "snmp.trap.receiver",
          defaultMessage: "SNMP Trap Receiver",
        }),
      ],
      [
        EndPointType.SNMP,
        intl.formatMessage({
          id: "snmp.trap.receiver",
          defaultMessage: "SNMP Trap Receiver",
        }),
      ],
      [
        EndPointType.SYSTEM_HTTP,
        intl.formatMessage({ id: "systemHttp", defaultMessage: "System" }),
      ],
    ]);

    if (!hasSystem) {
      map.delete(EndPointType.SYSTEM_HTTP);
    }

    [...map.entries()].forEach(([key]) => {
      if (authMap[key]) {
        const has = hasAuth(authMap[key]);

        if (!has) {
          map.delete(key);
        }
      }
    });
    return map;
  }, [authMap, hasAuth, hasSystem, intl]);
};

export default useEndPointTypeMap;
