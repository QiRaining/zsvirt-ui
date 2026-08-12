import { useTime } from "@zstack/hooks";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { Constant, List, Link } from "@zstack/zsphere-components";
import { LongText, CopyableText } from "@zstack/zsphere-design-biz";
import type { SecurityGroup } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

interface IProps {
  detail: SecurityGroup;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();

  const { uuid, state, owner, vmNicCount, createDate, description } = detail;

  const { getServerTime } = useTime();

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: "state", defaultMessage: "State" }),
        value: <Constant value={state as any} />,
      },
      {
        label: intl.formatMessage({
          id: "vm.nic.count",
          defaultMessage: "VM NICs",
        }),
        value: vmNicCount,
      },
      {
        label: intl.formatMessage({ id: "owner", defaultMessage: "Owner" }),
        auth: {
          type: "block",
          authKey: "owner",
          resource: "security.group",
        },
        value: (
          <Link.Owner uuid={owner?.uuid ?? ""} type={owner?.type}>
            {owner?.name}
          </Link.Owner>
        ),
      },
      {
        label: intl.formatMessage({
          id: "introduction",
          defaultMessage: "Description",
        }),
        value: <LongText value={description || undefined} />,
      },
      {
        label: intl.formatMessage({ id: "uuid", defaultMessage: "UUID" }),
        value: <CopyableText>{uuid}</CopyableText>,
      },
      //  去除所有最后操作时间
      // {
      //   label: intl.formatMessage({ id: 'lastOpDate', defaultMessage: '最后操作时间' }),
      //   value: getServerTime(lastOpDate!).format('YYYY-MM-DD HH:mm:ss')
      // },
      {
        label: intl.formatMessage({
          id: "createTime",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(createDate!).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [detail, intl, getServerTime],
  );

  return (
    <div className={style.overviewContainer}>
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
    </div>
  );
};

export default BasicInfo;
