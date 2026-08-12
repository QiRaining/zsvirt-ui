import { useTime } from "@zstack/hooks";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { FiberChannelLun as IFiberChannelLun } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  detail: IFiberChannelLun;
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
          id: "lunDevice",
          defaultMessage: "LUN",
        }),
        value: detail?.name,
      },
      {
        label: intl.formatMessage({
          id: "scsi.lun.size",
          defaultMessage: "Capacity",
        }),
        value: formatStorage(detail?.size || 0, 2),
      },
      {
        label: intl.formatMessage({
          id: "scsi.lun.vendor",
          defaultMessage: "Vendor",
        }),
        value: detail?.vendor,
      },
      {
        label: intl.formatMessage({
          id: "scsi.lun.model",
          defaultMessage: "Model",
        }),
        value: detail?.model,
      },
      {
        label: intl.formatMessage({
          id: "scsi.lun.source",
          defaultMessage: "Source",
        }),
        value: detail?.source,
      },
      {
        label: intl.formatMessage({
          id: "scsi.lun.wwn",
          defaultMessage: "WWN",
        }),
        value: detail?.wwn,
      },
      {
        label: intl.formatMessage({
          id: "scsi.lun.wwid",
          defaultMessage: "WWID",
        }),
        value: detail?.wwid,
      },
      {
        label: intl.formatMessage({
          id: "scsi.lun.type",
          defaultMessage: "Type",
        }),
        value: detail?.type,
      },
      {
        label: intl.formatMessage({
          id: "scsi.lun.path",
          defaultMessage: "Path",
        }),
        value: detail?.path,
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
