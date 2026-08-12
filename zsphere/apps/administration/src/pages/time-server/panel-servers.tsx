import { useQuery } from "@apollo/client";
import { InfoPopover } from "@zstack/design";
import { Spinner } from "@zstack/zsphere-design-biz";
import type { TimeServerResult } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { getTimeServers } from "../../gql/time-server.gql";
import Panel from "./components/panel";
import Topo from "./components/topo";
import { useServerMode } from "./hooks";

import style from "./style.module.less";

const PanelServers: FC = () => {
  const intl = useIntl();

  const { loading, data } = useQuery<{ timeServers: TimeServerResult }>(
    getTimeServers,
  );
  const serversData = data?.timeServers;
  const { mode } = useServerMode(serversData);

  return (
    <Panel
      title={intl.formatMessage({
        id: "ntp",
        defaultMessage: "Network Time Protocol",
      })}
    >
      <div className={style["panel-server"]}>
        <div className={style.mode}>
          <div className={style["mode-row"]}>
            <span className={style.label}>
              {intl.formatMessage({
                id: "ntp.mode",
                defaultMessage: "NTP Mode",
              })}
              <InfoPopover
                content={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "ntp.mode.tooltip",
                      defaultMessage: "### NTP Mode\n\nThe mode that the platform syncs time with a NTP server. The following modes are supported:\n\n1. Internal: Uses a management node or host as the time server for the platform system time to synchronize time with other nodes on the platform. You can add a maximum of 2 internal time servers.\n\n2. Internal and External: Uses an external node as the external time server and a management node or host as the internal time sever. After the external time server synchronizes with the internal time server, the internal time server then synchronizes time with other nodes on the platform. You can add a maximum of 2 internal time servers and 2 external time servers.\n\n3. External: Uses an external node as the external time server to synchronize time with all nodes on the platform. You can add a maximum of 2 external time servers.",
                    })}
                  </ReactMarkdown>
                }
              />
            </span>
            <span className={style.value}>{mode?.label}</span>
          </div>
        </div>
        {loading ? (
          <div className={style.topoContainer}>
            <Spinner spinning />
          </div>
        ) : (
          <Topo data={serversData} />
        )}
      </div>
    </Panel>
  );
};

export default PanelServers;
