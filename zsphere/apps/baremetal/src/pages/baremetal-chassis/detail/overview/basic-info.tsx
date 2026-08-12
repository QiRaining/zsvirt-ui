import { useQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { DraggableCard, State } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List, Constant } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { BaremetalChassis as IBaremetalChassis } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import {
  baremetalChassisNicCount,
  baremetalChassisDiskCount,
} from "../../../../gql/baremetal-chassis.gql";

export interface IProps {
  detail: IBaremetalChassis;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();
  const { state, status, powerStatus, uuid, createDate, description } =
    detail || {};

  const { getServerTime } = useTime();

  const { data } = useQuery(baremetalChassisNicCount, {
    variables: { conditions: [{ key: "uuid", value: detail?.uuid }] },
  });

  const { data: diskData } = useQuery(baremetalChassisDiskCount, {
    variables: { conditions: [{ key: "uuid", value: detail?.uuid }] },
  });

  const nicCount = useMemo(
    () => data?.baremetalChassisNicInfoList?.total || 0,
    [data?.baremetalChassisNicInfoList?.total],
  );

  const diskCount = useMemo(
    () => diskData?.baremetalChassisDiskInfoList?.total || 0,
    [diskData?.baremetalChassisDiskInfoList?.total],
  );

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "status",
          defaultMessage: "Status",
        }),
        value: <Constant value={state as unknown as ConstantEnum} />,
      },
      {
        label: intl.formatMessage({
          id: "provisionStatus",
          defaultMessage: "Deployment Status",
        }),
        value:
          status === "Available" ? (
            <State
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
          ) : (
            <Constant value={status as unknown as ConstantEnum} />
          ),
      },
      {
        label: intl.formatMessage({
          id: "powerStatus",
          defaultMessage: "Power Status",
        }),
        value: <Constant value={powerStatus as unknown as ConstantEnum} />,
      },
      {
        label: intl.formatMessage({
          id: "nic.num",
          defaultMessage: "NICs",
        }),
        value: nicCount,
      },
      {
        label: intl.formatMessage({
          id: "disk.num",
          defaultMessage: "Disks",
        }),
        value: diskCount,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: description ? <Text>{description}</Text> : undefined,
      },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [
      intl,
      state,
      status,
      powerStatus,
      nicCount,
      diskCount,
      description,
      uuid,
      getServerTime,
      createDate,
    ],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default BasicInfo;
