import { Icon } from "@zstack/icon";
import IscsiServerDetail from "@zstack/virtualization-resource/src/pages/iscsi-lun/tree-detail";
import { Drawer, TabPane2 as TabPane } from "@zstack/zsphere-components";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

import MultiPathList from "../multi-path/list";

import style from "./style.module.less";

interface LunDetailBtnProps {
  lunUuids: string[];
  hostUuid: string;
  zoneUuid?: string;
  children: React.ReactElement;
  scsiLunSourceType: string;
}

export const LunDetailBtn = ({
  children,
  lunUuids,
  hostUuid,
  zoneUuid,
  scsiLunSourceType,
}: LunDetailBtnProps) => {
  const intl = useIntl();
  const [visible, setVisible] = React.useState(false);

  const btn = React.cloneElement(children, {
    onClick: () => {
      setVisible(true);
    },
    className: style.themeColorBtn,
  });

  const defaultQuery = React.useMemo<IQuery>(() => {
    return {
      conditions: [
        {
          key: "hostUuid",
          op: Op.eq,
          value: hostUuid,
        },
        {
          key: "lunUuids",
          op: Op.eq,
          values: lunUuids,
        },
      ],
    };
  }, [lunUuids, hostUuid]);

  return (
    <>
      {btn}
      <Drawer
        className={style.customDrawerWrapper}
        width={600}
        visible={visible}
        closable={true}
        closeIcon={<Icon type="close" />}
        destroyOnClose={true}
        onClose={() => setVisible(false)}
        bodyStyle={{ padding: 0 }}
      >
        <IscsiServerDetail
          uuid={lunUuids[0]}
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
                scsiLunSourceType={scsiLunSourceType}
              />
            </TabPane>
          }
        />
      </Drawer>
    </>
  );
};
