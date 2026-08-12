import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import { Text, Constant } from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/gateway-vm";
import type { IOption } from "@zstack/zsphere-engine/src/gateway-vm/useColumnConfig";
import { mergeOptions } from "@zstack/zsphere-engine/utils";
import { VmInstanceState } from "@zstack/zsphere-types";
import type { Item } from "@zstack/zsphere-types";
import { formatStorage, formatBytesToSize } from "@zstack/zsphere-utils";
import { Space, Tooltip } from "antd";
import { pick } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import useOpenConsoleAction from "../action/open-console";

const verifyOpenConsole = (current: Item) => {
  return [
    VmInstanceState.Running,
    VmInstanceState.Crashed,
    VmInstanceState.Unknown,
  ].includes(current?.state as VmInstanceState);
};

export default (args?: { view?: string; options?: IOption<Item> }) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const openConsole = useOpenConsoleAction();

  const options = useMemo<IOption<Item>>(
    () =>
      mergeOptions<IOption<Item>[number]>(
        [
          {
            key: "status",
            searchKey: "state",
            filterEnumType: ConstantType.VmInstanceState,
            filterOptions: pick(VmInstanceState, [
              VmInstanceState.Running,
              VmInstanceState.Stopped,
              VmInstanceState.Starting,
              VmInstanceState.Stopping,
              VmInstanceState.Created,
              VmInstanceState.Unknown,
            ]),
            render: (record: Item) => {
              const val = record?.state;
              return val ? <Constant value={val} /> : null;
            },
          },
          {
            key: "cpu",
            render: (record: Item) => {
              const cpuNum = record?.cpuNum;
              return cpuNum || cpuNum === 0 ? (
                <Space size={4}>
                  {cpuNum}
                  {intl.formatMessage({ id: "core", defaultMessage: "Cores" })}
                </Space>
              ) : null;
            },
          },
          {
            key: "memory",
            formatter: (record: Item) => {
              return formatStorage(record?.memorySize || 0, 2);
            },
          },
          {
            key: "storage",
            formatter: (record: Item) => {
              return formatBytesToSize(record?.storageSize || 0);
            },
          },
          {
            key: "defaultIPv4.address",
            render: (record: Item) => {
              const ip = record?.defaultIp;
              return ip ? <Text value={ip} copyable /> : null;
            },
          },
          {
            key: "create.date",
            render: (record: Item) => {
              const val = record?.createDate;
              return val ? (
                <Text
                  value={getServerTime(val).format("YYYY-MM-DD HH:mm:ss")}
                />
              ) : null;
            },
          },
          {
            key: "console",
            render: (record: Item) => {
              return verifyOpenConsole(record) ? (
                <Tooltip
                  title={intl.formatMessage({
                    id: "open.console",
                    defaultMessage: "Launch Console",
                  })}
                >
                  <Icon
                    onClick={(e: React.MouseEvent) => {
                      openConsole(record);
                      e.stopPropagation();
                    }}
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
              );
            },
          },
        ],
        args?.options || [],
      ),
    [intl, getServerTime, openConsole, args?.options],
  );

  return useColumnConfig(options);
};
