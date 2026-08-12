import { InfoPopover } from "@zstack/design";
import type { BaremetalChassis as IBaremetalChassis } from "@zstack/zsphere-types/graphql";
import { flatMap as _flatMap } from "lodash-es";
import React from "react";
import type { IntlShape } from "react-intl";
import ReactMarkdown from "react-markdown";

import type { IAllNics, IInstanceConfig } from "./type";

import styles from "./action/style.module.less";

const checkInvalidConfigurations = (configurations: IInstanceConfig[]) => {
  return configurations.some((config: IInstanceConfig) => {
    const isCredentialsEmpty = !config.password || !config.username;
    const isNetworkConfigsEmpty = config.networkConfigs.length === 0;
    return isCredentialsEmpty || isNetworkConfigsEmpty;
  });
};

const extractNicsFromChassis = (
  chassis: IBaremetalChassis[],
): Omit<IAllNics, "label">[] | undefined => {
  return chassis
    ? _flatMap(chassis, (chassisItem) => {
        const hardwareInfos = chassisItem?.hardwareInfos || [];
        const parsedNics = _flatMap(
          hardwareInfos.filter((info) => info.type === "nic"),
          (nic) => JSON.parse(nic.content),
        );

        return parsedNics
          .filter((nic) => nic.pxe !== "true")
          .map((nic) => ({
            chassisUuid: chassisItem.uuid,
            devname: nic.devname,
            mac: nic.mac,
            value: JSON.stringify({
              name: nic.devname,
              mac: nic.mac,
              chassisUuid: chassisItem.uuid,
            }),
          }));
      })
    : undefined;
};

const getConfigCardTitle = (
  intl: IntlShape,
  type: "systemConfig" | "networkConfig",
) => {
  const titleInfoMap = new Map([
    [
      "systemConfig",
      <div className={styles.title}>
        {intl.formatMessage({
          id: "system.config",
          defaultMessage: "System Configuration",
        })}
        <InfoPopover
          content={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "system.config.title.info",
                defaultMessage: "xxxxxx",
              })}
            </ReactMarkdown>
          }
        />
      </div>,
    ],
    [
      "networkConfig",
      <div className={styles.title}>
        {intl.formatMessage({
          id: "network.config",
          defaultMessage: "Network Configuration",
        })}
        <InfoPopover
          content={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "network.config.title.info",
                defaultMessage: "xxxxxx",
              })}
            </ReactMarkdown>
          }
        />
      </div>,
    ],
  ]);
  return titleInfoMap.get(type);
};

export {
  checkInvalidConfigurations,
  extractNicsFromChassis,
  getConfigCardTitle,
};
