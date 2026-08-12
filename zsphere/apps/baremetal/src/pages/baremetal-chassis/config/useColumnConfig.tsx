import { Text, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Constant, ResourceName } from "@zstack/zsphere-components";
import { State as ZstackState } from "@zstack/zsphere-components";
import type { IOption } from "@zstack/zsphere-engine/src/baremetal-chassis/useColumnConfig";
import useColumnConfig from "@zstack/zsphere-engine/src/baremetal-chassis/useColumnConfig";
import { State } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type { BaremetalChassis as IBaremetalChassis } from "@zstack/zsphere-types/graphql";
import { pick } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

export function useFormatHardwareInfos(baremetalChassis?: IBaremetalChassis) {
  const formatData = useMemo(
    () => format(baremetalChassis),
    [baremetalChassis],
  );
  const intl = useIntl();
  const noGet = (
    <span className={style.noGet}>
      {intl.formatMessage({
        id: "no.get",
        defaultMessage: "Nothing obtained",
      })}
    </span>
  );
  const memoFn = useMemo(
    () => ({
      getCpuNum(innerBaremetalChassis?: IBaremetalChassis) {
        const bc = innerBaremetalChassis
          ? format(innerBaremetalChassis)
          : formatData;
        const cpuNum = getCpuNum(bc);

        if (!cpuNum) {
          return noGet;
        }

        return `${cpuNum} ${intl.formatMessage({
          id: "core",
          defaultMessage: "Cores",
        })}`;
      },

      getMemorySizeSize(innerBaremetalChassis?: IBaremetalChassis) {
        const bc = innerBaremetalChassis
          ? format(innerBaremetalChassis)
          : formatData;
        return getMemorySizeSize(bc) || noGet;
      },

      getFormatData(b?: IBaremetalChassis) {
        return format(b);
      },

      getCpuModel(innerBaremetalChassis?: IBaremetalChassis) {
        const bc = innerBaremetalChassis
          ? format(innerBaremetalChassis)
          : formatData;
        return bc?.basic?.cpu_model.replace(/\s+/g, " ") || noGet;
      },

      getCpuCore(innerBaremetalChassis?: IBaremetalChassis) {
        const bc = innerBaremetalChassis
          ? format(innerBaremetalChassis)
          : formatData;
        return bc?.basic?.cpu_core || noGet;
      },

      getDiskSize(innerBaremetalChassis?: IBaremetalChassis) {
        const bc = innerBaremetalChassis
          ? format(innerBaremetalChassis)
          : formatData;
        return (
          bc?.disk?.map(({ name, size }) => `${name}:${size}`)?.join(",") ||
          noGet
        );
      },
    }),
    [formatData, intl, noGet],
  );
  return useMemo(
    () => ({
      formatData,
      ...memoFn,

      get cpuNum() {
        return memoFn.getCpuNum();
      },

      get memorySizeSize() {
        return memoFn.getMemorySizeSize();
      },

      get cpuModel() {
        return memoFn.getCpuModel();
      },

      get cpuCore() {
        return memoFn.getCpuModel();
      },

      get diskSize() {
        return memoFn.getDiskSize();
      },
    }),
    [formatData, memoFn],
  );
}

const WebTerminalWrapper = ({ bmChassis }: any) => {
  const intl = useIntl();

  const checkIfWebTerminalEnabled = () => {
    return bmChassis?.state === "Enabled";
  };

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
            onClick={() => {
              if (checkIfWebTerminalEnabled()) {
                window.open(`http://${bmChassis.ipmiAddress!}`);
              }
            }}
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

export type FormatHardwareInfos = {
  disk: Array<{
    name: string;
    size: string;
    [prop: string]: any;
  }>;
  basic: any;
  nic: Array<{
    devname: string;
    mac: string;
    pxe: string;
    ip: string;
    speed: string;
  }>;
};

function format(baremetalChassis?: IBaremetalChassis) {
  const hardwareInfos = baremetalChassis?.hardwareInfos;

  if (!hardwareInfos?.length) {
    return;
  }

  return hardwareInfos.reduce<FormatHardwareInfos>(
    (prev, { type, content }) => ({ ...prev, [type]: JSON.parse(content) }),
    {
      disk: [],
      basic: {},
      nic: [],
    },
  );
}

export function getCpuNum(formatHardwareInfos?: FormatHardwareInfos) {
  const cpuCore = formatHardwareInfos?.basic?.cpu_core;

  if (!cpuCore) {
    return;
  }

  return cpuCore;
}

export function getMemorySizeSize(formatHardwareInfos?: FormatHardwareInfos) {
  const memory = formatHardwareInfos?.basic?.memory;

  if (!memory) {
    return;
  }

  const numKB = Number(memory.slice(0, -3));
  const KBToGB = 1024 * 1024;
  const numGB = numKB / KBToGB;
  return `${numGB.toFixed(2)} GB`;
}
export default () => {
  const {
    getCpuNum: getC,
    getMemorySizeSize: getM,
    getFormatData,
    getCpuModel,
    getDiskSize,
  } = useFormatHardwareInfos();

  const intl = useIntl();

  const config: IOption<IBaremetalChassis> = useMemo(
    () => [
      {
        key: "name",
        render: (current) => (
          <ResourceName
            value={current?.name}
            link={{
              to: `/baremetal-chassis`,
              microAppName: "virtualization-resource",
              uuid: current?.uuid,
              leftnav: LeftNavType.BareMetal,
              keepState: false,
            }}
          />
        ),
      },
      {
        key: "console",
        auth: {
          authKey: "open.console",
          resource: "baremetal.chassis",
          type: "action",
        },
        render: (curr) => <WebTerminalWrapper bmChassis={curr} />,
      },
      {
        key: "cluster",
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
        key: "cpuType",
        formatter: (curr) => getCpuModel(curr),
      },
      {
        key: "cpuNum",
        formatter: (curr) => getC(curr),
      },
      {
        key: "memorySize",
        formatter: (curr) => getM(curr),
      },
      {
        key: "disk",
        formatter: (curr) => getDiskSize(curr),
      },
      {
        key: "macList",
        formatter: (curr) => getFormatData(curr)?.nic?.length,
      },
      {
        key: "state",
        filterOptions: pick(State, [State.Enabled, State.Disabled]),
      },
      {
        key: "status",
        render({ status }) {
          let value = (
            <ZstackState
              name={intl.formatMessage({
                id: "BareMetal2Chassis.status.Available",
                defaultMessage: "Assignable",
              })}
              color={{
                color: "positive",
                number: 500,
              }}
              prefix="dot"
            />
          );
          if (status !== "Available") {
            value = <Constant value={status} />;
          }
          return <Text className={style.statusText}>{value}</Text>;
        },
      },
    ],
    [getCpuModel, getC, getM, getDiskSize, getFormatData, intl],
  );
  return useColumnConfig<IBaremetalChassis>(config);
};
