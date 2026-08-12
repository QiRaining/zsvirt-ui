import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import type { ListItem } from "@zstack/zsphere-components";
import { List, TagList, ResourceName } from "@zstack/zsphere-components";
import { DraggableCard, Tag } from "@zstack/zsphere-components";
import { LeftNavType } from "@zstack/zsphere-types";
import type { HostKernelInterface } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { useKernelTrafficTypesMap } from "../../hooks";

import style from "./style.module.less";

export interface IProps {
  current: HostKernelInterface;
}

const BasicInfo: React.FC<IProps> = ({ current, ...rest }) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const { kernelTrafficTypesMap } = useKernelTrafficTypesMap();
  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "zskernel.name",
          defaultMessage: "Name",
        }),
        value: (
          <div className={style.nameField}>
            <Text>{current.name}</Text>
            {current.isDefault && (
              <Tag round level="weak" className={style.defaultTag}>
                {intl.formatMessage({ id: "default", defaultMessage: "Default" })}
              </Tag>
            )}
          </div>
        ),
      },
      {
        label: intl.formatMessage({
          id: "zskernel.service",
          defaultMessage: "Service",
        }),
        value: current.trafficTypes?.length ? (
          <div className={style.serviceTagListWrapper}>
            <TagList
              tags={current.trafficTypes.map((trafficType) => ({
                name: kernelTrafficTypesMap.get(trafficType) ?? trafficType,
              }))}
            />
          </div>
        ) : undefined,
      },
      {
        label: intl.formatMessage({
          id: "zskernel.l3network",
          defaultMessage: "Distributed Port Group",
        }),
        value: (
          <ResourceName
            icon={<Icon type="dportgroup" />}
            value={current.l3Network?.name}
            link={{
              leftnav: LeftNavType.Network,
              to: `/l3-network`,
              microAppName: "virtualization-resource",
              uuid: current.l3Network?.uuid,
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "zskernel.l2network",
          defaultMessage: "Distributed Switch",
        }),
        value: (
          <ResourceName
            icon={<Icon type="dswitch" />}
            value={current.l3Network?.vSwitch?.name}
            link={{
              leftnav: LeftNavType.Network,
              to: `/l2-network`,
              microAppName: "virtualization-resource",
              uuid: current.l3Network?.vSwitch?.uuid,
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        copyable: true,
        value: current?.uuid,
      },
      {
        label: intl.formatMessage({
          id: "zskernel.description",
          defaultMessage: "Introduction",
        }),
        value: current.description ? (
          <Text>{current.description}</Text>
        ) : undefined,
      },
      {
        label: intl.formatMessage({
          id: "zskernel.createDate",
          defaultMessage: "Creation Time",
        }),
        value: (
          <Text>
            {getServerTime(current.createDate).format("YYYY-MM-DD HH:mm:ss")}
          </Text>
        ),
      },
    ],
    [current, getServerTime, intl, kernelTrafficTypesMap],
  );
  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "zskernel.basicInfo",
        defaultMessage: "Basic Information",
      })}
      isList
      {...rest}
    >
      <List list={list} bordered={false} className={style.basicInfoList} />
    </DraggableCard>
  );
};

export default BasicInfo;
