import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import {
  State,
  List,
  ListItem,
  DraggableCard,
  Text,
  Spin,
} from "@zstack/zsphere-components";
import { formatStorage, formatBytesToSize } from "@zstack/zsphere-utils";
import { Tooltip } from "antd";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import useOpenConsoleAction from "../gateway-vm/action/open-console";
import type { FirstGatewayVmInfo } from "../types";

interface ConfigInfoCardProps {
  firstGatewayVm?: FirstGatewayVmInfo;
  loading?: boolean;
}

const ConfigInfoCard: React.FC<ConfigInfoCardProps> = ({
  firstGatewayVm,
  loading = false,
}) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const openVncConsole = useOpenConsoleAction();

  const handleOpenConsole = useCallback(() => {
    if (!firstGatewayVm?.uuid) return;
    openVncConsole(firstGatewayVm as Parameters<typeof openVncConsole>[0]);
  }, [firstGatewayVm, openVncConsole]);

  const renderVmStateBadge = useCallback(
    (state?: string) => {
      if (state === "Running") {
        return (
          <State
            prefix="icon"
            type="running"
            name={intl.formatMessage({
              id: "enabled",
              defaultMessage: "Enabled",
            })}
          />
        );
      }
      if (state === "Stopped") {
        return (
          <State
            prefix="icon"
            type="stopped"
            name={intl.formatMessage({
              id: "disabled",
              defaultMessage: "Disabled",
            })}
          />
        );
      }
      return (
        <State
          prefix="icon"
          type="unknown"
          name={intl.formatMessage({
            id: "unknown",
            defaultMessage: "Unknown",
          })}
        />
      );
    },
    [intl],
  );

  const configItems: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "readyState",
          defaultMessage: "Status",
        }),
        value: renderVmStateBadge(firstGatewayVm?.state),
      },
      {
        label: intl.formatMessage({
          id: "console",
          defaultMessage: "Console",
        }),
        value:
          firstGatewayVm?.uuid && firstGatewayVm?.state === "Running" ? (
            <Tooltip
              title={intl.formatMessage({
                id: "open.console",
                defaultMessage: "Launch Console",
              })}
            >
              <Icon
                onClick={handleOpenConsole}
                style={{
                  color: "var(--color-600)",
                  cursor: "pointer",
                  display: "flex",
                }}
                type="console"
              />
            </Tooltip>
          ) : (
            <Icon
              type="console"
              style={{
                color: "var(--neutral-500)",
                cursor: "not-allowed",
                display: "flex",
              }}
            />
          ),
      },
      {
        label: "CPU",
        value:
          firstGatewayVm?.cpuNum != null
            ? `${firstGatewayVm.cpuNum} ${intl.formatMessage({
                id: "core",
                defaultMessage: "Cores",
              })}`
            : "-",
      },
      {
        label: intl.formatMessage({
          id: "memory",
          defaultMessage: "Memory",
        }),
        value:
          firstGatewayVm?.memorySize != null
            ? formatStorage(firstGatewayVm.memorySize, 2)
            : "-",
      },
      {
        label: intl.formatMessage({
          id: "storage",
          defaultMessage: "Storage",
        }),
        value:
          firstGatewayVm?.storageSize != null
            ? formatBytesToSize(firstGatewayVm.storageSize)
            : "-",
      },
      {
        label: intl.formatMessage({
          id: "defaultIPv4.address",
          defaultMessage: "Default IPv4",
        }),
        value: firstGatewayVm?.defaultIp ? (
          <Text value={firstGatewayVm.defaultIp} copyable />
        ) : (
          "-"
        ),
      },
      {
        label: intl.formatMessage({
          id: "create.date",
          defaultMessage: "Creation Time",
        }),
        value: firstGatewayVm?.createDate
          ? getServerTime(firstGatewayVm.createDate).format(
              "YYYY-MM-DD HH:mm:ss",
            )
          : "-",
      },
    ],
    [
      intl,
      firstGatewayVm,
      renderVmStateBadge,
      getServerTime,
      handleOpenConsole,
    ],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "migration.config.info",
        defaultMessage: "Configurations",
      })}
      isList
      collapsed={false}
    >
      <div style={{ position: "relative", minHeight: 120 }}>
        <List list={configItems} bordered={false} />
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.6)",
              zIndex: 1,
            }}
          >
            <Spin spinning />
          </div>
        )}
      </div>
    </DraggableCard>
  );
};

export default ConfigInfoCard;
