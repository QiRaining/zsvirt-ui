import { useTime } from "@zstack/hooks";
import { List } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ResourceAttributeKey } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { useGetResourceTypeLabel } from "../../../hook";

export interface IProps {
  current?: ResourceAttributeKey;
}

export default function BasicInfo({ current, ...props }: IProps) {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const getResourceTypeLabel = useGetResourceTypeLabel();

  const resourceType = useMemo(() => {
    if (!current?.resourceTypes?.length) {
      return null;
    }
    if (current.resourceTypes.includes("ResourceAttributeKeyVO")) {
      return intl.formatMessage({
        id: "resource.attribute.key.global",
        defaultMessage: "Global",
      });
    }
    return getResourceTypeLabel(current.resourceTypes[0]).label;
  }, [current, intl, getResourceTypeLabel]);

  const createDate = useMemo(() => {
    if (!current) {
      return null;
    }
    return getServerTime(current.createDate).format("YYYY-MM-DD HH:mm:ss");
  }, [current]);

  const list = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: "type", defaultMessage: "Type" }),
        value: resourceType,
      },
      {
        label: intl.formatMessage({
          id: "zskernel.description",
          defaultMessage: "Introduction",
        }),
        value: current?.description,
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
          id: "zskernel.createDate",
          defaultMessage: "Creation Time",
        }),
        value: createDate,
      },
    ],
    [current, intl, createDate, resourceType],
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
