import { useTime } from "@zstack/hooks";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { Constant, List } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { NvmeServer as INvmeServer } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  detail: INvmeServer;
}

const BasicInfo: React.FC<IProps> = ({
  onCollapseChange,
  collapsed = false,
  detail,
}) => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const list: ListItem[] = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "NVMe.name",
          defaultMessage: "NVMe Storage Name",
        }),
        value: detail?.name,
      },
      {
        label: intl.formatMessage({
          id: "state",
          defaultMessage: "State",
        }),
        value: <Constant value={detail?.state as any} />,
      },
      {
        label: intl.formatMessage({
          id: "transportType",
          defaultMessage: "Transmission Mode",
        }),
        value: detail?.transport,
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
        value: <CopyableText>{detail?.uuid}</CopyableText>,
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
