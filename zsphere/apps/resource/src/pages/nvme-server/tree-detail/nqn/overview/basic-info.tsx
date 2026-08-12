import { useTime } from "@zstack/hooks";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { Constant, List } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { NvmeServer as INvmeServer } from "@zstack/zsphere-types/graphql";
import { find as _find, get as _get } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  detail: INvmeServer;
  nvmeTargetUuid: string;
}

const BasicInfo: React.FC<IProps> = ({
  onCollapseChange,
  collapsed = false,
  detail,
  nvmeTargetUuid,
}) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const nvmeTarget = _find(_get(detail, "nvmeTargets", []), {
    uuid: nvmeTargetUuid,
  });

  const list: ListItem[] = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "nvme.nqn.name",
          defaultMessage: "NQN",
        }),
        value: nvmeTarget?.nqn,
      },
      {
        label: intl.formatMessage({
          id: "NvmeServerState",
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
          id: "NvmeServerPort",
          defaultMessage: "Port",
        }),
        value: detail?.port,
      },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{nvmeTarget?.uuid}</CopyableText>,
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
    ];
  }, [detail, nvmeTarget, intl]);

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
