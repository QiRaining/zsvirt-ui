import IscsiServerDetail from "@zstack/virtualization-resource/src/pages/iscsi-lun/tree-detail";
import { TabPane2 as TabPane } from "@zstack/zsphere-components";
import { Detail } from "@zstack/zsphere-components";
import type { Condition } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { ScsiLun } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import MultiPathList from "../multi-path/list";

import style from "./style.module.less";

export interface IProps {
  current?: ScsiLun;
  open: boolean;
  onClose: () => void;
  getContainer?: () => HTMLElement;
  hostUuid?: string;
  zoneUuid?: string;
}

export default function LunDetail({
  current,
  open,
  onClose,
  getContainer,
  hostUuid,
  zoneUuid,
}: IProps) {
  const intl = useIntl();

  const defaultQuery = React.useMemo(() => {
    const conditions: Condition[] = [
      {
        key: "lunUuids",
        op: Op.eq,
        values: [current?.uuid ?? ""],
      },
      {
        key: "hostUuid",
        op: Op.eq,
        value: hostUuid ?? "",
      },
    ];
    return { conditions };
  }, [current?.uuid, hostUuid]);

  return (
    <Detail.Drawer
      className={style.detail}
      open={open}
      onClose={onClose}
      getContainer={getContainer}
    >
      <IscsiServerDetail
        uuid={current?.uuid ?? ""}
        hostUuid={hostUuid}
        extraTabPane={
          <TabPane
            tab={intl.formatMessage({
              id: "lunDevice.multipath",
              defaultMessage: "Path",
            })}
            key="multipath"
          >
            <MultiPathList
              view="sub.multipath"
              defaultQuery={defaultQuery}
              zoneUuid={zoneUuid}
              scsiLunSourceType={current?.source}
            />
          </TabPane>
        }
      />
    </Detail.Drawer>
  );
}
