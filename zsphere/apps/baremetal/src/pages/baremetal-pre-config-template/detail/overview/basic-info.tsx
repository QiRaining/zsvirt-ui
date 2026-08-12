import { useTime } from "@zstack/hooks";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { PreconfigurationTemplate as IPreconfigurationTemplate } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  current: IPreconfigurationTemplate;
}

const BasicInfo: React.FC<IProps> = ({ current, ...props }) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
        value: current?.name,
      },
      {
        label: intl.formatMessage({ id: "type", defaultMessage: "Type" }),
        value: current?.type,
      },
      {
        label: intl.formatMessage({
          id: "distribution",
          defaultMessage: "Operating System",
        }),
        value: current?.distribution,
      },
      {
        label: intl.formatMessage({ id: "owner", defaultMessage: "Owner" }),
        value: current?.owner?.name,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value:
          current?.description ||
          intl.formatMessage({ id: "none", defaultMessage: "None" }),
      },
      {
        label: "UUID",
        value: <CopyableText>{current?.uuid}</CopyableText>,
      },
      {
        label: "MD5",
        value: <CopyableText>{current?.md5sum}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "create.date",
          defaultMessage: "Creation Time",
        }),
        value: current?.createDate
          ? getServerTime(current.createDate).format("YYYY-MM-DD HH:mm:ss")
          : "-",
      },
    ],
    [current, intl, getServerTime],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
      isList
      draggable={false}
      {...props}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default BasicInfo;
