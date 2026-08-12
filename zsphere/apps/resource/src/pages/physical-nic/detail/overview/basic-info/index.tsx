import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { Constant, List } from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import type { PhysicalNic } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { formatSpeed } from "../../../config/useColumnConfig";

interface IProps {
  current: PhysicalNic;
}

const BasicInfo: FC<IProps> = ({ current, ...props }) => {
  const intl = useIntl();
  const list = useMemo<ListItem[]>(() => {
    return [
      {
        label: intl.formatMessage({
          id: "name",
          defaultMessage: "Name",
        }),
        value: current?.interfaceName,
      },
      {
        label: intl.formatMessage({
          id: "common.state",
          defaultMessage: "Status",
        }),
        value: current?.state && (
          <Constant
            value={current.state as any}
            enumType={ConstantType.NicState}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "manufacturer",
          defaultMessage: "Manufacturer",
        }),
        value: current?.interfaceFactory,
      },
      {
        label: intl.formatMessage({
          id: "nicDriveType",
          defaultMessage: "NIC Model",
        }),
        value: current?.interfaceModel,
      },
      {
        label: intl.formatMessage({
          id: "speed",
          defaultMessage: "Speed",
        }),
        value: formatSpeed(current?.speed),
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        render: current?.description,
      },
    ];
  }, [current, intl]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
      isList
      {...props}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default BasicInfo;
