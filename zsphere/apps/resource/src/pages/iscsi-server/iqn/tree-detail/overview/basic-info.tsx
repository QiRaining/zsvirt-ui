import { useTime } from "@zstack/hooks";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { Constant, List } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import { find, get } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  detail: IIscsiServer;
  iscsiTargetUuid: string;
}

const BasicInfo: React.FC<IProps> = ({
  onCollapseChange,
  collapsed = false,
  detail,
  iscsiTargetUuid,
}) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const iscsiTarget = find(get(detail, "iscsiTargets", []), {
    uuid: iscsiTargetUuid,
  });

  const list: ListItem[] = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "iSCSI.IQN.name",
          defaultMessage: "IQN",
        }),
        value: iscsiTarget?.iqn,
      },
      {
        label: intl.formatMessage({
          id: "IscsiServerState",
          defaultMessage: "State",
        }),
        value: <Constant value={detail?.state as any} />,
      },
      {
        label: intl.formatMessage({
          id: "ip",
          defaultMessage: "IP Address",
        }),
        value: detail?.ip,
      },
      {
        label: intl.formatMessage({
          id: "IscsiServerPort",
          defaultMessage: "Port",
        }),
        value: detail?.port,
      },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{iscsiTarget?.uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createTime",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail?.createDate ?? -1).format(
          "YYYY-MM-DD HH:mm:ss",
        ),
      },
      //  去除所有最后操作时间
      // {
      //   label: intl.formatMessage({ id: 'last.op.date', defaultMessage: '最后操作时间' }),
      //   value: getServerTime(detail?.lastOpDate ?? -1).format('YYYY-MM-DD HH:mm:ss')
      // }
    ];
  }, [detail, intl, getServerTime]);

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
