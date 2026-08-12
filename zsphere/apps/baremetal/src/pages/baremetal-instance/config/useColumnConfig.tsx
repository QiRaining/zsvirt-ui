import { Tooltip, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { ResourceName, TagList } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/baremetal-instance";
import {
  BaremetalInstanceState,
  BaremetalInstanceStatus,
} from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type { BaremetalInstance as IBaremetalInstance } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";

import useBaremetalConsole from "../hooks/BaremetalConsole";

import style from "./style.module.less";

const WebTerminalWrapper = ({ bmInstance }: any) => {
  const { onClick, checkIfWebTerminalEnabled } = useBaremetalConsole({
    instance: bmInstance,
  });
  const intl = useIntl();

  return (
    <>
      {checkIfWebTerminalEnabled() ? (
        <Tooltip
          title={intl.formatMessage({
            id: "open.console",
            defaultMessage: "Launch Console",
          })}
        >
          <Icon
            onClick={() => onClick()}
            type="web-shell"
            className={style["webshell-enabled"]}
          />
        </Tooltip>
      ) : (
        <Icon type="web-shell" className={style["webshell-disabled"]} />
      )}
    </>
  );
};

export default () => {
  const intl = useIntl();

  return useColumnConfig<IBaremetalInstance>([
    {
      key: "name",
      render: (current) => {
        return current?.state === BaremetalInstanceState.Destroyed ? (
          <Text>{current?.name}</Text>
        ) : (
          <ResourceName
            value={current?.name}
            link={{
              to: `/baremetal-instance`,
              microAppName: "virtualization-resource",
              uuid: current?.uuid,
              leftnav: LeftNavType.BareMetal,
              keepState: false,
            }}
          />
        );
      },
    },
    {
      key: "console",
      auth: {
        authKey: "open.console",
        resource: "baremetal.instance",
        type: "action",
      },
      render: (curr) => <WebTerminalWrapper bmInstance={curr} />,
    },
    {
      key: "memorySize",
      formatter: (current: IBaremetalInstance) => {
        return formatStorage(current?.hardwareInfo?.memory || 0, 2);
      },
    },
    {
      key: "state",
      filterOptions: BaremetalInstanceState,
    },
    {
      key: "status",
      filterOptions: BaremetalInstanceStatus,
    },
    {
      key: "cpuNum",
      formatter: (current: IBaremetalInstance) => {
        return current?.hardwareInfo?.cpuNum || 0;
      },
    },
    {
      key: "defaultIp",
      formatter: (current: IBaremetalInstance) => {
        return current.managementIp ?? "";
      },
    },
    {
      key: "bm.cluster",
      render: (current) => (
        <ResourceName
          value={current?.cluster?.name}
          link={{
            to: `/baremetal-cluster`,
            microAppName: "virtualization-resource",
            uuid: current?.cluster?.uuid,
            leftnav: LeftNavType.BareMetal,
            keepState: false,
          }}
        />
      ),
    },
    {
      key: "bm.chassis",
      render: (current) => (
        <ResourceName
          value={current?.baremetalChassis?.name}
          link={{
            to: `/baremetal-chassis`,
            microAppName: "virtualization-resource",
            uuid: current?.baremetalChassis?.uuid,
            leftnav: LeftNavType.BareMetal,
            keepState: false,
          }}
        />
      ),
    },
    {
      key: "tag",
      title: intl.formatMessage({
        id: "tag",
        defaultMessage: "Tag",
      }),
      auth: {
        type: "block",
        resource: "vm",
        authKey: "tag",
      },
      render: ({ tag }: IBaremetalInstance) => {
        if (!tag?.length) {
          return null;
        }
        return <TagList tags={tag} />;
      },
      exportToCSVRender: ({ tag }: IBaremetalInstance) => {
        return tag?.map((item) => item.name ?? "").join(",") ?? "";
      },
    },
    {
      key: "owner",
      render: (current: any) => {
        const owner = current.owner;
        return owner?.uuid === "36c27e8ff05c4780bf6d2fa65700f22e" ? (
          owner?.name
        ) : (
          <ResourceName
            value={owner?.name}
            link={{
              leftnav: LeftNavType.ClusterHost,
              to: `/account-information/user`,
              microAppName: "virtualization-administration",
              uuid: owner?.uuid,
            }}
          />
        );
      },
      exportToCSVRender(value?: any) {
        if (!value) {
          return "";
        }
        if ("owner" in value && value.owner) {
          return value.owner.name;
        }
        return "";
      },
    },
  ]);
};
