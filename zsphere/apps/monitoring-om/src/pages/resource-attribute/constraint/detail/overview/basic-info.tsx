import { useTime } from "@zstack/hooks";
import { List } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ResourceAttributeConstraint } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export interface IProps {
  current?: ResourceAttributeConstraint;
}

export default function BasicInfo({ current, ...props }: IProps) {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const createDate = useMemo(() => {
    if (!current) {
      return null;
    }
    return getServerTime(current.createDate).format("YYYY-MM-DD HH:mm:ss");
  }, [current]);

  const list = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "resource.attribute.value",
          defaultMessage: "Attribute Value",
        }),
        value: current?.parameter,
      },
      {
        label: intl.formatMessage({
          id: "resource.count",
          defaultMessage: "Resources",
        }),
        value: current?.resourceCount,
      },
      {
        label: intl.formatMessage({
          id: "zskernel.createDate",
          defaultMessage: "Creation Time",
        }),
        value: createDate,
      },
    ],
    [current, intl, createDate],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basicInfo",
        defaultMessage: "Basic Info",
      })}
      isList
      {...props}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}
