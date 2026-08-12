import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import { LongText, CopyableText } from "@zstack/zsphere-design-biz";
import type { Zone } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: Zone;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();

  const { getServerTime } = useTime();

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: <LongText value={detail?.description || undefined} canModify />,
      },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{detail.uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createTime",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail.createDate!).format("YYYY-MM-DD HH:mm:ss"),
      },
      //  去除所有最后操作时间
      // {
      //   label: intl.formatMessage({ id: 'last.op.date', defaultMessage: '最后操作时间' }),
      //   value: getServerTime(detail.lastOpDate!).format('YYYY-MM-DD HH:mm:ss')
      // }
    ],
    [detail, intl, getServerTime],
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
