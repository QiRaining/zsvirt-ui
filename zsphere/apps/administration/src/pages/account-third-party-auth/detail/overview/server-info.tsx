import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import type {
  AccountThirdPartyAuth as IAccountThirdPartyAuth,
  ThirdPartyAuthVO as IThirdPartyAuthVO,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { extractIpAndPort } from "../../uitls";

interface IProps {
  current: Partial<IAccountThirdPartyAuth & IThirdPartyAuthVO>;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch?: Function;
}

const ServerInfo: React.FC<IProps> = ({
  current,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();

  const { ip: masterIp, port: masterPort } = extractIpAndPort(current.url!);

  const list: ListItem[] = React.useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "master.server.ip",
          defaultMessage: "Primary Server IP/Domain",
        }),
        value: `${masterIp}-${masterPort}`,
      },
      {
        label: intl.formatMessage({
          id: "secondaryServer.ip/domain",
          defaultMessage: "Secondary Server IP/Domain",
        }),
        value: current?.relatedSystemTag?.standbyServerIP
          ? `${current?.relatedSystemTag?.standbyServerIP}-${current?.relatedSystemTag?.standbyServerPort}`
          : undefined,
      },
      {
        label: intl.formatMessage({
          id: "accountThirdPartyAuth.field.encryption.type",
          defaultMessage: "Encryption Type",
        }),
        value:
          current.encryption !== "None"
            ? intl.formatMessage({
                id: "accountThirdPartyAuth.field.encryption",
                defaultMessage: "SSL/TLS Encryption",
              })
            : current.encryption,
      },
    ],
    [intl, masterIp, masterPort, current.encryption],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "server.info",
        defaultMessage: "Server Info",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default ServerInfo;
