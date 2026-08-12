import { Text } from "@zstack/design";
import {
  Tag,
  TagList,
  TableDetailLink,
  ResourceName,
} from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { useColumnConfig } from "@zstack/zsphere-engine/src/host-kernel-interface";
import { LeftNavType } from "@zstack/zsphere-types";
import type { HostKernelInterface } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { useKernelTrafficTypesMap } from "../hooks";

import style from "./style.module.less";

export default () => {
  const intl = useIntl();
  const { kernelTrafficTypesMap, kernelTrafficTypesList } =
    useKernelTrafficTypesMap();

  return useColumnConfig<HostKernelInterface>([
    {
      key: "name",
      render: (current) => (
        <div className={style.nameColumn}>
          <Text>
            <TableDetailLink currentRow={current}>
              {current.name}
            </TableDetailLink>
          </Text>
          {current.isDefault && (
            <Tag round level="weak" className={style.defaultTag}>
              {intl.formatMessage({ id: "default", defaultMessage: "Default" })}
            </Tag>
          )}
        </div>
      ),
    },
    {
      key: "ipAddress",
      render: (value) => (
        <CopyableText>{value.usedIps?.[0]?.ip ?? "-"}</CopyableText>
      ),
    },
    {
      key: "l3network",
      render: ({ l3Network }: HostKernelInterface) => {
        return (
          <ResourceName
            value={l3Network?.name}
            link={{
              leftnav: LeftNavType.Network,
              to: `/l3-network`,
              microAppName: "virtualization-resource",
              uuid: l3Network?.uuid,
            }}
          />
        );
      },
    },
    {
      key: "l2network",
      render: ({ l3Network }: HostKernelInterface) => {
        return (
          <ResourceName
            value={l3Network?.vSwitch?.name}
            link={{
              leftnav: LeftNavType.Network,
              to: `/l2-network`,
              microAppName: "virtualization-resource",
              uuid: l3Network?.vSwitch?.uuid,
            }}
          />
        );
      },
    },
    {
      key: "service",
      searchKey: "trafficTypes",
      filters: kernelTrafficTypesList.map(({ key, label }) => ({
        text: label,
        value: key,
      })),
      render: ({ trafficTypes }: HostKernelInterface) => {
        if (!trafficTypes?.length) {
          return (
            <span className={style.emptyText}>
              {intl.formatMessage({ id: "empty", defaultMessage: "Empty" })}
            </span>
          );
        }
        return (
          <TagList
            tags={trafficTypes.map((trafficType) => {
              const name =
                kernelTrafficTypesMap.get(trafficType) ?? trafficType;
              return { uuid: name, name };
            })}
          />
        );
      },
    },
  ]);
};
