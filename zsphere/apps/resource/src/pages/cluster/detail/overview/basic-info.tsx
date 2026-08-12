import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { DraggableCard, List } from "@zstack/zsphere-components";
import { LongText, CopyableText } from "@zstack/zsphere-design-biz";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

export interface IProps {
  detail: ICluster;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();

  const { getServerTime } = useTime();

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.detail.field.hostNum",
          defaultMessage: "Hosts",
        }),
        value: detail?.hostNum ?? 0,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.detail.field.vmNum",
          defaultMessage: "VMs",
        }),
        value: detail?.virtualizationVmInstanceCount,
      },
      {
        label: intl.formatMessage({
          id: "cpuArchitecture",
          defaultMessage: "CPU Architecture",
        }),
        value: detail?.architecture,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: detail.description ? (
          <LongText value={detail.description} />
        ) : undefined,
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
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail.createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
      //  去除所有最后操作时间
      // {
      //   label: intl.formatMessage({
      //     id: 'lastOpDate',
      //     defaultMessage: '最后操作日期'
      //   }),
      //   value: getServerTime(detail.lastOpDate).format('YYYY-MM-DD HH:mm:ss')
      // }
    ],
    [intl, detail],
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
