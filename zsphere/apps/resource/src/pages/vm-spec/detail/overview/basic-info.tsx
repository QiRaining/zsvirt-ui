import { Text } from "@zstack/design";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { VmCustomSpecification } from "@zstack/zsphere-types/graphql";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { renderPlatform } from "../../config/useColumnConfig";

export interface IProps {
  current?: VmCustomSpecification;
}

export default function BasicInfo({ current, ...props }: IProps) {
  const intl = useIntl();

  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
        value: current?.name,
      },
      {
        label: intl.formatMessage({
          id: "vm.spec.platform",
          defaultMessage: "Target VM OS",
        }),
        value: current?.platform && renderPlatform(current.platform),
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: current?.description,
      },
      {
        label: intl.formatMessage({ id: "uuid", defaultMessage: "UUID" }),
        value: <CopyableText>{current?.uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: current?.createDate && (
          <Text>{dayjs(current.createDate).format("YYYY-MM-DD HH:mm:ss")}</Text>
        ),
      },
    ],
    [current, intl],
  );

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
}
