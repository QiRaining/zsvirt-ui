import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import {
  List,
  Link,
  DraggableCard,
  useIsCurrentTab,
} from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { LeftNavType } from "@zstack/zsphere-types";
import type { NVMeLun as INVMeLun } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

interface IProps {
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  detail: INVMeLun & { zoneUuid: string };
}

const BasicInfo: React.FC<IProps> = ({
  onCollapseChange,
  collapsed = false,
  detail,
}) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const isStorageTargetTab = useIsCurrentTab("main-tab", "storageTarget");

  const nvmeServerLink = useMemo(() => {
    if (detail?.nvmeServer?.uuid) {
      return isStorageTargetTab ? (
        <Text>{detail?.nvmeServer?.name}</Text>
      ) : (
        <Text>
          <Link
            to={`/zone/detail?uuid=${detail?.zoneUuid}&leftnav=${LeftNavType.DataStorage}&activeKey=storageTarget`}
            onClick={() => {
              sessionStorage.setItem(
                "storage-target-tab-type",
                JSON.stringify("NvmeServer"),
              );
              localStorage.setItem(
                "dataStorageDetail",
                JSON.stringify({
                  NvmeServer: {
                    uuid: detail?.nvmeServer?.uuid,
                    resource: "nvme-server",
                  },
                }),
              );
            }}
            microAppName="virtualization-resource"
            key={detail?.nvmeServer?.uuid}
          >
            {detail?.nvmeServer?.name}
          </Link>
        </Text>
      );
    }
    return "-";
  }, [detail, isStorageTargetTab]);

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
          id: "nvme.storage",
          defaultMessage: "NVMe Storage",
        }),
        value: nvmeServerLink,
      },
      {
        label: intl.formatMessage({
          id: "scsi.lun.size",
          defaultMessage: "Capacity",
        }),
        value: formatStorage(detail?.size || 0),
      },
      {
        label: intl.formatMessage({
          id: "scsi.lun.vendor",
          defaultMessage: "Vendor",
        }),
        value: detail?.vendor ? (
          <Text>{detail?.vendor}</Text>
        ) : (
          <span className={style.none}>
            {intl.formatMessage({ id: "none", defaultMessage: "None" })}
          </span>
        ),
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
